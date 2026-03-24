#!/bin/bash
# Submit all URLs to IndexNow after deploy
curl -s https://doppelwriter.com/sitemap.xml | grep -oP '<loc>\K[^<]+' | head -500 > /tmp/dw-urls.txt
# Use the API route to submit
curl -X POST https://doppelwriter.com/api/indexnow \
  -H "Content-Type: application/json" \
  -H "Cookie: $(cat ~/.dw-cookie 2>/dev/null)" \
  -d "{\"urls\": $(cat /tmp/dw-urls.txt | jq -R -s 'split("\n") | map(select(length > 0))')}"
echo "IndexNow: submitted $(wc -l < /tmp/dw-urls.txt) URLs"
