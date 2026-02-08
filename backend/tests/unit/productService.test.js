const mockQuery = jest.fn();
jest.mock('../../db/connection', () => ({
  query: mockQuery,
  getClient: jest.fn(),
  testConnection: jest.fn().mockResolvedValue(true),
  runMigrations: jest.fn().mockResolvedValue()
}));

const { createProduct } = require('../fixtures/testData');

describe('Product Service', () => {
  const productService = require('../../services/productService');

  beforeEach(() => {
    mockQuery.mockReset();
  });

  // 1. getProducts returns list
  it('should get products and return list with total', async () => {
    const product1 = createProduct();
    const product2 = createProduct({ id: 'prod-uuid-2', name: 'XR Training Module', category: 'training', base_price: 15000 });

    mockQuery
      .mockResolvedValueOnce({ rows: [product1, product2] })
      .mockResolvedValueOnce({ rows: [{ count: '2' }] });

    const result = await productService.getProducts({ page: 1, limit: 50 });

    expect(result.products).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.products[0].name).toBe('Custom XR Experience');
    expect(result.products[1].name).toBe('XR Training Module');
  });

  // 2. getProducts with category filter
  it('should filter products by category', async () => {
    const product = createProduct({ category: 'training' });

    mockQuery
      .mockResolvedValueOnce({ rows: [product] })
      .mockResolvedValueOnce({ rows: [{ count: '1' }] });

    const result = await productService.getProducts({ category: 'training' });

    expect(result.products).toHaveLength(1);
    expect(result.total).toBe(1);
    // Verify category param was passed to the query
    expect(mockQuery).toHaveBeenCalledTimes(2);
    const firstCallParams = mockQuery.mock.calls[0][1];
    expect(firstCallParams).toContain('training');
  });

  // 3. getProductById returns product
  it('should get product by id with features', async () => {
    const product = createProduct();
    const features = [
      { id: 'feat-1', product_id: 'prod-uuid-1', name: 'Multi-user support', status: 'released' },
      { id: 'feat-2', product_id: 'prod-uuid-1', name: 'Analytics dashboard', status: 'planned' }
    ];

    mockQuery
      .mockResolvedValueOnce({ rows: [product] })
      .mockResolvedValueOnce({ rows: features });

    const result = await productService.getProductById('prod-uuid-1');

    expect(result).not.toBeNull();
    expect(result.id).toBe('prod-uuid-1');
    expect(result.name).toBe('Custom XR Experience');
    expect(result.product_features).toHaveLength(2);
    expect(result.product_features[0].name).toBe('Multi-user support');
  });

  // 4. getProductById returns null for not found
  it('should return null when product not found', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const result = await productService.getProductById('non-existent');

    expect(result).toBeNull();
  });

  // 5. createProduct inserts and returns
  it('should create a product and return it', async () => {
    const newProduct = createProduct({ id: 'prod-new-1' });

    mockQuery.mockResolvedValueOnce({ rows: [newProduct] });

    const result = await productService.createProduct({
      name: 'Custom XR Experience',
      description: 'Test product',
      category: 'custom_experience',
      pricing_model: 'one_time',
      base_price: 25000,
      status: 'active',
      features: []
    });

    expect(result.id).toBe('prod-new-1');
    expect(result.name).toBe('Custom XR Experience');
    expect(mockQuery).toHaveBeenCalledTimes(1);
    // Verify INSERT query was used
    expect(mockQuery.mock.calls[0][0]).toContain('INSERT INTO products');
  });

  // 6. updateProduct with valid fields
  it('should update product with valid fields', async () => {
    const updated = createProduct({ name: 'Updated Experience', base_price: 30000 });

    mockQuery.mockResolvedValueOnce({ rows: [updated] });

    const result = await productService.updateProduct('prod-uuid-1', {
      name: 'Updated Experience',
      base_price: 30000
    });

    expect(result).not.toBeNull();
    expect(result.name).toBe('Updated Experience');
    expect(result.base_price).toBe(30000);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery.mock.calls[0][0]).toContain('UPDATE products SET');
  });

  // 7. deleteProduct
  it('should delete a product and return deleted id', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'prod-uuid-1' }] });

    const result = await productService.deleteProduct('prod-uuid-1');

    expect(result).not.toBeNull();
    expect(result.id).toBe('prod-uuid-1');
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery.mock.calls[0][0]).toContain('DELETE FROM products');
  });

  // 8. getFeatures returns features for product
  it('should get features for a product', async () => {
    const features = [
      { id: 'feat-1', product_id: 'prod-uuid-1', name: 'Multi-user support', status: 'released', priority: 1 },
      { id: 'feat-2', product_id: 'prod-uuid-1', name: 'Analytics dashboard', status: 'planned', priority: 2 },
      { id: 'feat-3', product_id: 'prod-uuid-1', name: 'Offline mode', status: 'in_development', priority: 3 }
    ];

    mockQuery.mockResolvedValueOnce({ rows: features });

    const result = await productService.getFeaturesByProduct('prod-uuid-1');

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('Multi-user support');
    expect(result[1].name).toBe('Analytics dashboard');
    expect(result[2].name).toBe('Offline mode');
    expect(mockQuery.mock.calls[0][1]).toEqual(['prod-uuid-1']);
  });
});
