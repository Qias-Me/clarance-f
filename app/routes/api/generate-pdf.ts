/**
 * PDF Template API Route
 *
 * This route serves the base SF-86 PDF template for client-side processing.
 * For privacy and security, form data is never sent to the server.
 * The client handles all form data application locally.
 */


const SF86_PDF_URL = 'https://www.opm.gov/forms/pdf_fill/sf86.pdf';

export async function loader() {
  try {
    console.log("Fetching base SF-86 PDF template...");

    // Fetch the base PDF from the government website
    const response = await fetch(SF86_PDF_URL);

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }

    const pdfBytes = await response.arrayBuffer();

    console.log(`Successfully fetched SF-86 PDF template. Size: ${pdfBytes.byteLength} bytes`);

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
    console.error("Error fetching PDF template:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: `Failed to fetch PDF template: ${
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
