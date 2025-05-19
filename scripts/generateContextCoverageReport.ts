import fs from 'fs';
import path from 'path';

interface SectionData {
  sectionNumber: number;
  contextFile: string;
  description: string;
  status: string;
  coverage: string;
  missingFieldCount: number;
  totalFields: number;
  coverageValue?: number;
}

interface ValidationResult {
  section: number;
  contextFile: string;
  description: string;
  status: string;
  coverage?: string;
  missingFieldCount?: number;
  totalFields?: number;
}

/**
 * This script generates a detailed visual HTML report showing the 
 * coverage of fields in each section context
 */
async function generateContextCoverageReport() {
  console.log('Generating context coverage report...');
  
  // Directory paths
  const reportsDir = path.join(process.cwd(), 'reports');
  const analysisDir = path.join(process.cwd(), 'scripts', 'analysis');
  const sectionsDir = path.join(process.cwd(), 'app', 'state', 'contexts', 'sections');
  
  // Create reports directory if it doesn't exist
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }
  
  // Define section mapping
  const sectionMapping: SectionData[] = [];
  const validationReportPath = path.join(reportsDir, 'section-context-validation-report.json');
  
  if (fs.existsSync(validationReportPath)) {
    // Use existing validation report if available
    const validationReport = JSON.parse(fs.readFileSync(validationReportPath, 'utf-8')) as ValidationResult[];
    validationReport.forEach((section) => {
      sectionMapping.push({
        sectionNumber: section.section,
        contextFile: section.contextFile,
        description: section.description,
        status: section.status,
        coverage: section.coverage || '0%',
        missingFieldCount: section.missingFieldCount || 0,
        totalFields: section.totalFields || 0
      });
    });
  } else {
    console.warn('Validation report not found. Run npm run validate-section-contexts first for best results.');
    
    // Use a default mapping based on section files in the analysis directory
    const sectionFiles = fs.readdirSync(analysisDir)
      .filter(file => file.match(/^section\d+-fields\.json$/));
    
    for (const file of sectionFiles) {
      const match = file.match(/^section(\d+)-fields\.json$/);
      if (match) {
        const sectionNumber = parseInt(match[1], 10);
        sectionMapping.push({
          sectionNumber,
          contextFile: `section${sectionNumber}.tsx`, // Just a placeholder
          description: `Section ${sectionNumber}`,
          status: 'Unknown',
          coverage: 'Unknown',
          missingFieldCount: 0,
          totalFields: 0
        });
      }
    }
  }
  
  // Sort sections by number
  sectionMapping.sort((a, b) => a.sectionNumber - b.sectionNumber);
  
  // Generate coverage data for each section
  const sectionData: SectionData[] = [];
  let totalFields = 0;
  let totalMissingFields = 0;
  
  for (const section of sectionMapping) {
    const sectionFilePath = path.join(analysisDir, `section${section.sectionNumber}-fields.json`);
    const contextFilePath = path.join(sectionsDir, section.contextFile);
    
    let fieldCount = section.totalFields || 0;
    let missingCount = section.missingFieldCount || 0;
    let coverage = section.coverage || '0%';
    
    if (fs.existsSync(sectionFilePath) && fs.existsSync(contextFilePath)) {
      const fields = JSON.parse(fs.readFileSync(sectionFilePath, 'utf-8'));
      const contextContent = fs.readFileSync(contextFilePath, 'utf-8');
      
      if (!section.totalFields) {
        fieldCount = fields.length;
        
        // Count missing fields
        missingCount = fields.filter((field: any) => {
          const cleanId = field.id.replace(' 0 R', '');
          return !contextContent.includes(`id: "${cleanId}"`) && !contextContent.includes(`id: '${cleanId}'`);
        }).length;
        
        // Calculate coverage
        const coveredCount = fieldCount - missingCount;
        coverage = fieldCount > 0 ? 
          `${((coveredCount / fieldCount) * 100).toFixed(2)}%` : 
          '0%';
      }
    }
    
    sectionData.push({
      sectionNumber: section.sectionNumber,
      description: section.description,
      contextFile: section.contextFile,
      totalFields: fieldCount,
      missingFieldCount: missingCount,
      coverage: coverage,
      coverageValue: parseFloat(coverage),
      status: section.status || (missingCount > 0 ? 'Incomplete' : 'Complete')
    });
    
    totalFields += fieldCount;
    totalMissingFields += missingCount;
  }
  
  // Calculate total coverage
  const totalCoverage = totalFields > 0 ? 
    ((totalFields - totalMissingFields) / totalFields) * 100 : 
    0;
  
  // Generate HTML report
  const reportPath = path.join(reportsDir, 'context-coverage-report.html');
  
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Section Context Coverage Report</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1, h2 {
      color: #2c3e50;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .summary {
      background-color: #f8f9fa;
      border-radius: 5px;
      padding: 15px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .summary-stats {
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      margin-top: 15px;
    }
    .stat-box {
      text-align: center;
      padding: 10px;
      border-radius: 5px;
      min-width: 150px;
      margin: 5px;
      background-color: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stat-value {
      font-size: 1.8em;
      font-weight: bold;
      margin: 5px 0;
    }
    .progress-container {
      width: 100%;
      height: 30px;
      background-color: #e9ecef;
      border-radius: 15px;
      margin: 15px 0;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background-color: #4caf50;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      transition: width 0.5s ease;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
      box-shadow: 0 2px 3px rgba(0,0,0,0.1);
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
      font-weight: bold;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    .section-bar {
      height: 20px;
      background-color: #e9ecef;
      border-radius: 10px;
      overflow: hidden;
      width: 100%;
    }
    .section-progress {
      height: 100%;
      border-radius: 10px;
      display: flex;
      align-items: center;
      padding-left: 10px;
      font-size: 0.8em;
      color: white;
      font-weight: bold;
    }
    .complete {
      background-color: #4caf50;
    }
    .partial {
      background-color: #ff9800;
    }
    .minimal {
      background-color: #f44336;
    }
    .unknown {
      background-color: #9e9e9e;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 0.9em;
      color: #6c757d;
    }
    .actions {
      margin-top: 20px;
      padding: 15px;
      background-color: #e9f7ef;
      border-radius: 5px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .action-btn {
      background-color: #28a745;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      margin-right: 10px;
      text-decoration: none;
      display: inline-block;
    }
    .action-btn:hover {
      background-color: #218838;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Section Context Coverage Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
  </div>
  
  <div class="summary">
    <h2>Overall Coverage Summary</h2>
    <div class="progress-container">
      <div class="progress-bar" style="width: ${totalCoverage.toFixed(2)}%">
        ${totalCoverage.toFixed(2)}%
      </div>
    </div>
    
    <div class="summary-stats">
      <div class="stat-box">
        <div>Total Sections</div>
        <div class="stat-value">${sectionData.length}</div>
      </div>
      <div class="stat-box">
        <div>Total Fields</div>
        <div class="stat-value">${totalFields}</div>
      </div>
      <div class="stat-box">
        <div>Fields Covered</div>
        <div class="stat-value">${totalFields - totalMissingFields}</div>
      </div>
      <div class="stat-box">
        <div>Fields Missing</div>
        <div class="stat-value">${totalMissingFields}</div>
      </div>
    </div>
  </div>
  
  <div class="actions">
    <h3>Recommended Actions</h3>
    <p>Based on this analysis, here are the recommended next steps:</p>
    <ol>
      <li>Run <code>npm run validate-section-contexts</code> to generate updated context files</li>
      <li>Run <code>npm run merge-context-updates</code> to merge the updated context files into your codebase</li>
      <li>Run <code>npm run typecheck</code> to verify the updates don't cause type errors</li>
      <li>Run <code>npm run dev</code> to test the application with the updated contexts</li>
    </ol>
    <p>
      <a href="#" class="action-btn" onclick="window.location.href='file://${path.resolve(process.cwd())}/reports/section-context-validation-report.html'">View Detailed Report</a>
    </p>
  </div>
  
  <h2>Section-by-Section Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Section</th>
        <th>Description</th>
        <th>Context File</th>
        <th>Coverage</th>
        <th>Fields</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${sectionData.map(section => {
        const coverageValue = parseFloat(section.coverage);
        let progressClass = 'unknown';
        
        if (!isNaN(coverageValue)) {
          if (coverageValue >= 95) progressClass = 'complete';
          else if (coverageValue >= 50) progressClass = 'partial';
          else progressClass = 'minimal';
        }
        
        return `
          <tr>
            <td>${section.sectionNumber}</td>
            <td>${section.description}</td>
            <td>${section.contextFile}</td>
            <td>
              <div class="section-bar">
                <div class="section-progress ${progressClass}" style="width: ${!isNaN(coverageValue) ? coverageValue + '%' : '100%'}">
                  ${section.coverage}
                </div>
              </div>
            </td>
            <td>${section.totalFields - section.missingFieldCount} / ${section.totalFields}</td>
            <td>${section.status}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  </table>
  
  <div class="footer">
    <p>This report helps track the completeness of your section context files.</p>
    <p>For any missing fields, use the validation and merge scripts to update your context files.</p>
  </div>
</body>
</html>`;
  
  fs.writeFileSync(reportPath, htmlContent);
  console.log(`Coverage report generated successfully: ${reportPath}`);
  
  // Open the report in the default browser
  const startCommand = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
  
  try {
    const { execSync } = require('child_process');
    execSync(`${startCommand} "${reportPath}"`);
    console.log('Report opened in default browser');
  } catch (error) {
    console.log(`Could not open report automatically. Please open manually: ${reportPath}`);
  }
}

// Run the function
generateContextCoverageReport().catch(console.error); 