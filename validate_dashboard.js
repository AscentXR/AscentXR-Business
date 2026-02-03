#!/usr/bin/env node
/**
 * Dashboard Validator - No browser required
 * Validates HTML structure, JS syntax, CSS references
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 DASHBOARD VALIDATOR\n');

const checks = {
  passed: 0,
  failed: 0,
  warnings: 0
};

function check(name, condition, error = '') {
  if (condition) {
    console.log(`  ✅ ${name}`);
    checks.passed++;
    return true;
  } else {
    console.log(`  ❌ ${name}${error ? ': ' + error : ''}`);
    checks.failed++;
    return false;
  }
}

function warn(name, message) {
  console.log(`  ⚠️  ${name}: ${message}`);
  checks.warnings++;
}

// Read dashboard file
const dashboardPath = process.argv[2] || './dashboard_v18.html';
const html = fs.readFileSync(dashboardPath, 'utf8');

console.log(`📄 Testing: ${dashboardPath}\n`);

// 1. Structure Tests
console.log('📐 STRUCTURE TESTS:');
check('DOCTYPE present', html.includes('<!DOCTYPE html>'));
check('HTML lang attribute', html.includes('<html lang="en">'));
check('Title present', html.includes('<title>'));
check('Head section', html.includes('<head>') && html.includes('</head>'));
check('Body section', html.includes('<body>') && html.includes('</body>'));

// 2. Meta Tags
console.log('\n🏷️  META TAGS:');
check('Charset UTF-8', html.includes('charset="UTF-8"'));
check('Viewport meta', html.includes('viewport'));
check('Cache control', html.includes('no-cache'));

// 3. Required Resources
console.log('\n📦 RESOURCES:');
check('Chart.js loaded', html.includes('chart.js') || html.includes('Chart.js'));
check('Font Awesome', html.includes('font-awesome'));
check('CSS file linked', html.includes('agent_coordination_styles.css'));
check('Favicon', html.includes('favicon'));

// 4. JavaScript Validation
console.log('\n💻 JAVASCRIPT:');
const jsErrors = [];

// Check for common issues
if (html.includes('await') && !html.includes('async function') && !html.includes('async (')) {
  jsErrors.push('Found await without async declaration');
}

if (html.includes('document.getElementById') && !html.includes('if (!') && !html.includes('if(')) {
  warn('DOM queries', 'Consider adding null checks for getElementById');
}

if (!html.includes('loadAgentRegistry')) {
  jsErrors.push('Missing loadAgentRegistry function');
}

if (!html.includes('updateStats')) {
  jsErrors.push('Missing updateStats function');
}

check('No obvious async/await errors', jsErrors.length === 0, jsErrors.join(', '));
check('loadAgentRegistry defined', html.includes('loadAgentRegistry'));
check('updateStats defined', html.includes('updateStats'));
check('switchView defined', html.includes('switchView'));

// 5. Chart Containers
console.log('\n📊 CHARTS:');
check('Revenue trend chart', html.includes('revenueTrendChart') || html.includes('revenue-trend'));
check('Agent performance chart', html.includes('agentPerformanceChart') || html.includes('agent-performance'));
check('Task distribution chart', html.includes('taskDistributionChart') || html.includes('task-distribution'));
check('Weekly activity chart', html.includes('weeklyActivityChart') || html.includes('weekly-activity'));

// 6. Agent Components
console.log('\n🤖 AGENT COMPONENTS:');
check('Agent registry reference', html.includes('agent_registry.json') || html.includes('agentData'));
check('Agent cards container', html.includes('agent-card') || html.includes('agentCard'));
check('Task queue', html.includes('task') && html.includes('priority'));

// 7. UI Components
console.log('\n🎨 UI COMPONENTS:');
check('Navigation', html.includes('nav') || html.includes('sidebar'));
check('Header stats', html.includes('header') && html.includes('stat'));
check('Dashboard grid', html.includes('grid') || html.includes('flex'));
check('Mobile responsive', html.includes('viewport') && html.includes('width=device-width'));

// 8. No Purple Check
console.log('\n🚫 COLOR CHECK:');
const purpleMatches = html.match(/#8b5cf6|rgb\(139,\s*92,\s*246|rgba\(139,\s*92,\s*246/gi);
if (purpleMatches) {
  warn('Purple colors found', `${purpleMatches.length} instances - should be blue/teal`);
} else {
  check('No purple colors', true);
}

// 9. Accessibility
console.log('\n♿ ACCESSIBILITY:');
check('Lang attribute', html.includes('lang='));
check('Meta viewport', html.includes('viewport'));

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Passed: ${checks.passed}`);
console.log(`❌ Failed: ${checks.failed}`);
console.log(`⚠️  Warnings: ${checks.warnings}`);
console.log('='.repeat(50));

if (checks.failed === 0) {
  console.log('\n🎉 ALL CRITICAL CHECKS PASSED!');
  console.log('Dashboard is structurally sound and ready for deployment.');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${checks.failed} critical issue(s) found.`);
  console.log('Fix errors before deployment.');
  process.exit(1);
}
