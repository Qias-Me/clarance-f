# ============================================================================
# Centralized SF-86 Form Test Runner (PowerShell)
# ============================================================================
# 
# Comprehensive test runner for the centralized SF-86 form implementation.
# Executes tests across Chrome, Firefox, and Safari browsers with detailed
# reporting and performance monitoring.

param(
    [string]$TestType = "all",
    [string]$Browser = "all",
    [switch]$Headed = $false,
    [switch]$Debug = $false,
    [switch]$Performance = $false,
    [switch]$Accessibility = $false,
    [switch]$Integration = $false,
    [switch]$Security = $false,
    [string]$OutputDir = "test-results/centralized-sf86",
    [switch]$CI = $false,
    [switch]$Help = $false
)

# ============================================================================
# HELP DOCUMENTATION
# ============================================================================

if ($Help) {
    Write-Host @"
Centralized SF-86 Form Test Runner

USAGE:
    .\run-tests.ps1 [OPTIONS]

OPTIONS:
    -TestType <type>     Test type to run (all, smoke, regression, e2e)
    -Browser <browser>   Browser to test (all, chrome, firefox, safari)
    -Headed             Run tests in headed mode (visible browser)
    -Debug              Enable debug mode with detailed logging
    -Performance        Run performance tests only
    -Accessibility      Run accessibility tests only
    -Integration        Run integration tests only
    -Security           Run security tests only
    -OutputDir <dir>    Output directory for test results
    -CI                 Run in CI mode with optimized settings
    -Help               Show this help message

EXAMPLES:
    # Run all tests across all browsers
    .\run-tests.ps1

    # Run tests in Chrome only with headed mode
    .\run-tests.ps1 -Browser chrome -Headed

    # Run performance tests only
    .\run-tests.ps1 -Performance

    # Run in CI mode
    .\run-tests.ps1 -CI

    # Run accessibility tests in debug mode
    .\run-tests.ps1 -Accessibility -Debug
"@
    exit 0
}

# ============================================================================
# CONFIGURATION
# ============================================================================

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Test configuration
$TestConfig = @{
    BaseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    ProjectRoot = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path))
    TestDir = "tests/centralized-sf86"
    ConfigFile = "tests/centralized-sf86/playwright.config.ts"
    OutputDir = $OutputDir
    Timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
}

# Browser configurations
$BrowserConfigs = @{
    chrome = @{
        Project = "chromium-centralized-sf86"
        Name = "Chrome"
        Icon = "🌐"
    }
    firefox = @{
        Project = "firefox-centralized-sf86"
        Name = "Firefox"
        Icon = "🦊"
    }
    safari = @{
        Project = "webkit-centralized-sf86"
        Name = "Safari"
        Icon = "🧭"
    }
    mobile = @{
        Project = "mobile-chrome-centralized-sf86,mobile-safari-centralized-sf86"
        Name = "Mobile"
        Icon = "📱"
    }
}

# Test type configurations
$TestTypeConfigs = @{
    all = @{
        Grep = ""
        Description = "All tests"
        Icon = "🎯"
    }
    smoke = @{
        Grep = "@smoke"
        Description = "Smoke tests"
        Icon = "💨"
    }
    regression = @{
        Grep = "@regression"
        Description = "Regression tests"
        Icon = "🔄"
    }
    e2e = @{
        Grep = "@e2e"
        Description = "End-to-end tests"
        Icon = "🔗"
    }
    performance = @{
        Grep = "@performance"
        Description = "Performance tests"
        Icon = "⚡"
    }
    accessibility = @{
        Grep = "@accessibility"
        Description = "Accessibility tests"
        Icon = "♿"
    }
    integration = @{
        Grep = "@integration"
        Description = "Integration tests"
        Icon = "🔧"
    }
    security = @{
        Grep = "@security"
        Description = "Security tests"
        Icon = "🔒"
    }
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

function Write-Banner {
    param([string]$Message, [string]$Icon = "🚀")
    
    $border = "=" * 80
    Write-Host ""
    Write-Host $border -ForegroundColor Cyan
    Write-Host "$Icon $Message" -ForegroundColor Yellow
    Write-Host $border -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([string]$Message, [string]$Icon = "📋")
    Write-Host "$Icon $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message, [string]$Icon = "❌")
    Write-Host "$Icon $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message, [string]$Icon = "⚠️")
    Write-Host "$Icon $Message" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message, [string]$Icon = "✅")
    Write-Host "$Icon $Message" -ForegroundColor Green
}

function Test-Prerequisites {
    Write-Step "Checking prerequisites..."
    
    # Check if Node.js is installed
    try {
        $nodeVersion = node --version
        Write-Success "Node.js version: $nodeVersion"
    } catch {
        Write-Error "Node.js is not installed or not in PATH"
        exit 1
    }
    
    # Check if npm is installed
    try {
        $npmVersion = npm --version
        Write-Success "npm version: $npmVersion"
    } catch {
        Write-Error "npm is not installed or not in PATH"
        exit 1
    }
    
    # Check if Playwright is installed
    try {
        $playwrightVersion = npx playwright --version
        Write-Success "Playwright version: $playwrightVersion"
    } catch {
        Write-Error "Playwright is not installed. Run: npm install @playwright/test"
        exit 1
    }
    
    # Check if the application server is running (if not in CI mode)
    if (-not $CI) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
            Write-Success "Application server is running"
        } catch {
            Write-Warning "Application server may not be running. Starting development server..."
            # In a real scenario, you might want to start the dev server here
        }
    }
}

