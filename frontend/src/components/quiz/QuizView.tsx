// src/components/quiz/QuizView.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { QuizProgress } from "./QuizProgress";
import { QuestionCard } from "./QuestionCard";
import { Button } from "../ui/button";
import { Trophy, RefreshCw, RefreshCcw, Download, Eye, ArrowLeft } from "lucide-react";

import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";

const vfs = (pdfFonts as any).pdfMake ? (pdfFonts as any).pdfMake.vfs : (pdfFonts as any).vfs;
if (vfs) {
  pdfMake.vfs = vfs;
}

export function QuizView() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialQuestions = location.state?.generatedQuestions || [];

  const [activeQuestions, setActiveQuestions] = useState<any[]>(initialQuestions);
  const [incorrectQuestions, setIncorrectQuestions] = useState<any[]>([]);

  // History of user answers for the Review screen
  const [history, setHistory] = useState<{ selected: number[], isCorrect: boolean }[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);

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
      setIsAnswered(true);

      const correct = currentQuestion.correctAnswers || [];
      const normalizedCorrect = correct.map((c: any) => {
        if (typeof c === "boolean") return c ? 0 : 1;
        if (typeof c === "string") return c.toLowerCase() === "true" ? 0 : 1;
        return Number(c);
      });

      const isCorrect =
        selectedAnswers.length === normalizedCorrect.length &&
        selectedAnswers.every((val) => normalizedCorrect.includes(val));

      // Save to history
      setHistory(prev => [...prev, { selected: [...selectedAnswers], isCorrect }]);

      if (isCorrect) {
        setScore((prev) => prev + 1);
      } else {
        setIncorrectQuestions((prev) => [...prev, currentQuestion]);
      }
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

  const handleRetryIncorrect = () => {
    setActiveQuestions(incorrectQuestions);
    setIncorrectQuestions([]);
    setHistory([]);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswers([]);
    setIsAnswered(false);
    setShowResults(false);
    setIsReviewing(false);
  };

  const handleDownloadPDF = () => {
    const content: any[] = [];
    content.push({ text: 'EduScanner - Quiz', style: 'header', alignment: 'center', margin: [0, 0, 0, 20] });

    initialQuestions.forEach((q: any, index: number) => {
      content.push({ text: `${index + 1}. ${q.question}`, style: 'question', margin: [0, 15, 0, 8] });
      const options = q.options && q.options.length > 0 ? q.options : (q.type === "true_false" ? ["True", "False"] : []);
      const optionsList = options.map((opt: string, optIndex: number) => `${String.fromCharCode(65 + optIndex)}. ${opt}`);
      content.push({ type: 'none', ul: optionsList, margin: [15, 0, 0, 10] });
    });

    content.push({ text: 'Answer Key', style: 'header', alignment: 'center', pageBreak: 'before', margin: [0, 0, 0, 20] });

    const answersList = initialQuestions.map((q: any, index: number) => {
      const correct = q.correctAnswers || [];
      const normalizedCorrect = correct.map((c: any) => {
        if (typeof c === "boolean") return c ? 0 : 1;
        if (typeof c === "string") return c.toLowerCase() === "true" ? 0 : 1;
        return Number(c);
      });
      const options = q.options && q.options.length > 0 ? q.options : (q.type === "true_false" ? ["True", "False"] : []);
      const answersText = normalizedCorrect.map((idx: number) => `${String.fromCharCode(65 + idx)} (${options[idx]})`).join(', ');
      return `${index + 1}. ${answersText}`;
    });

    content.push({ type: 'none', ul: answersList, margin: [0, 0, 0, 0] });

    const docDefinition: any = {
      content: content,
      styles: { header: { fontSize: 22, bold: true }, question: { fontSize: 13, bold: true } },
      defaultStyle: { fontSize: 11, lineHeight: 1.3 }
    };

    pdfMake.createPdf(docDefinition).download('EduScanner_Quiz.pdf');
  };

  const percentage = Math.round((score / activeQuestions.length) * 100) || 0;

  const getFeedbackMessage = () => {
    if (percentage === 100) return "Perfect! You are a master of this topic! 🌟";
    if (percentage >= 70) return "Great job! You have this in the bag! 🎓";
    if (percentage >= 50) return "Good, but it's worth reviewing the notes again. 📚";
    return "You need a bit more practice. Don't give up! 💪";
  };

  if (showResults) {
    if (isReviewing) {
      return (
        <div className="min-h-screen bg-background flex flex-col py-12 px-6 lg:px-12 items-center">
          <div className="w-full max-w-4xl">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Your answers</h2>
                <p className="text-muted-foreground mt-1">Review your mistakes and correct answers.</p>
              </div>
              <Button variant="outline" onClick={() => setIsReviewing(false)} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to results
              </Button>
            </div>

            <div className="space-y-6">
              {activeQuestions.map((q: any, idx: number) => {
                const hist = history[idx];
                const options = q.options && q.options.length > 0 ? q.options : (q.type === "true_false" ? ["True", "False"] : []);
                const correct = q.correctAnswers || [];
                const normalizedCorrect = correct.map((c: any) => {
                  if (typeof c === "boolean") return c ? 0 : 1;
                  if (typeof c === "string") return c.toLowerCase() === "true" ? 0 : 1;
                  return Number(c);
                });

                return (
                  <div key={idx} className={`bg-card border-2 rounded-xl p-6 shadow-sm ${hist?.isCorrect ? 'border-green-500/30' : 'border-red-500/30'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white ${hist?.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                        {idx + 1}
                      </span>
                      <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-primary/10 text-primary">
                        {q.type.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="text-lg font-medium text-foreground mb-4">{q.question}</h3>

                    <div className="space-y-2">
                      {options.map((opt: string, optIdx: number) => {
                        const isCorrectAnswer = normalizedCorrect.includes(optIdx);
                        const isUserSelected = hist?.selected?.includes(optIdx);

                        let bgClass = "bg-background border-border text-muted-foreground";
                        if (isCorrectAnswer) bgClass = "bg-green-500/10 border-green-500/40 text-green-700 font-medium";
                        else if (isUserSelected && !isCorrectAnswer) bgClass = "bg-red-500/10 border-red-500/40 text-red-700";

                        return (
                          <div key={optIdx} className={`p-3 rounded-lg border-2 text-sm flex items-center justify-between transition-colors ${bgClass}`}>
                            <div className="flex items-center gap-3">
                              <span className="font-bold w-4">{String.fromCharCode(65 + optIdx)}.</span>
                              <span>{opt}</span>
                            </div>
                            {isUserSelected && <span className="text-xs uppercase tracking-wider font-bold opacity-70">Your choice</span>}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg text-sm text-foreground/80">
                        <strong className="text-blue-500 block mb-1">Explanation:</strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <Button size="lg" onClick={() => setIsReviewing(false)} className="gap-2">
                <ArrowLeft className="w-5 h-5" />
                Back to summary
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 relative">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-lg text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <Trophy className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-2xl font-bold mb-2 text-foreground">Quiz completed!</h2>
          <p className="text-muted-foreground text-sm mb-6">Here is your summary</p>

          <div className="text-5xl font-black text-primary mb-4">
            {percentage}%
          </div>

          <p className="text-lg font-medium text-foreground mb-2">
            Score: {score} / {activeQuestions.length} pts
          </p>

          <p className="text-sm text-muted-foreground px-4 mb-6 leading-relaxed">
            {getFeedbackMessage()}
          </p>

          <div className="w-full flex flex-col gap-3">
            <Button
              onClick={() => setIsReviewing(true)}
              size="lg"
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-primary/30 text-primary hover:bg-primary/5"
            >
              <Eye className="w-4 h-4" />
              Review your answers
            </Button>

            {incorrectQuestions.length > 0 && (
              <Button
                onClick={handleRetryIncorrect}
                size="lg"
                variant="secondary"
                className="w-full flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Retry incorrect questions ({incorrectQuestions.length})
              </Button>
            )}

            <Button
              onClick={() => navigate("/")}
              size="lg"
              className="w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Return to home
            </Button>
          </div>

          <div className="mt-8 w-full p-6 bg-primary/5 border-2 border-primary/20 rounded-xl flex flex-col items-center gap-3 transition-colors hover:bg-primary/10">
            <p className="font-semibold text-primary text-center">
              Like this quiz? 📄
            </p>
            <p className="text-sm text-muted-foreground text-center mb-1">
              Save it for printing or share it with your students!
            </p>
            <Button
              onClick={handleDownloadPDF}
              className="w-full flex items-center justify-center gap-2 font-bold shadow-md"
              size="lg"
            >
              <Download className="w-5 h-5" />
              Download as PDF right now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <div className="absolute top-6 right-8 z-10">
        <Button variant="outline" onClick={handleDownloadPDF} className="flex items-center gap-2 bg-background shadow-sm hover:bg-accent">
          <Download className="w-4 h-4" />
          Download for students
        </Button>
      </div>

      <div className="pt-24">
        <QuizProgress current={currentIndex + 1} total={activeQuestions.length} />
      </div>

      <div className="flex-1 p-8 lg:p-12 flex items-center justify-center">
        <div className="w-full max-w-3xl mt-4 lg:mt-0">
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
                ? "Check answer"
                : isLastQuestion ? "Finish & show results" : "Next question"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}