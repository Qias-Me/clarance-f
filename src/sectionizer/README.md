# SF-86 Sectionizer Tool

This tool processes SF-86 PDF forms and categorizes fields into appropriate sections, subsections, and entries to facilitate automated processing.

## Features

- Automated extraction of fields from SF-86 PDF files
- Field categorization into sections, subsections, and entries
- Intelligent caching mechanism to avoid repeated PDF parsing
- Spatial analysis for improved categorization accuracy
- Cyclical learning to iteratively improve results
- Output of JSON files with categorized data

## Usage

```
node src/sectionizer/index.js [options]
```

### Options

- `-p, --pdf-path <path>` - Path to the SF-86 PDF file to process
- `-o, --output-dir <path>` - Directory to output categorized fields (default: output/)
- `-l, --log-level <level>` - Log level: debug, info, warn, error (default: info)
- `-f, --force` - Force extraction even when cache exists
- `--validate` - Validate that PDF can be parsed correctly
- `--verbose` - Show detailed output

### Example Commands

**Basic Usage:**
```
node src/sectionizer/index.js -p forms/sf86.pdf -o output/myform
```

**Use Cached Data:**
```
# First run will create cache
node src/sectionizer/index.js -p forms/sf86.pdf

# Subsequent runs will use cache
node src/sectionizer/index.js -p forms/sf86.pdf

# Force re-extraction from PDF
node src/sectionizer/index.js -p forms/sf86.pdf -f
```

## Caching

The sectionizer implements a caching system to improve performance during development:

- First run extracts fields from PDF and stores them in a `.cache.json` file
- Subsequent runs use the cached data if available and newer than the PDF
- Force flag (`-f`) bypasses cache and re-extracts fields directly from PDF
- Cache filenames follow the pattern: `<pdf-path>.cache.json`

## Output

The sectionizer produces the following output files:

- `categorized-fields.json` - All fields organized by section, subsection, and entry
- `pdf-extracted.json` - Raw field data extracted from the PDF
- `section-statistics.json` - Summary statistics about the categorization

## Extending the Tool

To add new categorization rules:

1. Modify the appropriate rule files in `src/sectionizer/rules/`
2. Add patterns for special sections or subsections in `src/sectionizer/utils/fieldParsing.js`
3. Run the tool with `-f` flag to force re-processing with your new rules 