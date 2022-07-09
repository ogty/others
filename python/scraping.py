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

    def __init__(self, url: str) -> None:
        self.url = url
        self.html = requests.get(url)
        self.soup = BeautifulSoup(self.html.content, "html.parser")
        self.data = []

    def from_class(self, class_name: str) -> Scraping:
        self.data = self.soup.select(f"[class='{class_name}']")
        return self

    def get_href(self) -> List[str]:
        a_tags = [d.find("a") for d in self.data]
        return [a.get("href") for a in a_tags if a is not None]

    def get_text(self) -> List[str]:
        return [d.text for d in self.data]


def get_content(url: str, class_name: str):
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
    with open(f"{os.path.join(DATA_DIR, filename)}.csv", "w", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELD_NAMES)
        writer.writeheader()
        writer.writerows(data)


@get_content("https://gigazine.net/", "card")
def gigazine(*args) -> None:
    article_contents = args[0]
    article_hrefs = args[1]

    result: List[ArticleData] = []
    data_counter = 0
    for article_content in article_contents:
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
            url=article_hrefs[data_counter], 
            date=date[0], 
            category=category,
        ))
        data_counter += 1

    csv_writer(result, "gigazine")


@get_content("https://news.mynavi.jp/techplus/list/headline/", "c-archiveList_listNode")
def tech_plus(*args) -> None:
    article_contents = args[0]
    article_hrefs = args[1]
    base_url = "https://news.mynavi.jp"

    result: List[ArticleData] = []
    data_counter = 0
    for article_content in article_contents:
        filtered_data = list(filter(lambda x: x, article_content.split("\n"))) 
        filtered_data = list(map(lambda x: x.replace(" ", ""), filtered_data))
        filtered_data = list(filter(lambda x: x, filtered_data))

        result.append(ArticleData(
            title=filtered_data[1],
            url=urljoin(base_url, article_hrefs[data_counter]),
            date=filtered_data[2],
            category=filtered_data[0],
        ))
        data_counter += 1

    csv_writer(result, "tech_plus")


class Job:

    def __init__(self) -> None:
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
        for c in itertools.cycle(self.unicode_braille_pattern_dots):
            if self.done:
                break

            sys.stdout.write(f'\rloading{self.count} ' + c.decode('unicode-escape'))
            sys.stdout.flush()
            time.sleep(0.1)

    def get_article_data(self) -> None:
        self.count += 1
        self.done = True

        gigazine()
        tech_plus()

        self.done = False
        t = threading.Thread(target=self.loading)
        t.start()


if __name__ == "__main__":
    job = Job()
    job.get_article_data()

    schedule.every(1).hour.do(job.get_article_data)
    while True:
        schedule.run_pending()
        time.sleep(1)
