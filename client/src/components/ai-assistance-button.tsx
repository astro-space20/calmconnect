import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Brain, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import AIAnalysisCard from "@/components/ai-analysis-card";

interface AIAssistanceButtonProps {
  journalId: string;
  className?: string;
}

interface AnalysisResult {
  cognitiveDistortions: string[];
  severity: 'low' | 'moderate' | 'high';
  suggestions: string[];
  reframingExamples: string[];
  strengths: string[];
}

export default function AIAssistanceButton({ journalId, className = "" }: AIAssistanceButtonProps) {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const analysisMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/thought-journals/${journalId}/analyze`, {});
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysis(data.analysis);
      setShowAnalysis(true);
    },
    onError: (error) => {
      console.error("Failed to analyze thought journal:", error);
    }
  });

  const handleAnalyze = () => {
    if (showAnalysis) {
      setShowAnalysis(false);
    } else if (analysis) {
      setShowAnalysis(true);
    } else {
      analysisMutation.mutate();
    }
  };

  return (
    <div className={className}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleAnalyze}
        disabled={analysisMutation.isPending}
        className="w-full text-purple-600 border-purple-200 hover:bg-purple-50"
      >
        {analysisMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Brain className="w-4 h-4 mr-2" />
            {showAnalysis ? 'Hide' : analysis ? 'Show' : 'Get'} AI Analysis
          </>
        )}
      </Button>

      {showAnalysis && analysis && (
        <div className="mt-4">
          <AIAnalysisCard analysis={analysis} />
        </div>
      )}
    </div>
  );
}