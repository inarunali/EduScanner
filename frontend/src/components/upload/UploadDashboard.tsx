// src/components/upload/UploadDashboard.tsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { DropZone } from "./DropZone";
import { SettingsSidebar } from "./SettingsSidebar";

export function UploadDashboard() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [questionType, setQuestionType] = useState("mixed");
  
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateQuiz = async () => {
    if (!file) return;
    
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("numQuestions", numQuestions.toString());
    formData.append("difficulty", difficulty);
    formData.append("questionType", questionType);

    try {
      const response = await fetch("http://localhost:8000/api/generate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Wystąpił błąd");
      }

      const data = await response.json();
      navigate("/quiz", { state: { generatedQuestions: data.quiz } });

    } catch (error: any) {
      console.error(error);
      alert(`Błąd: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main content area */}
      <div className="flex-1 p-8 lg:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">EduScanner</h1>
            <p className="text-muted-foreground text-lg">
              Prześlij swoje notatki z wykładów, a sztuczna inteligencja stworzy dla Ciebie spersonalizowany quiz.
            </p>
          </div>
          
          <DropZone onFileDrop={setFile} currentFile={file} />
        </div>
      </div>

      {/* Settings sidebar */}
      <SettingsSidebar 
        numQuestions={numQuestions}
        setNumQuestions={setNumQuestions}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        questionType={questionType}
        setQuestionType={setQuestionType}
        onGenerate={handleGenerateQuiz}
        isLoading={isLoading}
        hasFile={!!file}
      />
    </div>
  );
}
