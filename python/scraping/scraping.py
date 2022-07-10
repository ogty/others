from __future__ import annotations
import csv
import itertools
import os
import re
import sys
import time
import threading
from typing import TypedDict, List
from urllib.parse import urljoin

from bs4 import BeautifulSoup
import requests
import schedule

from settings import DATA_DIR


ArticleData = TypedDict("ArticleData", {
    "title": str, 
    "url": str,
    "date": str, 
    "category": str,
})
FIELD_NAMES = [k for k in ArticleData.__annotations__.keys()]


class Scraping:
    """Scraping class

    Attributes:
        url: url to scrape
        html: html of url
        soup: soup of html
        data: data of html

    """

    def __init__(self, url: str) -> None:
        """init

        initialize scraping object

        Args:
            url: url to scrape

        Returns:
            None

        """
        self.url = url
        self.html = requests.get(url)
        self.soup = BeautifulSoup(self.html.content, "html.parser")
        self.data = []

    def from_class(self, class_name: str) -> Scraping:
        """get html from class

        Args:
            class_name: class name to scrape

        Returns:
            Scraping object

        """
        self.data = self.soup.select(f"[class='{class_name}']")
        return self

    def get_href(self) -> List[str]:
        """get href from html
        
        Returns:
            list of hrefs

        """
        a_tags = [d.find("a") for d in self.data]
        return [a.get("href") for a in a_tags if a is not None]

    def get_text(self) -> List[str]:
        """get text from html

        Returns:
            list of text

        """
        return [d.text for d in self.data]


def get_content(url: str, class_name: str):
    """get content from url and class name

    Args:
        url: url to scrape
        class_name: class name to scrape

    Returns:
        ?

    """
    def decorator(func):
        def wrapper():
            result = Scraping(url)
            article_data = result.from_class(class_name)
            article_contents = article_data.get_text()
            article_hrefs = article_data.get_href()
            return func(article_contents, article_hrefs)
        return wrapper
    return decorator


def csv_writer(data: List[ArticleData], filename: str) -> None:
    """write data to csv file

    Args:
        data: list of article data
        filename: filename to write to

    Returns:
        None

    """
    with open(f"{os.path.join(DATA_DIR, filename)}.csv", "w", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELD_NAMES)
        writer.writeheader()
        writer.writerows(data)


@get_content("https://gigazine.net/", "card")
def gigazine(*args) -> None:
    """get gigazine data

    Args:
        args: args to pass to csv_writer

    Returns:
        None

    """
    result: List[ArticleData] = []
    for article_content, article_href in zip(*args):
        filtered_data = list(filter(lambda x: x, article_content.split("\n"))) 
        if len(filtered_data) == 1:
            continue

        date = re.findall(r"\d{1,2}月\d{1,2}日\d{1,2}時\d{1,2}分", filtered_data[1])
        if not date:
            date = ["--月--日--時--分"]

        title = filtered_data[0]
        category = filtered_data[1].replace(date[0], "")

        result.append(ArticleData(
            title=title, 
            url=article_href, 
            date=date[0], 
            category=category,
        ))

    csv_writer(result, "gigazine")


@get_content("https://news.mynavi.jp/techplus/list/headline/", "c-archiveList_listNode")
def tech_plus(*args) -> None:
    """get tech plus data

    Args:
        args: args to pass to csv_writer

    Returns:
        None

    """
    base_url = "https://news.mynavi.jp"

    result: List[ArticleData] = []
    for article_content, article_href in zip(*args):
        filtered_data = list(filter(lambda x: x, article_content.split("\n"))) 
        filtered_data = list(map(lambda x: x.replace(" ", ""), filtered_data))
        filtered_data = list(filter(lambda x: x, filtered_data))

        result.append(ArticleData(
            title=filtered_data[1],
            url=urljoin(base_url, article_href),
            date=filtered_data[2],
            category=filtered_data[0],
        ))

    csv_writer(result, "tech_plus")


@get_content("https://nazology.net/", "article-list__entry")
def nazology(*args) -> None:
    """get nazology data

    Args:
        args: args to pass to csv_writer

    Returns:
        None

    """
    result: List[ArticleData] = []
    for article_content, article_href in zip(*args):
        date = re.findall(r"\d{4}\.\d{2}\.\d{2}\s\w{3}", article_content)
        filtered_data = article_content.split(date[0])
        title = filtered_data[1].replace("\"", "").replace("\n", "-").replace(" ", "")

        result.append(ArticleData(
            title=title,
            url=article_href,
            date=date[0],
            category=filtered_data[0],
        ))

    csv_writer(result, "nazology")


class Job:
    """Job class

    Attributes:
        count: count of job
        done: whether job is done
        loading: loading message

    """

    def __init__(self) -> None:
        """init

        initialize job object

        Returns:
            None

        """
        self.done = False
        self.count = 0
        self.unicode_braille_pattern_dots = [
            b"\\u28F7",
            b"\\u28EF",
            b"\\u28DF",
            b"\\u287F",
            b"\\u28BF",
            b"\\u28FB",
            b"\\u28FD",
            b"\\u28FE",
        ]

    def loading(self) -> None:
        """loading message

        Returns:
            None

        """
        for c in itertools.cycle(self.unicode_braille_pattern_dots):
            if self.done:
                break

            sys.stdout.write(f'\rloading{self.count} ' + c.decode('unicode-escape'))
            sys.stdout.flush()
            time.sleep(0.1)

    def get_article_data(self) -> None:
        """get article data
            
        Returns:
            None
    
        """
        self.count += 1
        self.done = True

        gigazine()
        tech_plus()
        nazology()

        self.done = False
        t = threading.Thread(target=self.loading)
        t.start()


if __name__ == "__main__":
    job = Job()
    job.get_article_data()

    schedule.every(1).days.do(job.get_article_data)
    while True:
        schedule.run_pending()
        time.sleep(1)
