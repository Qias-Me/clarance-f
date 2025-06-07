#!/bin/bash

# Section 18 Comprehensive Test Runner
# This script runs all 964 field tests for Section 18 of the SF-86 form

echo "🚀 Section 18 Comprehensive Testing - All 964 Fields"
echo "=================================================="

# Check if Node.js and npm are available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed."
    exit 1
fi

# Check if Playwright is installed
if ! npm list @playwright/test &> /dev/null; then
    echo "📦 Installing Playwright..."
    npm install @playwright/test playwright
    npx playwright install
fi

# Create test results directory
mkdir -p test-results

echo ""
echo "📋 Available Test Commands:"
echo "1. Smoke Test (20 high-priority fields)"
echo "2. Text Fields Test (1,170 fields)"
echo "3. Dropdown Fields Test (342 fields)"
echo "4. Checkbox Fields Test (1,218 fields)"
echo "5. Radio Button Fields Test (162 fields)"
echo "6. Data Persistence Test"
echo "7. PDF Generation Test"
echo "8. Field Analysis"
echo "9. Comprehensive Test (All 964 fields)"
echo "0. Run All Tests"

echo ""
read -p "Select test to run (0-9): " choice

case $choice in
    1)
        echo "🧪 Running Smoke Test..."
        npm run test:section18:smoke
        ;;
    2)
        echo "🧪 Running Text Fields Test..."
        npm run test:section18:text
        ;;
    3)
        echo "🧪 Running Dropdown Fields Test..."
        npm run test:section18:dropdown
        ;;
    4)
        echo "🧪 Running Checkbox Fields Test..."
        npm run test:section18:checkbox
        ;;
    5)
        echo "🧪 Running Radio Button Fields Test..."
        npm run test:section18:radio
        ;;
    6)
        echo "🧪 Running Data Persistence Test..."
        npm run test:section18:persistence
        ;;
    7)
        echo "🧪 Running PDF Generation Test..."
        npm run test:section18:pdf
        ;;
    8)
        echo "🧪 Running Field Analysis..."
        npm run test:section18:analyze
        ;;
    9)
        echo "🧪 Running Comprehensive Test (All 964 fields)..."
        echo "⚠️  This may take 5-10 minutes to complete."
        read -p "Continue? (y/N): " confirm
        if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
            npm run test:section18:comprehensive
        else
            echo "Test cancelled."
        fi
        ;;
    0)
        echo "🧪 Running All Tests..."
        echo "⚠️  This will take 10-15 minutes to complete."
        read -p "Continue? (y/N): " confirm
        if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
            echo ""
            echo "📊 Step 1/9: Field Analysis..."
            npm run test:section18:analyze
            
            echo ""
            echo "📊 Step 2/9: Smoke Test..."
            npm run test:section18:smoke
            
            echo ""
            echo "📊 Step 3/9: Text Fields Test..."
            npm run test:section18:text
            
            echo ""
            echo "📊 Step 4/9: Dropdown Fields Test..."
            npm run test:section18:dropdown
            
            echo ""
            echo "📊 Step 5/9: Checkbox Fields Test..."
            npm run test:section18:checkbox
            
            echo ""
            echo "📊 Step 6/9: Radio Button Fields Test..."
            npm run test:section18:radio
            
            echo ""
            echo "📊 Step 7/9: Data Persistence Test..."
            npm run test:section18:persistence
            
            echo ""
            echo "📊 Step 8/9: PDF Generation Test..."
            npm run test:section18:pdf
            
            echo ""
            echo "📊 Step 9/9: Comprehensive Test..."
            npm run test:section18:comprehensive
            
            echo ""
            echo "✅ All tests completed!"
            echo "📊 Check test-results/ directory for detailed reports."
        else
            echo "Tests cancelled."
        fi
        ;;
    *)
        echo "❌ Invalid choice. Please select 0-9."
        exit 1
        ;;
esac

echo ""
echo "📊 Test Results:"
if [ -f "test-results/section18-test-results.json" ]; then
    echo "✅ Detailed results available in: test-results/section18-test-results.json"
fi

if [ -f "section18-test-data.json" ]; then
    echo "✅ Field analysis available in: section18-test-data.json"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Review test results in the test-results/ directory"
echo "2. Check browser console logs for any errors"
echo "3. Verify Section 18 data persistence in IndexedDB"
echo "4. Test PDF generation with Section 18 data"

echo ""
echo "🎯 Expected Results:"
echo "- Overall pass rate: ≥ 80%"
echo "- Text fields: ≥ 70% success rate"
echo "- Dropdowns: ≥ 70% success rate"
echo "- Checkboxes: ≥ 70% success rate"
echo "- Radio buttons: ≥ 70% success rate"
echo "- Data persistence: 100% success"
echo "- PDF generation: 100% success"

echo ""
echo "🔧 Troubleshooting:"
echo "- If tests fail, check that the dev server is running (npm run dev)"
echo "- Ensure Section 18 is accessible at /startForm"
echo "- Check browser console for JavaScript errors"
echo "- Review SECTION18_COMPREHENSIVE_TESTING.md for detailed guidance"
