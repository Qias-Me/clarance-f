// Simple script to install the package and read a PDF
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Installing PDF Reader MCP...');
try {
  execSync('npm install @sylphlab/pdf-reader-mcp', { stdio: 'inherit' });
  console.log('Package installed successfully.');
} catch (error) {
  console.error('Failed to install package:', error);
  process.exit(1);
}

// Verify the PDF file exists
const pdfPath = path.join(__dirname, 'utilities', 'externalTools', 'sf862.pdf');
if (!fs.existsSync(pdfPath)) {
  console.error(`PDF file not found at path: ${pdfPath}`);
  process.exit(1);
}
console.log(`Found PDF file at: ${pdfPath}`);

// Run the PDF reader
console.log('Starting PDF reader...');
try {
  const { PDFReader } = require('@sylphlab/pdf-reader-mcp');
  
  async function readPDF() {
    try {
      const reader = new PDFReader();
      const result = await reader.readPDF(pdfPath, {
        includeMetadata: true,
        includePageCount: true,
        includeFullText: true
      });
      
      console.log('PDF Information:');
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error reading PDF:', error);
    }
  }
  
  readPDF();
} catch (error) {
  console.error('Failed to read PDF:', error);
} 