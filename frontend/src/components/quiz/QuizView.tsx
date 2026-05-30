// src/components/quiz/QuizView.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { QuizProgress } from "./QuizProgress";
import { QuestionCard } from "./QuestionCard";
import { Button } from "../ui/button";
import { Trophy, RefreshCw } from "lucide-react";

export function QuizView() {
  const navigate = useNavigate();
  const location = useLocation();
  const questions = location.state?.generatedQuestions || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (questions.length === 0) navigate("/");
  }, [questions, navigate]);

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleAction = () => {
    if (!isAnswered) {
      setIsAnswered(true);
      
      const correct = currentQuestion.correctAnswers || [];
      const isCorrect = 
        selectedAnswers.length === correct.length && 
        selectedAnswers.every((val) => correct.includes(val));

      if (isCorrect) setScore((prev) => prev + 1);
    } else {
      if (isLastQuestion) {
        setShowResults(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswers([]);
        setIsAnswered(false);
      }
    }
  };

  const percentage = Math.round((score / questions.length) * 100);

  const getFeedbackMessage = () => {
    if (percentage === 100) return "Perfekcyjnie! Jesteś mistrzem tego tematu! 🌟";
    if (percentage >= 70) return "Świetny wynik! Egzamin akademicki masz w kieszeni! 🎓";
    if (percentage >= 50) return "Dobrze, ale warto przejrzeć notatki jeszcze raz. 📚";
    return "Musisz jeszcze trochę poćwiczyć. Nie poddawaj się! 💪";
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-lg text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2 text-foreground">Quiz zakończony!</h2>
          <p className="text-muted-foreground text-sm mb-6">Oto Twoje podsumowanie</p>
          
          {/* Wielki licznik procentowy */}
          <div className="text-5xl font-black text-primary mb-4">
            {percentage}%
          </div>
          
          <p className="text-lg font-medium text-foreground mb-2">
            Wynik: {score} / {questions.length} pkt
          </p>
          
          <p className="text-sm text-muted-foreground px-4 mb-8 leading-relaxed">
            {getFeedbackMessage()}
          </p>

          <Button 
            onClick={() => navigate("/")} 
            size="lg" 
            className="w-full flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Rozpocznij nowy quiz
          </Button>
        </div>
      </div>
    );
  }

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
