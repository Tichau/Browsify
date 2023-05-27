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
    echo "Build failed."
    exit 1
fi

echo ""
echo "Deploy..."
echo ""

echo "Clean old version..."
ssh bot@groot "cd /var/www/browsify && rm -rf *"
if [ $? != 0 ]
then
    echo "Failed to connect to server."
    exit 2
fi

echo ""
echo "Deploy new version..."
scp -r dist/browsify/** bot@groot:/var/www/browsify
if [ $? != 0 ]
then
    echo "Failed to deploy on server."
    exit 3
fi

echo ""
echo "Commit..."
echo ""

git add package.json
git commit -m "Publish v$newVersion"

echo "Deployment succeeded!"
