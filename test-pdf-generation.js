/**
 * Test script to trigger PDF generation and capture error logs
 */

const fetch = require('node-fetch');

async function testPdfGeneration() {
  try {
    console.log('🧪 Testing PDF generation with enhanced error reporting...');
    
    const response = await fetch('http://localhost:5173/startForm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generatePdfServer'
      })
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', response.headers.raw());
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ PDF generation response:', result);
    } else {
      console.log('❌ PDF generation failed:', response.statusText);
      const errorText = await response.text();
      console.log('❌ Error details:', errorText);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testPdfGeneration();
