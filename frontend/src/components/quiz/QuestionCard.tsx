// src/components/quiz/QuestionCard.tsx
import { CheckCircle2, Circle, XCircle } from "lucide-react";

interface QuestionData {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuestionCardProps {
  questionData: QuestionData;
  selectedAnswer: number | null;
  onSelectAnswer: (index: number) => void;
  isAnswered: boolean; // <--- NOWE: Czy odpowiedź została już zatwierdzona?
}

export function QuestionCard({ questionData, selectedAnswer, onSelectAnswer, isAnswered }: QuestionCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
      <h3 className="mb-8 text-xl font-medium leading-relaxed text-foreground">
        {questionData.question}
      </h3>

      <div className="space-y-3">
        {questionData.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = questionData.correctAnswer === index;
          
          // Logika kolorowania po zatwierdzeniu
          let buttonClass = "border-border bg-background hover:border-muted-foreground/30 hover:bg-accent/10";
          let Icon = Circle;
          let iconColor = "text-muted-foreground";

          if (isAnswered) {
            if (isCorrect) {
              buttonClass = "border-green-500 bg-green-500/10";
              Icon = CheckCircle2;
              iconColor = "text-green-500";
            } else if (isSelected && !isCorrect) {
              buttonClass = "border-red-500 bg-red-500/10 opacity-70";
              Icon = XCircle;
              iconColor = "text-red-500";
            } else {
              buttonClass = "border-border bg-background opacity-50"; // Wyciszamy pozostałe
            }
          } else if (isSelected) {
            buttonClass = "border-primary bg-primary/5";
            Icon = CheckCircle2;
            iconColor = "text-primary";
          }
          
          return (
            <button
              key={index}
              onClick={() => !isAnswered && onSelectAnswer(index)} // Blokada klikania po zatwierdzeniu
              disabled={isAnswered}
              className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all flex items-center ${buttonClass}`}
            >
              <span className="mr-4 flex-shrink-0 flex items-center justify-center">
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </span>
              <span className={`text-base ${isAnswered && !isCorrect && !isSelected ? 'text-muted-foreground' : 'text-foreground'}`}>
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
