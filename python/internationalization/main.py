import json
import os
from typing import Dict, List

import yaml


class LanguageSegmenter:

    base_data = {}
    segmented_data = {}

    def __init__(self, import_file_name: str, languages: List[str]) -> None:
        self.languages = languages
        with open(import_file_name, "r", encoding="utf-8") as f:
            LanguageSegmenter.base_data = yaml.safe_load(f)

        [self.Processer(language) for language in self.languages]

    def write(self, path: str) -> None:
        for language in self.languages:
            locales_path = os.path.join(path, language)
            os.makedirs(locales_path, exist_ok=True)
            with open(os.path.join(locales_path, "translations.json"), "w") as f:
                json.dump(
                    fp=f,
                    obj=LanguageSegmenter.segmented_data[language],
                    indent=4,
                    ensure_ascii=False,
                )
    
    class Processer:

        def __init__(self, language: str):
            self.language = language
            self.result = {}

            self.segmenter(LanguageSegmenter.base_data)
            LanguageSegmenter.segmented_data[self.language] = self.result

        def segmenter(self, translation_data: Dict[str, dict]) -> any:
            element = {}
            for key, value in translation_data.items():
                if self.language in value:
                    element[key] = value[self.language]
                else:
                    element[key] = self.segmenter(value)

            self.result = element
            return element


if __name__ == "__main__":
    segmenter = LanguageSegmenter(import_file_name="./sample.yaml", languages=["jp", "en"])
    segmenter.write("./public/locales")
