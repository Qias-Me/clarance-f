# Section29 Context Integration Test Execution Script
# 
# This PowerShell script executes all Section29 Playwright tests and generates
# comprehensive reports for the integration test suite.

Write-Host "🚀 Starting Section29 Context Integration Test Suite..." -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan

# Create test results directory
$testResultsDir = "test-results"
if (!(Test-Path $testResultsDir)) {
    New-Item -ItemType Directory -Path $testResultsDir -Force
    Write-Host "📁 Created test results directory: $testResultsDir" -ForegroundColor Yellow
}

# Function to run tests and capture results
function Run-TestSuite {
    param(
        [string]$TestName,
        [string]$TestPattern,
        [string]$Description
    )
    
    Write-Host "`n🧪 Running $TestName..." -ForegroundColor Blue
    Write-Host "Description: $Description" -ForegroundColor Gray
    Write-Host "Pattern: $TestPattern" -ForegroundColor Gray
    
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $reportFile = "$testResultsDir/$TestName-$timestamp"
    
    try {
        # Run the test with detailed reporting
        $result = npx playwright test $TestPattern --reporter=html --output-dir="$reportFile-artifacts" 2>&1
        
        # Save results to file
        $result | Out-File -FilePath "$reportFile-output.txt" -Encoding UTF8
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $TestName completed successfully!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ $TestName failed with exit code: $LASTEXITCODE" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "💥 Error running $TestName : $_" -ForegroundColor Red
        return $false
    }
}

# Test execution plan
$testSuites = @(
    @{
        Name = "context-provider"
        Pattern = "tests/section29/context-provider.spec.ts"
        Description = "React Context provider functionality and error handling"
    },
    @{
        Name = "crud-operations"
        Pattern = "tests/section29/crud-operations.spec.ts"
        Description = "Complete CRUD operations for all Section29 methods"
    },
    @{
        Name = "crud-edge-cases"
        Pattern = "tests/section29/crud-edge-cases.spec.ts"
        Description = "Edge cases and boundary conditions for CRUD operations"
    },
    @{
        Name = "field-id-generation"
        Pattern = "tests/section29/field-id-generation.spec.ts"
        Description = "PDF field ID pattern validation and compliance"
    },
    @{
        Name = "field-id-validation"
        Pattern = "tests/section29/field-id-validation.spec.ts"
        Description = "Field ID format validation and edge cases"
    },
    @{
        Name = "field-id-utilities"
        Pattern = "tests/section29/field-id-utilities.spec.ts"
        Description = "Field ID generation utility function testing"
    },
    @{
        Name = "integration-tests"
        Pattern = "tests/section29/integration-tests.spec.ts"
        Description = "ApplicantFormValues integration and data persistence"
    },
    @{
        Name = "advanced-features"
        Pattern = "tests/section29/advanced-features.spec.ts"
        Description = "Enhanced entry management (move, duplicate, clear, bulk update)"
    },
    @{
        Name = "error-handling"
        Pattern = "tests/section29/error-handling.spec.ts"
        Description = "Error handling, validation, and graceful degradation"
    }
)

# Execute all test suites
$results = @{}
$totalTests = $testSuites.Count
$passedTests = 0

Write-Host "`n📊 Executing $totalTests test suites..." -ForegroundColor Cyan

foreach ($suite in $testSuites) {
    $success = Run-TestSuite -TestName $suite.Name -TestPattern $suite.Pattern -Description $suite.Description
    $results[$suite.Name] = $success
    if ($success) { $passedTests++ }
    
    # Brief pause between test suites
    Start-Sleep -Seconds 2
}

# Generate summary report
Write-Host "`n📋 Test Execution Summary" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

$summaryReport = @"
# Section29 Context Integration Test Results
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Test Suite Summary
- **Total Test Suites**: $totalTests
- **Passed**: $passedTests
- **Failed**: $($totalTests - $passedTests)
- **Success Rate**: $([math]::Round(($passedTests / $totalTests) * 100, 2))%

## Individual Test Results

"@

foreach ($suite in $testSuites) {
    $status = if ($results[$suite.Name]) { "✅ PASSED" } else { "❌ FAILED" }
    $color = if ($results[$suite.Name]) { "Green" } else { "Red" }
    
    Write-Host "$status $($suite.Name): $($suite.Description)" -ForegroundColor $color
    
    $summaryReport += @"
### $($suite.Name)
- **Status**: $status
- **Description**: $($suite.Description)
- **Test File**: $($suite.Pattern)

"@
}

# Save summary report
$summaryReport | Out-File -FilePath "$testResultsDir/test-summary-$(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss').md" -Encoding UTF8

# Final results
Write-Host "`n🎯 Final Results:" -ForegroundColor Cyan
if ($passedTests -eq $totalTests) {
    Write-Host "🎉 ALL TESTS PASSED! Section29 Context is production-ready!" -ForegroundColor Green
} elseif ($passedTests -gt ($totalTests / 2)) {
    Write-Host "⚠️  Most tests passed, but some issues need attention." -ForegroundColor Yellow
} else {
    Write-Host "🚨 Multiple test failures detected. Review required." -ForegroundColor Red
}

Write-Host "`n📁 Test artifacts saved to: $testResultsDir" -ForegroundColor Gray
Write-Host "📊 View detailed HTML reports in the artifacts directories" -ForegroundColor Gray

# Return exit code based on results
if ($passedTests -eq $totalTests) {
    exit 0
} else {
    exit 1
}
