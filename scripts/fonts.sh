hexLetters=(0 1 2 3 4 5 6 7 8 9 A B C D E F)

for c1 in "${hexLetters[@]}"; do
    for c2 in "${hexLetters[@]}"; do
        for c3 in "${hexLetters[@]}"; do
            for c4 in "${hexLetters[@]}"; do
                echo -e "\u$c1$c2$c3$c4" "$c1$c2$c3$c4"
            done
        done
    done
done
