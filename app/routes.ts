import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/_index.tsx"),
  
  // Form Routes
  route("startForm", "routes/startForm.tsx"),
  route("test/section13-demo", "routes/test.section13-demo.tsx"),

  // Tools routes
  route("tools/field-mapping", "routes/tools.field-mapping.tsx"),
  route("tools/mapping-photos", "routes/tools.mapping-photos.tsx"),

  // API Routes for PDF operations
  route("api/pdf-proxy", "routes/api/pdf-proxy.ts"),
  route("api/generate-pdf", "routes/api/generate-pdf.ts"),
  route("api/validate-pdf", "routes/api/validate-pdf.ts"),
<<<<<<< HEAD
  
  // Health check route to prevent 404s
  route("api/health", "routes/api/health.ts"),
=======
  route("api/pdf-validation-tools", "routes/api.pdf-validation-tools.ts"),
>>>>>>> dee206932ac43994f42ae910b9869d54d7fa3b02

] satisfies RouteConfig;
