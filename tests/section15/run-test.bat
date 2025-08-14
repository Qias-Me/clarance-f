@echo off
echo Running comprehensive Section 15 test...
echo.
cd ../..
npx playwright test tests/section15/comprehensive-section15.test.ts --reporter=list --headed
echo.
echo Test completed!
pause