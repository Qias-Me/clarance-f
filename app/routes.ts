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
  route("api/pdf-proxy", "routes/api/pdf-proxy.tsx"),
//    route("download-pdf/:id", "routes/download-pdf.ts"),

] satisfies RouteConfig;
