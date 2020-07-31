./enable-host.sh &&
CID=$(basename "$(cat /proc/1/cpuset)") &&
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    -H "Container-ID: $CID" \
    -d "$1" \
    http://host.docker.internal:$2/complete || true