function Install-Browsers {
    Write-Step "Installing/updating browsers..."
    
    try {
        npx playwright install --with-deps
        Write-Success "Browsers installed successfully"
    } catch {
        Write-Error "Failed to install browsers"
        exit 1
    }
}

function Build-TestCommand {
    param(
        [string]$ProjectName,
        [string]$GrepPattern,
        [bool]$IsHeaded,
        [bool]$IsDebug,
        [bool]$IsCI
    )
    
    $cmd = "npx playwright test"
    $cmd += " --config=`"$($TestConfig.ConfigFile)`""
    
    if ($ProjectName -and $ProjectName -ne "all") {
        $cmd += " --project=`"$ProjectName`""
    }
    
    if ($GrepPattern) {
        $cmd += " --grep=`"$GrepPattern`""
    }
    
    if ($IsHeaded) {
        $cmd += " --headed"
    }
    
    if ($IsDebug) {
        $cmd += " --debug"
    }
    
    if ($IsCI) {
        $cmd += " --reporter=github,html,junit"
    } else {
        $cmd += " --reporter=list,html"
    }
    
    $cmd += " --output-dir=`"$($TestConfig.OutputDir)`""
    
    return $cmd
}

function Run-TestSuite {
    param(
        [string]$SuiteName,
        [string]$ProjectName,
        [string]$GrepPattern,
        [string]$Icon
    )
    
    Write-Banner "$Icon Running $SuiteName Tests" $Icon
    
    $command = Build-TestCommand -ProjectName $ProjectName -GrepPattern $GrepPattern -IsHeaded $Headed -IsDebug $Debug -IsCI $CI
    
    Write-Step "Executing: $command"
    
    $startTime = Get-Date
    
    try {
        Invoke-Expression $command
        $endTime = Get-Date
        $duration = $endTime - $startTime
        Write-Success "$SuiteName tests completed successfully in $($duration.TotalSeconds) seconds"
        return $true
    } catch {
        $endTime = Get-Date
        $duration = $endTime - $startTime
        Write-Error "$SuiteName tests failed after $($duration.TotalSeconds) seconds"
        Write-Error "Error: $_"
        return $false
    }
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

Write-Banner "🚀 Centralized SF-86 Form Test Runner" "🚀"

# Change to project root directory
Set-Location $TestConfig.ProjectRoot

# Check prerequisites
Test-Prerequisites

# Install browsers if needed
if (-not $CI) {
    Install-Browsers
}

# Create output directory
if (-not (Test-Path $TestConfig.OutputDir)) {
    New-Item -ItemType Directory -Path $TestConfig.OutputDir -Force | Out-Null
    Write-Step "Created output directory: $($TestConfig.OutputDir)"
}

# Determine what tests to run
$testResults = @()
$startTime = Get-Date

# Handle specific test type flags
if ($Performance) {
    $TestType = "performance"
} elseif ($Accessibility) {
    $TestType = "accessibility"
} elseif ($Integration) {
    $TestType = "integration"
} elseif ($Security) {
    $TestType = "security"
}

# Get test configuration
$testConfig = $TestTypeConfigs[$TestType]
if (-not $testConfig) {
    Write-Error "Invalid test type: $TestType"
    exit 1
}

# Determine browsers to test
$browsersToTest = @()
if ($Browser -eq "all") {
    $browsersToTest = @("chrome", "firefox", "safari")
} else {
    $browsersToTest = @($Browser)
}

# Run tests for each browser
foreach ($browserName in $browsersToTest) {
    $browserConfig = $BrowserConfigs[$browserName]
    if (-not $browserConfig) {
        Write-Warning "Unknown browser: $browserName"
        continue
    }
    
    $suiteName = "$($testConfig.Description) - $($browserConfig.Name)"
    $result = Run-TestSuite -SuiteName $suiteName -ProjectName $browserConfig.Project -GrepPattern $testConfig.Grep -Icon $browserConfig.Icon
    
    $testResults += @{
        Browser = $browserName
        TestType = $TestType
        Success = $result
        Timestamp = Get-Date
    }
}

# ============================================================================
# RESULTS SUMMARY
# ============================================================================

$endTime = Get-Date
$totalDuration = $endTime - $startTime

Write-Banner "📊 Test Results Summary" "📊"

$successCount = ($testResults | Where-Object { $_.Success }).Count
$totalCount = $testResults.Count

Write-Host "Total Duration: $($totalDuration.TotalMinutes.ToString('F2')) minutes" -ForegroundColor Cyan
Write-Host "Tests Passed: $successCount/$totalCount" -ForegroundColor $(if ($successCount -eq $totalCount) { "Green" } else { "Yellow" })
Write-Host ""

foreach ($result in $testResults) {
    $icon = if ($result.Success) { "✅" } else { "❌" }
    $color = if ($result.Success) { "Green" } else { "Red" }
    Write-Host "$icon $($result.Browser) - $($result.TestType)" -ForegroundColor $color
}

Write-Host ""
Write-Host "📁 Test results saved to: $($TestConfig.OutputDir)" -ForegroundColor Cyan

if ($successCount -eq $totalCount) {
    Write-Success "🎉 All tests passed!"
    exit 0
} else {
    Write-Error "💥 Some tests failed!"
    exit 1
}
