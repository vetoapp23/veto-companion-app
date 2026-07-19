/** Ambient shims so the Node/TS language service can typecheck Deno edge functions. */
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
  function serve(
    handler: (request: Request) => Response | Promise<Response>
  ): void;
}

type EdgeSupabaseClient = {
  auth: {
    admin: {
      listUsers: (opts?: { page?: number; perPage?: number }) => Promise<{ data: any; error: any }>;
      updateUserById: (id: string, attrs: Record<string, unknown>) => Promise<{ data: any; error: any }>;
      createUser: (attrs: Record<string, unknown>) => Promise<{ data: any; error: any }>;
    };
  };
  from: (table: string) => any;
};

declare module "https://esm.sh/@supabase/supabase-js@2.45.0" {
  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: Record<string, unknown>
  ): EdgeSupabaseClient;
}

declare module "npm:@supabase/supabase-js@2" {
  export function createClient(
    supabaseUrl: string,
    supabaseKey: string,
    options?: Record<string, unknown>
  ): EdgeSupabaseClient;
}

declare module "https://esm.sh/standardwebhooks@1.0.0" {
  export class Webhook {
    constructor(secret: string);
    verify(payload: string, headers: Record<string, string>): unknown;
  }
}

declare module "npm:@supabase/supabase-js@2/cors" {
  export const corsHeaders: Record<string, string>;
}

