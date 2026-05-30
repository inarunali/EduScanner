// src/components/upload/UploadDashboard.tsx
import { useState } from "react";
import { useNavigate } from "react-router";
import { DropZone } from "./DropZone";
import { SettingsSidebar } from "./SettingsSidebar";

export function UploadDashboard() {
  const navigate = useNavigate();
  
  // Shared view state
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");

  const handleGenerateQuiz = async () => {
    if (!file) {
      alert("Please upload PDF notes first.");
      return;
    }
    
    // Zmieniamy tekst alertu (lub używamy loadera)
    console.log("Łączę z modelem Bielik...");
    
    try {
      const response = await fetch("http://localhost:8000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numQuestions: numQuestions,
          difficulty: difficulty,
        }),
      });

      const data = await response.json();
      
      // Magia dzieje się tutaj: przechodzimy do /quiz i ładujemy dane do "state"
      navigate("/quiz", { state: { generatedQuestions: data.quiz } });

    } catch (error) {
      console.error("Backend error:", error);
      alert("Something went wrong. Is the Python server running?");
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
              Upload your lecture notes and let AI generate a personalized quiz.
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
        onGenerate={handleGenerateQuiz}
      />
    </div>
  );
}
