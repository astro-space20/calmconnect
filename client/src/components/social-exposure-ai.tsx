import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Brain, Heart, Target, TrendingUp, Lightbulb, Award, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

interface SocialExposureMotivation {
  encouragement: string;
  confidenceBooster: string;
  practicalTip: string;
  affirmation: string;
}

interface SocialExposureFeedback {
  celebration: string;
  reflection: string[];
  learnings: string[];
  nextSteps: string[];
}

interface PreExposureMotivationProps {
  exposureType: string;
  anxietyLevel: number;
  description: string;
  isFirstTime: boolean;
  onMotivationReceived?: (motivation: SocialExposureMotivation) => void;
}

interface PostExposureFeedbackProps {
  exposureType: string;
  anxietyLevel: number;
  description: string;
  isFirstTime: boolean;
  completed: boolean;
  beforeAnxiety: number;
  afterAnxiety: number;
  notes?: string;
  onFeedbackReceived?: (feedback: SocialExposureFeedback) => void;
}

export function PreExposureMotivation({
  exposureType,
  anxietyLevel,
  description,
  isFirstTime,
  onMotivationReceived
}: PreExposureMotivationProps) {
  const [motivation, setMotivation] = useState<SocialExposureMotivation | null>(null);
  const [showMotivation, setShowMotivation] = useState(false);

  const motivationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/social-exposures/motivation", {
        exposureType,
        anxietyLevel,
        description,
        isFirstTime
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMotivation(data.motivation);
      setShowMotivation(true);
      onMotivationReceived?.(data.motivation);
    }
  });

  const handleGetMotivation = () => {
    motivationMutation.mutate();
  };

  if (showMotivation && motivation) {
    return (
      <Card className="border-0 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Heart className="w-5 h-5 text-purple-600" />
            <span>AI Encouragement</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Encouragement */}
          <div className="bg-white/70 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-4 h-4 text-purple-600" />
              <h4 className="font-medium text-purple-800">You've Got This!</h4>
            </div>
            <p className="text-sm text-purple-700">{motivation.encouragement}</p>
          </div>

          {/* Confidence Booster */}
          <div className="bg-white/70 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-blue-800">Confidence Boost</h4>
            </div>
            <p className="text-sm text-blue-700">{motivation.confidenceBooster}</p>
          </div>

          {/* Practical Tip */}
          <div className="bg-white/70 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="w-4 h-4 text-orange-600" />
              <h4 className="font-medium text-orange-800">Practical Tip</h4>
            </div>
            <p className="text-sm text-orange-700">{motivation.practicalTip}</p>
          </div>

          {/* Affirmation */}
          <div className="bg-white/70 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-green-600" />
              <h4 className="font-medium text-green-800">Affirmation</h4>
            </div>
            <p className="text-sm text-green-700 italic">"{motivation.affirmation}"</p>
          </div>

          <Button
            onClick={() => setShowMotivation(false)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            Get New Motivation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base">
          <Brain className="w-5 h-5 text-purple-600" />
          <span>AI Motivation</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Get personalized encouragement and tips for your social exposure challenge.
        </p>
        <Button
          onClick={handleGetMotivation}
          disabled={motivationMutation.isPending}
          className="w-full gradient-bg hover:opacity-90"
        >
          {motivationMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Getting Motivation...
            </>
          ) : (
            <>
              <Heart className="w-4 h-4 mr-2" />
              Get AI Motivation
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export function PostExposureFeedback({
  exposureType,
  anxietyLevel,
  description,
  isFirstTime,
  completed,
  beforeAnxiety,
  afterAnxiety,
  notes,
  onFeedbackReceived
}: PostExposureFeedbackProps) {
  const [feedback, setFeedback] = useState<SocialExposureFeedback | null>(null);

  const feedbackMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/social-exposures/feedback", {
        exposureType,
        anxietyLevel,
        description,
        isFirstTime,
        completed,
        beforeAnxiety,
        afterAnxiety,
        notes
      });
      return response.json();
    },
    onSuccess: (data) => {
      setFeedback(data.feedback);
      onFeedbackReceived?.(data.feedback);
    }
  });

  // Auto-generate feedback on mount
  useState(() => {
    feedbackMutation.mutate();
  });

  if (feedbackMutation.isPending) {
    return (
      <Card className="border-0 bg-gradient-to-br from-green-50 to-blue-50">
        <CardContent className="p-6 text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-green-600" />
          <p className="text-sm text-gray-600">Generating personalized feedback...</p>
        </CardContent>
      </Card>
    );
  }

  if (!feedback) {
    return null;
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-green-50 to-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-base">
          <Award className="w-5 h-5 text-green-600" />
          <span>AI Celebration & Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Celebration */}
        <div className="bg-white/70 rounded-lg p-4 text-center">
          <Award className="w-8 h-8 mx-auto mb-2 text-green-600" />
          <p className="font-medium text-green-800 mb-1">Celebration</p>
          <p className="text-sm text-green-700">{feedback.celebration}</p>
        </div>

        {/* Reflection */}
        {feedback.reflection.length > 0 && (
          <div className="bg-white/70 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-blue-800">Reflection</h4>
            </div>
            <ul className="space-y-1">
              {feedback.reflection.map((item, index) => (
                <li key={index} className="text-sm text-blue-700 flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Learnings */}
        {feedback.learnings.length > 0 && (
          <div className="bg-white/70 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Lightbulb className="w-4 h-4 text-orange-600" />
              <h4 className="font-medium text-orange-800">Key Learnings</h4>
            </div>
            <ul className="space-y-1">
              {feedback.learnings.map((item, index) => (
                <li key={index} className="text-sm text-orange-700 flex items-start">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Steps */}
        {feedback.nextSteps.length > 0 && (
          <div className="bg-white/70 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-600" />
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
        )}
      </CardContent>
    </Card>
  );
}