#!/bin/bash
# Haiku heartbeat response generator
# Usage: ./haiku_heartbeat.sh [status]

STATUS=${1:-"ok"}

if [ "$STATUS" = "ok" ]; then
    # Random haikus for normal status
    HAIKUS=(
        "Systems running smooth
Dashboard glows with data bright
All is well tonight"
        
        "Agents work in sync
Tasks flow like a quiet stream
Peace in every line"
        
        "Code stands strong and true
No errors found in the night
Ready for the day"
        
        "Servers hum softly
Data streams through fiber veins
All systems are go"
        
        "Morning light breaks through
Dashboards wake with fresh data
New day starts anew"
    )
    
    # Select random haiku
    INDEX=$((RANDOM % ${#HAIKUS[@]}))
    echo "${HAIKUS[$INDEX]}"
    
elif [ "$STATUS" = "alert" ]; then
    # Alert haikus
    echo "Warning lights flash red
Attention needed right now
Fix the broken code"
    
else
    # Custom status
    echo "Status unclear now
Check the systems carefully
Report back to me"
fi
