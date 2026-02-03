# Shared Assets Directory

This directory provides a centralized location for agents to share assets and collaborate on projects.

## Directory Structure

### /design/
Branding assets, logos, visual designs, UI/UX components.
- **Logos**: Company logos in various formats
- **Styles**: Color palettes, typography, design systems
- **Templates**: Design templates for presentations, documents
- **Assets**: Images, icons, illustrations

### /content/
Content creation assets for LinkedIn, social media, and marketing.
- **LinkedIn**: Posts, carousels, articles
- **Social Media**: Content for other platforms
- **Copywriting**: Ad copy, email templates
- **Scheduling**: Content calendars, posting schedules

### /code/
Code repositories, scripts, and development assets.
- **CRM**: CRM interface files, schemas, improvements
- **Dashboard**: HTML/CSS/JS dashboard files
- **Scripts**: Automation scripts, utilities
- **Templates**: Code templates, boilerplate

### /docs/
Documentation, specifications, and project documentation.
- **Specifications**: Technical specifications, requirements
- **Guides**: How-to guides, tutorials
- **Meeting Notes**: Meeting summaries, decisions
- **Project Docs**: Project documentation, status reports

### /tasks/
Task management and agent coordination.
- **task_request_schema.json**: JSON schema for task requests
- **agent_registry.json**: Registry of available agents
- **status_updates.md**: Shared status updates file
- **pending_tasks/**: Directory for pending task requests

## Usage Guidelines

1. **File Naming**: Use descriptive names with dates (YYYY-MM-DD_description)
2. **Version Control**: Add version numbers for iterative files (v1, v2)
3. **Metadata**: Include metadata in README files within each directory
4. **Cleanup**: Archive old files to /archive/ subdirectories
5. **Integration**: Reference assets from existing projects (LinkedIn Week 1, CRM, Dashboard)

## Integration with Existing Projects

### LinkedIn Week 1 Assets
Location: `/home/jim/openclaw/linkedin_week1/`
- Copy relevant assets to `/shared_assets/content/linkedin/week1/`
- Reference templates in shared directory

### CRM Interface Files
Location: `/home/jim/openclaw/crm/`
- Share schema.json and improvements in `/shared_assets/code/crm/`

### Dashboard Improvements
Location: `/home/jim/openclaw/ascent_xr_master_dashboard.html`
- Reference dashboard files in `/shared_assets/code/dashboard/`

### Branding Assets
Location: `/home/jim/openclaw/branding/`
- Centralize all branding assets in `/shared_assets/design/`

## Agent Communication Protocol

Agents should:
1. Check `/shared_assets/tasks/agent_registry.json` for available agents
2. Use `/shared_assets/tasks/task_request_schema.json` for task requests
3. Update `/shared_assets/tasks/status_updates.md` with progress
4. Place deliverables in appropriate shared directories
5. Reference shared assets in task requirements