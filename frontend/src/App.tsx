import { BrowserRouter, Routes, Route } from "react-router";
import { UploadDashboard } from "./components/upload/UploadDashboard";
import { QuizView } from "./components/quiz/QuizView";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Homepage path */}
        <Route path="/" element={<UploadDashboard />} />
        
        {/* Quiz view path */}
        <Route path="/quiz" element={<QuizView />} />
      </Routes>
    </BrowserRouter>
  );
}