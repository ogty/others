SUFFIX="件中"
MIN_PRICE=1000
MAX_PRICE=3000


function output() {
    python3 -c "
from datetime import datetime


GREEN = '\033[92m'
RED = '\033[91m'
BLUE = '\033[94m'
YELLOW = '\033[93m'
CYAN = '\033[96m'
WHITE = '\033[97m'
NO_COLOR = '\033[0m'


now = datetime.now().strftime('%Y年%m月%d日 %H時%M分%S秒')
rate = round(($1 / 3865) * 100)
rate_string = f'{GREEN}{rate}%{NO_COLOR}' if rate > 50 else f'{RED}{rate}%{NO_COLOR}'
print(f\"\n{now}\n\n\t市場全体の上昇率: {rate_string}\n\")

prices = '''$2'''.split('\n')
prices = [float(price.replace(',', '')) for price in prices]
codes = '''$3'''.split('\n')

print('\t┌──────┬────────┐')
print('\t│ CODE │ PRICE  │')
print('\t├──────┼────────┤')
for code, price in zip(codes, prices):
    if $MIN_PRICE <= price <= $MAX_PRICE:
        print(f'\t│ {BLUE}{code}{NO_COLOR} │ {WHITE}{price}{NO_COLOR} │')
print('\t└──────┴────────┘')

print()
"
}


while true; do
    html=$(curl -s https://finance.yahoo.co.jp/stocks/ranking/up)
    num=$(echo $html                 \
    | rg ">\d{1,}<!-- -->$SUFFIX" -o \
    | sed 's/>//g'                   \
    | sed "s/<!-- --$SUFFIX//g")

    prices=$(echo $html                                                    \
    | rg '>[\d|,|.]{1,}(</span>){3}<span class="_\w{1,10}">\d{2}:\d{2}' -o \
    | sed 's/>//g'                                                         \
    | awk '{split($0, a, "<"); print(a[1])}')

    codes=$(echo $html   \
    | rg '\d{4}</li>' -o \
    | sed 's/<\/li>//g')

    output $num $prices $codes
    sleep 60
    clear
done
