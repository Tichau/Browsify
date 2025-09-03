#!/bin/bash

if (($# != 1)); then
  >&2 echo "usage: deploy <deploy-branch>"
  exit
fi

deployBranch=$1

echo "Increment build number..."

json=$(cat package.json)

re="\"(version)\": \"([^\"]*)\""
if [[ $json =~ $re ]]; then
  version="${BASH_REMATCH[2]}"
fi

re="([0-9]+)\.([0-9]+)\.([0-9]+)"
if [[ $version =~ $re ]]; then
  major="${BASH_REMATCH[1]}"
  minor="${BASH_REMATCH[2]}"
  build="${BASH_REMATCH[3]}"
fi

build=$(($build + 1))
newVersion="$major.$minor.$build"

json=${json/\"version\": \"$version\"/\"version\": \"$newVersion\"}

echo "$json" >package.json

echo ""
echo "Build and deploy version $newVersion..."

# To uncomment if you deploy on github pages with default configuration
npm run ng deploy -- --dir=dist/browsify/ --base-href=/Browsify/ --branch=$deployBranch --message="Deploy v$newVersion"

# To uncomment if you deploy on github pages with a custom domain
# npm run ng deploy -- --dir=dist/browsify/ --cname=browsify.aallard.me --branch=$deployBranch --message="Deploy v$newVersion"

if [ $? != 0 ]; then
  >&2 echo "Build failed."
  exit 1
fi

echo ""
echo "Commit..."
echo ""

git add package.json
git commit -m "Publish v$newVersion"

echo "Deployment succeeded!"
