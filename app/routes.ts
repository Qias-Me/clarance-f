import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  
  // Form Routes
  route("startForm", "routes/startForm.tsx"),
  route("test/section13-demo", "routes/test.section13-demo.tsx"),

  // API Routes for PDF operations
  route("api/pdf-proxy", "routes/api/pdf-proxy.ts"),
  route("api/generate-pdf", "routes/api/generate-pdf.ts"),
  route("api/validate-pdf", "routes/api/validate-pdf.ts"),
  
  // Health check route to prevent 404s
  route("api/health", "routes/api/health.ts"),

] satisfies RouteConfig;
