import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { SettingsSidebar } from "./SettingsSidebar";
import { Upload, FileText, Image as ImageIcon, X, Trash2 } from "lucide-react"; // Dodano Trash2

// Definiujemy, co Dashboard otrzymuje od App.tsx
interface UploadDashboardProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export function UploadDashboard({ files, setFiles }: UploadDashboardProps) {
  const navigate = useNavigate();

  // Lokalny stan TYLKO dla ustawień (pliki są teraz w propsach)
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [questionType, setQuestionType] = useState("mixed");
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

  // funkcje obslugi wielu plikow
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(f => allowedTypes.includes(f.type));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => allowedTypes.includes(f.type));
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  // NOWA FUNKCJA: Usuwa wszystkie pliki naraz
  const clearAllFiles = () => {
    setFiles([]);
  };

  // wysylanie na serwer
  const handleGenerateQuiz = async () => {
    if (files.length === 0) return;
    setIsLoading(true);

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("file", file);
    });

    // Klucze snake_case do backendu
    formData.append("num_questions", numQuestions.toString());
    formData.append("difficulty", difficulty);
    formData.append("question_type", questionType);

    try {
      const response = await fetch("http://localhost:8000/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = typeof errorData.detail === 'string'
          ? errorData.detail
          : JSON.stringify(errorData.detail, null, 2);
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      const questions = responseData.quiz || responseData.data;
      navigate("/quiz", { state: { generatedQuestions: questions } });

    } catch (error: any) {
      console.error(error);
      alert(`Błąd: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 p-12 flex flex-col items-center justify-start">
        <h1 className="text-4xl font-bold mb-4 text-foreground">EduScanner</h1>
        <p className="text-muted-foreground mb-12">Wgraj notatki z wykładów (PDF, JPG, PNG) i pozwól AI wygenerować test.</p>

        <div className="w-full max-w-2xl">
          {/* Dropzone */}
          <div
            className="border-2 border-dashed border-border rounded-2xl p-12 flex flex-col items-center justify-center bg-card hover:bg-accent/5 transition-colors cursor-pointer mb-6"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">Przeciągnij i upuść pliki tutaj</p>
            <p className="text-sm text-muted-foreground mb-6">lub kliknij, aby przeglądać pliki</p>
            <button className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md text-sm font-medium hover:bg-secondary/80">
              Przeglądaj pliki
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
            />
          </div>

          {/* List of attached files */}
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Wgrane pliki ({files.length}):</p>
                {/* NOWY PRZYCISK: Usuń wszystkie */}
                <button
                  onClick={clearAllFiles}
                  className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-red-500/10"
                >
                  <Trash2 className="w-3 h-3" />
                  Usuń wszystkie
                </button>
              </div>

              {files.map((file, index) => {
                const isImage = file.type.startsWith("image/");
                return (
                  <div key={index} className="flex items-center justify-between bg-card border border-border p-3 rounded-lg">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {isImage ? (
                        <ImageIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      ) : (
                        <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                      )}
                      <span className="text-sm text-foreground truncate">{file.name}</span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <SettingsSidebar
        numQuestions={numQuestions}
        setNumQuestions={setNumQuestions}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        questionType={questionType}
        setQuestionType={setQuestionType}
        onGenerate={handleGenerateQuiz}
        isLoading={isLoading}
        hasFile={files.length > 0}
      />
    </div>
  );
}