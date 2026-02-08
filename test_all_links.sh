#!/bin/bash
echo "=== COMPREHENSIVE LINK TESTING ==="
echo ""

# Test all HTML pages
echo "=== TESTING ALL HTML PAGES (HTTP STATUS) ==="
PAGES="dashboard_v19.html ASCENT_XR_LINKEDIN_STRATEGY.html ASCENT_XR_ROI_TEMPLATE.html ASCENT_ASSISTANT_CONSTITUTION.html NICK_STATUS.html LINKEDIN_SCHEDULE.html linkedin_gallery.html"

for page in $PAGES; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "https://ascentxr.com/dev/$page" 2>/dev/null || echo "ERROR")
    echo "$page → $status"
done

echo ""
echo "=== TESTING ALL NAVIGATION LINKS ==="

# Collect all unique links from all pages into a temp file
TMPFILE=$(mktemp)

for page in $PAGES; do
    echo "--- Extracting from $page ---"
    curl -s "https://ascentxr.com/dev/$page" | grep -o 'href="[^"]*\.html"' | sed 's/href="//;s/"//' | while read -r link; do
        if [ -n "$link" ]; then
            echo "$link" >> "$TMPFILE"
            echo "  Found: $link"
        fi
    done
done

echo ""
echo "=== TESTING ALL UNIQUE LINKS ==="
sort -u "$TMPFILE" | while read -r link; do
    # Determine full URL
    if [[ $link == *"/"* ]]; then
        full_url="https://ascentxr.com$link"
    else
        full_url="https://ascentxr.com/dev/$link"
    fi

    status=$(curl -s -o /dev/null -w "%{http_code}" "$full_url" 2>/dev/null || echo "ERROR")
    echo "$link → $status"
done

rm -f "$TMPFILE"
