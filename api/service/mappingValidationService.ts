/**
 * Generic Mapping Validation Service
 *
 * Goals:
 * - Validate that expected UI→PDF mappings exist in the PDF on a page-by-page basis
 * - Extract actual PDF fields on a page to compare against mappings
 * - Scale to all sections/pages for full coverage iteration
 */

import { PDFDocument, PDFName } from 'pdf-lib';
import { getSectionFields, getSectionMetadata } from '../utils/sections-references-loader.js';

export interface PageFieldInfo {
  name: string;
  id?: string;
  type?: string;
  page?: number | null;
}

export interface MappingCheckItem {
  uiPath: string;           // logical UI path
  pdfFieldName: string;     // expected PDF field name
  sectionId?: number;       // section to check references against (default provided in service)
}

export interface PageMappingReport {
  pageNumber: number;
  totalPdfFields: number;
  expectedMappings: number;
  foundInPdf: number;       // of expected mappings that exist in the PDF (by name)
  foundInReferences: number;// of expected mappings that exist in references (section json)
  missingInPdf: MappingCheckItem[];     // expected but not found in the actual PDF page scan
  missingInReferences: MappingCheckItem[]; // expected but not found in references
  extraPdfFields: PageFieldInfo[];      // fields on page not present in expected mapping list (for discovery)
}

export interface FullMappingReport {
  success: boolean;
  totalPages: number;
  pages: PageMappingReport[];
}

export class MappingValidationService {
  constructor(private defaultSectionId: number = 13) {}

  /**
   * Extract all AcroForm field names present in PDF (no page filter)
   */
  private async extractAllFieldNames(pdfBytes: Uint8Array): Promise<{ fieldNames: string[]; fields: any[]; pdfDoc: PDFDocument }>{
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    const fieldNames = fields.map(f => f.getName());
    return { fieldNames, fields, pdfDoc };
  }

  /**
   * Extract fields that are on a specific page
   */
  private extractFieldsOnPage(pdfDoc: PDFDocument, fields: any[], pageNumber: number): any[] {
    const onPage: any[] = [];
    for (const f of fields) {
      try {
        const widgets = (f as any).acroField?.getWidgets?.() || [];
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
      } catch {
        // ignore field if widget/page not resolvable
      }
    }
    return onPage;
  }

  /**
   * Validate expected mapping items against a specific PDF page and references
   */
  async validateMappingsForPage(
    pdfBytes: Uint8Array,
    pageNumber: number,
    expected: MappingCheckItem[],
    sectionId?: number
  ): Promise<PageMappingReport> {
    const { fields, pdfDoc } = await this.extractAllFieldNames(pdfBytes);
    const pageFields = this.extractFieldsOnPage(pdfDoc, fields, pageNumber);
    const pageFieldNames = new Set(pageFields.map(f => f.getName())) as Set<string>;

  const useSection = sectionId ?? this.defaultSectionId;
  const refFields = getSectionFields(useSection);
    const refNames = new Set(refFields.map(f => f.name));

    const missingInPdf: MappingCheckItem[] = [];
    const missingInReferences: MappingCheckItem[] = [];

    let foundInPdf = 0;
    let foundInReferences = 0;

    for (const item of expected) {
      const name = item.pdfFieldName;
  const inPdf = pageFieldNames.has(name); // on this page
  const inRefs = refNames.has(name);

      if (inPdf) foundInPdf++; else missingInPdf.push(item);
      if (inRefs) foundInReferences++; else missingInReferences.push(item);
    }

    // Extra page fields not covered by expected list
    const expectedNames = new Set(expected.map(e => e.pdfFieldName));
    const extraPdfFields: PageFieldInfo[] = [];
    for (const pf of pageFields) {
      const n = pf.getName();
      if (!expectedNames.has(n)) {
        extraPdfFields.push({ name: n });
      }
    }

    return {
      pageNumber,
      totalPdfFields: pageFields.length,
      expectedMappings: expected.length,
      foundInPdf,
      foundInReferences,
      missingInPdf,
      missingInReferences,
      extraPdfFields
    };
  }

  /**
   * Validate mappings over a set of pages (for full-PDF iteration)
   */
  async validateAcrossPages(
    pdfBytes: Uint8Array,
    pages: number[],
    expectedByPage: Record<number, MappingCheckItem[]>,
    sectionId?: number
  ): Promise<FullMappingReport> {
    const reports: PageMappingReport[] = [];
    for (const p of pages) {
      const report = await this.validateMappingsForPage(pdfBytes, p, expectedByPage[p] || [], sectionId);
      reports.push(report);
    }
    return {
      success: true,
      totalPages: reports.length,
      pages: reports
    };
  }
}

export const mappingValidationService = new MappingValidationService();

/**
 * Build expectedByPage map for any section from references
 */
export function buildExpectedByPage(sectionId: number, pages?: number[]): Record<number, MappingCheckItem[]> {
  const refs = getSectionFields(sectionId);
  const meta = getSectionMetadata(sectionId);
  const targetPages = pages && pages.length > 0 ? pages : (meta?.pageRange || []);
  const byPage: Record<number, MappingCheckItem[]> = {};

  if (targetPages.length === 0) {
    // Fallback: derive from refs if metadata pageRange missing
    const uniquePages = Array.from(new Set(refs.map(r => r.page))).sort((a, b) => a - b);
    uniquePages.forEach(p => {
      byPage[p] = refs.filter(r => r.page === p).map(r => ({ uiPath: r.uniqueId || r.name, pdfFieldName: r.name, sectionId }));
    });
    return byPage;
  }

  for (const p of targetPages) {
    byPage[p] = refs.filter(r => r.page === p).map(r => ({ uiPath: r.uniqueId || r.name, pdfFieldName: r.name, sectionId }));
  }
  return byPage;
}
