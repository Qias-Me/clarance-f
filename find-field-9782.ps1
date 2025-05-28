#!/usr/bin/env pwsh

# PowerShell script to find field with ID "9782 0 R" and check its classification

param(
    [string]$JsonFile = "C:\Users\Jason\Desktop\AI-Coding\clarance-f\output\test13\categorized-fields.json"
)

Write-Host "Searching for field with ID '9782 0 R'..." -ForegroundColor Green

if (-not (Test-Path $JsonFile)) {
    Write-Host "Error: File $JsonFile not found!" -ForegroundColor Red
    exit 1
}

try {
    # Read file line by line to search for the ID
    Write-Host "Reading file line by line..." -ForegroundColor Yellow
    $lineNumber = 0
    $found = $false
    $context = @()

    Get-Content $JsonFile | ForEach-Object {
        $lineNumber++
        $line = $_

        # Keep last 10 lines as context
        if ($context.Count -ge 10) {
            $context = $context[1..9]
        }
        $context += $line

        if ($line -like "*9782 0 R*") {
            Write-Host "`nFound '9782 0 R' at line $lineNumber" -ForegroundColor Green
            Write-Host "Context around the match:" -ForegroundColor Yellow

            # Show context
            for ($i = 0; $i -lt $context.Count; $i++) {
                if ($context[$i] -like "*9782 0 R*") {
                    Write-Host ">>> $($context[$i])" -ForegroundColor Cyan
                } else {
                    Write-Host "    $($context[$i])" -ForegroundColor Gray
                }
            }

            # Try to find section info in nearby lines
            $sectionFound = $false
            foreach ($contextLine in $context) {
                if ($contextLine -like '*"section":*') {
                    Write-Host "`nSection info: $contextLine" -ForegroundColor Green
                    $sectionFound = $true

                    # Extract section number
                    if ($contextLine -match '"section":\s*(\d+)') {
                        $sectionNum = $matches[1]
                        if ($sectionNum -eq "11") {
                            Write-Host "✅ SUCCESS: Field is correctly classified as Section 11!" -ForegroundColor Green
                        } elseif ($sectionNum -eq "15") {
                            Write-Host "❌ ISSUE: Field is still classified as Section 15!" -ForegroundColor Red
                        } else {
                            Write-Host "⚠️  Field is classified as Section $sectionNum" -ForegroundColor Yellow
                        }
                    }
                    break
                }
            }

            if (-not $sectionFound) {
                Write-Host "⚠️  Could not find section information in context" -ForegroundColor Yellow
            }

            $found = $true
        }
    }

    if (-not $found) {
        Write-Host "`n❌ Field with ID '9782 0 R' not found in the file!" -ForegroundColor Red
    }

} catch {
    Write-Host "Error processing file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
