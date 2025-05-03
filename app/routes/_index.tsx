import type { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};


export async function loader() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/startForm",
    },
  });
}


