import { PDFDocument, PDFPage, TextItem } from 'pdf-lib';
import { logger } from '~/utils/logger'; // Assuming logger setup exists

/**
 * Options for text extraction.
 */
export interface TextExtractionOptions {
  pageNumbers?: number[]; // Specific 1-based page numbers to extract from, otherwise all pages
  cleanWhitespace?: boolean; // Apply basic whitespace cleaning
  mergeLines?: boolean; // Attempt to merge lines based on vertical proximity (simple implementation)
}

/**
 * Represents extracted text content along with its source page.
 */
export interface ExtractedPageText {
  pageNumber: number; // 1-based page number
  textContent: string;
  rawItems: TextItem[];
}

/**
 * Service for extracting text content from PDF documents, focusing on non-form field text.
 */
export class PdfTextExtractor {
  /**
   * Extracts text content from specified pages of a PDF document.
   *
   * @param pdfDoc The loaded PDFDocument object.
   * @param options Text extraction options.
   * @returns A promise resolving to an array of ExtractedPageText objects.
   */
  static async extractTextFromPages(
    pdfDoc: PDFDocument,
    options: TextExtractionOptions = {}
  ): Promise<ExtractedPageText[]> {
    const results: ExtractedPageText[] = [];
    const totalPages = pdfDoc.getPageCount();
    const targetPages =
      options.pageNumbers?.map((n) => n - 1) // Convert to 0-based index
      ?? Array.from({ length: totalPages }, (_, i) => i); // All pages if not specified

    for (const pageIndex of targetPages) {
      if (pageIndex < 0 || pageIndex >= totalPages) {
        logger.warn(`Invalid page number ${pageIndex + 1} requested. Skipping.`);
        continue;
      }

      try {
        const page = pdfDoc.getPage(pageIndex);
        const textContentItems = await page.getTextContent();

        if (textContentItems?.items?.length > 0) {
          let extractedText = this.itemsToString(textContentItems.items, options.mergeLines);

          if (options.cleanWhitespace) {
            extractedText = this.cleanText(extractedText);
          }

          results.push({
            pageNumber: pageIndex + 1,
            textContent: extractedText,
            rawItems: textContentItems.items,
          });
        } else {
          // Add entry even for pages with no text content found
           results.push({
            pageNumber: pageIndex + 1,
            textContent: '',
            rawItems: [],
          });
        }
      } catch (error) {
        logger.error(`Error extracting text content from page ${pageIndex + 1}: ${error instanceof Error ? error.message : error}`);
        // Optionally add an error entry or re-throw
         results.push({
            pageNumber: pageIndex + 1,
            textContent: '[Error extracting text]',
            rawItems: [],
          });
      }
    }

    return results;
  }

  /**
   * Converts an array of TextItem objects to a single string.
   * Optionally tries to merge lines based on simple vertical proximity.
   *
   * @param items Array of TextItem objects from pdf-lib.
   * @param mergeLines Attempt to merge lines.
   * @returns The combined text content as a string.
   */
  private static itemsToString(items: TextItem[], mergeLines?: boolean): string {
      if (!items || items.length === 0) {
          return '';
      }

      // Sort items primarily by vertical position (top-to-bottom), then horizontal (left-to-right)
      // pdf-lib's coordinate system has y increasing upwards.
      const sortedItems = [...items].sort((a, b) => {
          const yDiff = b.transform[5] - a.transform[5]; // Compare y-coordinate (index 5 in transform matrix)
          if (Math.abs(yDiff) > 2) { // Consider items on different lines if y diff is significant
              return yDiff;
          }
          return a.transform[4] - b.transform[4]; // Compare x-coordinate (index 4) for same line ordering
      });

      if (!mergeLines) {
        // Simple join if not merging lines
        return sortedItems.map(item => item.str).join('');
      }

      // Simple line merging logic
      let result = '';
      let currentLineY = sortedItems[0]?.transform[5] ?? 0;
      const lineHeightThreshold = 5; // Heuristic: consider items on new line if y diff exceeds this

      for (let i = 0; i < sortedItems.length; i++) {
          const item = sortedItems[i];
          const itemY = item.transform[5];

          // Check if this item likely starts a new line
          if (i > 0 && Math.abs(itemY - currentLineY) > lineHeightThreshold) {
              result += '\n'; // Add newline character
              currentLineY = itemY;
          } else if (i > 0) {
             // Add space between items on the same assumed line if not already ending/starting with space
             if (!result.endsWith(' ') && !item.str.startsWith(' ')) {
                 result += ' ';
             }
          }
          result += item.str;
      }

      return result;
  }


  /**
   * Applies basic cleaning to extracted text.
   * - Trims leading/trailing whitespace.
   * - Replaces multiple consecutive spaces/newlines with single ones.
   *
   * @param text The text to clean.
   * @returns The cleaned text.
   */
  private static cleanText(text: string): string {
    if (!text) return '';
    let cleaned = text.trim();
    cleaned = cleaned.replace(/\s\s+/g, ' '); // Replace multiple spaces with single space
    cleaned = cleaned.replace(/(\n\s*)+/g, '\n'); // Replace multiple newlines (with optional space) with single newline
    return cleaned;
  }

  // TODO: Implement extractTextInArea(page: PDFPage, x: number, y: number, width: number, height: number)
  // TODO: Implement OCR integration (likely involving external library like Tesseract.js)
} 