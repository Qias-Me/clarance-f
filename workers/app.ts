import { createRequestHandler } from "react-router";
import { PdfService } from "api/service/pdfService";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    
    // Handle PDF download requests
    if (url.pathname === '/download-pdf') {
      const pdfId = url.searchParams.get('id');
      
      if (!pdfId) {
        return new Response('PDF ID is required', { status: 400 });
      }
      
      const pdfService = new PdfService();
      const pdfBytes = await pdfService.getPdfById(pdfId);
      
      if (!pdfBytes) {
        return new Response('PDF not found', { status: 404 });
      }
      
      // Return the PDF with proper headers for download
      return new Response(pdfBytes, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="sf86-form.pdf"',
          'Content-Length': pdfBytes.length.toString()
        }
      });
    }
    
    // Handle all other requests with the React Router
    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
} satisfies ExportedHandler<Env>;
