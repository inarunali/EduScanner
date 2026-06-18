// src/components/quiz/QuizView.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { QuizProgress } from "./QuizProgress";
import { QuestionCard } from "./QuestionCard";
import { Button } from "../ui/button";
import { Trophy, RefreshCw, RefreshCcw } from "lucide-react";

export function QuizView() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialQuestions = location.state?.generatedQuestions || [];

  // The list of questions currently being played
  const [activeQuestions, setActiveQuestions] = useState<any[]>(initialQuestions);
  // The list of questions answered incorrectly in the current run
  const [incorrectQuestions, setIncorrectQuestions] = useState<any[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (activeQuestions.length === 0) navigate("/");
  }, [activeQuestions, navigate]);

  if (activeQuestions.length === 0) return null;

  const currentQuestion = activeQuestions[currentIndex];
  const isLastQuestion = currentIndex === activeQuestions.length - 1;

  const handleAction = () => {
    if (!isAnswered) {
      // 1. CHECK THE ANSWER
      setIsAnswered(true);

      const correct = currentQuestion.correctAnswers || [];

      // Normalize correct answers (in case LLM returned booleans for True/False)
      const normalizedCorrect = correct.map((c: any) => {
        if (typeof c === "boolean") return c ? 0 : 1;
        if (typeof c === "string") {
          if (c.toLowerCase() === "true") return 0;
          if (c.toLowerCase() === "false") return 1;
        }
        return Number(c);
      });

      const isCorrect =
        selectedAnswers.length === normalizedCorrect.length &&
        selectedAnswers.every((val) => normalizedCorrect.includes(val));

      if (isCorrect) {
        // Correct answer - increase score
        setScore((prev) => prev + 1);
      } else {
        // Incorrect answer - save to the incorrect questions array for later review
        setIncorrectQuestions((prev) => [...prev, currentQuestion]);
      }
    } else {
      // 2. MOVE TO NEXT QUESTION OR FINISH
      if (isLastQuestion) {
        setShowResults(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswers([]);
        setIsAnswered(false);
      }
    }
  };

  // Function to restart the quiz using only the incorrectly answered questions
  const handleRetryIncorrect = () => {
    setActiveQuestions(incorrectQuestions); // Set active questions to the failed ones
    setIncorrectQuestions([]); // Clear the mistakes array for the new run
    setCurrentIndex(0); // Start from the first question
    setScore(0); // Reset score
    setSelectedAnswers([]);
    setIsAnswered(false);
    setShowResults(false);
  };

  const percentage = Math.round((score / activeQuestions.length) * 100) || 0;

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

          <div className="text-5xl font-black text-primary mb-4">
            {percentage}%
          </div>

          <p className="text-lg font-medium text-foreground mb-2">
            Wynik: {score} / {activeQuestions.length} pkt
          </p>

          <p className="text-sm text-muted-foreground px-4 mb-8 leading-relaxed">
            {getFeedbackMessage()}
          </p>

          <div className="w-full flex flex-col gap-3">
            {/* Show "Retry Incorrect" button only if there are mistakes */}
            {incorrectQuestions.length > 0 && (
              <Button
                onClick={handleRetryIncorrect}
                size="lg"
                variant="secondary"
                className="w-full flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Powtórz błędne pytania ({incorrectQuestions.length})
              </Button>
            )}

            <Button
              onClick={() => navigate("/")}
              size="lg"
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Rozpocznij nowy quiz z PDF
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <QuizProgress current={currentIndex + 1} total={activeQuestions.length} />

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
                ? "Sprawdź odpowiedź"
                : isLastQuestion ? "Zakończ i pokaż wyniki" : "Następne pytanie"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}