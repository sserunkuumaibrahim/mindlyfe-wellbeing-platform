
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { documentService } from '@/services/documentService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface DocumentUploadProps {
  profileId: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ profileId }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['document-categories'],
    queryFn: documentService.getDocumentCategories
  });

  const { data: userDocuments } = useQuery({
    queryKey: ['user-documents', profileId],
    queryFn: () => documentService.getUserDocuments(profileId)
  });

  const uploadMutation = useMutation({
    mutationFn: documentService.uploadDocument,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document uploaded successfully!"
      });
      setSelectedFile(null);
      setSelectedCategory('');
      setExpiryDate('');
      queryClient.invalidateQueries({ queryKey: ['user-documents', profileId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive"
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive"
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !selectedCategory) return;

    uploadMutation.mutate({
      profile_id: profileId,
      category_id: selectedCategory,
      file: selectedFile,
      expiry_date: expiryDate || undefined
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border border-blue-100">
        <CardHeader>
          <CardTitle className="text-blue-900">Upload Document</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Category
            </label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File
            </label>
            <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-8 w-8 text-blue-500 mb-2" />
                <span className="text-sm text-gray-600">
                  {selectedFile ? selectedFile.name : 'Click to upload file'}
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  PDF, JPG, PNG, DOC (max 10MB)
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date (Optional)
            </label>
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !selectedCategory || uploadMutation.isPending}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Document'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-blue-100">
        <CardHeader>
          <CardTitle className="text-blue-900">My Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userDocuments?.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium text-sm">{doc.file_name}</div>
                    <div className="text-xs text-gray-500">
                      {doc.category?.name}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {doc.status === 'approved' && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {doc.status === 'rejected' && (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${
                    doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                    doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doc.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
