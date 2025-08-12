// AI guidance for CBT exercises
// Provides personalized coaching and feedback based on user's current state

export interface CBTExerciseGuidance {
  preExerciseGuidance: string[];
  duringExerciseGuidance: string[];
  postExerciseGuidance: string[];
  personalizedTips: string[];
  difficultyAdjustments: string[];
}

export interface UserState {
  currentMood: string;
  anxietyLevel: number; // 1-10
  exerciseHistory: ExerciseHistory[];
  recentThoughtJournals: any[];
}

export interface ExerciseHistory {
  exerciseType: string;
  completedAt: Date;
  durationMinutes: number;
  effectiveness: number; // 1-10
  notes?: string;
}

const exerciseTemplates = {
  'box-breathing': {
    name: 'Box Breathing',
    baseGuidance: {
      preExercise: [
        "Find a comfortable position where you won't be disturbed",
        "Place one hand on your chest and one on your stomach",
        "Close your eyes or soften your gaze downward"
      ],
      duringExercise: [
        "Breathe in slowly through your nose for 4 counts",
        "Hold your breath gently for 4 counts",
        "Exhale slowly through your mouth for 4 counts",
        "Hold empty for 4 counts, then repeat"
      ],
      postExercise: [
        "Notice how your body feels now compared to when you started",
        "Take a moment to appreciate the time you've given yourself",
        "Consider when you might use this technique again today"
      ]
    }
  },
  'grounding-5-4-3-2-1': {
    name: '5-4-3-2-1 Grounding',
    baseGuidance: {
      preExercise: [
        "Sit or stand comfortably and take three deep breaths",
        "Remind yourself that you are safe in this moment",
        "This exercise will help bring you back to the present"
      ],
      duringExercise: [
        "Name 5 things you can see around you",
        "Name 4 things you can touch or feel",
        "Name 3 things you can hear",
        "Name 2 things you can smell",
        "Name 1 thing you can taste"
      ],
      postExercise: [
        "Notice if you feel more present and grounded",
        "Acknowledge that you successfully used a coping skill",
        "Remember this technique is always available to you"
      ]
    }
  },
  'thought-challenging': {
    name: 'Thought Challenging',
    baseGuidance: {
      preExercise: [
        "Think of a specific situation that's causing you distress",
        "Identify the automatic thought that came up",
        "Rate how much you believe this thought (1-10)"
      ],
      duringExercise: [
        "What evidence supports this thought?",
        "What evidence contradicts this thought?",
        "What would you tell a friend in this situation?",
        "What's a more balanced way to think about this?"
      ],
      postExercise: [
        "Rate how much you believe the original thought now",
        "Notice any shift in your emotional intensity",
        "Practice using this balanced thought throughout your day"
      ]
    }
  },
  'progressive-muscle-relaxation': {
    name: 'Progressive Muscle Relaxation',
    baseGuidance: {
      preExercise: [
        "Lie down or sit in a comfortable chair",
        "Loosen any tight clothing",
        "Take a few deep breaths to settle in"
      ],
      duringExercise: [
        "Tense each muscle group for 5 seconds, then release",
        "Start with your toes and work up to your face",
        "Notice the contrast between tension and relaxation",
        "Breathe naturally throughout the exercise"
      ],
      postExercise: [
        "Scan your body and notice areas of relaxation",
        "Take a few moments to enjoy this peaceful state",
        "Remember how relaxation feels in your body"
      ]
    }
  }
};

