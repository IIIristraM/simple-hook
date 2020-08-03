ab \
    -n 50 \
    -c 10 \
    -T 'application/json' \
    -p './tests/stress/payload.json' \
    -H 'x-github-event: pull_request' \
    http://localhost:8000/run