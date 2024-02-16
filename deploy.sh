if (( $# != 1 )); then
    >&2 echo "usage: deploy <deploy-branch>"
    exit
fi

deployBranch=$1

echo "Increment build number..."

json=`cat package.json`

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

echo "$json" > package.json

echo ""
echo "Build version $newVersion..."

npm run build

if [ $? != 0 ]
then
    >&2 echo "Build failed."
    exit 1
fi

echo ""
echo "Deploy..."
echo ""

deployDir=`mktemp -d`

echo "Clone $deployBranch repository: $deployDir"
git clone -l -s -b $deployBranch . $deployDir
if [ $? != 0 ]
then
    >&2 echo "Failed to checkout deploy branch '$deployBranch'."
    exit 2
fi

echo "Copy files..."
rm -r $deployDir/*
cp -r dist/browsify/** $deployDir

echo "Push to server..."
git --git-dir=$deployDir/.git --work-tree=$deployDir add .
git --git-dir=$deployDir/.git --work-tree=$deployDir commit -m "Deploy v$newVersion"
git --git-dir=$deployDir/.git --work-tree=$deployDir push origin $deployBranch

echo "Clean temporary repository..."
rm -rf $deployDir

echo ""
echo "Commit..."
echo ""

git add package.json
git commit -m "Publish v$newVersion"

echo "Deployment succeeded!"
