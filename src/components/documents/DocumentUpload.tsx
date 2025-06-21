
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { documentService } from '@/services/documentService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

interface DocumentCategory {
  id: string;
  name: string;
  description: string;
  required_for_role: string[];
}

interface Document {
  id: string;
  profile_id: string;
  category_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  status: string;
  created_at: string;
  category: DocumentCategory;
}

interface DocumentUploadProps {
  userRole: 'therapist' | 'org_admin' | 'individual';
  profileId: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ userRole, profileId }) => {
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
    loadDocuments();
  }, [profileId]);

  const loadCategories = async () => {
    try {
      const data = await documentService.getDocumentCategories();
      // Filter categories based on user role
      const filteredCategories = data.filter(category => 
        category.required_for_role.includes(userRole)
      );
      setCategories(filteredCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load document categories",
        variant: "destructive"
      });
    }
  };

  const loadDocuments = async () => {
    try {
      const data = await documentService.getUserDocuments(profileId);
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (categoryId: string, file: File) => {
    if (!file) return;

    setUploading(categoryId);
    try {
      await documentService.uploadDocument({
        profile_id: profileId,
        category_id: categoryId,
        file
      });

      toast({
        title: "Success",
        description: "Document uploaded successfully",
      });

      loadDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive"
      });
    } finally {
      setUploading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'pending_review':
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
    }
  };

  const getCategoryDocument = (categoryId: string) => {
    return documents.find(doc => doc.category_id === categoryId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Document Upload</h2>
        <p className="text-muted-foreground">
          Upload required documents for verification. All documents are reviewed by our team.
        </p>
      </div>

      <div className="grid gap-4">
        {categories.map((category) => {
          const existingDoc = getCategoryDocument(category.id);
          const isUploading = uploading === category.id;

          return (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                  {existingDoc && getStatusBadge(existingDoc.status)}
                </div>
              </CardHeader>
              <CardContent>
                {existingDoc ? (
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium">{existingDoc.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded on {new Date(existingDoc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-4">
                      Click to upload {category.name.toLowerCase()}
                    </p>
                    <input
                      type="file"
                      id={`file-${category.id}`}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(category.id, file);
                        }
                      }}
                      disabled={isUploading}
                    />
                    <Button
                      onClick={() => document.getElementById(`file-${category.id}`)?.click()}
                      disabled={isUploading}
                      variant="outline"
                    >
                      {isUploading ? 'Uploading...' : 'Choose File'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
