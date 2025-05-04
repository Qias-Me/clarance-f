import type { MetaFunction } from "react-router";

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


