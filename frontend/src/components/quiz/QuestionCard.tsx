import { CheckCircle2, Circle, XCircle, CheckSquare, Square, Lightbulb } from "lucide-react";

interface QuestionData {
  id: number;
  type?: string;
  question?: string;
  options?: string[];
  correctAnswers?: any[];
  explanation?: string;
}

interface QuestionCardProps {
  questionData: QuestionData;
  selectedAnswers: number[];
  onSelectAnswer: (indexes: number[]) => void;
  isAnswered: boolean;
}

export function QuestionCard({ questionData, selectedAnswers, onSelectAnswer, isAnswered }: QuestionCardProps) {
  if (!questionData) {
    return <div className="p-8 text-center text-red-500">Missing question data.</div>;
  }

  const normalizedType = (questionData.type || "single").toLowerCase().replace("-", "_").trim();
  const isMultiple = normalizedType === "multiple";

  let rawOptions: string[] = [];
  if (Array.isArray(questionData.options) && questionData.options.length > 0) {
    rawOptions = questionData.options;
  } else if (normalizedType === "true_false") {
    rawOptions = ["True", "False"];
  }

  const options = rawOptions.map(opt => {
    const text = typeof opt === "string" ? opt : String(opt);
    return text.replace(/^[A-Da-d][\.\)]\s*/, '');
  });

  const correctAnswersArray = Array.isArray(questionData.correctAnswers) ? questionData.correctAnswers : [];
  const normalizedCorrectAnswers = correctAnswersArray.map(ans => {
    if (typeof ans === "boolean") return ans ? 0 : 1;
    if (typeof ans === "string") {
      if (ans.toLowerCase() === "true") return 0;
      if (ans.toLowerCase() === "false") return 1;
    }
    return Number(ans);
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
      onSelectAnswer([index]);
    }
  };

  if (!options || options.length === 0) {
    console.error("Broken question data rejected by frontend:", questionData);
    return (
      <div className="p-8 text-center border border-red-500 bg-red-500/10 rounded-xl">
        <h3 className="text-red-500 font-bold mb-2">Error rendering question</h3>
        <p className="text-sm text-foreground">The application could not read the answer options for this question.</p>
        <p className="text-xs text-muted-foreground mt-4">Press F12 and check the Console for details.</p>
      </div>
    );
  }

  const displayType = normalizedType === 'true_false' ? 'True / False' : normalizedType;

  return (
    <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
      <span className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider rounded-full bg-primary/10 text-primary">
        {displayType}
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
              Icon = isMultiple ? Square : XCircle;
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
              <span className="mr-4 flex-shrink-0 flex items-center justify-center font-bold w-8 h-8 rounded-md bg-background/50 border border-border/50 text-muted-foreground">
                {String.fromCharCode(65 + index)}
              </span>
              <span className={`text-base ${isAnswered && !isCorrect && !isSelected ? 'text-muted-foreground' : 'text-foreground'}`}>
                {option}
              </span>
              <div className="ml-auto flex-shrink-0">
                {isAnswered || isSelected ? <Icon className={`w-5 h-5 ${iconColor}`} /> : null}
              </div>
            </button>
          );
        })}
      </div>

      {isAnswered && questionData.explanation && (
        <div className="mt-8 p-5 bg-blue-500/10 border border-blue-500/20 rounded-xl animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold text-blue-500">Explanation:</h4>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">
            {questionData.explanation}
          </p>
        </div>
      )}
    </div>
  );
}