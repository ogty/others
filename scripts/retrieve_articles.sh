#!/bin/sh

# /^.+class=.card/,/^<\/d/ {
#     split($0, a, "h2");
#
#     if (length(a) == 3) {
#         split($0, b, "f=");
#         split(b[2], c, " ");
#         gsub("\"", "", c[1]);
#
#         split($0, d, "n>");
#         split(d[2], e, "</s");
#
#         printf("- [%s](%s)\n", e[1], c[1])
#     }
# }

wget https://gigazine.net/ -q -O - \
| awk '/^.+class=.card/,/^<\/d/{split($0,a,"h2");if(length(a)==3){split($0,a,"f=");split(a[2],b," ");split($0,d,"n>");split(d[2],e,"</s");gsub("\"","",b[1]);printf("- [%s](%s)\n",e[1],b[1])}}' \
> $(date "+%Y-%m-%d").md
