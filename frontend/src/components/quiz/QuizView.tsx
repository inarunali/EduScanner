// src/components/quiz/QuizView.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { QuizProgress } from "./QuizProgress";
import { QuestionCard } from "./QuestionCard";
import { Button } from "../ui/button";

export function QuizView() {
  const navigate = useNavigate();
  const location = useLocation();
  const questions = location.state?.generatedQuestions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  // NOWE STANY DO WALIDACJI:
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (questions.length === 0) {
      navigate("/");
    }
  }, [questions, navigate]);

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleAction = () => {
    if (!isAnswered) {
      // 1. Użytkownik klika "Sprawdź odpowiedź"
      setIsAnswered(true);
      if (selectedAnswer === currentQuestion.correctAnswer) {
        setScore((prev) => prev + 1);
      }
    } else {
      // 2. Użytkownik klika "Następne pytanie" (lub zakończ)
      if (isLastQuestion) {
        // Zamiast AI Tutora, na razie prosty alert z wynikiem:
        alert(`Quiz finished! Your score: ${score}/${questions.length}`);
        navigate("/");
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsAnswered(false); // Resetujemy flagę dla nowego pytania
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <QuizProgress current={currentIndex + 1} total={questions.length} />

      <div className="flex-1 p-8 lg:p-12 flex items-center justify-center">
        <div className="w-full max-w-3xl">
          <QuestionCard 
            questionData={currentQuestion}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={setSelectedAnswer}
            isAnswered={isAnswered} // <--- Przekazujemy stan do karty
          />

          <div className="flex items-center justify-end mt-8">
            <Button
              onClick={handleAction}
              disabled={selectedAnswer === null}
              size="lg"
            >
              {!isAnswered 
                ? "Check Answer" 
                : isLastQuestion ? "Finish & View Results" : "Next Question"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
