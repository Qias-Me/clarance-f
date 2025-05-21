# SF-86 Form Field Sectionizer CLI Usage

This document details the command line interface for the SF-86 Form Field Sectionizer tool.

## Basic Usage

```bash
# Using the main sectionizer tool
npx tsx src/sectionizer/index.ts [options]

# Using the PDF subsection analyzer utility
npx tsx src/sectionizer/utils/pdf-subsection-analyzer.ts --input=<path-to-hierarchy.json> [options]
```

## Main Sectionizer Options

| Option | Description | Default |
|--------|-------------|---------|
| `-v, --verbose` | Enable verbose logging with detailed information about processing steps | `false` |
| `-l, --log-level <level>` | Set logging detail level (debug, info, warn, error) | `info` |
| `-o, --output <path>` | Directory where results will be saved | Current directory |
| `-p, --pdf <path>` | Path to the SF-86 PDF file to analyze | Required |
| `-f, --fields <path>` | Path to JSON file containing extracted form fields | Required |
| `-s, --self-healing` | Apply self-healing algorithms to improve categorization results | `false` |
| `--validate-counts` | Compare section assignments against expected reference counts for validation | `false` |
| `-m, --max-iterations <number>` | Maximum number of self-healing iterations to perform | `5` |
| `--confidence-threshold <number>` | Minimum confidence score (0-1) required to accept a section assignment | `0.75` |
| `--healing-report <path>` | Path where the detailed self-healing process report will be saved | None |
| `--healing-only` | Skip field extraction and only run the self-healing process on existing data | `false` |

## PDF Subsection Analyzer Options

| Option | Description | Default |
|--------|-------------|---------|
| `-i, --input <path>` | Path to field hierarchy JSON file | Required |
| `-o, --output <path>` | Output directory for results | `validation-results` in current directory |
| `-v, --verbose` | Enable verbose logging | `false` |

## Common Usage Examples

### Basic Section Analysis

Process a PDF and extracted fields JSON file:

```bash
npx tsx src/sectionizer/index.ts --pdf="./forms/sf86.pdf" --fields="./data/extracted-fields.json"
```

### Advanced Usage with Self-Healing

Process a PDF with self-healing enabled and output to a specific directory:

```bash
npx tsx src/sectionizer/index.ts \
  --pdf="./forms/sf86.pdf" \
  --fields="./data/extracted-fields.json" \
  --output="./results" \
  --self-healing \
  --validate-counts \
  --confidence-threshold=0.8 \
  --max-iterations=10 \
  --healing-report="./reports/healing-report.json"
```

### Debug Mode with Verbose Logging

Run in debug mode with verbose logging:

```bash
npx tsx src/sectionizer/index.ts \
  --pdf="./forms/sf86.pdf" \
  --fields="./data/extracted-fields.json" \
  --log-level=debug \
  --verbose
```

### Self-Healing Only Mode

Run only the self-healing process on already processed data:

```bash
npx tsx src/sectionizer/index.ts \
  --fields="./data/extracted-fields.json" \
  --healing-only \
  --healing-report="./reports/healing-report.json"
```

### Analyze Subsections

Analyze subsections from a field hierarchy file:

```bash
npx tsx src/sectionizer/utils/pdf-subsection-analyzer.ts \
  --input="./data/field-hierarchy.json" \
  --output="./subsection-analysis" \
  --verbose
```

### Process Multiple PDFs in Batch

Process multiple PDFs in sequence using a shell script:

```bash
#!/bin/bash
PDF_DIR="./forms"
FIELDS_DIR="./data/extracted"
OUTPUT_DIR="./results"

for pdf_file in $PDF_DIR/*.pdf; do
  filename=$(basename -- "$pdf_file")
  name="${filename%.*}"
  fields_file="$FIELDS_DIR/$name-fields.json"
  
  echo "Processing $filename..."
  npx tsx src/sectionizer/index.ts \
    --pdf="$pdf_file" \
    --fields="$fields_file" \
    --output="$OUTPUT_DIR/$name" \
    --self-healing
done
```

### Validate Results Against Reference Counts

Run with validation against reference section counts:

```bash
npx tsx src/sectionizer/index.ts \
  --pdf="./forms/sf86.pdf" \
  --fields="./data/extracted-fields.json" \
  --validate-counts
```

### Generate Detailed Reports

Generate comprehensive reports for analysis:

```bash
npx tsx src/sectionizer/index.ts \
  --pdf="./forms/sf86.pdf" \
  --fields="./data/extracted-fields.json" \
  --output="./detailed-analysis" \
  --self-healing \
  --healing-report="./reports/detailed-healing-report.json" \
  --verbose
```

## Exit Codes

| Code | Description |
|------|-------------|
| `0` | Success |
| `1` | General error or invalid arguments |
| `2` | File access/processing error |
| `3` | Validation error |
| `4` | Self-healing process failure |

## Environment Variables

The following environment variables can be used to configure the sectionizer:

| Variable | Description | Default |
|----------|-------------|---------|
| `SECTIONIZER_LOG_LEVEL` | Override the log level | Command line option value |
| `SECTIONIZER_OUTPUT_DIR` | Default output directory | Current directory |
| `SECTIONIZER_REFERENCE_PATH` | Path to reference counts file | `./data/reference-counts.json` |

## Troubleshooting

### Common Issues and Solutions

1. **PDF File Not Found**
   - Ensure the path to the PDF file is correct
   - Check file permissions
   - Verify the PDF is not corrupted

2. **Missing Fields JSON File**
   - Generate the fields JSON file using the PDF extraction tool
   - Check the path to the fields file

3. **Self-Healing Not Improving Results**
   - Try increasing the `--max-iterations` value
   - Adjust the `--confidence-threshold` to be lower
   - Check if the PDF structure matches expected format

4. **High Memory Usage**
   - Process larger PDFs on a machine with more RAM
   - Consider splitting processing into smaller batches 