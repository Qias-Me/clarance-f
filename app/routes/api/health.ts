import type { Route } from "./+types/health";

export async function loader({ request }: Route.LoaderArgs) {
  return new Response(JSON.stringify({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'sf86-form-app'
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}