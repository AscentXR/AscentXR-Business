#!/usr/bin/env python3
import json
import os
import glob
import datetime
import subprocess
from pathlib import Path

def get_real_agent_data():
    """Get actual agent progress from OpenClaw session files"""
    data = {
        "agents": [],
        "total_agents": 0,
        "active_agents": 0,
        "completed_work": [],
        "real_progress": {},
        "last_updated": datetime.datetime.utcnow().isoformat() + "Z",
        "analysis_source": "real_session_files"
    }
    
    # Check for actual agent directories
    workspace = Path("/home/jim/openclaw")
    
    # Real work completed (files created/modified today)
    today = datetime.date.today()
    completed_files = []
    
    for file_path in workspace.rglob("*"):
        if file_path.is_file():
            # Get modification time
            mtime = datetime.datetime.fromtimestamp(file_path.stat().st_mtime)
            if mtime.date() == today:
                rel_path = str(file_path.relative_to(workspace))
                completed_files.append({
                    "file": rel_path,
                    "modified": mtime.isoformat(),
                    "size": file_path.stat().st_size
                })
    
    # Count actual work
    data["completed_work"] = completed_files
    
    # Analyze actual progress based on file types
    progress_areas = {
        "dashboard": 0,
        "crm": 0,
        "linkedin": 0,
        "marketing": 0,
        "sales": 0,
        "deployment": 0,
        "qa": 0
    }
    
    for file_info in completed_files:
        file_path = file_info["file"].lower()
        
        # Categorize progress
        if "dashboard" in file_path:
            progress_areas["dashboard"] += 1
        elif "crm" in file_path:
            progress_areas["crm"] += 1
        elif "linkedin" in file_path:
            progress_areas["linkedin"] += 1
        elif "market" in file_path:
            progress_areas["marketing"] += 1
        elif "sales" in file_path:
            progress_areas["sales"] += 1
        elif "deploy" in file_path or "docker" in file_path:
            progress_areas["deployment"] += 1
        elif "qa" in file_path or "test" in file_path:
            progress_areas["qa"] += 1
    
    # Calculate percentage progress (based on expected milestones)
    total_expected = 20  # Expected files per area for completion
    
    data["real_progress"] = {
        "dashboard": min(100, int((progress_areas["dashboard"] / total_expected) * 100)),
        "crm": min(100, int((progress_areas["crm"] / total_expected) * 100)),
        "linkedin": min(100, int((progress_areas["linkedin"] / total_expected) * 100)),
        "marketing": min(100, int((progress_areas["marketing"] / total_expected) * 100)),
        "sales": min(100, int((progress_areas["sales"] / total_expected) * 100)),
        "deployment": min(100, int((progress_areas["deployment"] / total_expected) * 100)),
        "qa": min(100, int((progress_areas["qa"] / total_expected) * 100)),
        "total_files_created": len(completed_files)
    }
    
    # Get actual session files from OpenClaw
    session_dir = Path("/home/jim/.openclaw/agents/main/sessions")
    if session_dir.exists():
        session_files = list(session_dir.glob("*.jsonl"))
        data["active_sessions"] = len(session_files)
        data["recent_sessions"] = []
        
        # Get recent session info
        for session_file in sorted(session_files, key=lambda x: x.stat().st_mtime, reverse=True)[:5]:
            session_info = {
                "file": session_file.name,
                "modified": datetime.datetime.fromtimestamp(session_file.stat().st_mtime).isoformat(),
                "size": session_file.stat().st_size
            }
            data["recent_sessions"].append(session_info)
    
    return data

def update_dashboard_progress(data):
    """Update the dashboard with real progress data"""
    dashboard_path = Path("/home/jim/openclaw/index.html")
    
    if not dashboard_path.exists():
        print("Dashboard file not found")
        return
    
    with open(dashboard_path, 'r') as f:
        content = f.read()
    
    # Find and update progress sections
    # This would require updating the HTML/JS to show real data
    # For now, create a JSON file for the dashboard to fetch
    
    output_path = Path("/home/jim/openclaw/real_progress.json")
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Real progress data saved to {output_path}")
    return data

if __name__ == "__main__":
    print("🔍 Analyzing REAL agent progress...")
    print("-" * 60)
    
    real_data = get_real_agent_data()
    
    print(f"📊 REAL PROGRESS ANALYSIS:")
    print(f"  Files created today: {len(real_data['completed_work'])}")
    print(f"  Active sessions: {real_data.get('active_sessions', 0)}")
    print()
    print(f"📈 PROGRESS BY AREA:")
    for area, progress in real_data["real_progress"].items():
        if isinstance(progress, int):
            print(f"  {area.capitalize():12} {progress:3}%")
    
    print()
    print(f"📋 RECENT WORK:")
    for file_info in real_data["completed_work"][:5]:  # Show first 5
        print(f"  • {file_info['file']}")
    
    print("-" * 60)
    
    # Update dashboard data
    update_dashboard_progress(real_data)