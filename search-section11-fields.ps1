#!/usr/bin/env pwsh

# PowerShell script to search for Section 11 fields that might be misclassified as Section 15

param(
    [string]$JsonFile = "output/test13/categorized-fields.json"
)

Write-Host "Searching for Section 11 field classification issues..." -ForegroundColor Green

if (-not (Test-Path $JsonFile)) {
    Write-Host "Error: File $JsonFile not found!" -ForegroundColor Red
    exit 1
}

try {
    # Read and parse JSON
    $jsonContent = Get-Content $JsonFile -Raw | ConvertFrom-Json

    Write-Host "Total fields in file: $($jsonContent.Count)" -ForegroundColor Yellow

    # Find fields that contain "Section11" in their name but are categorized as something other than section 11
    $section11NamedFields = $jsonContent | Where-Object {
        $_.name -match "Section11" -and $_.section -ne 11
    }

    if ($section11NamedFields.Count -gt 0) {
        Write-Host "`nFound $($section11NamedFields.Count) fields with 'Section11' in name but NOT in section 11:" -ForegroundColor Red
        foreach ($field in $section11NamedFields) {
            Write-Host "  - Name: $($field.name)" -ForegroundColor White
            Write-Host "    Assigned to Section: $($field.section)" -ForegroundColor Red
            Write-Host "    Page: $($field.page)" -ForegroundColor Gray
            Write-Host "    Confidence: $($field.confidence)" -ForegroundColor Gray
            if ($field.wasMovedByHealing) {
                Write-Host "    Was moved by healing: $($field.wasMovedByHealing)" -ForegroundColor Magenta
            }
            Write-Host ""
        }
    } else {
        Write-Host "`nNo fields with 'Section11' in name found in wrong sections." -ForegroundColor Green
    }

    # Find all fields currently in section 15
    $section15Fields = $jsonContent | Where-Object { $_.section -eq 15 }
    Write-Host "Fields currently in Section 15: $($section15Fields.Count)" -ForegroundColor Yellow

    # Look for fields in section 15 that might belong to section 11
    $suspiciousSection15Fields = $section15Fields | Where-Object {
        $_.name -match "Section11" -or
        $_.name -match "residence" -or
        $_.name -match "address" -or
        ($_.page -ge 10 -and $_.page -le 13)  # Section 11 page range
    }

    if ($suspiciousSection15Fields.Count -gt 0) {
        Write-Host "`nFound $($suspiciousSection15Fields.Count) suspicious fields in Section 15 that might belong to Section 11:" -ForegroundColor Red
        foreach ($field in $suspiciousSection15Fields) {
            Write-Host "  - Name: $($field.name)" -ForegroundColor White
            Write-Host "    Page: $($field.page)" -ForegroundColor Gray
            Write-Host "    Confidence: $($field.confidence)" -ForegroundColor Gray
            if ($field.wasMovedByHealing) {
                Write-Host "    Was moved by healing: $($field.wasMovedByHealing)" -ForegroundColor Magenta
            }
            Write-Host ""
        }
    }

    # Find all fields currently in section 11
    $section11Fields = $jsonContent | Where-Object { $_.section -eq 11 }
    Write-Host "Fields currently in Section 11: $($section11Fields.Count)" -ForegroundColor Yellow

    # Show some examples of fields in section 11
    if ($section11Fields.Count -gt 0) {
        Write-Host "`nSample of fields in Section 11:" -ForegroundColor Green
        $section11Fields | Select-Object -First 5 | ForEach-Object {
            Write-Host "  - Name: $($_.name)" -ForegroundColor White
            Write-Host "    Page: $($_.page)" -ForegroundColor Gray
            Write-Host ""
        }
    }

    # Summary
    Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
    Write-Host "Section 11 fields: $($section11Fields.Count)" -ForegroundColor White
    Write-Host "Section 15 fields: $($section15Fields.Count)" -ForegroundColor White
    Write-Host "Misclassified Section11-named fields: $($section11NamedFields.Count)" -ForegroundColor White
    Write-Host "Suspicious Section 15 fields: $($suspiciousSection15Fields.Count)" -ForegroundColor White

} catch {
    Write-Host "Error processing JSON file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
