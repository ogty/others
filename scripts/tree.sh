userName=ogty
branchName=main
repositoryName=others
ignoreDirectories=(
  .git
)

repositoryUrl=https://github.com/$userName/$repositoryName/blob/$branchName

ignoreDirectories=$(IFS="|"; echo "${ignoreDirectories[*]}")
directoryTree=$(tree -a -I "$ignoreDirectories")

setUrl='
BEGIN {
  paths = "";
  tmp = 0;
}

/^(( {4}){1,})?-/ {
  split($0, array, "`");
  split($0, for_tab, "    ");

  number_of_tab = length(for_tab) - 1;
  file_name = array[2];

  if (number_of_tab != tmp) {
    paths = paths "/" file_name;
  }
  if (number_of_tab == 0) {
    paths = "";
  }

  for (i = 0; i < number_of_tab; i++) {
    printf("    ");
  }
  printf("- [`%s`](%s%s)\n", file_name, repositoryUrl, paths "/" file_name);

  tmp = number_of_tab;
}
'

result=$(echo "$directoryTree" \
| sed -r 's/[├──└│]/ /g' \
| sed -r "s/$(echo -ne '\u00a0')/ /g" \
| sed -r 's/(( {4}){1,})?( {4})(.+)$/\1- [`\4`]()/g' \
| sed -r 's/^\.$//' \
| sed '$d' \
| awk -v repositoryUrl="$repositoryUrl" "$setUrl")

echo $result
