// src/components/upload/SettingsSidebar.tsx
import { Slider } from "../ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

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

  const isButtonDisabled = !hasFile || isLoading;

  return (
    <div className="w-80 bg-card border-l border-border p-6 flex flex-col min-h-screen">
      <div className="flex-1">
        <h3 className="mb-6 font-semibold text-lg text-foreground">Quiz Settings</h3>

        {/* Ilość pytań */}
        <div className="mb-8">
          <label className="block mb-4 text-sm font-medium text-foreground">
            Ilość pytań
            <span className="ml-2 text-muted-foreground">({numQuestions})</span>
          </label>
          <Slider
            value={[numQuestions]}
            onValueChange={(value) => setNumQuestions(value[0])}
            min={1}
            max={15}
            step={1}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        {/* Difficulty level */}
        <div className="mb-8">
          <label className="block mb-3 text-sm font-medium text-foreground">Difficulty Level</label>
          <Select value={difficulty} onValueChange={setDifficulty} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Łatwy</SelectItem>
              <SelectItem value="medium">Średni</SelectItem>
              <SelectItem value="academic">Trudny</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Question type */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-foreground">
            Typ pytań
          </label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            disabled={isLoading}
            className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer disabled:opacity-50"
          >
            <option value="mixed">Różne (wszystkie rodzaje)</option>
            <option value="single">Jeden wybór</option>
            <option value="multiple">Wielokrotnegy wybor</option>
            <option value="true_false">Prawda / Fałsz</option>
          </select>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <Button 
          onClick={onGenerate} 
          size="lg" 
          className="w-full flex items-center justify-center gap-2"
          disabled={isButtonDisabled}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Twój AI pomocnik myśli...
            </>
          ) : !hasFile ? (
            "Wgraj plik PDF"
          ) : (
            "Generuj Quiz"
          )}
        </Button>
      </div>
    </div>
  );
}
