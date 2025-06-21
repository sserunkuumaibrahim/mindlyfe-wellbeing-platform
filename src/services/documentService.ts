
import { supabase } from '@/integrations/supabase/client';

interface DocumentUploadData {
  profile_id: string;
  category_id: string;
  file: File;
}

export const documentService = {
  async getDocumentCategories() {
    const { data, error } = await supabase
      .from('document_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  async getUserDocuments(profileId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        category:document_categories(
          id,
          name,
          description,
          required_for_role
        )
      `)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async uploadDocument(uploadData: DocumentUploadData) {
    const { profile_id, category_id, file } = uploadData;
    
    // Upload file to storage
    const fileName = `${profile_id}/${category_id}/${Date.now()}_${file.name}`;
    const { data: storageData, error: storageError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (storageError) throw storageError;

    // Create document record
    const { data, error } = await supabase
      .from('documents')
      .insert({
        profile_id,
        category_id,
        file_name: file.name,
        file_path: storageData.path,
        file_size: file.size,
        mime_type: file.type,
        status: 'pending_review'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
