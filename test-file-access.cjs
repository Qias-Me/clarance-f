const fs = require('fs');

console.log('🧪 Testing file access...');

try {
  // Test if file exists
  const filePath = './api/sections-references/section-30.json';
  console.log('📁 File path:', filePath);
  
  const exists = fs.existsSync(filePath);
  console.log('📄 File exists:', exists);
  
  if (exists) {
    const stats = fs.statSync(filePath);
    console.log('📊 File size:', stats.size, 'bytes');
    
    // Try to read a small portion
    const content = fs.readFileSync(filePath, 'utf8');
    console.log('📝 Content length:', content.length);
    console.log('🔍 First 200 characters:', content.substring(0, 200));
    
    // Try to parse JSON
    const data = JSON.parse(content);
    console.log('📋 JSON parsed successfully');
    console.log('🎯 Fields array length:', data.fields ? data.fields.length : 'No fields array');
    
    // Test searching for field 16262
    if (data.fields) {
      const field16262Count = data.fields.filter(f => f.id === '16262 0 R').length;
      console.log('🔢 Field 16262 occurrences:', field16262Count);
    }
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
}

console.log('✅ Test complete'); 