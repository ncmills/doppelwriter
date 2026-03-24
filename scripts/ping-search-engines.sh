#!/bin/bash
# Ping search engines to re-crawl sitemap after deploy
curl -s "https://www.google.com/ping?sitemap=https://doppelwriter.com/sitemap.xml"
curl -s "https://www.bing.com/ping?sitemap=https://doppelwriter.com/sitemap.xml"
echo "Sitemap ping sent to Google and Bing"
