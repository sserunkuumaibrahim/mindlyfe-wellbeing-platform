import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';

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
  filters: { column: string; operator: any; value: any }[] = []
): Promise<{ data: T[] | null; error: PostgrestError | null }> => {
  let query = supabase.from(from).select(select);

  filters.forEach(filter => {
    query = query[filter.operator](filter.column, filter.value);
  });

  const { data, error } = await query;
  return { data: data as T[] | null, error };
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
): Promise<{ data: T[] | null; error: PostgrestError | null }> => {
  let query;

  switch (action) {
    case 'insert':
      query = supabase.from(from).insert(payload as any);
      break;
    case 'update':
      query = supabase.from(from).update(payload as any).match(match as any);
      break;
    case 'delete':
      query = supabase.from(from).delete().match(match as any);
      break;
    default:
      return Promise.resolve({ data: null, error: { message: 'Invalid action', details: '', hint: '', code: '' } });
  }

  const { data, error } = await query.select();
  return { data: data as T[] | null, error };
};