// src/components/upload/SettingsSidebar.tsx
import { Slider } from "../ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";

interface SettingsSidebarProps {
  numQuestions: number;
  setNumQuestions: (val: number) => void;
  difficulty: string;
  setDifficulty: (val: string) => void;
  questionType: string;
  setQuestionType: (val: string) => void;
  onGenerate: () => void;
}

export function SettingsSidebar({
  numQuestions,
  setNumQuestions,
  difficulty,
  setDifficulty,
  questionType,
  setQuestionType,
  onGenerate
}: SettingsSidebarProps) {
  return (
    <div className="w-80 bg-card border-l border-border p-6 flex flex-col min-h-screen">
      <div className="flex-1">
        <h3 className="mb-6 font-semibold text-lg text-foreground">Quiz Settings</h3>

        {/* Question count configuration */}
        <div className="mb-8">
          <label className="block mb-4 text-sm font-medium text-foreground">
            Number of questions
            <span className="ml-2 text-muted-foreground">({numQuestions})</span>
          </label>
          <Slider
            value={[numQuestions]}
            onValueChange={(value) => setNumQuestions(value[0])}
            min={1}
            max={15}
            step={1}
            className="w-full"
          />
        </div>

        {/* Difficulty configuration */}
        <div className="mb-8">
          <label className="block mb-3 text-sm font-medium text-foreground">Difficulty Level</label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Question type configuration */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-foreground">
            Question Type
          </label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
          >
            <option value="mixed">Mixed (All types)</option>
            <option value="single">Single Choice</option>
            <option value="multiple">Multiple Choice</option>
            <option value="true_false">True / False</option>
          </select>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <Button onClick={onGenerate} size="lg" className="w-full">
          Generate Quiz
        </Button>
      </div>
    </div>
  );
}
