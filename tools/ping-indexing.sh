#!/usr/bin/env bash
set -e

KEY="f478a2e684074bd5a9bf517178de3d0f"
HOST="taymahhendi.com"
KEY_LOCATION="https://${HOST}/${KEY}.txt"

echo "=== Submitting https://${HOST}/ to IndexNow API ==="

PAYLOAD=$(cat <<EOF
{
  "host": "${HOST}",
  "key": "${KEY}",
  "keyLocation": "${KEY_LOCATION}",
  "urlList": [
    "https://${HOST}/"
  ]
}
EOF
)

# Submit to api.indexnow.org
curl -s -o /dev/null -w "api.indexnow.org HTTP Response: %{http_code}\n" \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$PAYLOAD" || echo "IndexNow ping failed"

# Submit to Bing IndexNow
curl -s -o /dev/null -w "Bing IndexNow HTTP Response: %{http_code}\n" \
  -X POST "https://www.bing.com/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$PAYLOAD" || echo "Bing ping failed"

echo "=== Submission complete ==="
