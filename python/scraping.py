from __future__ import annotations
import csv
import os
import re
import time
from typing import TypedDict, List

from bs4 import BeautifulSoup
import requests
import schedule

from settings import DATA_DIR


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


def gigazine() -> List[str]:
    ArticleData = TypedDict("ArticleData", {
        "title": str, 
        "url": str,
        "date": str, 
        "category": str,
    })

    gigazine = Scraping("https://gigazine.net/")
    article_data = gigazine.from_class("card")
    article_contents = article_data.get_text()
    article_hrefs = article_data.get_href()

    result: List[ArticleData] = []
    count = 0
    for article_content in article_contents:
        filtered_data = list(filter(lambda x: x, article_content.split("\n"))) 
        if len(filtered_data) == 1:
            continue

        date = re.findall(r"\d{1,2}月\d{1,2}日\d{1,2}時\d{1,2}分", filtered_data[1])
        if not date:
            date = ["--月--日--時--分"]

        title = filtered_data[0]
        category = filtered_data[1].replace(date[0], "")

        result.append({
            "title": title,
            "url": article_hrefs[count],
            "date": date[0],
            "category": category,
        })
        count += 1

    return result


def job() -> None:
    result = gigazine()
    with open(os.path.join(DATA_DIR, "gigazine.csv"), "w", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["title", "url", "date", "category"])
        writer.writeheader()
        writer.writerows(result)


if __name__ == "__main__":
    job()
    schedule.every(1).hour.do(job)
    while True:
        schedule.run_pending()
        time.sleep(1)
