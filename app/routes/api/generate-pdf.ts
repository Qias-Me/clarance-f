/**
 * PDF Template API Route
 *
 * This route serves the base SF-86 PDF template for client-side processing.
 * For privacy and security, form data is never sent to the server.
 * The client handles all form data application locally.
 */

const LOCAL_SF86_PDF_URL = '/clean.pdf'; // Using clean.pdf as it exists in public directory

export async function loader({ request }: { request: Request }) {
  try {
    console.log("Loading local SF-86 PDF template...");

    // Get the origin from the request to construct the full URL
    const url = new URL(request.url);
    const fullPdfUrl = new URL(LOCAL_SF86_PDF_URL, url.origin).href;

    console.log(`Fetching PDF from: ${fullPdfUrl}`);

    // Fetch the local PDF file from the public directory
    const response = await fetch(fullPdfUrl);

    if (!response.ok) {
      throw new Error(`Failed to load local PDF: ${response.status} ${response.statusText}`);
    }

    const pdfBytes = await response.arrayBuffer();

    console.log(`Successfully loaded local SF-86 PDF template. Size: ${pdfBytes.byteLength} bytes`);

    // Return the base PDF template
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Access-Control-Allow-Origin": "*",
        "Content-Length": pdfBytes.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Error loading local PDF template:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: `Failed to load local PDF template: ${
          error instanceof Error ? error.message : String(error)
        }`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function options() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
