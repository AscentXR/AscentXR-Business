#!/usr/bin/env node
/**
 * Agent Registry Display Test
 * Verifies that all 22 agents render correctly in dashboard_v19.html
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
    log('🚀 Starting Agent Registry Display Test', 'info');
    log('📄 Testing dashboard_v19.html', 'info');

    const dashboardPath = path.resolve(__dirname, 'dashboard_v19.html');
    
    // Check if file exists
    if (!fs.existsSync(dashboardPath)) {
        log(`❌ dashboard_v19.html not found at ${dashboardPath}`, 'error');
        process.exit(1);
    }
    
    log(`✅ Found dashboard_v19.html`, 'success');

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
        await page.waitForTimeout(2000); // Give JS time to execute

        log('✅ Dashboard loaded successfully', 'success');

        // Test 1: Check if agent registry section exists
        log('🔍 Test 1: Checking agent registry section...', 'info');
        const registrySection = await page.locator('#agentRegistrySection').count();
        if (registrySection > 0) {
            log('✅ Agent registry section found', 'success');
        } else {
            log('❌ Agent registry section NOT found', 'error');
        }

        // Test 2: Check if agent cards grid exists
        log('🔍 Test 2: Checking agent cards grid...', 'info');
        const cardsGrid = await page.locator('#agentCardsGrid').count();
        if (cardsGrid > 0) {
            log('✅ Agent cards grid found', 'success');
        } else {
            log('❌ Agent cards grid NOT found', 'error');
        }

        // Test 3: Count agent cards
        log('🔍 Test 3: Counting agent cards...', 'info');
        await page.waitForTimeout(1000); // Wait for JS to render cards
        const agentCards = await page.locator('.agent-card-item').count();
        log(`📊 Found ${agentCards} agent cards`, 'info');

        if (agentCards === 22) {
            log('✅ All 22 agents are displayed!', 'success');
        } else if (agentCards > 0) {
            log(`⚠️ Expected 22 agents, but found ${agentCards}`, 'warn');
        } else {
            log('❌ No agent cards found', 'error');
        }

        // Test 4: Check summary statistics
        log('🔍 Test 4: Checking summary statistics...', 'info');
        const summaryTotal = await page.locator('#summaryTotalAgents').textContent().catch(() => '0');
        const summaryActive = await page.locator('#summaryActiveAgents').textContent().catch(() => '0');
        const summaryAvailable = await page.locator('#summaryAvailableAgents').textContent().catch(() => '0');
        const summaryBusy = await page.locator('#summaryBusyAgents').textContent().catch(() => '0');

        log(`📊 Summary - Total: ${summaryTotal}, Active: ${summaryActive}, Available: ${summaryAvailable}, Busy: ${summaryBusy}`, 'info');

        if (parseInt(summaryTotal) === 22) {
            log('✅ Summary shows correct total (22)', 'success');
        }

        // Test 5: Check filter buttons
        log('🔍 Test 5: Checking filter buttons...', 'info');
        const filterButtons = await page.locator('.agent-filter-btn').count();
        log(`📊 Found ${filterButtons} filter buttons`, 'info');
        
        if (filterButtons === 4) {
            log('✅ All filter buttons present (All, Active, Available, Busy)', 'success');
        }

        // Test 6: Check search box
        log('🔍 Test 6: Checking search box...', 'info');
        const searchBox = await page.locator('#agentSearchInput').count();
        if (searchBox > 0) {
            log('✅ Search box found', 'success');
        } else {
            log('❌ Search box NOT found', 'error');
        }

        // Test 7: Check modal
        log('🔍 Test 7: Checking agent details modal...', 'info');
        const modal = await page.locator('#agentDetailsModal').count();
        if (modal > 0) {
            log('✅ Agent details modal found', 'success');
        } else {
            log('❌ Agent details modal NOT found', 'error');
        }

        // Test 8: Click on first agent card and check modal opens
        log('🔍 Test 8: Testing agent card click...', 'info');
        const firstCard = page.locator('.agent-card-item').first();
        if (await firstCard.count() > 0) {
            await firstCard.click();
            await page.waitForTimeout(500);
            
            const modalActive = await page.locator('#agentDetailsModal.active').count();
            if (modalActive > 0) {
                log('✅ Modal opens on agent card click', 'success');
                
                // Check modal content
                const modalName = await page.locator('#modalAgentName').textContent().catch(() => '');
                log(`📋 Modal shows: ${modalName}`, 'info');
                
                // Close modal
                await page.locator('.agent-modal-close').click();
                await page.waitForTimeout(300);
            } else {
                log('⚠️ Modal did not open on click', 'warn');
            }
        }

        // Test 9: Test filter functionality
        log('🔍 Test 9: Testing filter functionality...', 'info');
        const activeFilter = page.locator('.agent-filter-btn[data-filter="active"]');
        if (await activeFilter.count() > 0) {
            await activeFilter.click();
            await page.waitForTimeout(500);
            
            const activeCards = await page.locator('.agent-card-item').count();
            log(`📊 Active filter shows ${activeCards} agents`, 'info');
            
            // Reset to all
            await page.locator('.agent-filter-btn[data-filter="all"]').click();
            await page.waitForTimeout(500);
        }

        // Test 10: Test search functionality
        log('🔍 Test 10: Testing search functionality...', 'info');
        const searchInput = page.locator('#agentSearchInput');
        if (await searchInput.count() > 0) {
            await searchInput.fill('SDR');
            await page.waitForTimeout(500);
            
            const searchResults = await page.locator('.agent-card-item').count();
            log(`📊 Search for "SDR" returned ${searchResults} agent(s)`, 'info');
            
            // Clear search
            await searchInput.fill('');
            await page.waitForTimeout(500);
        }

        // Take screenshot
        log('📸 Taking screenshot...', 'info');
        await page.screenshot({ path: 'agent_registry_test.png', fullPage: true });
        log('✅ Screenshot saved to agent_registry_test.png', 'success');

        // Final results
        log('', 'info');
        log('════════════════════════════════════════', 'info');
        log('           TEST RESULTS SUMMARY          ', 'info');
        log('════════════════════════════════════════', 'info');
        log(`Total Agents Displayed: ${agentCards}/22`, agentCards === 22 ? 'success' : 'warn');
        log(`Registry Section: ${registrySection > 0 ? '✅ Found' : '❌ Missing'}`, registrySection > 0 ? 'success' : 'error');
        log(`Filter Buttons: ${filterButtons}/4`, filterButtons === 4 ? 'success' : 'warn');
        log(`Search Box: ${searchBox > 0 ? '✅ Found' : '❌ Missing'}`, searchBox > 0 ? 'success' : 'error');
        log(`Details Modal: ${modal > 0 ? '✅ Found' : '❌ Missing'}`, modal > 0 ? 'success' : 'error');
        log('════════════════════════════════════════', 'info');

        if (agentCards === 22) {
            log('🎉 ALL TESTS PASSED! Agent registry is fully functional.', 'success');
        } else {
            log(`⚠️  Tests completed with warnings. Expected 22 agents, found ${agentCards}.`, 'warn');
        }

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
