class MagicSquares {
    static void generateSquare(int n) {
        int[][] magicSquare = new int[n][n];

        int i = n / 2;
        int j = n - 1;

        for (int num = 1; num <= n * n;) {
            if (i == -1 && j == n) {
                j = n - 2;
                i = 0;
            } else {
                if (j == n) {
                    j = 0;
                }
                if (i < 0) {
                    i = n - 1;
                }
            }

            if (magicSquare[i][j] != 0) {
                j -= 2;
                i += 1;
                continue;
            } else {
                magicSquare[i][j] = num++;
            }

            j++;
            i--;
        }

        for (i = 0; i < n; i += 1) {
            for (j = 0; j < n; j += 1) {
                System.out.print(magicSquare[i][j] + " ");
            }
            System.out.println();
        }
    }

    public static void main(String[] args) {
        generateSquare(3);
        /*
         * 2 7 6
         * 9 5 1
         * 4 3 8
         */
        System.out.println();

        generateSquare(5);
        /* 
         *  9  3 22 16 15
         *  2 21 20 14  8
         * 25 19 13  7  1
         * 18 12  6  5 24
         * 11 10  4 23 17
         */
    }
}
