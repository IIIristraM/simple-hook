./enable-host.sh &&
cat ./event.json &&
CID=$(basename "$(cat /proc/1/cpuset)") &&
curl \
    -X POST \
    -H 'Content-Type: application/json' \
    -H "Container-ID: $CID" \
    -d "$(cat ./event.json)" \
    http://host.docker.internal:8000/complete || true