const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// GET /api/agents/progress - Get agent progress data
router.get('/progress', async (req, res, next) => {
  try {
    const progressDataPath = path.join(__dirname, '../../agent_progress_data.json');
    
    if (!fs.existsSync(progressDataPath)) {
      // Return sample data if file doesn't exist
      return res.json({
        success: true,
        data: {
          agents: [
            {
              id: 'agent-001',
              name: 'Content Creator Agent',
              status: 'active',
              progress: 85,
              tasksCompleted: 17,
              totalTasks: 20,
              lastActive: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
              currentTask: 'Creating LinkedIn post about XR technology'
            },
            {
              id: 'agent-002',
              name: 'CRM Integration Agent',
              status: 'active',
              progress: 60,
              tasksCompleted: 12,
              totalTasks: 20,
              lastActive: new Date(Date.now() - 120000).toISOString(), // 2 minutes ago
              currentTask: 'Syncing contact data with CRM'
            },
            {
              id: 'agent-003',
              name: 'Analytics Agent',
              status: 'paused',
              progress: 30,
              tasksCompleted: 6,
              totalTasks: 20,
              lastActive: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
              currentTask: 'Generating weekly performance report'
            }
          ],
          systemMetrics: {
            totalAgents: 3,
            activeAgents: 2,
            totalTasksCompleted: 35,
            averageProgress: 58.3,
            uptime: '99.8%',
            lastUpdated: new Date().toISOString()
          }
        }
      });
    }

    // Read actual progress data
    const progressData = JSON.parse(fs.readFileSync(progressDataPath, 'utf8'));
    
    res.json({
      success: true,
      data: progressData
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/agents/progress - Update agent progress
router.post('/progress', async (req, res, next) => {
  try {
    const { agentId, progress, status, currentTask } = req.body;
    
    if (!agentId) {
      return res.status(400).json({
        error: 'agentId is required'
      });
    }

    const progressDataPath = path.join(__dirname, '../../agent_progress_data.json');
    let progressData = {};
    
    if (fs.existsSync(progressDataPath)) {
      progressData = JSON.parse(fs.readFileSync(progressDataPath, 'utf8'));
    }

    // Initialize agents array if not exists
    if (!progressData.agents) {
      progressData.agents = [];
    }

    // Find or create agent
    let agentIndex = progressData.agents.findIndex(a => a.id === agentId);
    if (agentIndex === -1) {
      progressData.agents.push({
        id: agentId,
        name: `Agent ${agentId}`,
        status: 'active',
        progress: 0,
        tasksCompleted: 0,
        totalTasks: 0,
        lastActive: new Date().toISOString(),
        currentTask: ''
      });
      agentIndex = progressData.agents.length - 1;
    }

    // Update agent data
    if (progress !== undefined) progressData.agents[agentIndex].progress = progress;
    if (status !== undefined) progressData.agents[agentIndex].status = status;
    if (currentTask !== undefined) progressData.agents[agentIndex].currentTask = currentTask;
    
    progressData.agents[agentIndex].lastActive = new Date().toISOString();

    // Update system metrics
    const activeAgents = progressData.agents.filter(a => a.status === 'active').length;
    const totalProgress = progressData.agents.reduce((sum, agent) => sum + (agent.progress || 0), 0);
    const averageProgress = progressData.agents.length > 0 ? totalProgress / progressData.agents.length : 0;
    const totalTasksCompleted = progressData.agents.reduce((sum, agent) => sum + (agent.tasksCompleted || 0), 0);

    progressData.systemMetrics = {
      totalAgents: progressData.agents.length,
      activeAgents,
      totalTasksCompleted,
      averageProgress: Math.round(averageProgress * 10) / 10,
      uptime: '99.8%',
      lastUpdated: new Date().toISOString()
    };

    // Save to file
    fs.writeFileSync(progressDataPath, JSON.stringify(progressData, null, 2));
    
    res.json({
      success: true,
      message: 'Agent progress updated',
      data: progressData.agents[agentIndex]
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/agents/:id - Get specific agent details
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Try to read from actual data file
    const progressDataPath = path.join(__dirname, '../../agent_progress_data.json');
    
    if (fs.existsSync(progressDataPath)) {
      const progressData = JSON.parse(fs.readFileSync(progressDataPath, 'utf8'));
      const agent = progressData.agents?.find(a => a.id === id);
      
      if (agent) {
        return res.json({
          success: true,
          data: agent
        });
      }
    }

    // Return sample agent if not found
    const sampleAgents = {
      'agent-001': {
        id: 'agent-001',
        name: 'Content Creator Agent',
        description: 'Creates and schedules content for LinkedIn and other platforms',
        status: 'active',
        progress: 85,
        tasksCompleted: 17,
        totalTasks: 20,
        lastActive: new Date(Date.now() - 300000).toISOString(),
        currentTask: 'Creating LinkedIn post about XR technology',
        capabilities: ['content_creation', 'scheduling', 'social_media'],
        performance: {
          accuracy: 92,
          speed: 88,
          quality: 95
        }
      },
      'agent-002': {
        id: 'agent-002',
        name: 'CRM Integration Agent',
        description: 'Manages data sync between dashboard and CRM systems',
        status: 'active',
        progress: 60,
        tasksCompleted: 12,
        totalTasks: 20,
        lastActive: new Date(Date.now() - 120000).toISOString(),
        currentTask: 'Syncing contact data with CRM',
        capabilities: ['data_sync', 'api_integration', 'webhooks'],
        performance: {
          accuracy: 95,
          speed: 76,
          quality: 90
        }
      }
    };

    const agent = sampleAgents[id];
    
    if (agent) {
      res.json({
        success: true,
        data: agent
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/agents/:id/tasks - Get agent tasks
router.get('/:id/tasks', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const sampleTasks = {
      'agent-001': [
        { id: 'task-1', name: 'Create LinkedIn post about XR adoption', status: 'completed', duration: '2h 15m' },
        { id: 'task-2', name: 'Schedule posts for next week', status: 'in-progress', duration: '45m' },
        { id: 'task-3', name: 'Analyze post engagement metrics', status: 'pending', duration: '1h 30m' },
        { id: 'task-4', name: 'Generate content calendar for Q2', status: 'pending', duration: '3h' }
      ],
      'agent-002': [
        { id: 'task-5', name: 'Sync contacts with CRM', status: 'completed', duration: '1h' },
        { id: 'task-6', name: 'Update company records', status: 'in-progress', duration: '30m' },
        { id: 'task-7', name: 'Create new deal records', status: 'pending', duration: '45m' },
        { id: 'task-8', name: 'Set up webhook notifications', status: 'pending', duration: '2h' }
      ]
    };

    const tasks = sampleTasks[id] || [];
    
    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/agents/:id/control - Control agent (start, stop, pause)
router.post('/:id/control', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    
    if (!['start', 'stop', 'pause', 'resume'].includes(action)) {
      return res.status(400).json({
        error: 'Invalid action. Use: start, stop, pause, resume'
      });
    }

    // Simulate agent control
    const statusMap = {
      start: 'active',
      stop: 'stopped',
      pause: 'paused',
      resume: 'active'
    };

    res.json({
      success: true,
      message: `Agent ${id} ${action}ed successfully`,
      data: {
        agentId: id,
        previousStatus: 'active',
        newStatus: statusMap[action],
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/agents/metrics - Get agent performance metrics
router.get('/metrics', async (req, res, next) => {
  try {
    const { period = '7d' } = req.query;
    
    // Sample metrics data
    const metrics = {
      performanceOverTime: [
        { date: '2024-01-25', accuracy: 89, speed: 82, quality: 91 },
        { date: '2024-01-26', accuracy: 92, speed: 85, quality: 93 },
        { date: '2024-01-27', accuracy: 91, speed: 80, quality: 90 },
        { date: '2024-01-28', accuracy: 94, speed: 88, quality: 95 },
        { date: '2024-01-29', accuracy: 93, speed: 87, quality: 94 },
        { date: '2024-01-30', accuracy: 95, speed: 90, quality: 96 },
        { date: '2024-01-31', accuracy: 96, speed: 92, quality: 97 }
      ],
      taskCompletion: {
        completed: 235,
        inProgress: 18,
        failed: 7,
        successRate: 97.1
      },
      agentActivity: {
        active: 3,
        idle: 1,
        error: 0,
        total: 4
      },
      resourceUsage: {
        cpu: 42.5,
        memory: 67.3,
        disk: 23.8,
        network: 15.2
      }
    };

    res.json({
      success: true,
      period: period,
      data: metrics
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;