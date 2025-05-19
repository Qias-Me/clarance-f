# Read a chunk of the file (can't use Raw and TotalCount together)
$content = Get-Content -Path "reports/field-hierarchy.json" -TotalCount 1000 | Out-String

# Extract a sample field pattern with all properties
$fieldPattern = '{\s*"name":\s*"[^"]+",\s*"id":\s*"[^"]+",\s*"label":\s*"[^"]+",\s*"value":\s*"[^"]+",\s*"type":\s*"[^"]+",\s*"section":\s*\d+,\s*"sectionName":\s*"[^"]+"(?:,\s*"confidence":\s*[\d\.]+)?\s*}'

$match = [regex]::Match($content, $fieldPattern)

if ($match.Success) {
    Write-Host "Found complete field entry:"
    Write-Host $match.Value
} else {
    Write-Host "No complete field entry found matching all expected properties"
    
    # Try with fewer properties
    $simplePattern = '{\s*"name":\s*"[^"]+",\s*"id":\s*"[^"]+"[^}]*}'
    $simpleMatch = [regex]::Match($content, $simplePattern)
    
    if ($simpleMatch.Success) {
        Write-Host "Found partial field entry:"
        Write-Host $simpleMatch.Value
    }
}

# Extract and display individual property examples
Write-Host "`nExample property values:"

$nameMatch = [regex]::Match($content, '"name":\s*"([^"]+)"')
$idMatch = [regex]::Match($content, '"id":\s*"([^"]+)"')
$labelMatch = [regex]::Match($content, '"label":\s*"([^"]+)"')
$valueMatch = [regex]::Match($content, '"value":\s*"([^"]+)"')
$typeMatch = [regex]::Match($content, '"type":\s*"([^"]+)"')
$sectionMatch = [regex]::Match($content, '"section":\s*(\d+)')
$sectionNameMatch = [regex]::Match($content, '"sectionName":\s*"([^"]+)"')
$confidenceMatch = [regex]::Match($content, '"confidence":\s*([\d\.]+)')

if ($nameMatch.Success) { Write-Host "name: $($nameMatch.Groups[1].Value)" }
if ($idMatch.Success) { Write-Host "id: $($idMatch.Groups[1].Value)" }
if ($labelMatch.Success) { Write-Host "label: $($labelMatch.Groups[1].Value)" }
if ($valueMatch.Success) { Write-Host "value: $($valueMatch.Groups[1].Value)" }
if ($typeMatch.Success) { Write-Host "type: $($typeMatch.Groups[1].Value)" }
if ($sectionMatch.Success) { Write-Host "section: $($sectionMatch.Groups[1].Value)" }
if ($sectionNameMatch.Success) { Write-Host "sectionName: $($sectionNameMatch.Groups[1].Value)" }
if ($confidenceMatch.Success) { Write-Host "confidence: $($confidenceMatch.Groups[1].Value)" }

# Try to identify the overall structure
$formMatches = [regex]::Matches($content, '"form\d+_\d+"')
$regexMatches = [regex]::Matches($content, '"regex":\s*"[^"]+"')
$fieldsMatches = [regex]::Matches($content, '"fields":\s*\[')

Write-Host "`nOverall structure analysis:"
Write-Host "Forms found: $($formMatches.Count)"
Write-Host "Regex patterns: $($regexMatches.Count)"
Write-Host "Fields arrays: $($fieldsMatches.Count)"

# Get section information
$sectionNumbers = [regex]::Matches($content, '"section":\s*(\d+)')
$uniqueSections = @{}

foreach ($match in $sectionNumbers) {
    $section = $match.Groups[1].Value
    $uniqueSections[$section] = $true
}

Write-Host "`nUnique sections found in first 1000 lines: $($uniqueSections.Keys.Count)"
Write-Host "Section numbers: $($uniqueSections.Keys -join ', ')" 