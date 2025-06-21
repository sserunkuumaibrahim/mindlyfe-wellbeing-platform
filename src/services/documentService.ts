
import { supabase } from '@/integrations/supabase/client';

export interface UploadDocumentData {
  profile_id: string;
  category_id: string;
  file: File;
  expiry_date?: string;
}

export const documentService = {
  async uploadDocument(data: UploadDocumentData) {
    const { file, profile_id, category_id, expiry_date } = data;
    
    // Upload file to storage
    const fileName = `${profile_id}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Save document record
    const { data: document, error } = await supabase
      .from('documents')
      .insert({
        profile_id,
        category_id,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
        expiry_date: expiry_date ? new Date(expiry_date).toISOString().split('T')[0] : null
      })
      .select()
      .single();

    if (error) throw error;
    return document;
  },

  async getUserDocuments(profileId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        category:document_categories(name, description)
      `)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getDocumentCategories() {
    const { data, error } = await supabase
      .from('document_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  async getDocumentUrl(filePath: string) {
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async deleteDocument(documentId: string) {
    // Get document info first
    const { data: document } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', documentId)
      .single();

    if (document) {
      // Delete from storage
      await supabase.storage
        .from('documents')
        .remove([document.file_path]);
    }

    // Delete from database
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) throw error;
  }
};
