import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertThoughtJournalSchema, type InsertThoughtJournal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import AIAnalysisCard from "@/components/ai-analysis-card";

interface ThoughtFormProps {
  onSuccess?: () => void;
}

const USER_ID = "demo-user";

export default function ThoughtForm({ onSuccess }: ThoughtFormProps) {
  const [emotionIntensity, setEmotionIntensity] = useState([5]);
  const [analysis, setAnalysis] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<InsertThoughtJournal>({
    resolver: zodResolver(insertThoughtJournalSchema),
    defaultValues: {
      userId: USER_ID,
      emotionIntensity: 5,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertThoughtJournal) => {
      const response = await apiRequest("POST", "/api/thought-journals", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/thought-journals"] });
      toast({
        title: "Thought journal saved!",
        description: "Great work challenging and reframing your thoughts!",
      });
      
      // Set analysis from response
      if (data.analysis) {
        setAnalysis(data.analysis);
      }
      
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save thought journal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertThoughtJournal) => {
    mutation.mutate({
      ...data,
      emotionIntensity: emotionIntensity[0],
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="situation">Situation</Label>
        <Textarea
          {...register("situation")}
          placeholder="What happened? Describe the situation that triggered this thought..."
          className="mt-1"
          rows={2}
        />
        {errors.situation && <p className="text-sm text-red-500">{errors.situation.message}</p>}
      </div>

      <div>
        <Label htmlFor="negativeThought">Negative Thought</Label>
        <Textarea
          {...register("negativeThought")}
          placeholder="What negative thought went through your mind?"
          className="mt-1"
          rows={2}
        />
        {errors.negativeThought && <p className="text-sm text-red-500">{errors.negativeThought.message}</p>}
      </div>

      <div>
        <Label htmlFor="emotion">Emotion</Label>
        <Input
          {...register("emotion")}
          placeholder="e.g., anxious, sad, angry, worried"
          className="mt-1"
        />
        {errors.emotion && <p className="text-sm text-red-500">{errors.emotion.message}</p>}
      </div>

      <div>
        <Label className="flex items-center justify-between">
          Emotion Intensity
          <span className="text-sm text-gray-500">{emotionIntensity[0]}/10</span>
        </Label>
        <Slider
          value={emotionIntensity}
          onValueChange={setEmotionIntensity}
          max={10}
          min={1}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Mild (1)</span>
          <span>Intense (10)</span>
        </div>
      </div>

      <div>
        <Label htmlFor="evidenceFor">Evidence For This Thought</Label>
        <Textarea
          {...register("evidenceFor")}
          placeholder="What evidence supports this thought?"
          className="mt-1"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="evidenceAgainst">Evidence Against This Thought</Label>
        <Textarea
          {...register("evidenceAgainst")}
          placeholder="What evidence contradicts this thought? What would you tell a friend?"
          className="mt-1"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="reframedThought">Reframed Thought</Label>
        <Textarea
          {...register("reframedThought")}
          placeholder="Create a more balanced, realistic thought..."
          className="mt-1"
          rows={2}
        />
        <p className="text-xs text-gray-600 mt-1">
          Ask yourself: "What would I say to a friend feeling this way?"
        </p>
      </div>

      <Button 
        type="submit" 
        className="w-full gradient-bg hover:opacity-90"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Saving..." : "Save Thought Journal"}
      </Button>

      {/* Show AI Analysis after submission */}
      {analysis && (
        <div className="mt-6">
          <AIAnalysisCard analysis={analysis} />
        </div>
      )}
    </form>
  );
}
