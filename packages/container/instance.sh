
cd simple-hook/container &&
./enable-host.sh &&
CID=$(basename "$(cat /proc/1/cpuset)") &&
node ./index.js $CID "$1" $2