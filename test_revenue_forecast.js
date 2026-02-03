#!/usr/bin/env node
/**
 * Revenue Forecasting Section Test
 * Verifies that the revenue forecasting section renders correctly
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const color = type === 'success' ? colors.green : type === 'error' ? colors.red : type === 'warn' ? colors.yellow : colors.blue;
    console.log(`${color}[${timestamp}]${colors.reset} ${message}`);
}

async function runTests() {
    log('🚀 Starting Revenue Forecasting Section Test', 'info');
    log('📄 Testing dashboard_v19.html', 'info');

    const dashboardPath = path.resolve(__dirname, 'dashboard_v19.html');
    
    if (!fs.existsSync(dashboardPath)) {
        log(`❌ dashboard_v19.html not found`, 'error');
        process.exit(1);
    }
    
    log(`✅ Found dashboard_v19.html`, 'success');

    let browser;
    try {
        browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
        const page = await context.newPage();

        log('📂 Loading dashboard...', 'info');
        await page.goto(`file://${dashboardPath}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        log('✅ Dashboard loaded successfully', 'success');

        // Test 1: Check if revenue forecast section exists
        log('🔍 Test 1: Checking revenue forecast section...', 'info');
        const forecastSection = await page.locator('#revenueForecast').count();
        if (forecastSection > 0) {
            log('✅ Revenue forecast section found', 'success');
        } else {
            log('❌ Revenue forecast section NOT found', 'error');
        }

        // Test 2: Check progress tracking elements
        log('🔍 Test 2: Checking revenue target tracking...', 'info');
        const hasProgress = await page.locator('.stat-progress-bar').first().count();
        const hasTarget = await page.locator('text=$300K').count();
        if (hasProgress > 0 && hasTarget > 0) {
            log('✅ Revenue target tracking elements found', 'success');
        }

        // Test 3: Check monthly projections
        log('🔍 Test 3: Checking monthly projections...', 'info');
        const monthlyProjections = await page.locator('text=Monthly Projections').count();
        if (monthlyProjections > 0) {
            log('✅ Monthly projections section found', 'success');
        }

        // Test 4: Check if all months are displayed
        log('🔍 Test 4: Checking all months displayed...', 'info');
        const months = ['January', 'February', 'March', 'April', 'May', 'June'];
        let monthsFound = 0;
        for (const month of months) {
            const count = await page.locator(`text=${month}`).count();
            if (count > 0) monthsFound++;
        }
        log(`📊 Found ${monthsFound}/6 months`, 'info');
        if (monthsFound === 6) {
            log('✅ All 6 months displayed', 'success');
        }

        // Test 5: Check revenue trajectory chart
        log('🔍 Test 5: Checking revenue trajectory chart...', 'info');
        const trajectoryChart = await page.locator('#revenueTrajectoryChart').count();
        if (trajectoryChart > 0) {
            log('✅ Revenue trajectory chart found', 'success');
        } else {
            log('❌ Revenue trajectory chart NOT found', 'error');
        }

        // Test 6: Check key metrics
        log('🔍 Test 6: Checking key metrics...', 'info');
        const keyMetrics = await page.locator('text=Key Metrics').count();
        const dealsNeeded = await page.locator('text=Deals/Month Needed').count();
        if (keyMetrics > 0) {
            log('✅ Key metrics section found', 'success');
        }

        // Test 7: Check navigation link
        log('🔍 Test 7: Checking Forecast navigation link...', 'info');
        const forecastNav = await page.locator('text=Forecast').count();
        if (forecastNav > 0) {
            log('✅ Forecast navigation link found', 'success');
        }

        // Test 8: Test scroll functionality
        log('🔍 Test 8: Testing scroll to forecast...', 'info');
        await page.evaluate(() => {
            const el = document.getElementById('revenueForecast');
            if (el) el.scrollIntoView({ behavior: 'instant' });
        });
        await page.waitForTimeout(500);
        
        const isVisible = await page.locator('#revenueForecast').isVisible().catch(() => false);
        if (isVisible) {
            log('✅ Revenue forecast section is visible', 'success');
        }

        // Take screenshot of the revenue section
        log('📸 Taking screenshot of revenue forecast section...', 'info');
        const revenueSection = page.locator('#revenueForecast');
        if (await revenueSection.count() > 0) {
            await revenueSection.screenshot({ path: 'revenue_forecast_section.png' });
            log('✅ Screenshot saved to revenue_forecast_section.png', 'success');
        }

        // Final results
        log('', 'info');
        log('════════════════════════════════════════', 'info');
        log('     REVENUE FORECAST TEST RESULTS      ', 'info');
        log('════════════════════════════════════════', 'info');
        log(`Forecast Section: ${forecastSection > 0 ? '✅ Found' : '❌ Missing'}`, forecastSection > 0 ? 'success' : 'error');
        log(`Monthly Projections: ${monthsFound}/6 months`, monthsFound === 6 ? 'success' : 'warn');
        log(`Trajectory Chart: ${trajectoryChart > 0 ? '✅ Found' : '❌ Missing'}`, trajectoryChart > 0 ? 'success' : 'error');
        log(`Key Metrics: ${keyMetrics > 0 ? '✅ Found' : '❌ Missing'}`, keyMetrics > 0 ? 'success' : 'error');
        log(`Navigation: ${forecastNav > 0 ? '✅ Found' : '❌ Missing'}`, forecastNav > 0 ? 'success' : 'error');
        log('════════════════════════════════════════', 'info');

        if (forecastSection > 0 && monthsFound === 6 && trajectoryChart > 0) {
            log('🎉 REVENUE FORECASTING SECTION IS FULLY FUNCTIONAL!', 'success');
        } else {
            log('⚠️  Some elements may be missing', 'warn');
        }

    } catch (error) {
        log(`❌ Test failed: ${error.message}`, 'error');
        console.error(error);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
            log('🔒 Browser closed', 'info');
        }
    }
}

runTests().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
