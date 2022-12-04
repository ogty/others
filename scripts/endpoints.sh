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
#    ○ Output format
#        □ list(default)
#        □ code
#
#    ○ Code type
#        □ httpie(default)
#        □ curl
#
# Examples:
#
#    ╭─ Zsh ─────────────────────────────────────────────────────────────────────────────╮
#    │  $ source endpoints.sh                                                            │
#    │  $ source endpoints.sh code                                                       │
#    │  $ source endpoints.sh code curl                                                  │
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
