#!/usr/bin/env pwsh

# Simple search for field ID 9782

$file = "output/test13/categorized-fields.json"
$searchId = "9782"

Write-Host "Searching for ID containing '$searchId' in $file..." -ForegroundColor Green

# Read file line by line and search for the ID
$lineNumber = 0
$found = $false

Get-Content $file | ForEach-Object {
    $lineNumber++
    if ($_ -like "*$searchId*") {
        Write-Host "Found at line $lineNumber`: $_" -ForegroundColor Yellow
        $found = $true
    }
}

if (-not $found) {
    Write-Host "ID '$searchId' not found in the file." -ForegroundColor Red
} else {
    Write-Host "Search completed." -ForegroundColor Green
}
