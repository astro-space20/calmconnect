interface MoodSelectorProps {
  onSelect: (mood: string) => void;
  selectedMood?: string;
}

export default function MoodSelector({ onSelect, selectedMood }: MoodSelectorProps) {
  const moods = [
    { emoji: "😊", value: "happy", label: "Happy" },
    { emoji: "😐", value: "neutral", label: "Neutral" },
    { emoji: "😔", value: "sad", label: "Sad" },
    { emoji: "😰", value: "anxious", label: "Anxious" },
  ];

  return (
    <div className="bg-white bg-opacity-10 rounded-2xl p-4">
      <p className="text-sm text-blue-100 mb-3">Quick mood check-in</p>
      <div className="flex justify-between">
        {moods.map(({ emoji, value, label }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              selectedMood === value
                ? "bg-white bg-opacity-40"
                : "bg-white bg-opacity-20 hover:bg-opacity-30"
            }`}
          >
            <span className="text-xl">{emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
