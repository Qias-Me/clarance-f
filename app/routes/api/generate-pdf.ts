/**
 * PDF Template API Route
 *
 * This route serves the base SF-86 PDF template for client-side processing.
 * For privacy and security, form data is never sent to the server.
 * The client handles all form data application locally.
 */

import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request, context }: LoaderFunctionArgs) {
  try {
    console.log("🔄 API Route: /api/generate-pdf - Loading local SF-86 PDF template...");

    // Access the ASSETS binding from the Cloudflare environment
    const assets = context?.cloudflare?.env?.ASSETS;

    if (!assets) {
      console.error("❌ ASSETS binding not available");
      throw new Error("ASSETS binding not configured - check wrangler.jsonc assets configuration");
    }

    console.log("📄 Fetching PDF from ASSETS binding...");

    // Create a request for the clean.pdf file from the assets
    // The ASSETS binding serves files from the configured directory (./public/)
    const assetRequest = new Request(new URL("/clean.pdf", request.url));
    const response = await assets.fetch(assetRequest);

    console.log(`📊 PDF fetch response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        url: assetRequest.url,
        headers: Object.fromEntries(response.headers.entries())
      };
      console.error("❌ PDF fetch failed:", errorDetails);

      // Provide more helpful error message
      if (response.status === 404) {
        throw new Error(`PDF template not found: clean.pdf is missing from the public directory. Ensure the file exists and is deployed with the Worker.`);
      } else {
        throw new Error(`Failed to load PDF template: ${response.status} ${response.statusText}`);
      }
    }

    const pdfBytes = await response.arrayBuffer();

    console.log(`✅ Successfully loaded local SF-86 PDF template. Size: ${pdfBytes.byteLength} bytes`);

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
    console.error("💥 Error in /api/generate-pdf route:", error);

    const errorResponse = {
      success: false,
      error: `Failed to load local PDF template: ${
        error instanceof Error ? error.message : String(error)
      }`,
      route: "/api/generate-pdf",
      timestamp: new Date().toISOString(),
      requestUrl: request.url,
      assetsBindingAvailable: !!context?.cloudflare?.env?.ASSETS
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
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
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
