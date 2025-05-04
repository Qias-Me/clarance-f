import { type RouteConfig, index } from "@react-router/dev/routes";

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
  }
] satisfies RouteConfig;
