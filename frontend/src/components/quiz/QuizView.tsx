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
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]); // <--- Tablica zamiast pojedynczej cyfry
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (questions.length === 0) navigate("/");
  }, [questions, navigate]);

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleAction = () => {
    if (!isAnswered) {
      setIsAnswered(true);
      
      // Sprawdzanie czy obie tablice (wybrane i poprawne) są identyczne
      const correct = currentQuestion.correctAnswers || [];
      const isCorrect = 
        selectedAnswers.length === correct.length && 
        selectedAnswers.every((val) => correct.includes(val));

      if (isCorrect) setScore((prev) => prev + 1);
    } else {
      if (isLastQuestion) {
        alert(`Quiz finished! Your score: ${score}/${questions.length}`);
        navigate("/");
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswers([]); // Reset tablicy dla nowego pytania
        setIsAnswered(false);
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
            selectedAnswers={selectedAnswers}
            onSelectAnswer={setSelectedAnswers}
            isAnswered={isAnswered}
          />

          <div className="flex items-center justify-end mt-8">
            {/* Wyłącz przycisk "Check", jeśli uczeń niczego nie zaznaczył */}
            <Button
              onClick={handleAction}
              disabled={selectedAnswers.length === 0}
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
