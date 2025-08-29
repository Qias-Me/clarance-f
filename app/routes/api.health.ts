/**
 * Health Check API Endpoint
 * 
 * Simple endpoint to verify API is working
 */

import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  const timestamp = new Date().toISOString();
  const uptime = process.uptime ? process.uptime() : 0;
  
  return new Response(
    JSON.stringify({
      status: 'healthy',
      timestamp,
      uptime,
      environment: process.env.NODE_ENV || 'development',
      message: 'API is running'
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    }
  );
}