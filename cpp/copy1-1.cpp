#include<iostream>

#include<algorithm>

using namespace std;
static
const int MAX = 200000;

int main() {
    int R[MAX], n, r;

    cin >> n;
    cin >> r;

    int maxv = -2000000000;
    int minv = r;

    for (int i = 1; i < n; i += 1) {
        cin >> r;
        maxv = max(maxv, r - minv);
        minv = min(minv, r);
    }

    cout << maxv << endl;
    return 0;
}