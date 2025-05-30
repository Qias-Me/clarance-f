/**
 * PDF Proxy API Route
 * 
 * This route handles PDF proxying for the SF-86 form architecture.
 * It fetches PDF files from external URLs and serves them with proper headers.
 */

import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const pdfUrl = url.searchParams.get("url");

  if (!pdfUrl) {
    return new Response(JSON.stringify({ error: "No URL provided" }), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 400,
    });
  }

  try {
    console.log(`Proxying PDF request to: ${pdfUrl}`);

    // Fetch the PDF
    const response = await fetch(pdfUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch PDF: ${response.status} ${response.statusText}`
      );
    }

    // Get the PDF data
    const pdfArrayBuffer = await response.arrayBuffer();

    // Return the PDF with appropriate headers
    return new Response(pdfArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": pdfArrayBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=86400", // Cache for a day
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error proxying PDF:", error);

    return new Response(
      JSON.stringify({
        error: `Failed to proxy PDF: ${
          error instanceof Error ? error.message : String(error)
        }`,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
        status: 500,
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
