// Agent Service - Stub for deployment
class AgentService {
  async getAgents() {
    return [];
  }

  async getAgentTasks(agentId) {
    return [];
  }

  async updateAgentStatus(agentId, status) {
    return { agentId, status, updated: true };
  }
}

module.exports = new AgentService();
