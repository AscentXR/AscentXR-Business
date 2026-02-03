#!/bin/bash
# GitHub Push Helper Script
# Usage: ./push_with_token.sh <github_token>

TOKEN=$1

if [ -z "$TOKEN" ]; then
    echo "Usage: ./push_with_token.sh <github_token>"
    echo ""
    echo "To get a token:"
    echo "1. Go to https://github.com/settings/tokens"
    echo "2. Generate new token with 'repo' scope"
    echo "3. Run: ./push_with_token.sh ghp_xxxxxxxx"
    exit 1
fi

echo "🚀 Setting up GitHub authentication..."

# Store the original remote
ORIGINAL_REMOTE=$(git remote get-url origin)

# Set remote with token
NEW_REMOTE="https://${TOKEN}@github.com/AscentXR/AscentXR-Business.git"
git remote set-url origin "$NEW_REMOTE"

echo "📤 Pushing to GitHub..."
if git push origin master; then
    echo ""
    echo "✅ Push successful!"
    echo ""
    echo "🔗 Check deployment status:"
    echo "   https://github.com/AscentXR/AscentXR-Business/actions"
    echo ""
    echo "🌐 Verify live site:"
    echo "   https://ascentxr.com/dev/"
else
    echo ""
    echo "❌ Push failed"
    echo "Check token has 'repo' scope"
fi

# Restore original remote (removes token from config)
git remote set-url origin "$ORIGINAL_REMOTE"
echo ""
echo "🔒 Token removed from git config"
