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
  const initialQuestions = location.state?.generatedQuestions || [];

  // Kolejka pytań - rośnie, jeśli odpowiemy źle (mechanika Duolingo)
  const [questionsQueue, setQuestionsQueue] = useState<any[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState<boolean | null>(null);

  // Śledzenie statystyk do końcowego wyniku
  const [firstTryCorrectIds, setFirstTryCorrectIds] = useState<number[]>([]);
  const [failedIds, setFailedIds] = useState<number[]>([]);

  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (questionsQueue.length === 0) navigate("/");
  }, [questionsQueue, navigate]);

  if (questionsQueue.length === 0) return null;

  const currentQuestion = questionsQueue[currentIndex];
  const isLastQuestion = currentIndex === questionsQueue.length - 1;

  const handleAction = () => {
    if (!isAnswered) {
      // 1. SPRAWDZANIE ODPOWIEDZI
      setIsAnswered(true);

      const correct = currentQuestion.correctAnswers || [];
      // Normalizacja odpowiedzi (na wypadek gdyby LLM zwrócił booleany w Prawda/Fałsz)
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

      setIsCurrentCorrect(isCorrect);

      if (isCorrect) {
        // Zgadł za pierwszym razem (pytania nie ma w failedIds)
        if (!failedIds.includes(currentQuestion.id) && !firstTryCorrectIds.includes(currentQuestion.id)) {
          setFirstTryCorrectIds((prev) => [...prev, currentQuestion.id]);
        }
      } else {
        // Błędna odpowiedź - rejestrujemy błąd
        if (!failedIds.includes(currentQuestion.id)) {
          setFailedIds((prev) => [...prev, currentQuestion.id]);
        }
        // MECHANIKA DUOLINGO: Dodajemy kopię pytania na sam koniec kolejki!
        setQuestionsQueue((prev) => [...prev, currentQuestion]);
      }
    } else {
      // 2. PRZEJŚCIE DO NASTĘPNEGO PYTANIA
      if (isLastQuestion) {
        setShowResults(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
        setSelectedAnswers([]);
        setIsAnswered(false);
        setIsCurrentCorrect(null);
      }
    }
  };

  // Obliczamy wynik na podstawie początkowej liczby pytań
  const score = firstTryCorrectIds.length;
  const totalOriginal = initialQuestions.length;
  const percentage = Math.round((score / totalOriginal) * 100) || 0;

  const getFeedbackMessage = () => {
    if (percentage === 100) return "Perfekcyjnie! Jesteś mistrzem tego tematu! 🌟";
    if (percentage >= 70) return "Świetny wynik! Egzamin akademicki masz w kieszeni! 🎓";
    if (percentage >= 50) return "Dobrze, ale super, że powtórzyłeś błędy. 📚";
    return "Trening czyni mistrza. Dzięki powtórkom na pewno to zapamiętasz! 💪";
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-lg text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Trophy className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-2xl font-bold mb-2 text-foreground">Quiz zakończony!</h2>
          <p className="text-muted-foreground text-sm mb-6">Wszystkie błędne pytania zostały poprawione</p>

          <div className="text-5xl font-black text-primary mb-4">
            {percentage}%
          </div>

          <p className="text-lg font-medium text-foreground mb-2">
            Wynik z pierwszej próby: {score} / {totalOriginal} pkt
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
            Rozpocznij nowy quiz z PDF
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Pasek postępu rośnie / cofa się dynamicznie w zależności od błędów */}
      <QuizProgress current={currentIndex + 1} total={questionsQueue.length} />

      <div className="flex-1 p-8 lg:p-12 flex items-center justify-center">
        <div className="w-full max-w-3xl">
          <QuestionCard
            questionData={currentQuestion}
            selectedAnswers={selectedAnswers}
            onSelectAnswer={setSelectedAnswers}
            isAnswered={isAnswered}
          />

          <div className="flex items-center justify-between mt-8">
            <div className="flex-1">
              {isAnswered && isCurrentCorrect === false && (
                <p className="text-red-500 font-medium animate-in fade-in">
                  Błędna odpowiedź. To pytanie wróci na koniec quizu!
                </p>
              )}
              {isAnswered && isCurrentCorrect === true && (
                <p className="text-green-500 font-medium animate-in fade-in">
                  Świetnie! Poprawna odpowiedź.
                </p>
              )}
            </div>

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