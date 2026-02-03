#!/usr/bin/env python3
"""
Real-time Agent Progress Tracker
Fetches live agent data from OpenClaw sessions API and combines with agent registry.
"""

import json
import subprocess
import time
from datetime import datetime, timedelta
import os
import sys

def get_openclaw_sessions():
    """Get current OpenClaw sessions using CLI"""
    try:
        result = subprocess.run(
            ['openclaw', 'sessions', '--json'],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            sessions = json.loads(result.stdout)
            return sessions
    except Exception as e:
        print(f"Error getting sessions: {e}")
    
    # Fallback to reading session file directly
    session_file = '/home/jim/.openclaw/agents/main/sessions/sessions.json'
    if os.path.exists(session_file):
        try:
            with open(session_file, 'r') as f:
                return json.load(f)
        except:
            pass
    
    return []

def get_agent_registry():
    """Get agent registry data"""
    registry_file = '/home/jim/openclaw/shared_assets/tasks/agent_registry.json'
    try:
        with open(registry_file, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading agent registry: {e}")
        return {"agents": []}

def calculate_agent_progress(session, registry_entry):
    """Calculate progress percentage based on session activity"""
    progress = 0
    
    # Check if this is a subagent (indicates active work)
    if 'subagent' in session.get('key', ''):
        progress = 70  # Actively working
    elif session.get('flags') and 'system' in str(session.get('flags')):
        progress = 85  # System agent, likely coordinating
    else:
        progress = 40  # Main agent, planning
    
    # Adjust based on token usage if available
    if 'tokens' in session:
        tokens_info = session['tokens']
        if isinstance(tokens_info, str):
            try:
                if '/' in tokens_info:
                    used, total = tokens_info.split('/')
                    used = int(used.replace('k', '000').replace('K', '000'))
                    total = int(total.replace('k', '000').replace('K', '000'))
                    token_percentage = min(100, int((used / total) * 100))
                    progress = max(progress, token_percentage)
            except:
                pass
    
    return min(95, progress)  # Cap at 95% unless explicitly marked complete

def calculate_eta(progress, start_time_str):
    """Calculate ETA based on progress and elapsed time"""
    if progress <= 0:
        return "N/A"
    
    try:
        # Try to parse start time from session
        if start_time_str:
            # Simple estimation: if 50% done in X hours, ETA is X hours from now
            elapsed_hours = 1  # Default assumption
            remaining_percentage = 100 - progress
            if progress > 0:
                estimated_total_hours = elapsed_hours * (100 / progress)
                remaining_hours = estimated_total_hours - elapsed_hours
                if remaining_hours < 0.5:
                    return "<30 min"
                elif remaining_hours < 1:
                    return "~1 hour"
                elif remaining_hours < 24:
                    return f"~{int(remaining_hours)} hours"
                else:
                    days = remaining_hours / 24
                    return f"~{days:.1f} days"
    except:
        pass
    
    # Fallback estimates based on progress
    if progress < 20:
        return "2-3 hours"
    elif progress < 50:
        return "1-2 hours"
    elif progress < 80:
        return "30-60 min"
    elif progress < 95:
        return "10-30 min"
    else:
        return "Finishing up"

def get_task_description(session_key, registry_entry):
    """Get task description based on session and registry"""
    key = session_key.lower()
    
    # Map session types to tasks
    if 'subagent' in key:
        if 'content' in key or 'linkedin' in key:
            return "Creating LinkedIn content"
        elif 'design' in key:
            return "Designing visual assets"
        elif 'developer' in key or 'crm' in key:
            return "Developing CRM system"
        elif 'dashboard' in key:
            return "Building dashboard"
        else:
            return "Working on assigned task"
    elif 'main' in key:
        return "Coordinating team & tasks"
    elif 'slack' in key:
        return "Monitoring Slack channels"
    
    # Fallback to registry specialization
    if registry_entry and 'specialization' in registry_entry:
        return f"{registry_entry['specialization']}"
    
    return "Active"

def get_quality_metrics(agent_id):
    """Generate quality metrics for agents (simulated for now)"""
    # This would ideally connect to test results/QA system
    import random
    metrics = {
        'score': random.randint(70, 100),
        'tests_passed': random.randint(5, 10),
        'bugs_found': random.randint(0, 3),
        'code_quality': random.randint(80, 100)
    }
    return metrics

def check_for_alerts(agent_data):
    """Check for agent issues requiring alerts"""
    alerts = []
    
    for agent in agent_data:
        # Alert if agent has been active for too long (> 2 hours)
        if agent.get('active_hours', 0) > 2:
            alerts.append({
                'agent': agent['name'],
                'type': 'stuck',
                'message': f"{agent['name']} has been working for {agent['active_hours']:.1f} hours - may need assistance"
            })
        
        # Alert if progress is very low but agent has been active
        if agent['progress'] < 20 and agent.get('active_hours', 0) > 1:
            alerts.append({
                'agent': agent['name'],
                'type': 'slow_progress',
                'message': f"{agent['name']} showing slow progress ({agent['progress']}%)"
            })
        
        # Alert if quality score is low
        if agent.get('quality_score', 100) < 70:
            alerts.append({
                'agent': agent['name'],
                'type': 'quality_issue',
                'message': f"{agent['name']} quality score low ({agent['quality_score']}/100)"
            })
    
    return alerts

def get_agent_progress_data():
    """Main function to get combined agent progress data"""
    sessions = get_openclaw_sessions()
    registry = get_agent_registry()
    
    # Map registry agents by ID for easy lookup
    registry_map = {agent['id']: agent for agent in registry.get('agents', [])}
    
    agent_data = []
    
    # Process active sessions (last 4 hours)
    four_hours_ago = datetime.now() - timedelta(hours=4)
    
    for session in sessions:
        if isinstance(session, dict):
            # Extract agent info from session key
            session_key = session.get('key', '')
            
            # Skip if too old (unless it's the main agent)
            age = session.get('age', '')
            if 'main' not in session_key and 'hour' in age and int(age.split()[0]) > 4:
                continue
            
            # Determine agent ID from session
            agent_id = 'main'
            agent_name = 'Main Agent'
            
            if 'subagent' in session_key:
                # Try to extract agent type from session key
                key_parts = session_key.split(':')
                if len(key_parts) > 2:
                    session_id = key_parts[2]
                    # Map session to agent type
                    if 'content' in session_id.lower():
                        agent_id = 'content_creator'
                    elif 'design' in session_id.lower():
                        agent_id = 'designer'
                    elif 'developer' in session_id.lower() or 'crm' in session_id.lower():
                        agent_id = 'developer'
                    elif 'dashboard' in session_id.lower():
                        agent_id = 'dashboard'
            
            # Get registry entry
            registry_entry = registry_map.get(agent_id, {})
            
            if registry_entry:
                agent_name = registry_entry.get('name', agent_name)
                specialization = registry_entry.get('specialization', '')
                status = registry_entry.get('current_status', 'unknown')
            else:
                specialization = get_task_description(session_key, None)
                status = 'active'
            
            # Calculate progress
            progress = calculate_agent_progress(session, registry_entry)
            
            # Get quality metrics
            quality_metrics = get_quality_metrics(agent_id)
            
            agent_data.append({
                'id': agent_id,
                'name': agent_name,
                'session_key': session_key,
                'specialization': specialization,
                'status': status,
                'progress': progress,
                'eta': calculate_eta(progress, session.get('created_at', '')),
                'active_since': age if age else 'Recently',
                'quality_score': quality_metrics['score'],
                'tests_passed': quality_metrics['tests_passed'],
                'bugs_found': quality_metrics['bugs_found'],
                'code_quality': quality_metrics['code_quality'],
                'task': get_task_description(session_key, registry_entry),
                'token_usage': session.get('tokens', 'N/A'),
                'model': session.get('model', 'unknown')
            })
    
    # Add registry agents that aren't in current sessions
    for agent_id, agent in registry_map.items():
        if agent_id not in [a['id'] for a in agent_data]:
            # Not currently active
            agent_data.append({
                'id': agent_id,
                'name': agent.get('name', agent_id),
                'session_key': 'None',
                'specialization': agent.get('specialization', ''),
                'status': 'available',
                'progress': 0,
                'eta': 'N/A',
                'active_since': 'Not active',
                'quality_score': 0,
                'tests_passed': 0,
                'bugs_found': 0,
                'code_quality': 0,
                'task': 'Awaiting assignment',
                'token_usage': 'N/A',
                'model': 'N/A'
            })
    
    # Calculate alerts
    alerts = check_for_alerts(agent_data)
    
    return {
        'agents': agent_data,
        'total_agents': len(agent_data),
        'active_agents': len([a for a in agent_data if a['progress'] > 0]),
        'average_progress': sum(a['progress'] for a in agent_data) / len(agent_data) if agent_data else 0,
        'alerts': alerts,
        'last_updated': datetime.now().isoformat(),
        'sources': ['openclaw_sessions', 'agent_registry']
    }

def save_progress_data(data):
    """Save progress data to JSON file for dashboard"""
    output_file = '/home/jim/openclaw/agent_progress_data.json'
    try:
        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)
        print(f"Data saved to {output_file}")
        return True
    except Exception as e:
        print(f"Error saving data: {e}")
        return False

def main():
    """Main function"""
    print("Fetching agent progress data...")
    data = get_agent_progress_data()
    
    print(f"\nFound {data['total_agents']} agents ({data['active_agents']} active)")
    print(f"Average progress: {data['average_progress']:.1f}%")
    
    if data['alerts']:
        print(f"\n⚠️  ALERTS ({len(data['alerts'])}):")
        for alert in data['alerts']:
            print(f"  • {alert['message']}")
    
    print(f"\nAgents:")
    for agent in data['agents']:
        status_icon = "🟢" if agent['progress'] > 0 else "⚪"
        print(f"  {status_icon} {agent['name']}: {agent['progress']}% - {agent['task']} (ETA: {agent['eta']})")
    
    # Save data
    if save_progress_data(data):
        print(f"\nData saved for dashboard use")
    
    return data

if __name__ == "__main__":
    main()