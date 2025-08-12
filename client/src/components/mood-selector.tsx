import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Heart, Sparkles, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface MoodSelectorProps {
  onSelect: (mood: string) => void;
  selectedMood?: string;
}

interface MoodSupport {
  validation: string;
  motivation: string;
  quickTip?: string;
}

export default function MoodSelector({ onSelect, selectedMood }: MoodSelectorProps) {
  const [aiSupport, setAiSupport] = useState<MoodSupport | null>(null);
  const [showSupport, setShowSupport] = useState(false);

  const moods = [
    { emoji: "😊", value: "happy", label: "Happy" },
    { emoji: "😌", value: "calm", label: "Calm" },
    { emoji: "😐", value: "neutral", label: "Neutral" },
    { emoji: "😰", value: "anxious", label: "Anxious" },
    { emoji: "😢", value: "sad", label: "Sad" },
    { emoji: "😓", value: "overwhelmed", label: "Overwhelmed" },
  ];

  const moodSupportMutation = useMutation({
    mutationFn: async (moodEmoji: string) => {
      const response = await apiRequest("POST", "/api/mood-support", {
        moodEmoji
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAiSupport(data.support);
      setShowSupport(true);
      setTimeout(() => setShowSupport(false), 5000); // Hide after 5 seconds
    }
  });

  const handleMoodSelect = (mood: { emoji: string; value: string; label: string }) => {
    onSelect(mood.value);
    // Get AI support for the selected mood
    moodSupportMutation.mutate(mood.emoji);
  };

  return (
    <div className="bg-white bg-opacity-10 rounded-2xl p-4">
      <p className="text-sm text-blue-100 mb-3">Quick mood check-in</p>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => handleMoodSelect(mood)}
            disabled={moodSupportMutation.isPending}
            className={`p-3 rounded-xl flex flex-col items-center justify-center transition-all relative ${
              selectedMood === mood.value
                ? "bg-white bg-opacity-40"
                : "bg-white bg-opacity-20 hover:bg-opacity-30"
            } ${moodSupportMutation.isPending ? 'opacity-50' : ''}`}
          >
            <span className="text-lg mb-1">{mood.emoji}</span>
            <span className="text-xs text-blue-100">{mood.label}</span>
            {moodSupportMutation.isPending && selectedMood === mood.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* AI Support Message */}
      {showSupport && aiSupport && (
        <div className="bg-white bg-opacity-20 rounded-xl p-4 animate-fade-in border border-white border-opacity-20">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0 w-6 h-6 bg-white bg-opacity-30 rounded-full flex items-center justify-center mt-0.5">
              <Heart className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm text-white font-medium">
                {aiSupport.validation}
              </p>
              <div className="flex items-start space-x-1">
                <Sparkles className="w-3 h-3 text-blue-200 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-100">
                  {aiSupport.motivation}
                </p>
              </div>
              {aiSupport.quickTip && (
                <p className="text-xs text-blue-200 italic border-l-2 border-white border-opacity-30 pl-2">
                  {aiSupport.quickTip}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
