import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  {
    path: "startForm",
    file: "routes/startForm.tsx",
    children: [
      {
        index: true,
        file: "routes/startForm._index.tsx"
      }
    ]
  },

  // API Routes for PDF operations
  route("api/pdf-proxy", "routes/api/pdf-proxy.ts"),
  route("api/generate-pdf", "routes/api/generate-pdf.ts"),
  route("api/validate-pdf", "routes/api/validate-pdf.ts"),

] satisfies RouteConfig;
