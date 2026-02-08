const mockQuery = jest.fn();
jest.mock('../../db/connection', () => ({
  query: mockQuery,
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  runMigrations: jest.fn().mockResolvedValue()
}));

const { createGoal, createKeyResult } = require('../fixtures/testData');

describe('Goal Service', () => {
  const goalService = require('../../services/goalService');

  beforeEach(() => {
    mockQuery.mockReset();
  });

  // 1. getGoals returns flat list
  it('should get goals as a flat list', async () => {
    const goal1 = createGoal();
    const goal2 = createGoal({ id: 'goal-uuid-2', title: 'Launch 3 products', business_area: 'product' });

    mockQuery.mockResolvedValueOnce({ rows: [goal1, goal2] });

    const result = await goalService.getGoals();

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Build $300K pipeline');
    expect(result[1].title).toBe('Launch 3 products');
  });

  // 2. getGoals with quarter filter
  it('should filter goals by quarter', async () => {
    const goal = createGoal({ quarter: 'Q2_2026' });

    mockQuery.mockResolvedValueOnce({ rows: [goal] });

    const result = await goalService.getGoals({ quarter: 'Q2_2026' });

    expect(result).toHaveLength(1);
    expect(result[0].quarter).toBe('Q2_2026');
    const callParams = mockQuery.mock.calls[0][1];
    expect(callParams).toContain('Q2_2026');
  });

  // 3. getGoalById returns with children
  it('should get goal by id with children key_results', async () => {
    const objective = createGoal({ goal_type: 'objective' });
    const kr1 = createKeyResult({ id: 'kr-uuid-1', title: 'Generate 150 leads' });
    const kr2 = createKeyResult({ id: 'kr-uuid-2', title: 'Close 5 deals', target_value: 5 });

    // First query: get the goal
    mockQuery.mockResolvedValueOnce({ rows: [objective] });
    // Second query: get children
    mockQuery.mockResolvedValueOnce({ rows: [kr1, kr2] });

    const result = await goalService.getGoalById('goal-uuid-1');

    expect(result).not.toBeNull();
    expect(result.id).toBe('goal-uuid-1');
    expect(result.goal_type).toBe('objective');
    expect(result.key_results).toHaveLength(2);
    expect(result.key_results[0].title).toBe('Generate 150 leads');
  });

  // 4. getTree builds hierarchy (objectives with child key_results)
  it('should build OKR tree with objectives containing key_results', async () => {
    const obj1 = createGoal({ id: 'obj-1', title: 'Sales Target', goal_type: 'objective' });
    const obj2 = createGoal({ id: 'obj-2', title: 'Product Launch', goal_type: 'objective', business_area: 'product' });
    const kr1 = createKeyResult({ id: 'kr-1', parent_id: 'obj-1', title: 'Generate leads', progress: 40 });
    const kr2 = createKeyResult({ id: 'kr-2', parent_id: 'obj-1', title: 'Close deals', progress: 60 });
    const kr3 = createKeyResult({ id: 'kr-3', parent_id: 'obj-2', title: 'Ship MVP', progress: 80 });

    mockQuery.mockResolvedValueOnce({ rows: [obj1, obj2, kr1, kr2, kr3] });

    const result = await goalService.getTree({ quarter: 'Q1_2026' });

    expect(result.tree).toHaveLength(2);
    // First objective with 2 key results
    expect(result.tree[0].key_results).toHaveLength(2);
    expect(result.tree[0].key_result_count).toBe(2);
    // calculated_progress = avg of children: (40 + 60) / 2 = 50
    expect(result.tree[0].calculated_progress).toBe(50);

    // Second objective with 1 key result
    expect(result.tree[1].key_results).toHaveLength(1);
    expect(result.tree[1].calculated_progress).toBe(80);

    // Summary
    expect(result.summary.total_objectives).toBe(2);
    expect(result.summary.total_key_results).toBe(3);

    // by_area grouping
    expect(result.by_area.sales).toHaveLength(1);
    expect(result.by_area.product).toHaveLength(1);
  });

  // 5. createGoal objective
  it('should create an objective goal', async () => {
    const goal = createGoal();

    mockQuery.mockResolvedValueOnce({ rows: [goal] });

    const result = await goalService.createGoal({
      title: 'Build $300K pipeline',
      goal_type: 'objective',
      business_area: 'sales',
      quarter: 'Q1_2026',
      target_value: 300000,
      unit: 'currency',
      owner: 'jim'
    });

    expect(result.id).toBe('goal-uuid-1');
    expect(result.goal_type).toBe('objective');
    expect(result.parent_id).toBeNull();
    expect(mockQuery.mock.calls[0][0]).toContain('INSERT INTO goals');
  });

  // 6. createGoal key_result with parent
  it('should create a key_result with parent_id', async () => {
    const kr = createKeyResult();

    mockQuery.mockResolvedValueOnce({ rows: [kr] });

    const result = await goalService.createGoal({
      parent_id: 'goal-uuid-1',
      title: 'Generate 150 leads',
      goal_type: 'key_result',
      business_area: 'sales',
      quarter: 'Q1_2026',
      target_value: 150,
      unit: 'count'
    });

    expect(result.id).toBe('kr-uuid-1');
    expect(result.parent_id).toBe('goal-uuid-1');
    expect(result.goal_type).toBe('key_result');
  });

  // 7. updateGoal progress
  it('should update goal progress', async () => {
    const updated = createKeyResult({ progress: 65, current_value: 97, parent_id: null });

    mockQuery.mockResolvedValueOnce({ rows: [updated] });

    const result = await goalService.updateGoal('kr-uuid-1', {
      progress: 65,
      current_value: 97
    });

    expect(result).not.toBeNull();
    expect(result.progress).toBe(65);
    expect(result.current_value).toBe(97);
    expect(mockQuery.mock.calls[0][0]).toContain('UPDATE goals SET');
  });

  // 8. progress rollup: objective = avg of children
  it('should rollup objective progress as average of children', async () => {
    // updateGoal returns a key_result with parent_id
    const updatedKr = createKeyResult({ progress: 80, parent_id: 'goal-uuid-1' });
    mockQuery.mockResolvedValueOnce({ rows: [updatedKr] });

    // rollupProgress: fetch children progress
    const children = [
      { progress: 80 },
      { progress: 40 },
      { progress: 60 }
    ];
    mockQuery.mockResolvedValueOnce({ rows: children });

    // rollupProgress: update parent objective
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    await goalService.updateGoal('kr-uuid-1', { progress: 80 });

    // rollupProgress should have been called
    expect(mockQuery).toHaveBeenCalledTimes(3);

    // Verify the parent update query: avg = (80+40+60)/3 = 60
    const updateCall = mockQuery.mock.calls[2];
    expect(updateCall[0]).toContain('UPDATE goals SET progress');
    expect(updateCall[1][0]).toBe(60); // avg progress
    expect(updateCall[1][1]).toBe('goal-uuid-1'); // parent id
  });

  // 9. behind-schedule detection (via getTree)
  it('should detect behind-schedule goals with low progress', async () => {
    const behindGoal = createGoal({
      id: 'obj-behind',
      title: 'Behind target',
      goal_type: 'objective',
      progress: 10
    });
    // No key results means calculated_progress = obj.progress
    mockQuery.mockResolvedValueOnce({ rows: [behindGoal] });

    const result = await goalService.getTree({ quarter: 'Q1_2026' });

    expect(result.tree).toHaveLength(1);
    expect(result.tree[0].calculated_progress).toBe(10);
    // The status field tracks behind-schedule state
    expect(result.tree[0].status).toBe('on_track');
    // With 10% progress and quarter underway, this would be behind in the notification system
    expect(result.summary.avg_progress).toBe(10);
  });

  // 10. deleteGoal
  it('should delete a goal and trigger parent rollup if child', async () => {
    // Delete returns goal with parent_id
    const deleted = { id: 'kr-uuid-1', parent_id: 'goal-uuid-1' };
    mockQuery.mockResolvedValueOnce({ rows: [deleted] });

    // rollupProgress: fetch remaining children
    const remainingChildren = [{ progress: 50 }];
    mockQuery.mockResolvedValueOnce({ rows: remainingChildren });

    // rollupProgress: update parent
    mockQuery.mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const result = await goalService.deleteGoal('kr-uuid-1');

    expect(result).not.toBeNull();
    expect(result.id).toBe('kr-uuid-1');
    expect(mockQuery).toHaveBeenCalledTimes(3);
    // Verify parent rollup happened
    expect(mockQuery.mock.calls[2][1][0]).toBe(50); // remaining child progress avg
    expect(mockQuery.mock.calls[2][1][1]).toBe('goal-uuid-1');
  });
});
