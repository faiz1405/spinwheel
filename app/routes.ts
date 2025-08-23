import { type RouteConfig, index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("routes/admin/layout.tsx", [
    route( "/admin","routes/admin/admin.tsx"),
    route( "/admin/prize","routes/admin/prize.tsx"),
    route( "/admin/import","routes/admin/import.tsx"),
  ]),
] satisfies RouteConfig;
