# Extract Section 29 subsection patterns from JSON
$jsonContent = Get-Content "api/sections-reference/section-29.json" -Raw
$json = $jsonContent | ConvertFrom-Json

# Extract all field names and find unique Section29 patterns
$fieldNames = $json.fields | ForEach-Object { $_.name }
$section29Fields = $fieldNames | Where-Object { $_ -like "*Section29*" }

# Extract unique subsection patterns
$patterns = $section29Fields | ForEach-Object {
    if ($_ -match "Section29(_\d+)?\[0\]") {
        $matches[0]
    }
} | Sort-Object | Get-Unique

Write-Host "Found Section 29 subsection patterns:"
$patterns | ForEach-Object { Write-Host "  $_" }

# Count fields per pattern
Write-Host "`nField count per pattern:"
foreach ($pattern in $patterns) {
    $count = ($section29Fields | Where-Object { $_ -like "*$pattern*" }).Count
    Write-Host "  $pattern`: $count fields"
}

Write-Host "`nTotal Section 29 fields: $($section29Fields.Count)"
