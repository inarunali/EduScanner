// src/components/upload/SettingsSidebar.tsx
import { Settings, Play } from "lucide-react";
import { Button } from "../ui/button";

interface SettingsSidebarProps {
  numQuestions: number;
  setNumQuestions: (val: number) => void;
  difficulty: string;
  setDifficulty: (val: string) => void;
  questionType: string;
  setQuestionType: (val: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
  hasFile: boolean;
}

export function SettingsSidebar({
  numQuestions,
  setNumQuestions,
  difficulty,
  setDifficulty,
  questionType,
  setQuestionType,
  onGenerate,
  isLoading,
  hasFile
}: SettingsSidebarProps) {

  return (
    <div className="w-80 bg-card border-l border-border p-6 flex flex-col h-screen sticky top-0 shadow-lg">
      <div className="flex items-center gap-2 mb-8">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Quiz Settings</h2>
      </div>

      <div className="flex-1 space-y-8">
        {/* Number of Questions */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-foreground flex justify-between">
            Number of questions:
            <span className="text-primary">{numQuestions}</span>
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        {/* Difficulty Level */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground">Difficulty Level</label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: "easy", label: "Easy" },
              { id: "medium", label: "Medium" },
              { id: "hard", label: "Hard (Academic)" }
            ].map(lvl => (
              <label
                key={lvl.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  difficulty === lvl.id ? 'border-primary bg-primary/10' : 'border-border bg-background hover:bg-muted'
                }`}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={lvl.id}
                  checked={difficulty === lvl.id}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="hidden"
                />
                <span className={`text-sm font-medium ${difficulty === lvl.id ? 'text-primary' : 'text-muted-foreground'}`}>
                  {lvl.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Question Type */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground">Question Type</label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="w-full p-3 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="mixed">Mixed (All types)</option>
            <option value="single">Single Choice Only</option>
            <option value="multiple">Multiple Choice Only</option>
            <option value="true_false">True / False Only</option>
          </select>
        </div>
      </div>

      <div className="pt-6 border-t border-border mt-auto">
        <Button
          onClick={onGenerate}
          disabled={!hasFile || isLoading}
          className="w-full h-12 text-base font-bold shadow-md flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="w-5 h-5 fill-current" />
          )}
          {isLoading ? "Analyzing..." : "Generate Quiz"}
        </Button>
        {!hasFile && (
          <p className="text-xs text-center text-muted-foreground mt-3">
            Upload at least one file to start
          </p>
        )}
      </div>
    </div>
  );
}