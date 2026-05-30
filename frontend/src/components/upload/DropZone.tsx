// src/components/upload/DropZone.tsx
import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "../ui/button";

interface DropZoneProps {
  currentFile: File | null;
  onFileDrop: (file: File | null) => void;
}

export function DropZone({ currentFile, onFileDrop }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Validate PDF format
      if (droppedFile.type === "application/pdf") {
        onFileDrop(droppedFile);
      } else {
        alert("Please upload a valid PDF file.");
      }
    }
  }, [onFileDrop]);

  // Uploaded file view
  if (currentFile) {
    return (
      <div className="border-2 border-primary bg-primary/5 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h3 className="mb-2 text-foreground font-medium">{currentFile.name}</h3>
        <p className="text-muted-foreground mb-6 text-sm">
          Size: {(currentFile.size / 1024 / 1024).toFixed(2)} MB
        </p>
        <Button 
          variant="destructive" 
          onClick={() => onFileDrop(null)}
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" /> Usuń plik
        </Button>
      </div>
    );
  }

  // Default drag & drop view
  return (
    <div
      className={`border-2 border-dashed rounded-xl p-16 transition-all duration-200 cursor-pointer ${
        isDragging
          ? "border-primary bg-accent/50 scale-[1.02]"
          : "border-border bg-card hover:border-muted-foreground/50 hover:bg-accent/20"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById("file-upload")?.click()}
    >
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-4">
          <Upload className={`w-8 h-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
        </div>
        <h3 className="mb-2 font-medium">Przeciągnij i upuść tutaj swoje notatki w formacie PDF</h3>
        <p className="text-muted-foreground mb-6 text-sm">lub kliknij, aby przeglądać pliki</p>
        
        <input
          id="file-upload"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              onFileDrop(e.target.files[0]);
            }
          }}
        />
        
        <Button variant="secondary" onClick={(e) => {
          e.stopPropagation(); // Prevent event bubbling
          document.getElementById("file-upload")?.click();
        }}>
          Browse files
        </Button>
      </div>
    </div>
  );
}