export function getPersonalizedGuidance(
  exerciseType: string,
  userState: UserState
): CBTExerciseGuidance {
  const template = exerciseTemplates[exerciseType as keyof typeof exerciseTemplates];
  
  if (!template) {
    return getDefaultGuidance();
  }

  const guidance: CBTExerciseGuidance = {
    preExerciseGuidance: [...template.baseGuidance.preExercise],
    duringExerciseGuidance: [...template.baseGuidance.duringExercise],
    postExerciseGuidance: [...template.baseGuidance.postExercise],
    personalizedTips: [],
    difficultyAdjustments: []
  };

  // Personalize based on anxiety level
  if (userState.anxietyLevel >= 8) {
    guidance.personalizedTips.push(
      "Your anxiety is quite high right now. Start with shorter durations.",
      "It's normal for your mind to wander when anxious - gently return focus.",
      "Remember: the goal isn't to eliminate anxiety, but to manage it."
    );
    
    guidance.difficultyAdjustments.push(
      "Consider reducing the duration by half to start",
      "If breathing exercises feel difficult, just focus on natural breathing",
      "It's okay to keep your eyes open if closing them increases anxiety"
    );
  } else if (userState.anxietyLevel >= 5) {
    guidance.personalizedTips.push(
      "You're experiencing moderate anxiety - this exercise can help.",
      "Take your time and don't rush through the steps.",
      "Notice any small changes in how you feel."
    );
  } else {
    guidance.personalizedTips.push(
      "Great time to practice! Building skills when calm makes them more available during stress.",
      "You might try extending the duration or adding complexity.",
      "Focus on really noticing the subtle effects of the exercise."
    );
  }

  // Personalize based on mood
  if (userState.currentMood.toLowerCase().includes('overwhelmed')) {
    guidance.preExerciseGuidance.unshift(
      "You're feeling overwhelmed right now. This exercise will help you find some calm."
    );
    guidance.personalizedTips.push(
      "When overwhelmed, any amount of practice is beneficial",
      "Focus on just getting through the exercise, don't worry about doing it perfectly"
    );
  }

  if (userState.currentMood.toLowerCase().includes('sad') || 
      userState.currentMood.toLowerCase().includes('depressed')) {
    guidance.personalizedTips.push(
      "When feeling low, these exercises can help lift your energy slightly",
      "Be especially kind to yourself during and after the practice",
      "Even if you don't feel much different, you're taking positive action"
    );
  }

  // Personalize based on exercise history
  const recentExercises = userState.exerciseHistory.filter(
    ex => ex.exerciseType === exerciseType && 
    new Date(ex.completedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
  );

  if (recentExercises.length === 0) {
    guidance.personalizedTips.push(
      "This is your first time trying this exercise recently - be patient with yourself",
      "It's normal for new techniques to feel awkward at first"
    );
  } else if (recentExercises.length >= 3) {
    const avgEffectiveness = recentExercises.reduce((sum, ex) => sum + ex.effectiveness, 0) / recentExercises.length;
    
    if (avgEffectiveness >= 7) {
      guidance.personalizedTips.push(
        "You've been finding this exercise quite helpful - great consistency!",
        "Consider trying a longer duration or teaching this technique to someone else"
      );
    } else if (avgEffectiveness >= 4) {
      guidance.personalizedTips.push(
        "You're building skill with this exercise. Keep practicing!",
        "Try paying attention to different aspects of the technique today"
      );
    } else {
      guidance.personalizedTips.push(
        "This exercise hasn't been feeling very effective lately - that's okay",
        "Consider trying a different variation or checking if something is distracting you",
        "Sometimes techniques work better at different times of day"
      );
    }
  }

  // Personalize based on recent thought journals
  if (userState.recentThoughtJournals.length > 0) {
    const recentIntensities = userState.recentThoughtJournals.map(j => j.emotionIntensity || 5);
    const avgIntensity = recentIntensities.reduce((sum, i) => sum + i, 0) / recentIntensities.length;
    
    if (avgIntensity >= 7) {
      guidance.personalizedTips.push(
        "Your recent journal entries show high emotional intensity - this practice can help",
        "Consider doing this exercise when you notice intense thoughts arising"
      );
    }

    const commonEmotions = getCommonEmotions(userState.recentThoughtJournals);
    if (commonEmotions.includes('anxious') && exerciseType === 'box-breathing') {
      guidance.personalizedTips.push(
        "Breathing exercises are particularly helpful for anxiety patterns you've been experiencing"
      );
    }
    
    if (commonEmotions.includes('overwhelmed') && exerciseType === 'grounding-5-4-3-2-1') {
      guidance.personalizedTips.push(
        "Grounding techniques can be especially helpful when feeling overwhelmed, as noted in your recent entries"
      );
    }
  }

  return guidance;
}

function getCommonEmotions(journals: any[]): string[] {
  const emotions = journals.map(j => j.emotion?.toLowerCase() || '').filter(e => e);
  const emotionCounts: Record<string, number> = {};
  
  emotions.forEach(emotion => {
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });
  
  return Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([emotion]) => emotion);
}

