import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

export namespace Route {
  export type LoaderArgs = {
    context: {
      cloudflare: {
        env: Record<string, string>;
      };
    };
  };
  
  export type ActionArgs = {
    request: Request;
  };
  
  export type MetaArgs = {};
  
  export interface ComponentProps {
    loaderData: Record<string, unknown>;
  }
} 