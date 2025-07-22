import { postgresClient } from '@/integrations/postgresql/client';

/**
 * Generic data fetching function.
 * @param from - The table name to fetch from.
 * @param select - The columns to select.
 * @param filters - An array of filter conditions to apply.
 * @returns A promise that resolves with the fetched data or an error.
 */
export const fetchData = async <T>(
  from: string,
  select: string = '*',
  filters: { column: string; operator: string; value: unknown }[] = []
): Promise<{ data: T[] | null; error: string | null }> => {
  try {
    let query = postgresClient.from(from as keyof import('@/integrations/postgresql/types').Database['public']['Tables']).select(select);

    filters.forEach(filter => {
      query = query[filter.operator](filter.column, filter.value);
    });

    const result = await query.execute();
    return { data: result.data as T[] | null, error: result.error };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Generic data mutation function for inserts, updates, and deletes.
 * @param from - The table name to mutate.
 * @param action - The mutation type: 'insert', 'update', or 'delete'.
 * @param payload - The data for the mutation.
 * @param match - The conditions for 'update' or 'delete' actions.
 * @returns A promise that resolves with the mutated data or an error.
 */
export const mutateData = async <T>(
  from: string,
  action: 'insert' | 'update' | 'delete',
  payload?: Partial<T> | Partial<T>[],
  match?: Partial<T>
): Promise<{ data: T[] | null; error: string | null }> => {
  try {
    let query;
    let result;

    switch (action) {
      case 'insert':
        query = postgresClient.from(from as keyof import('@/integrations/postgresql/types').Database['public']['Tables']).insert(payload);
        result = await query.execute();
        break;
      case 'update':
        query = postgresClient.from(from as keyof import('@/integrations/postgresql/types').Database['public']['Tables']).update(payload);
        // Apply match conditions using eq operator
        if (match) {
          Object.entries(match).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        result = await query.execute();
        break;
      case 'delete':
        query = postgresClient.from(from as keyof import('@/integrations/postgresql/types').Database['public']['Tables']).delete();
        // Apply match conditions using eq operator
        if (match) {
          Object.entries(match).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        result = await query.execute();
        break;
      default:
        return { data: null, error: 'Invalid action' };
    }

    return { data: result.data as T[] | null, error: result.error };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};