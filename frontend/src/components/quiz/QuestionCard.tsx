import { CheckCircle2, Circle, XCircle, CheckSquare, Square } from "lucide-react";

interface QuestionData {
  id: number;
  type: "single" | "multiple" | "true_false";
  question: string;
  options: string[];
  correctAnswers: number[];
}

interface QuestionCardProps {
  questionData: QuestionData;
  selectedAnswers: number[];
  onSelectAnswer: (indexes: number[]) => void;
  isAnswered: boolean;
}

export function QuestionCard({ questionData, selectedAnswers, onSelectAnswer, isAnswered }: QuestionCardProps) {
  const isMultiple = questionData.type === "multiple";

  const handleToggle = (index: number) => {
    if (isAnswered) return;
    
    if (isMultiple) {
      if (selectedAnswers.includes(index)) {
        onSelectAnswer(selectedAnswers.filter((i) => i !== index));
      } else {
        onSelectAnswer([...selectedAnswers, index]);
      }
    } else {
      // Dla pojedynczego wyboru/Prawda-Fałsz nadpisujemy całą tablicę
      onSelectAnswer([index]);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
      {/* Znaczek typu pytania na górze */}
      <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider rounded-full bg-primary/10 text-primary">
        {questionData.type.replace('_', ' ')}
      </span>

      <h3 className="mb-8 text-xl font-medium leading-relaxed text-foreground">
        {questionData.question}
      </h3>

      <div className="space-y-3">
        {questionData.options.map((option, index) => {
          const isSelected = selectedAnswers.includes(index);
          const isCorrect = questionData.correctAnswers.includes(index);
          
          let buttonClass = "border-border bg-background hover:border-muted-foreground/30 hover:bg-accent/10";
          let Icon = isMultiple ? Square : Circle;
          let iconColor = "text-muted-foreground";

          if (isAnswered) {
            if (isCorrect) {
              buttonClass = "border-green-500 bg-green-500/10";
              Icon = isMultiple ? CheckSquare : CheckCircle2;
              iconColor = "text-green-500";
            } else if (isSelected && !isCorrect) {
              buttonClass = "border-red-500 bg-red-500/10 opacity-70";
              Icon = isMultiple ? Square : XCircle; // Kwadrat lub błędne kółko
              iconColor = "text-red-500";
            } else {
              buttonClass = "border-border bg-background opacity-50";
            }
          } else if (isSelected) {
            buttonClass = "border-primary bg-primary/5";
            Icon = isMultiple ? CheckSquare : CheckCircle2;
            iconColor = "text-primary";
          }
          
          return (
            <button
              key={index}
              onClick={() => handleToggle(index)}
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
