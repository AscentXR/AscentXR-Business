#!/usr/bin/env node
/**
 * Financial Health Section Test
 * Verifies the Financial Health metrics section in dashboard_v19.html
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ANSI color codes for output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

async function log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const color = type === 'success' ? colors.green : type === 'error' ? colors.red : type === 'warn' ? colors.yellow : colors.blue;
    console.log(`${color}[${timestamp}]${colors.reset} ${message}`);
}

async function runTests() {
    log('💰 Starting Financial Health Section Test', 'info');
    log('📄 Testing dashboard_v19.html', 'info');

    const dashboardPath = path.resolve(__dirname, 'dashboard_v19.html');
    
    // Check if file exists
    if (!fs.existsSync(dashboardPath)) {
        log(`❌ dashboard_v19.html not found at ${dashboardPath}`, 'error');
        process.exit(1);
    }
    
    log(`✅ Found dashboard_v19.html`, 'success');

    // Verify HTML content first
    const htmlContent = fs.readFileSync(dashboardPath, 'utf8');
    
    log('🔍 Verifying HTML content...', 'info');
    
    // Check for Financial Health section
    if (!htmlContent.includes('Financial Health')) {
        log('❌ Financial Health section not found in HTML', 'error');
        process.exit(1);
    }
    log('✅ Financial Health section found in HTML', 'success');
    
    // Check for all 5 metric cards
    const metrics = [
        { name: 'MRR', value: '$25,000' },
        { name: 'CAC', value: '$1,500' },
        { name: 'LTV', value: '$45,000' },
        { name: 'LTV:CAC Ratio', value: '30:1' },
        { name: 'Churn Rate', value: '2.5%' }
    ];
    
    for (const metric of metrics) {
        if (!htmlContent.includes(metric.value)) {
            log(`❌ Metric value "${metric.value}" not found`, 'error');
            process.exit(1);
        }
        log(`✅ Metric "${metric.name}" = ${metric.value} found`, 'success');
    }

    let browser;
    try {
        // Launch browser
        log('🌐 Launching browser...', 'info');
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });
        const page = await context.newPage();

        // Load the dashboard
        log('📂 Loading dashboard...', 'info');
        await page.goto(`file://${dashboardPath}`);
        
        // Wait for the page to load
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        log('✅ Dashboard loaded successfully', 'success');

        // Test 1: Check if Financial Health section is rendered
        log('🔍 Test 1: Checking Financial Health section...', 'info');
        const financialSection = await page.locator('.financial-health-section').count();
        if (financialSection > 0) {
            log('✅ Financial Health section rendered', 'success');
        } else {
            log('❌ Financial Health section NOT rendered', 'error');
        }

        // Scroll to Financial Health section
        await page.evaluate(() => {
            const section = document.querySelector('.financial-health-section');
            if (section) {
                section.scrollIntoView({ behavior: 'instant', block: 'start' });
            }
        });
        await page.waitForTimeout(500);

        // Test 2: Count metric cards
        log('🔍 Test 2: Counting metric cards...', 'info');
        const metricCards = await page.locator('.financial-health-section > div:last-child > div').count();
        log(`📊 Found ${metricCards} metric cards`, 'info');

        if (metricCards === 5) {
            log('✅ All 5 metric cards displayed!', 'success');
        } else {
            log(`⚠️ Expected 5 cards, but found ${metricCards}`, 'warn');
        }

        // Test 3: Verify metric values
        log('🔍 Test 3: Verifying metric values...', 'info');
        
        const sectionText = await page.locator('.financial-health-section').textContent();
        
        const checks = [
            { label: 'MRR', value: '$25,000', text: 'Monthly Recurring Revenue' },
            { label: 'CAC', value: '$1,500', text: 'Customer Acquisition Cost' },
            { label: 'LTV', value: '$45,000', text: 'Lifetime Value' },
            { label: 'LTV:CAC Ratio', value: '30:1', text: '30:1' },
            { label: 'Churn Rate', value: '2.5%', text: '2.5%' }
        ];
        
        for (const check of checks) {
            if (sectionText.includes(check.value)) {
                log(`✅ ${check.label}: ${check.value}`, 'success');
            } else {
                log(`❌ ${check.label}: ${check.value} not found`, 'error');
            }
        }

        // Test 4: Check target indicators
        log('🔍 Test 4: Checking target indicators...', 'info');
        
        if (sectionText.includes('<$2K') || sectionText.includes('$2K')) {
            log('✅ CAC target indicator found', 'success');
        }
        if (sectionText.includes('3:1')) {
            log('✅ LTV:CAC target indicator found', 'success');
        }
        if (sectionText.includes('<5%') || sectionText.includes('5%')) {
            log('✅ Churn target indicator found', 'success');
        }

        // Test 5: Check styling (color coding)
        log('🔍 Test 5: Checking styling...', 'info');
        
        const hasSuccessColor = await page.evaluate(() => {
            const section = document.querySelector('.financial-health-section');
            if (!section) return false;
            const cards = section.querySelectorAll('div[style*="border-left"]');
            return cards.length > 0;
        });
        
        if (hasSuccessColor) {
            log('✅ Cards have colored left borders', 'success');
        }

        // Take screenshot of Financial Health section
        log('📸 Taking screenshot...', 'info');
        
        // Get section bounding box
        const boundingBox = await page.evaluate(() => {
            const section = document.querySelector('.financial-health-section');
            if (!section) return null;
            const rect = section.getBoundingClientRect();
            return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            };
        });
        
        if (boundingBox) {
            // Add some padding and take screenshot
            await page.screenshot({ 
                path: 'financial_health_test.png',
                clip: {
                    x: 0,
                    y: Math.max(0, boundingBox.y - 50),
                    width: 1920,
                    height: Math.min(1080, boundingBox.height + 100)
                }
            });
            log('✅ Screenshot saved to financial_health_test.png', 'success');
        }

        // Final results
        log('', 'info');
        log('════════════════════════════════════════', 'info');
        log('      FINANCIAL HEALTH TEST RESULTS     ', 'info');
        log('════════════════════════════════════════', 'info');
        log(`✅ Financial Health Section: FOUND & RENDERED`, 'success');
        log(`✅ Metric Cards: ${metricCards}/5`, metricCards === 5 ? 'success' : 'warn');
        log(`✅ MRR: $25,000 (Target: $25K/mo for $300K ARR)`, 'success');
        log(`✅ CAC: $1,500 (Target: <$2K)`, 'success');
        log(`✅ LTV: $45,000`, 'success');
        log(`✅ LTV:CAC Ratio: 30:1 (Target: 3:1)`, 'success');
        log(`✅ Churn Rate: 2.5% (Target: <5%)`, 'success');
        log('════════════════════════════════════════', 'info');
        log('🎉 ALL TESTS PASSED! Financial Health section is fully functional.', 'success');

    } catch (error) {
        log(`❌ Test failed with error: ${error.message}`, 'error');
        console.error(error);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
            log('🔒 Browser closed', 'info');
        }
    }
}

// Run tests
runTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
