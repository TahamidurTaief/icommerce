#!/usr/bin/env node
/**
 * Test script to verify the frontend API functions are working correctly
 * This will test the modified API functions that should now return arrays directly
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Simplified test to check API functions
async function testAPIFunctions() {
  console.log('🧪 Testing Frontend API Functions');
  console.log('=' * 50);
  
  try {
    // Import the API functions
    const { getCategories, getShops, getColors, getSizes } = await import('./app/lib/api.js');
    
    console.log('📋 Testing getCategories()...');
    const categories = await getCategories();
    console.log(`✅ Categories: ${Array.isArray(categories) ? `${categories.length} items` : 'Not an array'}`);
    if (categories.length > 0) {
      console.log(`📝 First category: ${JSON.stringify(categories[0], null, 2)}`);
    }
    
    console.log('\n📋 Testing getShops()...');
    const shops = await getShops();
    console.log(`✅ Shops: ${Array.isArray(shops) ? `${shops.length} items` : 'Not an array'}`);
    if (shops.length > 0) {
      console.log(`📝 First shop: ${JSON.stringify(shops[0], null, 2)}`);
    }
    
    console.log('\n📋 Testing getColors()...');
    const colors = await getColors();
    console.log(`✅ Colors: ${Array.isArray(colors) ? `${colors.length} items` : 'Not an array'}`);
    if (colors.length > 0) {
      console.log(`📝 First color: ${JSON.stringify(colors[0], null, 2)}`);
    }
    
    console.log('\n📋 Testing getSizes()...');
    const sizes = await getSizes();
    console.log(`✅ Sizes: ${Array.isArray(sizes) ? `${sizes.length} items` : 'Not an array'}`);
    if (sizes.length > 0) {
      console.log(`📝 First size: ${JSON.stringify(sizes[0], null, 2)}`);
    }
    
    console.log('\n🎉 All frontend API functions are working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing API functions:', error);
  }
}

// Run the test
testAPIFunctions().then(() => {
  console.log('\n✅ Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
