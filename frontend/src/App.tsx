import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { UploadDashboard } from "./components/upload/UploadDashboard";
import { QuizView } from "./components/quiz/QuizView";

export default function App() {
  // Stan plików przeniesiony wyżej, aby nie znikał przy zmianie podstron
  const [files, setFiles] = useState<File[]>([]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Homepage path */}
        <Route
          path="/"
          element={<UploadDashboard files={files} setFiles={setFiles} />}
        />
        
        {/* Quiz view path */}
        <Route path="/quiz" element={<QuizView />} />
      </Routes>
    </BrowserRouter>
  );
}