#!/usr/bin/env node
/**
 * Mapping Validation CLI (Node ESM standalone)
 *
 * Usage (PowerShell):
 *   node scripts/validate-mappings.js <pdfPath> <sectionId> [pagesCsv]
 * Example:
 *   node scripts/validate-mappings.js ./workspace/SF86_Section13_Test_2025-07-21.pdf 13 17
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument, PDFName } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function toArray(maybe) {
  if (!maybe) return [];
  return Array.isArray(maybe) ? maybe : [maybe];
}

async function loadSectionReferences(sectionId) {
  const file = path.join(__dirname, '..', 'api', 'sections-references', `section-${sectionId}.json`);
  const raw = await fs.readFile(file, 'utf8');
  const json = JSON.parse(raw);
  const fields = json.fields || Object.values(json.fieldsByEntry || {}).flat();
  const metadata = json.metadata || {};
  return { fields, metadata };
}

function buildExpectedByPageFromRefs(sectionId, pages, refs) {
  const { fields, metadata } = refs;
  const targetPages = pages && pages.length > 0 ? pages : toArray(metadata.pageRange);
  const byPage = {};

  if (!targetPages || targetPages.length === 0) {
    const uniquePages = Array.from(new Set(fields.map(f => f.page))).sort((a, b) => a - b);
    for (const p of uniquePages) {
      byPage[p] = fields.filter(r => r.page === p).map(r => ({ uiPath: r.uniqueId || r.name, pdfFieldName: r.name, sectionId }));
    }
    return byPage;
  }

  for (const p of targetPages) {
    byPage[p] = fields.filter(r => r.page === p).map(r => ({ uiPath: r.uniqueId || r.name, pdfFieldName: r.name, sectionId }));
  }
  return byPage;
}

function getFieldsOnPage(pdfDoc, fields, pageNumber) {
  const onPage = [];
  for (const f of fields) {
    try {
      const widgets = f.acroField?.getWidgets?.() || [];
      if (widgets.length > 0) {
        const widget = widgets[0];
        const pageRef = widget.dict.get(PDFName.of('P'));
        if (pageRef) {
          const pages = pdfDoc.getPages();
          for (let i = 0; i < pages.length; i++) {
            if (pages[i].ref.toString() === pageRef.toString()) {
              if (i + 1 === pageNumber) onPage.push(f);
              break;
            }
          }
        }
      }
    } catch {/* ignore */}
  }
  return onPage;
}

async function validateAcrossPages(pdfBytes, pages, expectedByPage, sectionRefs) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const form = pdfDoc.getForm();
  const allFields = form.getFields();
  const refNames = new Set(sectionRefs.fields.map(f => f.name));
  const reports = [];

  for (const p of pages) {
    const pageFields = getFieldsOnPage(pdfDoc, allFields, p);
    const pageFieldNames = new Set(pageFields.map(f => f.getName()));
    const expected = expectedByPage[p] || [];

    const missingInPdf = [];
    const missingInReferences = [];
    let foundInPdf = 0;
    let foundInReferences = 0;

    for (const item of expected) {
      const inPdf = pageFieldNames.has(item.pdfFieldName);
      const inRefs = refNames.has(item.pdfFieldName);
      if (inPdf) foundInPdf++; else missingInPdf.push(item);
      if (inRefs) foundInReferences++; else missingInReferences.push(item);
    }

    const expectedNames = new Set(expected.map(e => e.pdfFieldName));
    const extraPdfFields = [];
    for (const pf of pageFields) {
      const n = pf.getName();
      if (!expectedNames.has(n)) extraPdfFields.push({ name: n });
    }

    reports.push({
      pageNumber: p,
      totalPdfFields: pageFields.length,
      expectedMappings: expected.length,
      foundInPdf,
      foundInReferences,
      missingInPdf,
      missingInReferences,
      extraPdfFields
    });
  }

  return { success: true, totalPages: reports.length, pages: reports };
}

async function main() {
  const [pdfPathArg, sectionIdArg, pagesCsv] = process.argv.slice(2);
  if (!pdfPathArg || !sectionIdArg) {
    console.error('Usage: node scripts/validate-mappings.js <pdfPath> <sectionId> [pagesCsv]');
    process.exit(1);
  }

  const pdfPath = path.resolve(pdfPathArg);
  const sectionId = parseInt(sectionIdArg, 10);
  const pages = pagesCsv ? pagesCsv.split(',').map(n => parseInt(n.trim(), 10)).filter(Number.isFinite) : [];

  try {
    const pdfBytes = new Uint8Array(await fs.readFile(pdfPath));
    const refs = await loadSectionReferences(sectionId);
    const expectedByPage = buildExpectedByPageFromRefs(sectionId, pages, refs);
    const pageList = pages.length > 0 ? pages : Object.keys(expectedByPage).map(n => parseInt(n, 10));

    const report = await validateAcrossPages(pdfBytes, pageList, expectedByPage, refs);

    // Persist human-readable per-page JSON under api/PDFoutput
    const outputDir = path.join(__dirname, '..', 'api', 'PDFoutput');
    await fs.mkdir(outputDir, { recursive: true });

    for (const pageReport of report.pages) {
      const filePath = path.join(outputDir, `mapping-page-${String(pageReport.pageNumber).padStart(2,'0')}.json`);
      await fs.writeFile(filePath, JSON.stringify(pageReport, null, 2), 'utf8');
      console.log(`✅ Saved ${filePath}`);
    }

    // Summary output
    console.log(`\n📊 Mapping Validation Summary (Section ${sectionId})`);
    for (const p of report.pages) {
      console.log(`  • Page ${p.pageNumber}: expected ${p.expectedMappings}, foundInPdf ${p.foundInPdf}, foundInRefs ${p.foundInReferences}, totalPdfFields ${p.totalPdfFields}`);
    }

    console.log('\n🎉 Done');
  } catch (err) {
    console.error('❌ Mapping validation failed:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

main();
