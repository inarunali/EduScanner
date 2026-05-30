// src/components/quiz/QuizProgress.tsx
import { Progress } from "../ui/progress";

interface QuizProgressProps {
  current: number;
  total: number;
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  // Calculate progress percentage
  const progressPercentage = (current / total) * 100;

  return (
    <div className="border-b border-border bg-card px-8 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">EduScanner Quiz</h2>
          <span className="text-muted-foreground text-sm font-medium">
            Pytanie {current} z {total}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
    </div>
  );
}
