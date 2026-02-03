#!/bin/bash
# Generate Ascent XR branded LinkedIn images for Week 1

echo "=== GENERATING ASCENT XR BRANDED LINKEDIN IMAGES ==="
echo ""

# Ascent XR Brand Colors
PRIMARY_BLUE="#0a1d45"
SECONDARY_BLUE="#132e5e"
ACCENT_ORANGE="#ff6b00"
WHITE="#ffffff"
LIGHT_GRAY="#f5f7fa"

# Image dimensions for LinkedIn (1200x627 recommended)
WIDTH=1200
HEIGHT=627

echo "Creating Post 1: Food Web Engagement Gap..."
convert -size ${WIDTH}x${HEIGHT} xc:"$PRIMARY_BLUE" \
    -fill "$WHITE" -gravity center -pointsize 48 \
    -annotate +0+0 "THE ENGAGEMENT GAP" \
    -fill "$LIGHT_GRAY" -pointsize 24 \
    -annotate +0+80 "Bridging the divide with spatial learning" \
    -fill "$ACCENT_ORANGE" -pointsize 32 \
    -annotate +0+160 "300% Engagement Increase" \
    -fill "$WHITE" -pointsize 18 \
    -gravity southwest -annotate +40+100 "From Worksheets to Immersive VR Experiences" \
    -gravity southeast -annotate +40+40 "Ascent XR" \
    /home/jim/openclaw/branding/assets/linkedin/week1-post1-ascentxr.png

echo "Creating Post 2: AI Spatial Learning..."
convert -size ${WIDTH}x${HEIGHT} xc:"$SECONDARY_BLUE" \
    -fill "$WHITE" -gravity center -pointsize 52 \
    -annotate +0+0 "AI + Spatial Learning = ❤️" \
    -fill "$LIGHT_GRAY" -pointsize 22 \
    -annotate +0+80 "Custom lessons in minutes, not months" \
    -fill "$ACCENT_ORANGE" -pointsize 28 \
    -annotate +0+150 "Powered by Ascent XR" \
    -gravity southeast -annotate +40+40 "ascentxr.com" \
    /home/jim/openclaw/branding/assets/linkedin/week1-post2-ascentxr.png

echo "Creating Post 3: Superintendent ROI..."
convert -size ${WIDTH}x${HEIGHT} xc:"$LIGHT_GRAY" \
    -fill "$PRIMARY_BLUE" -gravity center -pointsize 42 \
    -annotate +0+0 "The Superintendent's Dilemma" \
    -fill "$SECONDARY_BLUE" -pointsize 20 \
    -annotate +0+70 "ROI Framework for Educational Technology" \
    -fill "$ACCENT_ORANGE" -pointsize 24 \
    -annotate +0+140 "✓ Engagement  ✓ Outcomes  ✓ Cost  ✓ ROI" \
    -gravity southeast -annotate +40+40 "Ascent XR" \
    /home/jim/openclaw/branding/assets/linkedin/week1-post3-ascentxr.png

echo ""
echo "=== UPLOADING TO SERVER ==="
for img in week1-post1-ascentxr.png week1-post2-ascentxr.png week1-post3-ascentxr.png; do
    echo "Uploading: $img"
    curl -T "/home/jim/openclaw/branding/assets/linkedin/$img" \
        "ftp://Sam564564457844537%40ascentxr.com:2Cl%23%2Ah2cdl%40cKNCO@ctz.hzv.mybluehost.me/dev/branding/assets/linkedin/$img" 2>&1 | tail -1
done

echo ""
echo "✅ Week 1 images regenerated with Ascent XR branding!"
echo "📁 Location: /branding/assets/linkedin/week1-post*-ascentxr.png"
