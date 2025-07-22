// Supabase compatibility layer for PostgreSQL migration
// This provides a compatible interface to prevent import errors

import { postgresClient, type AuthUser, type AuthSession, type ApiResponse } from '../postgresql/client';

// Supabase-compatible auth interface
interface SupabaseAuth {
  getUser(): Promise<{ data: { user: AuthUser | null }; error: string | null }>;
  getSession(): Promise<{ data: { session: AuthSession | null }; error: string | null }>;
  signUp(credentials: { email: string; password: string; options?: { data?: Record<string, unknown> } }): Promise<ApiResponse<AuthSession>>;
  signInWithPassword(credentials: { email: string; password: string }): Promise<ApiResponse<AuthSession>>;
  signOut(): Promise<ApiResponse<void>>;
  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void): { data: { subscription: { unsubscribe: () => void } } };
}

// Supabase-compatible query builder
class SupabaseQueryBuilder {
  private table: string;

  constructor(table: string) {
    this.table = table;
  }

  select(columns?: string) {
    const builder = postgresClient.from(this.table as keyof import('../postgresql/types').Database['public']['Tables']);
    if (columns) {
      builder.select(columns);
    }
    return {
      eq: (column: string, value: unknown) => builder.eq(column, value).execute(),
      neq: (column: string, value: unknown) => builder.neq(column, value).execute(),
      gt: (column: string, value: unknown) => builder.gt(column, value).execute(),
      gte: (column: string, value: unknown) => builder.gte(column, value).execute(),
      lt: (column: string, value: unknown) => builder.lt(column, value).execute(),
      lte: (column: string, value: unknown) => builder.lte(column, value).execute(),
      like: (column: string, value: string) => builder.like(column, value).execute(),
      in: (column: string, values: unknown[]) => builder.in(column, values).execute(),
      order: (column: string, options?: { ascending?: boolean }) => {
        builder.order(column, options?.ascending !== false);
        return {
          limit: (count: number) => {
            builder.limit(count);
            return builder.execute();
          },
          execute: () => builder.execute()
        };
      },
      limit: (count: number) => {
        builder.limit(count);
        return {
          order: (column: string, options?: { ascending?: boolean }) => {
            builder.order(column, options?.ascending !== false);
            return builder.execute();
          },
          execute: () => builder.execute()
        };
      },
      execute: () => builder.execute()
    };
  }

  insert(data: unknown | unknown[]) {
    return postgresClient.from(this.table as keyof import('../postgresql/types').Database['public']['Tables']).insert(data);
  }

  update(data: unknown) {
    const builder = postgresClient.from(this.table as keyof import('../postgresql/types').Database['public']['Tables']);
    return {
      eq: (column: string, value: unknown) => {
        builder.eq(column, value);
        return builder.update(data);
      },
      match: (conditions: Record<string, unknown>) => {
        Object.entries(conditions).forEach(([key, val]) => {
          builder.eq(key, val);
        });
        return builder.update(data);
      }
    };
  }

  delete() {
    const builder = postgresClient.from(this.table as keyof import('../postgresql/types').Database['public']['Tables']);
    return {
      eq: (column: string, value: unknown) => {
        builder.eq(column, value);
        return builder.delete();
      },
      match: (conditions: Record<string, unknown>) => {
        Object.entries(conditions).forEach(([key, val]) => {
          builder.eq(key, val);
        });
        return builder.delete();
      }
    };
  }

  upsert(data: unknown | unknown[]) {
    // For now, treat upsert as insert
    return this.insert(data);
  }
}

// Supabase-compatible storage interface
class SupabaseStorage {
  from(bucket: string) {
    return {
      upload: async (path: string, file: File) => {
        // Mock storage upload - in real implementation, this would upload to your storage service
        console.warn('Storage upload not implemented in PostgreSQL migration');
        return {
          data: { path: `${bucket}/${path}` },
          error: null
        };
      },
      getPublicUrl: (path: string) => {
        return {
          data: { publicUrl: `${import.meta.env.VITE_STORAGE_URL || '/storage'}/${bucket}/${path}` }
        };
      },
      remove: async (paths: string[]) => {
        console.warn('Storage remove not implemented in PostgreSQL migration');
        return { data: null, error: null };
      }
    };
  }
}

// Supabase-compatible functions interface
class SupabaseFunctions {
  async invoke(functionName: string, options?: { body?: unknown }) {
    return postgresClient.rpc(functionName, options?.body as Record<string, unknown>);
  }
}

// Supabase-compatible realtime interface
class SupabaseRealtime {
  channel(name: string) {
    return {
      on: (event: string, callback: (payload: unknown) => void) => {
        console.warn('Realtime subscriptions not implemented in PostgreSQL migration');
        return this;
      },
      subscribe: () => {
        console.warn('Realtime subscriptions not implemented in PostgreSQL migration');
        return Promise.resolve('SUBSCRIBED');
      },
      unsubscribe: () => {
        console.warn('Realtime subscriptions not implemented in PostgreSQL migration');
        return Promise.resolve('UNSUBSCRIBED');
      }
    };
  }

  removeChannel(channel: unknown) {
    console.warn('Realtime channel removal not implemented in PostgreSQL migration');
  }
}

// Main Supabase client interface
class SupabaseClient {
  auth: SupabaseAuth;
  storage: SupabaseStorage;
  functions: SupabaseFunctions;
  realtime: SupabaseRealtime;

  constructor() {
    this.auth = {
      getUser: async () => {
        const user = postgresClient.getCurrentUser();
        return {
          data: { user },
          error: null
        };
      },
      getSession: async () => {
        const session = postgresClient.getCurrentSession();
        return {
          data: { session },
          error: null
        };
      },
      signUp: (credentials) => {
        return postgresClient.signUp(
          credentials.email,
          credentials.password,
          credentials.options?.data
        );
      },
      signInWithPassword: (credentials) => {
        return postgresClient.signIn(credentials.email, credentials.password);
      },
      signOut: () => {
        return postgresClient.signOut();
      },
      onAuthStateChange: (callback) => {
        // Mock auth state change listener
        console.warn('Auth state change listeners not implemented in PostgreSQL migration');
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                console.warn('Auth state change unsubscribe not implemented');
              }
            }
          }
        };
      }
    };

    this.storage = new SupabaseStorage();
    this.functions = new SupabaseFunctions();
    this.realtime = new SupabaseRealtime();
  }

  from(table: string) {
    return new SupabaseQueryBuilder(table);
  }

  removeChannel(channel: unknown) {
    this.realtime.removeChannel(channel);
  }
}

// Create and export the compatibility client
export const supabase = new SupabaseClient();

// Export for named imports
export default supabase;