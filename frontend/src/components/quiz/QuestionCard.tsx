import { CheckCircle2, Circle, XCircle, CheckSquare, Square } from "lucide-react";

interface QuestionData {
  id: number;
  type: "single" | "multiple" | "true_false";
  question: string;
  options?: string[]; // Made optional because the LLM might not send them
  correctAnswers: any[]; // Set to any because the LLM might send a boolean instead of a number
}

interface QuestionCardProps {
  questionData: QuestionData;
  selectedAnswers: number[];
  onSelectAnswer: (indexes: number[]) => void;
  isAnswered: boolean;
}

export function QuestionCard({ questionData, selectedAnswers, onSelectAnswer, isAnswered }: QuestionCardProps) {
  const isMultiple = questionData.type === "multiple";

  // 1. SAFE OPTIONS NORMALIZATION
  // If options are missing (undefined) or empty, and the type is true_false - provide defaults
  const options = questionData.options && questionData.options.length > 0
    ? questionData.options
    : (questionData.type === "true_false" ? ["Prawda", "Fałsz"] : []);

  // 2. SAFE ANSWERS NORMALIZATION
  // Convert booleans (true/false) to indexes (0/1) if the LLM sent boolean values
  const normalizedCorrectAnswers = questionData.correctAnswers.map(ans => {
    if (typeof ans === "boolean") {
      return ans ? 0 : 1; // true -> 0 ("Prawda"), false -> 1 ("Fałsz")
    }
    if (typeof ans === "string") {
      if (ans.toLowerCase() === "true") return 0;
      if (ans.toLowerCase() === "false") return 1;
    }
    return Number(ans); // Ensure it is a number
  });

  const handleToggle = (index: number) => {
    if (isAnswered) return;

    if (isMultiple) {
      if (selectedAnswers.includes(index)) {
        onSelectAnswer(selectedAnswers.filter((i) => i !== index));
      } else {
        onSelectAnswer([...selectedAnswers, index]);
      }
    } else {
      // For single choice/True-False, overwrite the entire array
      onSelectAnswer([index]);
    }
  };

  // Protection against rendering an empty question (if something went completely wrong)
  if (!options || options.length === 0) {
    return <div className="p-8 text-center text-red-500">Błąd renderowania pytania: brak opcji odpowiedzi.</div>;
  }

  return (
    <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
      {/* Question type badge at the top */}
      <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider rounded-full bg-primary/10 text-primary">
        {questionData.type.replace('_', ' ')}
      </span>

      <h3 className="mb-8 text-xl font-medium leading-relaxed text-foreground">
        {questionData.question}
      </h3>

      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedAnswers.includes(index);
          const isCorrect = normalizedCorrectAnswers.includes(index);

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
              Icon = isMultiple ? Square : XCircle; // Square or incorrect circle
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