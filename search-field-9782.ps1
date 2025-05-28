#!/usr/bin/env pwsh

# PowerShell script to efficiently search for field "9782 0 R"

param(
    [string]$JsonFile = "output/test13/categorized-fields.json"
)

Write-Host "Searching for field '9782 0 R' in $JsonFile..." -ForegroundColor Green

if (-not (Test-Path $JsonFile)) {
    Write-Host "Error: File $JsonFile not found!" -ForegroundColor Red
    exit 1
}

try {
    # Read the entire file content
    $content = Get-Content $JsonFile -Raw
    
    # Search for the specific field ID
    $pattern = '"id":\s*"9782 0 R"'
    $matches = [regex]::Matches($content, $pattern)
    
    if ($matches.Count -gt 0) {
        Write-Host "Found field '9782 0 R'!" -ForegroundColor Green
        
        # Find the position of the match
        $matchPosition = $matches[0].Index
        
        # Extract a larger context around the match (about 2000 characters before and after)
        $startPos = [Math]::Max(0, $matchPosition - 2000)
        $endPos = [Math]::Min($content.Length - 1, $matchPosition + 2000)
        $context = $content.Substring($startPos, $endPos - $startPos)
        
        Write-Host "`nContext around the field:" -ForegroundColor Yellow
        Write-Host $context -ForegroundColor White
        
        # Try to extract just the field object
        $fieldStart = $context.LastIndexOf('{', $matchPosition - $startPos)
        $fieldEnd = $context.IndexOf('}', $matchPosition - $startPos)
        
        if ($fieldStart -ge 0 -and $fieldEnd -ge 0) {
            $fieldJson = $context.Substring($fieldStart, $fieldEnd - $fieldStart + 1)
            Write-Host "`nField JSON:" -ForegroundColor Cyan
            Write-Host $fieldJson -ForegroundColor White
            
            # Try to parse the field to extract key information
            try {
                $field = $fieldJson | ConvertFrom-Json
                Write-Host "`nField Details:" -ForegroundColor Green
                Write-Host "  ID: $($field.id)" -ForegroundColor White
                Write-Host "  Name: $($field.name)" -ForegroundColor White
                Write-Host "  Section: $($field.section)" -ForegroundColor Cyan
                Write-Host "  Confidence: $($field.confidence)" -ForegroundColor Gray
                Write-Host "  Page: $($field.page)" -ForegroundColor Gray
                if ($field.wasMovedByHealing) {
                    Write-Host "  Was moved by healing: $($field.wasMovedByHealing)" -ForegroundColor Magenta
                }
                
                # Check section classification
                if ($field.section -eq 11) {
                    Write-Host "`n✅ SUCCESS: Field is correctly classified as Section 11!" -ForegroundColor Green
                } elseif ($field.section -eq 15) {
                    Write-Host "`n❌ ISSUE: Field is incorrectly classified as Section 15!" -ForegroundColor Red
                } else {
                    Write-Host "`n⚠️  Field is classified as Section $($field.section)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "Could not parse field JSON: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "Field '9782 0 R' not found in the file!" -ForegroundColor Red
        
        # Search for similar patterns
        $similarPattern = '"id":\s*"978[0-9] 0 R"'
        $similarMatches = [regex]::Matches($content, $similarPattern)
        
        if ($similarMatches.Count -gt 0) {
            Write-Host "`nFound similar field IDs:" -ForegroundColor Yellow
            foreach ($match in $similarMatches) {
                $matchText = $match.Value
                Write-Host "  $matchText" -ForegroundColor Gray
            }
        }
    }
    
} catch {
    Write-Host "Error processing file: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`nSearch completed." -ForegroundColor Green
