#!/bin/bash

# Section 19 Comprehensive Test Runner
# 
# Executes all Section 19 tests with proper console monitoring
# and comprehensive field validation

echo "🚀 Section 19 Comprehensive Test Suite"
echo "======================================"
echo ""

# Set up environment
export NODE_ENV=test
export PLAYWRIGHT_BROWSERS_PATH=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "section19-comprehensive.spec.ts" ]; then
    print_error "Please run this script from the tests/section19 directory"
    exit 1
fi

# Create results directory
mkdir -p test-results
print_status "Created test results directory"

# Check if Playwright is installed
if ! command -v npx &> /dev/null; then
    print_error "npx not found. Please install Node.js and npm"
    exit 1
fi

# Install Playwright browsers if needed
print_status "Checking Playwright browser installation..."
npx playwright install chromium

# Function to run a specific test suite
run_test_suite() {
    local test_file=$1
    local test_name=$2
    
    print_status "Running $test_name..."
    echo "----------------------------------------"
    
    npx playwright test "$test_file" \
        --config=playwright.config.ts \
        --reporter=list \
        --output=test-results/section19-artifacts
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        print_success "$test_name completed successfully"
    else
        print_error "$test_name failed with exit code $exit_code"
        return $exit_code
    fi
    
    echo ""
}

# Main test execution
print_status "Starting Section 19 comprehensive test execution..."
echo ""

# Test 1: Comprehensive field testing
run_test_suite "section19-comprehensive.spec.ts" "Comprehensive Field Tests"
comprehensive_result=$?

# Test 2: PDF generation testing
run_test_suite "section19-pdf-generation.spec.ts" "PDF Generation Tests"
pdf_result=$?

# Generate HTML report
print_status "Generating HTML test report..."
npx playwright show-report test-results/section19-html-report --host=localhost --port=9323 &
report_pid=$!

# Wait a moment for the report server to start
sleep 2

print_success "HTML report server started (PID: $report_pid)"
print_status "View report at: http://localhost:9323"

# Summary
echo ""
echo "🎯 TEST EXECUTION SUMMARY"
echo "========================="

if [ $comprehensive_result -eq 0 ]; then
    print_success "Comprehensive Field Tests: PASSED"
else
    print_error "Comprehensive Field Tests: FAILED"
fi

if [ $pdf_result -eq 0 ]; then
    print_success "PDF Generation Tests: PASSED"
else
    print_error "PDF Generation Tests: FAILED"
fi

# Overall result
overall_result=$((comprehensive_result + pdf_result))

if [ $overall_result -eq 0 ]; then
    print_success "ALL TESTS PASSED ✅"
    echo ""
    echo "🎉 Section 19 Implementation Validation Complete!"
    echo "   - All 277 fields tested successfully"
    echo "   - PDF field mapping validated"
    echo "   - Console error monitoring completed"
    echo "   - Field interaction testing passed"
else
    print_error "SOME TESTS FAILED ❌"
    echo ""
    echo "⚠️  Please review the test results and console output"
    echo "   - Check test-results/ directory for detailed logs"
    echo "   - Review HTML report for specific failures"
    echo "   - Monitor console errors during test execution"
fi

echo ""
echo "📁 Test Results Location:"
echo "   - Artifacts: test-results/section19-artifacts/"
echo "   - HTML Report: test-results/section19-html-report/"
echo "   - JSON Results: test-results/section19-results.json"
echo "   - Summary: test-results/section19-test-summary.json"

echo ""
echo "🔍 Next Steps:"
echo "   1. Review HTML report for detailed test results"
echo "   2. Check console logs for any field mapping issues"
echo "   3. Validate PDF generation with populated fields"
echo "   4. Test field validation and error handling"

# Keep the report server running for a bit
print_status "HTML report server will run for 30 seconds..."
print_status "Press Ctrl+C to stop early, or wait for automatic shutdown"

sleep 30

# Clean up
if kill -0 $report_pid 2>/dev/null; then
    kill $report_pid
    print_status "HTML report server stopped"
fi

exit $overall_result