function getDefaultGuidance(): CBTExerciseGuidance {
  return {
    preExerciseGuidance: [
      "Find a quiet, comfortable space",
      "Take a moment to check in with how you're feeling",
      "Set an intention for this practice"
    ],
    duringExerciseGuidance: [
      "Follow the guided instructions",
      "Be patient and kind with yourself",
      "Notice without judgment what comes up"
    ],
    postExerciseGuidance: [
      "Take a moment to notice any changes",
      "Appreciate the time you've dedicated to self-care",
      "Consider how you might apply what you've learned"
    ],
    personalizedTips: [
      "Regular practice builds resilience over time",
      "It's normal for experiences to vary each time you practice"
    ],
    difficultyAdjustments: []
  };
}

export function getPostExerciseFeedback(
  exerciseType: string,
  durationMinutes: number,
  effectiveness: number,
  mood: string
): {
  encouragement: string[];
  suggestions: string[];
  nextSteps: string[];
} {
  const feedback = {
    encouragement: [],
    suggestions: [],
    nextSteps: []
  };

  // Encouragement based on completion
  if (effectiveness >= 8) {
    feedback.encouragement.push(
      "Excellent! You found this exercise very helpful.",
      "Your commitment to practice is paying off."
    );
  } else if (effectiveness >= 5) {
    feedback.encouragement.push(
      "Good work completing the exercise.",
      "Building these skills takes time and practice."
    );
  } else {
    feedback.encouragement.push(
      "Thank you for giving this exercise a try.",
      "Not every practice will feel amazing, and that's completely normal.",
      "The act of practicing itself is beneficial, regardless of how it feels."
    );
  }

  // Suggestions based on effectiveness
  if (effectiveness < 4) {
    feedback.suggestions.push(
      "Consider trying this exercise at a different time of day",
      "You might experiment with a shorter or longer duration",
      "Sometimes changing your environment can help",
      "Try a different exercise type if this one isn't resonating"
    );
  } else if (effectiveness >= 7) {
    feedback.suggestions.push(
      "This exercise seems to work well for you - consider making it a regular part of your routine",
      "You might try extending the duration or adding complexity",
      "Consider practicing this exercise preventively, not just during difficult moments"
    );
  }

  // Next steps based on exercise type and effectiveness
  feedback.nextSteps.push("Consider logging this experience in your thought journal");
  
  if (exerciseType === 'box-breathing' && effectiveness >= 6) {
    feedback.nextSteps.push(
      "Try using box breathing during moments of stress throughout your day",
      "Consider practicing at the same time daily to build a habit"
    );
  }
  
  if (exerciseType === 'grounding-5-4-3-2-1' && effectiveness >= 6) {
    feedback.nextSteps.push(
      "Remember this technique is available anywhere when you feel disconnected",
      "Try teaching this grounding technique to someone else"
    );
  }

  if (exerciseType === 'thought-challenging' && effectiveness >= 6) {
    feedback.nextSteps.push(
      "Practice applying these questioning techniques to daily situations",
      "Consider writing down the balanced thoughts you discover"
    );
  }

  if (exerciseType === 'progressive-muscle-relaxation' && effectiveness >= 6) {
    feedback.nextSteps.push(
      "Notice throughout the day when your muscles are tense",
      "Try doing brief muscle releases even when you can't do the full exercise"
    );
  }

  // Duration-based feedback
  if (durationMinutes < 3) {
    feedback.nextSteps.push("When you're ready, try gradually increasing the duration");
  } else if (durationMinutes > 15) {
    feedback.nextSteps.push("You dedicated significant time to this practice - excellent commitment");
  }

  return feedback;
}