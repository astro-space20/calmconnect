import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Brain, Lightbulb, Target, TrendingUp, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";

interface CBTExerciseGuidance {
  preExerciseGuidance: string[];
  duringExerciseGuidance: string[];
  postExerciseGuidance: string[];
  personalizedTips: string[];
  difficultyAdjustments: string[];
}

interface ExerciseFeedback {
  encouragement: string[];
  suggestions: string[];
  nextSteps: string[];
}

interface AIExerciseGuidanceProps {
  exerciseType: string;
  exerciseTitle: string;
  onGuidanceReceived?: (guidance: CBTExerciseGuidance) => void;
  showFeedbackForm?: boolean;
  onFeedbackSubmitted?: () => void;
}

export default function AIExerciseGuidance({
  exerciseType,
  exerciseTitle,
  onGuidanceReceived,
  showFeedbackForm = false,
  onFeedbackSubmitted
}: AIExerciseGuidanceProps) {
  const [guidance, setGuidance] = useState<CBTExerciseGuidance | null>(null);
  const [feedback, setFeedback] = useState<ExerciseFeedback | null>(null);
  const [showGuidance, setShowGuidance] = useState(false);
  const [currentMood, setCurrentMood] = useState("");
  const [anxietyLevel, setAnxietyLevel] = useState([5]);
  const [durationMinutes, setDurationMinutes] = useState([5]);
  const [effectiveness, setEffectiveness] = useState([5]);

  const guidanceMutation = useMutation({
    mutationFn: async ({ mood, anxiety }: { mood: string; anxiety: number }) => {
      const response = await apiRequest("POST", "/api/cbt-exercises/guidance", {
        exerciseType,
        currentMood: mood,
        anxietyLevel: anxiety
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGuidance(data.guidance);
      setShowGuidance(true);
      onGuidanceReceived?.(data.guidance);
    }
  });

  const feedbackMutation = useMutation({
    mutationFn: async (feedbackData: {
      durationMinutes: number;
      effectiveness: number;
      mood: string;
    }) => {
      const response = await apiRequest("POST", "/api/cbt-exercises/feedback", {
        exerciseType,
        ...feedbackData
      });
      return response.json();
    },
    onSuccess: (data) => {
      setFeedback(data.feedback);
      onFeedbackSubmitted?.();
    }
  });

  const handleGetGuidance = () => {
    if (!currentMood.trim()) {
      setCurrentMood("neutral");
    }
    guidanceMutation.mutate({
      mood: currentMood || "neutral",
      anxiety: anxietyLevel[0]
    });
  };

  const handleSubmitFeedback = () => {
    feedbackMutation.mutate({
      durationMinutes: durationMinutes[0],
      effectiveness: effectiveness[0],
      mood: currentMood || "neutral"
    });
  };

  if (showFeedbackForm && !feedback) {
    return (
      <Card className="border-0 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>Exercise Feedback</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>How long did you practice? (minutes)</Label>
            <Slider
              value={durationMinutes}
              onValueChange={setDurationMinutes}
              max={30}
              min={1}
              step={1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 min</span>
              <span className="font-medium">{durationMinutes[0]} minutes</span>
              <span>30 min</span>
            </div>
          </div>

          <div>
            <Label>How effective was this exercise for you?</Label>
            <Slider
              value={effectiveness}
              onValueChange={setEffectiveness}
              max={10}
              min={1}
              step={1}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Not helpful (1)</span>
              <span className="font-medium">{effectiveness[0]}/10</span>
              <span>Very helpful (10)</span>
            </div>
          </div>

          <div>
            <Label htmlFor="mood">How are you feeling now?</Label>
            <Input
              id="mood"
              value={currentMood}
              onChange={(e) => setCurrentMood(e.target.value)}
              placeholder="e.g., calmer, relaxed, still anxious"
              className="mt-1"
            />
          </div>

          <Button
            onClick={handleSubmitFeedback}
            disabled={feedbackMutation.isPending}
            className="w-full gradient-bg hover:opacity-90"
          >
            {feedbackMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Getting Feedback...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Get AI Feedback
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (feedback) {
    return (
      <Card className="border-0 bg-gradient-to-br from-green-50 to-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>AI Feedback & Encouragement</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Encouragement */}
          <div className="bg-white/70 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-green-600" />
              <h4 className="font-medium text-green-800">Encouragement</h4>
            </div>
            <ul className="space-y-1">
              {feedback.encouragement.map((item, index) => (
                <li key={index} className="text-sm text-green-700 flex items-start">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Suggestions */}
          {feedback.suggestions.length > 0 && (
            <div className="bg-white/70 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <h4 className="font-medium text-blue-800">Suggestions</h4>
              </div>
              <ul className="space-y-1">
                {feedback.suggestions.map((item, index) => (
                  <li key={index} className="text-sm text-blue-700 flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-white/70 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <h4 className="font-medium text-purple-800">Next Steps</h4>
            </div>
            <ul className="space-y-1">
              {feedback.nextSteps.map((item, index) => (
                <li key={index} className="text-sm text-purple-700 flex items-start">
                  <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base">
          <Brain className="w-5 h-5 text-purple-600" />
          <span>AI Exercise Guidance</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showGuidance ? (
          <>
            <p className="text-sm text-gray-600">
              Get personalized guidance for {exerciseTitle} based on your current state.
            </p>

            <div>
              <Label htmlFor="currentMood">How are you feeling right now?</Label>
              <Input
                id="currentMood"
                value={currentMood}
                onChange={(e) => setCurrentMood(e.target.value)}
                placeholder="e.g., anxious, overwhelmed, stressed, calm"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Current anxiety level</Label>
              <Slider
                value={anxietyLevel}
                onValueChange={setAnxietyLevel}
                max={10}
                min={1}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Calm (1)</span>
                <span className="font-medium">{anxietyLevel[0]}/10</span>
                <span>Very anxious (10)</span>
              </div>
            </div>

            <Button
              onClick={handleGetGuidance}
              disabled={guidanceMutation.isPending}
              className="w-full gradient-bg hover:opacity-90"
            >
              {guidanceMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Getting Guidance...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Get Personalized Guidance
                </>
              )}
            </Button>
          </>
        ) : guidance && (
          <div className="space-y-4">
            {/* Personalized Tips */}
            {guidance.personalizedTips.length > 0 && (
              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <h4 className="font-medium text-purple-800">For You Right Now</h4>
                </div>
                <ul className="space-y-1">
                  {guidance.personalizedTips.map((tip, index) => (
                    <li key={index} className="text-sm text-purple-700 flex items-start">
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Difficulty Adjustments */}
            {guidance.difficultyAdjustments.length > 0 && (
              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-orange-600" />
                  <h4 className="font-medium text-orange-800">Adjustments for Today</h4>
                </div>
                <ul className="space-y-1">
                  {guidance.difficultyAdjustments.map((adjustment, index) => (
                    <li key={index} className="text-sm text-orange-700 flex items-start">
                      <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {adjustment}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              onClick={() => setShowGuidance(false)}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Get New Guidance
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}