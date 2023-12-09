#!/bin/bash

# Check if a repository directory is provided

if [ -z "$1" ];
then

echo "Usage: $0 <path-to-repo>"

exit 1

fi

# Navigate to the repository

cd "$1" || exit

# Check if the directory is a git repository

if ! git rev-parse --git-dir > /dev/null 2>&1; then

echo "Error: Directory is not a Git repository."

exit 1

fi

# Get a list of contributor emails

contributors=$(git log --format='%aE' | sort -u)

# Iterate over each contributor

for contributor in $contributors; do

# Count commits


commit_count=$(git log --author="$contributor" --pretty=oneline | wc -l)


# Count net lines of code (added minus deleted)


net_lines=$(git log --author="$contributor" --pretty=tformat: --numstat | \


awk '{ added += $1; deleted += $2 } END { print added - deleted }')


echo "Contributor: $contributor"


echo "Commits: $commit_count"


echo "Net lines of code: $net_lines"


echo ""

done