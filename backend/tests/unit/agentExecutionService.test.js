const mockQuery = jest.fn();
jest.mock('../../db/connection', () => ({
  query: mockQuery,
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  runMigrations: jest.fn().mockResolvedValue()
}));

jest.mock('../../services/agentPrompts', () => ({
  buildPrompt: jest.fn().mockReturnValue('You are a helpful AI agent for AscentXR.')
}));

// Mock the websocket module so _emitUpdate doesn't fail
jest.mock('../../websocket', () => ({
  emitTaskUpdate: jest.fn()
}));

const { createAgentTask } = require('../fixtures/testData');

describe('Agent Execution Service', () => {
  const agentExecutionService = require('../../services/agentExecutionService');

  beforeEach(() => {
    mockQuery.mockReset();
    // Clear any env var to use fallback mode
    delete process.env.ANTHROPIC_API_KEY;
  });

  // 1. createTask inserts with queued status
  it('should create a task with queued status', async () => {
    const task = createAgentTask();

    mockQuery.mockResolvedValueOnce({ rows: [task] });

    const result = await agentExecutionService.createTask({
      agent_id: 'content-creator',
      title: 'Draft LinkedIn post',
      business_area: 'marketing',
      priority: 3,
      prompt: 'Write a LinkedIn post about XR in education',
      context: {},
      created_by: 'jim'
    });

    expect(result.id).toBe('task-uuid-1');
    expect(result.status).toBe('queued');
    expect(result.agent_id).toBe('content-creator');
    expect(mockQuery.mock.calls[0][0]).toContain('INSERT INTO agent_tasks');
    expect(mockQuery.mock.calls[0][0]).toContain("'queued'");
  });

  // 2. getTasks returns list
  it('should get tasks list with total', async () => {
    const t1 = createAgentTask();
    const t2 = createAgentTask({ id: 'task-uuid-2', title: 'Generate report', status: 'review', agent_name: 'CRM Agent' });

    mockQuery
      .mockResolvedValueOnce({ rows: [t1, t2] })
      .mockResolvedValueOnce({ rows: [{ count: '2' }] });

    const result = await agentExecutionService.getTasks();

    expect(result.tasks).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.tasks[0].title).toBe('Draft LinkedIn post');
    expect(result.tasks[1].title).toBe('Generate report');
  });

  // 3. getTask returns task (method is getTask, not getTaskById)
  it('should get a task by id', async () => {
    const task = createAgentTask({ agent_name: 'Content Creator' });

    mockQuery.mockResolvedValueOnce({ rows: [task] });

    const result = await agentExecutionService.getTask('task-uuid-1');

    expect(result).not.toBeNull();
    expect(result.id).toBe('task-uuid-1');
    expect(result.title).toBe('Draft LinkedIn post');
  });

  // 4. executeTask updates to running
  it('should set status to running during execution', async () => {
    const task = createAgentTask({ status: 'queued' });

    // getTask query
    mockQuery.mockResolvedValueOnce({ rows: [task] });
    // UPDATE to running
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
    // UPDATE to review (result saved) - no API key so fallback path
    const completedTask = { ...task, status: 'review', result: 'simulated response' };
    mockQuery.mockResolvedValueOnce({ rows: [completedTask] });
    // UPDATE agents tasks_completed
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const result = await agentExecutionService.executeTask('task-uuid-1');

    expect(result.status).toBe('review');
    // Second call should be the UPDATE to 'running'
    expect(mockQuery.mock.calls[1][0]).toContain("status = 'running'");
  });

  // 5. executeTask builds prompt from agentPrompts
  it('should build prompt using agentPrompts module', async () => {
    const agentPrompts = require('../../services/agentPrompts');
    const task = createAgentTask({ status: 'queued', context: '{"tone":"professional"}' });

    // getTask
    mockQuery.mockResolvedValueOnce({ rows: [task] });
    // UPDATE to running
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
    // UPDATE to review
    mockQuery.mockResolvedValueOnce({ rows: [{ ...task, status: 'review' }] });
    // UPDATE agents
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    await agentExecutionService.executeTask('task-uuid-1');

    expect(agentPrompts.buildPrompt).toHaveBeenCalledWith('content-creator', { tone: 'professional' });
  });

  // 6. executeTask saves result
  it('should save result after execution completes', async () => {
    const task = createAgentTask({ status: 'queued' });

    // getTask
    mockQuery.mockResolvedValueOnce({ rows: [task] });
    // UPDATE to running
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
    // UPDATE to review with result
    mockQuery.mockResolvedValueOnce({
      rows: [{ ...task, status: 'review', result: '[Agent content-creator - Simulated Response]' }]
    });
    // UPDATE agents
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const result = await agentExecutionService.executeTask('task-uuid-1');

    // The UPDATE call that saves the result should contain the result column
    const resultCall = mockQuery.mock.calls[2];
    expect(resultCall[0]).toContain("status = 'review'");
    expect(resultCall[0]).toContain('result');
    // The first parameter should be the result text (simulated response)
    expect(resultCall[1][0]).toContain('[Agent content-creator - Simulated Response]');
  });

  // 7. executeTask updates to review on completion
  it('should set status to review on successful completion', async () => {
    const task = createAgentTask({ status: 'queued' });

    // getTask
    mockQuery.mockResolvedValueOnce({ rows: [task] });
    // UPDATE to running
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
    // UPDATE to review
    mockQuery.mockResolvedValueOnce({ rows: [{ ...task, status: 'review' }] });
    // UPDATE agents
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const result = await agentExecutionService.executeTask('task-uuid-1');

    expect(result.status).toBe('review');
    const reviewCall = mockQuery.mock.calls[2];
    expect(reviewCall[0]).toContain("status = 'review'");
    expect(reviewCall[0]).toContain('tokens_used');
    expect(reviewCall[0]).toContain('execution_time_ms');
    expect(reviewCall[0]).toContain('completed_at');
  });

  // 8. executeTask handles errors (sets to failed)
  it('should set status to failed when execution errors occur', async () => {
    const task = createAgentTask({ status: 'queued' });

    // getTask
    mockQuery.mockResolvedValueOnce({ rows: [task] });
    // UPDATE to running
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });
    // Simulate the agentPrompts.buildPrompt throwing an error
    const agentPrompts = require('../../services/agentPrompts');
    agentPrompts.buildPrompt.mockImplementationOnce(() => {
      throw new Error('Agent prompt template not found');
    });
    // UPDATE to failed
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    await expect(agentExecutionService.executeTask('task-uuid-1')).rejects.toThrow('Agent prompt template not found');

    // Check if a failed status update was made
    const failedCall = mockQuery.mock.calls.find(c => c[0].includes("status = 'failed'"));
    expect(failedCall).toBeDefined();
    expect(failedCall[1][0]).toBe('Agent prompt template not found');

    // Restore the mock
    agentPrompts.buildPrompt.mockReturnValue('You are a helpful AI agent for AscentXR.');
  });

  // 9. reviewTask approved
  it('should review and approve a task', async () => {
    const approvedTask = createAgentTask({ status: 'approved', reviewed_by: 'jim', reviewed_at: '2026-02-08T15:00:00Z' });

    mockQuery.mockResolvedValueOnce({ rows: [approvedTask] });

    const result = await agentExecutionService.reviewTask('task-uuid-1', {
      status: 'approved',
      reviewed_by: 'jim'
    });

    expect(result).not.toBeNull();
    expect(result.status).toBe('approved');
    expect(mockQuery.mock.calls[0][0]).toContain('UPDATE agent_tasks');
    expect(mockQuery.mock.calls[0][1]).toContain('approved');
    expect(mockQuery.mock.calls[0][1]).toContain('jim');
  });

  // 10. reviewTask rejected
  it('should review and reject a task', async () => {
    const rejectedTask = createAgentTask({ status: 'rejected', reviewed_by: 'jim', reviewed_at: '2026-02-08T15:00:00Z' });

    mockQuery.mockResolvedValueOnce({ rows: [rejectedTask] });

    const result = await agentExecutionService.reviewTask('task-uuid-1', {
      status: 'rejected',
      reviewed_by: 'jim'
    });

    expect(result).not.toBeNull();
    expect(result.status).toBe('rejected');
    expect(mockQuery.mock.calls[0][1]).toContain('rejected');
  });
});
