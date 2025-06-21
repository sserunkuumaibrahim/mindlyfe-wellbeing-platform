
import React, { useRef, useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Upload, X, FileText } from 'lucide-react';

interface FileUploadProps {
  label?: string;
  accept?: string;
  onChange?: (file: File | null) => void;
  onFileSelect?: (file: File | null) => void;
  error?: string;
  required?: boolean;
  description?: string;
  maxSize?: number;
  multiple?: boolean;
}

export function FileUpload({ 
  label, 
  accept = ".pdf,.jpg,.jpeg,.png", 
  onChange,
  onFileSelect,
  error, 
  required = false,
  description,
  maxSize = 10 * 1024 * 1024,
  multiple = false
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    
    // Support both prop names for backwards compatibility
    if (onChange) onChange(file);
    if (onFileSelect) onFileSelect(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (onChange) onChange(null);
    if (onFileSelect) onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
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
          multiple={multiple}
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
              Supported formats: PDF, JPG, PNG (Max {Math.round(maxSize / 1024 / 1024)}MB)
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
