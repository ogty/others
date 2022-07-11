main='
BEGIN {
    line_counter = 0;
    function_name = "";
}

# For commands with no arguments
/^alias/ {
    print($0);
}

# For commands with arguments
/^\w{1,}\(\)/,/^\}/ {
    if ($0 == "}") {
        line_counter = 0;
    }

    if (line_counter == 0) {
        split($0, first_line, "()");
        function_name = first_line[1];
    } else if (line_counter >= 2) {
        gsub("\t", "", $0);
        print($0);
    }
    line_counter += 1;
}
'

# START setup
currentDirectory=$(cd $(dirname $0);pwd)
echo 'export PATH="$PATH:'$currentDirectory\" >> ~/.zshrc
echo 'source ~/.custom_alias' >> ~/.zshrc
touch ~/.custom_alias
source ~/.zshrc
sudo chmod 755 $currentDirectory/customa


# START set custom alias
customAliasName="$1"
customAliasCommand="$2"

# Asks for input until a unique name is given so as not to be covered by an existing alias.
while [ $(alias | awk -F '=' '{print $1}' | grep "^$customAliasName") ]; do
    clear
    echo "Custom alias already registered."
    echo "Please enter a new custom alias name."
    read customAliasName
done

# TODO:
#     Implement a custom alias so that if it is the same as 
#     a command name already defined in the custom alias, it will be overwritten

if [ "$function" = true ]; then
    echo "$customAliasName() {\n\t$customAliasCommand\n}" >> ~/.custom_alias
else
    echo "alias $customAliasName='$customAliasCommand'" >> ~/.custom_alias
fi

source ~/.custom_alias
