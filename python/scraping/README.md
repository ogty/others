# Scraping

Programs for learning about

- decorators
- Sphinx
- Loading

## Creating a document from a docstring

```zsh
$ pip3 install sphinx
$ pwd # python
$ sphinx-apidoc -F -H project -A <your-name> -V v1.0 -o ./scraping/docs scraping
$ # Edit python/scraping/conf.py
$ sphinx-build ./scraping/docs ./scraping/docs/_build
```

## Make a few changes to the file

**`python/scraping/conf.py`**

### Change 1

```diff
- # import os
- # import sys
- # sys.path.insert(0, '/Users/<username>/Desktop/others/python/scraping')
+ import os
+ import sys
+ sys.path.insert(0, '/Users/<username>/Desktop/others/python/scraping')
```

### Change 2

```diff
extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.viewcode',
    'sphinx.ext.todo',
+   'sphinx.ext.napoleon',
]
```
