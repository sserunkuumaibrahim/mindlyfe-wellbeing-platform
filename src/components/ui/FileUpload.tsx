
import React, { useRef, useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Upload, X, FileText } from 'lucide-react';

interface FileUploadProps {
  label: string;
  accept?: string;
  onChange: (file: File | null) => void;
  error?: string;
  required?: boolean;
  description?: string;
}

export function FileUpload({ 
  label, 
  accept = ".pdf,.jpg,.jpeg,.png", 
  onChange, 
  error, 
  required = false,
  description 
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    onChange(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      <div className="border-2 border-dashed border-muted rounded-lg p-4">
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {selectedFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground truncate">
                {selectedFile.name}
              </span>
              <span className="text-xs text-muted-foreground">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <Button
              type="button"
              variant="outline"
              onClick={handleButtonClick}
            >
              Choose File
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Supported formats: PDF, JPG, PNG (Max 10MB)
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
