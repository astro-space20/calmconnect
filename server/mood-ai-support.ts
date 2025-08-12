// AI-powered motivational responses for mood check-ins
// Provides quick encouragement and validation based on selected mood

export interface MoodSupport {
  validation: string;
  motivation: string;
  quickTip?: string;
}

const moodResponses = {
  // Positive moods
  "😊": {
    happy: [
      {
        validation: "It's wonderful that you're feeling happy today!",
        motivation: "Your positive energy can be a powerful force for good - share it with others."
      },
      {
        validation: "I'm so glad you're experiencing joy right now.",
        motivation: "Take a moment to really savor this feeling and remember what contributed to it."
      },
      {
        validation: "Your happiness is radiating through!",
        motivation: "Consider writing down what's making you happy to revisit on harder days."
      }
    ]
  },
  "😌": {
    calm: [
      {
        validation: "Finding calm is such a valuable skill.",
        motivation: "This peaceful state you've cultivated is something to be proud of."
      },
      {
        validation: "Your sense of calm is beautiful.",
        motivation: "You're creating space for clarity and wisdom to emerge."
      },
      {
        validation: "What a gift to feel centered and peaceful.",
        motivation: "Your calm energy can be a source of strength for others too."
      }
    ]
  },
  "🙂": {
    content: [
      {
        validation: "Contentment is one of life's greatest treasures.",
        motivation: "You're practicing gratitude for the present moment - that's powerful."
      },
      {
        validation: "There's such strength in feeling content with where you are.",
        motivation: "This balanced state you've found is worth celebrating."
      },
      {
        validation: "Your sense of contentment shows real inner wisdom.",
        motivation: "You're showing that happiness doesn't always need to be loud to be meaningful."
      }
    ]
  },
  
  // Neutral moods
  "😐": {
    neutral: [
      {
        validation: "It's perfectly okay to feel neutral - not every day needs to be exceptional.",
        motivation: "You're still here and still trying, and that's what matters most."
      },
      {
        validation: "Neutral feelings are valid and important too.",
        motivation: "Sometimes the most growth happens in these quiet, steady moments."
      },
      {
        validation: "You're taking time to check in with yourself - that's self-care.",
        motivation: "Even neutral days are part of your journey toward wellness."
      }
    ]
  },
  "🤔": {
    thoughtful: [
      {
        validation: "Your thoughtfulness shows how much you care about understanding yourself.",
        motivation: "The fact that you're reflecting means you're growing and learning."
      },
      {
        validation: "Taking time to think things through is a sign of wisdom.",
        motivation: "Your self-awareness is a superpower that will guide you well."
      },
      {
        validation: "Contemplation is how we make sense of our experiences.",
        motivation: "Trust the process - your insights will come when you're ready."
      }
    ]
  },
  "😴": {
    tired: [
      {
        validation: "Being tired is your body and mind asking for what they need.",
        motivation: "Rest isn't giving up - it's preparing for what comes next."
      },
      {
        validation: "Acknowledging your tiredness shows you're listening to yourself.",
        motivation: "Every small step counts, even when energy is low."
      },
      {
        validation: "Tiredness is a sign you've been putting in effort.",
        motivation: "Be gentle with yourself - recovery is part of the process."
      }
    ]
  },
  
  // Challenging moods
  "😰": {
    anxious: [
      {
        validation: "Your anxiety makes sense - you're human and you care deeply.",
        motivation: "You've managed anxious feelings before, and you have the strength to navigate this too."
      },
      {
        validation: "Feeling anxious doesn't mean you're weak - it means you're aware.",
        motivation: "Each time you notice anxiety, you're building your emotional intelligence."
      },
      {
        validation: "Your anxiety is trying to protect you - acknowledge it with kindness.",
        motivation: "You have tools and support to work through this feeling."
      }
    ]
  },
  "😢": {
    sad: [
      {
        validation: "Your sadness is valid and deserves to be honored.",
        motivation: "Feeling deeply is a sign of your compassion and humanity."
      },
      {
        validation: "It takes courage to acknowledge when you're struggling.",
        motivation: "This difficult moment is temporary, but your resilience is permanent."
      },
      {
        validation: "Sadness can be a teacher, showing us what matters most.",
        motivation: "You don't have to carry this alone - support is always available."
      }
    ]
  },
  "😠": {
    frustrated: [
      {
        validation: "Your frustration shows you have standards and you care about outcomes.",
        motivation: "This energy can be channeled into positive change when you're ready."
      },
      {
        validation: "Frustration often means you're pushing against limitations - that takes courage.",
        motivation: "You have the wisdom to find constructive ways to address what's bothering you."
      },
      {
        validation: "It's healthy to feel frustrated when things aren't going as hoped.",
        motivation: "Your determination will help you find solutions, one step at a time."
      }
    ]
  },
  "😓": {
    overwhelmed: [
      {
        validation: "Feeling overwhelmed means you're facing a lot - that's genuinely difficult.",
        motivation: "You don't have to tackle everything at once - focus on just the next small step."
      },
      {
        validation: "Overwhelm is your mind's way of saying 'this is a lot to handle'.",
        motivation: "Break things down, ask for help, and remember: you've overcome challenges before."
      },
      {
        validation: "Recognizing overwhelm is the first step toward managing it.",
        motivation: "You have more strength and resources than this moment might reveal."
      }
    ]
  }
};

