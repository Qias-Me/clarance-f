export namespace Route {
  export type LoaderArgs = {};
  
  export interface ComponentProps {
    loaderData: {
      isLoading: boolean;
      action?: {
        success: boolean;
        message: string;
      };
    };
  }
} 