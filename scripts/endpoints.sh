# Description:
#
#     Script to create a markdown endpoint summary from a file directly under "src/pages/api"
#
# Usage:
#
#    ╭─ Zsh ─────────────────────────────────────────────────────────────────────────────╮
#    │  $ source endpoints.sh [output format] [code type]                                │
#    ╰───────────────────────────────────────────────────────────────────────────────────╯
#
# Options:
#
#    ○ Output format            ○ Code type
#        □ list(default)            □ httpie(default)
#        □ code                     □ curl
#
# Examples:
#
#    ╭─ Zsh ─────────────────────────────────────────────────────────────────────────────╮
#    │  $ source endpoints.sh                                                            │
#    │  $ source endpoints.sh code                                                       │
#    │  $ source endpoints.sh code curl                                                  │
#    ╰───────────────────────────────────────────────────────────────────────────────────╯
#
#    ▽ src               ╭─ Zsh ─────────────────────────────────────────────────────────╮
#      ▽ pages           │  $ source endpoints.sh                                        │
#        ▽ api           │                                                               │
#        │ ▷ products    │ - [users](http://localhost:3000/api/users)                    │
#        │ ▷ posts       │ - [users/:id](http://localhost:3000/api/users/:id)            │
#        │ ▽ users       │ - [search](http://localhost:3000/api/search)                  │
#        │ │  [id].ts    │ ...                                                           │
#        │ │  index.ts   │                                                               │
#        │  search.ts    │  $ source endpoints.sh > README.md                            │
#        │  posts.ts     ╰───────────────────────────────────────────────────────────────╯
#
#    ╭─ Markdown - List Type ────────────────────────────────────────────────────────────╮
#    │  - [users](http://localhost:3000/api/users)                                       │
#    │  - [users/:id](http://localhost:3000/api/users/:id)                               │
#    │  - [search](http://localhost:3000/api/search)                                     │
#    │  ...                                                                              │
#    ╰───────────────────────────────────────────────────────────────────────────────────╯


EXTENSION='ts'
EXTENSION_PATTERN="s/\.$EXTENSION//g"
LIST_PATTERN='s/^(.+api\/)(.+)/- [`\2`](\1\2)/g'
CODE_CURL_PATTERN='s/^(.+api\/)(.+)/\n**`\2`**\n\n```\ncurl \1\2\n```/g'
CODE_HTTPIE_PATTERN='s/^(.+api\/)(.+)/\n**`\2`**\n\n```\nhttp \1\2\n```/g'

files=$(find src/pages/api -type f)

for file in $files; do
    endpoints=$(echo $file \
    | sed -r 's/(.+)\[(.+)\].ts/\1:\2/' \
    | sed -r 's/src\/pages/http:\/\/localhost:3000/' \
    | sed -r $EXTENSION_PATTERN)

    if [ "$1" = "code" ]; then
        if [ "$2" = "curl" ]; then
            endpoints=$(echo "$endpoints" | sed -r "$CODE_CURL_PATTERN")
        else
            endpoints=$(echo "$endpoints" | sed -r "$CODE_HTTPIE_PATTERN")
        fi
    else
        endpoints=$(echo "$endpoints" | sed -r "$LIST_PATTERN")
    fi

    echo $endpoints
done
