const { chromium } = require('playwright');

async function testDashboard() {
  console.log('🧪 Starting dashboard test...');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capture console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('❌ Console error:', msg.text());
    }
  });
  
  // Load dashboard
  console.log('📄 Loading dashboard...');
  await page.goto('file:///home/jim/openclaw/dashboard_v18.html', { waitUntil: 'networkidle' });
  
  // Wait for content
  await page.waitForTimeout(3000);
  
  // Check title
  const title = await page.title();
  console.log('📊 Title:', title);
  
  // Check for charts
  const charts = await page.locator('canvas').count();
  console.log('📈 Charts found:', charts);
  
  // Check for agent cards
  const agentCards = await page.locator('.agent-card, [class*="agent"]').count();
  console.log('🤖 Agent elements:', agentCards);
  
  // Check for errors
  console.log('\n📝 Test Summary:');
  console.log('================');
  if (errors.length === 0) {
    console.log('✅ NO CONSOLE ERRORS!');
  } else {
    console.log(`❌ ${errors.length} console errors found`);
    errors.forEach((err, i) => console.log(`  ${i + 1}. ${err.substring(0, 100)}`));
  }
  
  console.log(`✅ Dashboard loaded: ${title}`);
  console.log(`✅ Charts rendered: ${charts}`);
  
  await browser.close();
  
  return {
    success: errors.length === 0,
    errors: errors,
    title: title,
    charts: charts
  };
}

testDashboard().then(result => {
  console.log('\n🏁 Test complete:', result.success ? 'PASSED' : 'FAILED');
  process.exit(result.success ? 0 : 1);
}).catch(err => {
  console.error('💥 Test error:', err);
  process.exit(1);
});
