#!/usr/bin/env node

/**
 * CRM Connection Test Script
 * Tests the CRM API connection and reports results
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Test configuration
const CRM_URL = 'https://web-production-f0ae1.up.railway.app/';
const TEST_TIMEOUT = 10000; // 10 seconds
const TEST_ENDPOINTS = [
  { path: '/', method: 'GET', name: 'Root Endpoint' },
  { path: '/api/health', method: 'GET', name: 'Health Check' },
  { path: '/api/crm/connect', method: 'POST', name: 'CRM Connect' },
];

async function testEndpoint(url, endpoint) {
  return new Promise((resolve) => {
    const testUrl = new URL(endpoint.path, url);
    const options = {
      hostname: testUrl.hostname,
      port: testUrl.port || (testUrl.protocol === 'https:' ? 443 : 80),
      path: testUrl.pathname + testUrl.search,
      method: endpoint.method,
      timeout: TEST_TIMEOUT,
      headers: {
        'User-Agent': 'Ascent-XR-CRM-Test/1.0',
        'Accept': 'application/json',
      }
    };

    const protocol = testUrl.protocol === 'https:' ? https : http;
    const req = protocol.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          name: endpoint.name,
          url: testUrl.toString(),
          status: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 300,
          headers: res.headers,
          data: data.length > 0 ? data : undefined,
          error: null
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        name: endpoint.name,
        url: testUrl.toString(),
        status: 0,
        success: false,
        error: 'Request timeout'
      });
    });

    req.on('error', (err) => {
      resolve({
        name: endpoint.name,
        url: testUrl.toString(),
        status: 0,
        success: false,
        error: err.message || err.code || 'Connection failed'
      });
    });

    if (endpoint.method === 'POST') {
      req.write(JSON.stringify({
        test: true,
        timestamp: new Date().toISOString()
      }));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🔍 Testing CRM API Connection...\n');
  console.log(`Target: ${CRM_URL}`);
  console.log(`Timeout: ${TEST_TIMEOUT/1000}s per request\n`);
  
  const results = [];
  
  for (const endpoint of TEST_ENDPOINTS) {
    process.stdout.write(`Testing ${endpoint.name}... `);
    const result = await testEndpoint(CRM_URL, endpoint);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.status}`);
    } else if (result.error === 'Request timeout') {
      console.log('⏱️ TIMEOUT');
    } else {
      console.log(`❌ ${result.error || result.status}`);
    }
  }
  
  // Summary
  console.log('\n📊 TEST RESULTS SUMMARY:');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const timeouts = results.filter(r => r.error === 'Request timeout').length;
  
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Timeouts: ${timeouts}`);
  
  if (timeouts > 0) {
    console.log('\n⚠️  TIMEOUT DETECTED:');
    console.log('   This indicates a connection issue, likely:');
    console.log('   • Firewall blocking the request');
    console.log('   • Network connectivity problem');
    console.log('   • Server not responding');
    console.log('   • DNS resolution failure');
  }
  
  if (failed > 0) {
    console.log('\n❌ FAILED ENDPOINTS:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   • ${r.name}: ${r.error || `HTTP ${r.status}`}`);
    });
  }
  
  // Generate JSON report
  const report = {
    timestamp: new Date().toISOString(),
    target: CRM_URL,
    tests: results,
    summary: {
      total: results.length,
      passed,
      failed,
      timeouts,
      overall: passed === results.length ? 'PASS' : 'FAIL'
    }
  };
  
  // Save report
  const fs = require('fs');
  fs.writeFileSync(
    '/home/jim/openclaw/crm_test_results.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log(`\n📁 Report saved to: /home/jim/openclaw/crm_test_results.json`);
  
  return report;
}

// Run tests
runTests().then(report => {
  process.exit(report.summary.overall === 'PASS' ? 0 : 1);
}).catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});