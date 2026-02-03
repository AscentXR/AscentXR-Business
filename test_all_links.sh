#!/bin/bash
echo "=== COMPREHENSIVE LINK TESTING ==="
echo ""

# Test all HTML pages
echo "=== TESTING ALL HTML PAGES (HTTP STATUS) ==="
PAGES="unified_dashboard.html ascent_dashboard_docs.html ASCENT_XR_DASHBOARD.html ASCENT_XR_LINKEDIN_STRATEGY.html ASCENT_XR_ROI_TEMPLATE.html ASCENT_ASSISTANT_CONSTITUTION.html NICK_STATUS.html LINKEDIN_SCHEDULE.html linkedin_gallery.html"

for page in $PAGES; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "https://ascentxr.com/dev/$page" 2>/dev/null || echo "ERROR")
    echo "$page → $status"
done

echo ""
echo "=== TESTING ALL NAVIGATION LINKS ==="

# Collect all unique links from all pages
declare -A all_links

for page in $PAGES; do
    echo "--- Extracting from $page ---"
    curl -s "https://ascentxr.com/dev/$page" | grep -o 'href="[^"]*\.html"' | sed 's/href="//' | sed 's/"//' | sort | uniq | while read link; do
        if [ -n "$link" ]; then
            all_links["$link"]=1
            echo "  Found: $link"
        fi
    done
done

echo ""
echo "=== TESTING ALL UNIQUE LINKS ==="
for link in "${!all_links[@]}"; do
    # Determine full URL
    if [[ $link == *"/"* ]]; then
        # Already a path
        full_url="https://ascentxr.com$link"
    else
        # Relative path
        full_url="https://ascentxr.com/dev/$link"
    fi
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "$full_url" 2>/dev/null || echo "ERROR")
    echo "$link → $status"
done