export function getMoodSupport(moodEmoji: string): MoodSupport {
  const moodCategory = moodResponses[moodEmoji as keyof typeof moodResponses];
  
  if (!moodCategory) {
    // Default response for unmapped moods
    return {
      validation: "Thank you for sharing how you're feeling.",
      motivation: "Every emotion is valid and tells us something important about our experience."
    };
  }
  
  // Get the first mood type for the emoji (since each emoji maps to one mood type)
  const moodType = Object.keys(moodCategory)[0];
  const responses = moodCategory[moodType as keyof typeof moodCategory];
  
  // Randomly select one of the responses
  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  return randomResponse;
}

export function getMoodSupportWithContext(
  moodEmoji: string, 
  recentMoods: Array<{ mood: string; timestamp: Date }>,
  userName?: string
): MoodSupport {
  const baseSupport = getMoodSupport(moodEmoji);
  
  // Add contextual adjustments based on recent mood patterns
  const recentMoodEmojis = recentMoods.slice(-7).map(m => m.mood); // Last 7 moods
  
  // Check for concerning patterns
  const negativeEmojis = ["😰", "😢", "😠", "😓"];
  const recentNegativeCount = recentMoodEmojis.filter(m => negativeEmojis.includes(m)).length;
  
  // Check for positive streaks
  const positiveEmojis = ["😊", "😌", "🙂"];
  const recentPositiveCount = recentMoodEmojis.filter(m => positiveEmojis.includes(m)).length;
  
  let contextualSupport = { ...baseSupport };
  
  // Add contextual messaging
  if (recentNegativeCount >= 4) {
    if (positiveEmojis.includes(moodEmoji)) {
      contextualSupport.motivation += " It's especially meaningful to see you finding moments of light.";
    } else if (negativeEmojis.includes(moodEmoji)) {
      contextualSupport.quickTip = "Consider reaching out to someone you trust or trying a grounding exercise.";
    }
  } else if (recentPositiveCount >= 4) {
    if (positiveEmojis.includes(moodEmoji)) {
      contextualSupport.motivation += " You're building a beautiful pattern of wellbeing.";
    } else if (negativeEmojis.includes(moodEmoji)) {
      contextualSupport.validation += " It's normal to have ups and downs even during generally good periods.";
    }
  }
  
  // Add personal touch if name is available
  if (userName && userName !== "Guest User") {
    contextualSupport.validation = contextualSupport.validation.replace(
      /^(Your?|You're|You)/,
      `${userName}, your`
    );
  }
  
  return contextualSupport;
}