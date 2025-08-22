// Google Gemini AI analysis for CBT thought journal entries
import { geminiAI } from './gemini-ai';
import type { ThoughtJournal } from "@shared/schema";

interface CognitiveDistortion {
  name: string;
  description: string;
  keywords: string[];
  examples: string[];
}

interface AnalysisResult {
  cognitiveDistortions: string[];
  severity: 'low' | 'moderate' | 'high';
  suggestions: string[];
  reframingExamples: string[];
  strengths: string[];
}

const cognitiveDistortions: CognitiveDistortion[] = [
  {
    name: "All-or-Nothing Thinking",
    description: "Seeing things in black and white categories",
    keywords: ["always", "never", "completely", "totally", "perfect", "failure", "ruined", "disaster"],
    examples: ["I'm a complete failure", "I never do anything right", "This is totally ruined"]
  },
  {
    name: "Overgeneralization", 
    description: "Making broad conclusions from single events",
    keywords: ["always", "never", "everyone", "no one", "everything", "nothing", "typical"],
    examples: ["This always happens to me", "I never get it right", "Everyone thinks I'm weird"]
  },
  {
    name: "Mental Filter",
    description: "Focusing only on negative details",
    keywords: ["only", "just", "but", "except", "however", "still", "worst"],
    examples: ["I only made one mistake", "But what if", "The worst part was"]
  },
  {
    name: "Mind Reading",
    description: "Assuming you know what others think",
    keywords: ["thinks", "believes", "knows", "realizes", "sees", "notices", "judges"],
    examples: ["They think I'm stupid", "He knows I'm lying", "She can see I'm nervous"]
  },
  {
    name: "Fortune Telling",
    description: "Predicting negative outcomes",
    keywords: ["will", "going to", "bound to", "definitely", "certainly", "probably", "won't work"],
    examples: ["I'm going to fail", "This won't work out", "I'll definitely mess up"]
  },
  {
    name: "Catastrophizing",
    description: "Expecting the worst possible outcome",
    keywords: ["terrible", "awful", "horrible", "disaster", "catastrophe", "worst", "end of the world"],
    examples: ["This is a disaster", "It's the end of the world", "This is terrible"]
  },
  {
    name: "Emotional Reasoning",
    description: "Believing feelings reflect reality",
    keywords: ["feel", "seems", "appears", "looks like", "must be true"],
    examples: ["I feel stupid so I must be", "It feels wrong so it is", "I seem incompetent"]
  },
  {
    name: "Should Statements",
    description: "Using 'should', 'must', 'ought' statements",
    keywords: ["should", "shouldn't", "must", "mustn't", "ought", "have to", "need to"],
    examples: ["I should be better", "I must be perfect", "I have to succeed"]
  },
  {
    name: "Labeling",
    description: "Attaching negative labels to yourself or others",
    keywords: ["am", "is", "are", "loser", "idiot", "stupid", "worthless", "failure"],
    examples: ["I'm a loser", "I'm stupid", "I'm worthless", "I'm a failure"]
  },
  {
    name: "Personalization",
    description: "Taking responsibility for things outside your control",
    keywords: ["my fault", "because of me", "I caused", "I'm responsible", "I should have"],
    examples: ["It's my fault", "I caused this", "I'm responsible for their feelings"]
  }
];

const positiveKeywords = [
  "grateful", "thankful", "accomplished", "proud", "succeeded", "learned", 
  "grew", "improved", "handled", "managed", "coped", "resilient", "strong"
];

const reframingTemplates = {
  "All-or-Nothing Thinking": [
    "Instead of seeing this as completely good or bad, what's a more balanced view?",
    "What evidence exists for both sides of this situation?",
    "How might someone else see this more realistically?"
  ],
  "Overgeneralization": [
    "What evidence contradicts this generalization?",
    "When has this NOT been true in your experience?",
    "How might you describe this specific situation without generalizing?"
  ],
  "Mental Filter": [
    "What positive aspects of this situation am I overlooking?",
    "What would a balanced view of this situation include?",
    "What would I tell a friend in this same situation?"
  ],
  "Mind Reading": [
    "What evidence do I have that they're actually thinking this?",
    "What other explanations might there be for their behavior?",
    "How could I find out what they're actually thinking?"
  ],
  "Fortune Telling": [
    "What evidence supports this prediction?",
    "What other outcomes are possible?",
    "How have similar situations worked out in the past?"
  ],
  "Catastrophizing": [
    "What's the most realistic outcome here?",
    "How might I cope if this difficult situation actually happened?",
    "What's the difference between possible and probable?"
  ],
  "Emotional Reasoning": [
    "What facts support or contradict this feeling?",
    "How might my emotions be affecting my thinking right now?",
    "What would the evidence suggest if I weren't feeling this way?"
  ],
  "Should Statements": [
    "What would be a more realistic expectation?",
    "Where did this 'should' come from? Is it truly necessary?",
    "How might I reframe this as a preference rather than a demand?"
  ],
  "Labeling": [
    "What specific behaviors or actions am I referring to?",
    "How might I describe this situation without using labels?",
    "What would be a more compassionate way to view this?"
  ],
  "Personalization": [
    "What factors outside my control contributed to this situation?",
    "What percentage of responsibility realistically belongs to me?",
    "How might I separate my actions from the outcomes?"
  ]
};

export function analyzeCBTEntry(
  situation: string,
  negativeThought: string,
  emotion: string,
  emotionIntensity: number
): AnalysisResult {
  const combinedText = `${situation} ${negativeThought} ${emotion}`.toLowerCase();
  
  // Detect cognitive distortions
  const detectedDistortions: string[] = [];
  
  for (const distortion of cognitiveDistortions) {
    const hasKeywords = distortion.keywords.some(keyword => 
      combinedText.includes(keyword.toLowerCase())
    );
    
    if (hasKeywords) {
      detectedDistortions.push(distortion.name);
    }
  }
  
  // Determine severity based on emotion intensity and distortion count
  let severity: 'low' | 'moderate' | 'high' = 'low';
  if (emotionIntensity >= 8 || detectedDistortions.length >= 3) {
    severity = 'high';
  } else if (emotionIntensity >= 5 || detectedDistortions.length >= 2) {
    severity = 'moderate';
  }
  
  // Generate suggestions based on detected distortions
  const suggestions: string[] = [];
  const reframingExamples: string[] = [];
  
  if (detectedDistortions.length === 0) {
    suggestions.push(
      "Your thinking appears balanced. Consider what you learned from this experience.",
      "Focus on the coping strategies that helped you through this situation.",
      "Notice any growth or resilience you demonstrated."
    );
  } else {
    detectedDistortions.forEach(distortion => {
      const templates = reframingTemplates[distortion as keyof typeof reframingTemplates];
      if (templates) {
        reframingExamples.push(...templates.slice(0, 1)); // Take first template
      }
    });
    
    // General suggestions based on severity
    if (severity === 'high') {
      suggestions.push(
        "Consider discussing these thoughts with a mental health professional.",
        "Practice grounding techniques like deep breathing or the 5-4-3-2-1 method.",
        "Challenge these thoughts by looking for concrete evidence."
      );
    } else if (severity === 'moderate') {
      suggestions.push(
        "Try examining the evidence for and against these thoughts.",
        "Consider what you'd tell a friend in this situation.",
        "Practice self-compassion - treat yourself as kindly as you would a good friend."
      );
    } else {
      suggestions.push(
        "Continue practicing awareness of your thought patterns.",
        "Notice what's working well in your coping strategies.",
        "Acknowledge your efforts in self-reflection."
      );
    }
  }
  
  // Identify strengths
  const strengths: string[] = [];
  const hasPositiveKeywords = positiveKeywords.some(keyword => 
    combinedText.includes(keyword.toLowerCase())
  );
  
  if (hasPositiveKeywords) {
    strengths.push("You're recognizing positive aspects of your experience");
  }
  
  if (emotionIntensity <= 3) {
    strengths.push("You're managing your emotions effectively");
  }
  
  if (situation.length > 20) {
    strengths.push("You're providing detailed context, which shows good self-awareness");
  }
  
  if (detectedDistortions.length <= 1) {
    strengths.push("Your thinking appears relatively balanced");
  }
  
  // Always include this strength
  strengths.push("You're actively working on understanding your thoughts and feelings");
  
  return {
    cognitiveDistortions: detectedDistortions,
    severity,
    suggestions,
    reframingExamples,
    strengths
  };
}

export function getDetailedAnalysis(journals: ThoughtJournal[]): {
  patterns: string[];
  progress: string[];
  recommendations: string[];
  overallTrend: 'improving' | 'stable' | 'concerning';
} {
  if (journals.length === 0) {
    return {
      patterns: ["Not enough data to identify patterns"],
      progress: ["Start journaling to track your progress"],
      recommendations: ["Begin with daily thought tracking", "Practice identifying emotions", "Try reframing exercises"],
      overallTrend: 'stable'
    };
  }

  const recentJournals = journals.slice(-10); // Last 10 entries
  const averageIntensity = recentJournals.reduce((sum, j) => sum + j.emotionIntensity, 0) / recentJournals.length;
  const commonEmotions = getCommonEmotions(recentJournals);
  const reframingRate = recentJournals.filter(j => j.reframedThought).length / recentJournals.length;
  
  // Analyze intensity trend
  const firstHalf = recentJournals.slice(0, Math.floor(recentJournals.length / 2));
  const secondHalf = recentJournals.slice(Math.floor(recentJournals.length / 2));
  const firstHalfAvg = firstHalf.reduce((sum, j) => sum + j.emotionIntensity, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, j) => sum + j.emotionIntensity, 0) / secondHalf.length;
  
  const patterns = [];
  const progress = [];
  const recommendations = [];
  
  // Pattern analysis
  if (commonEmotions.length > 0) {
    patterns.push(`Most frequent emotions: ${commonEmotions.slice(0, 3).join(", ")}`);
  }
  
  if (averageIntensity >= 7) {
    patterns.push("High emotional intensity episodes are common");
  } else if (averageIntensity <= 3) {
    patterns.push("Generally low emotional intensity - good emotional regulation");
  }
  
  // Check for common cognitive distortions
  const catastrophicThoughts = recentJournals.filter(j => 
    j.negativeThought.toLowerCase().includes('always') ||
    j.negativeThought.toLowerCase().includes('never') ||
    j.negativeThought.toLowerCase().includes('worst') ||
    j.negativeThought.toLowerCase().includes('terrible')
  );
  
  if (catastrophicThoughts.length > recentJournals.length * 0.4) {
    patterns.push("Tendency towards catastrophic thinking patterns");
  }
  
  // Progress analysis
  if (secondHalfAvg < firstHalfAvg - 1) {
    progress.push("Emotional intensity has decreased over time - great progress!");
  } else if (secondHalfAvg > firstHalfAvg + 1) {
    progress.push("Emotional intensity has increased recently - consider additional support");
  } else {
    progress.push("Emotional intensity has remained stable");
  }
  
  if (reframingRate > 0.7) {
    progress.push("Excellent use of thought reframing techniques");
  } else if (reframingRate > 0.3) {
    progress.push("Good progress with thought reframing");
  } else {
    progress.push("More practice needed with thought reframing");
  }
  
  // Recommendations
  if (reframingRate < 0.5) {
    recommendations.push("Practice reframing negative thoughts more consistently");
  }
  
  if (averageIntensity > 6) {
    recommendations.push("Consider stress reduction techniques like deep breathing");
    recommendations.push("Try progressive muscle relaxation exercises");
  }
  
  if (commonEmotions.includes("anxious") || commonEmotions.includes("worried")) {
    recommendations.push("Explore grounding techniques like 5-4-3-2-1 method");
  }
  
  if (journals.length < 5) {
    recommendations.push("Continue daily journaling to build better awareness");
  }
  
  // Overall trend
  let overallTrend: 'improving' | 'stable' | 'concerning';
  if (secondHalfAvg < firstHalfAvg - 0.5 && reframingRate > 0.5) {
    overallTrend = 'improving';
  } else if (secondHalfAvg > firstHalfAvg + 1 || averageIntensity > 7) {
    overallTrend = 'concerning';
  } else {
    overallTrend = 'stable';
  }
  
  return { patterns, progress, recommendations, overallTrend };
}

function getCommonEmotions(journals: ThoughtJournal[]): string[] {
  const emotionCounts: Record<string, number> = {};
  
  journals.forEach(journal => {
    const emotion = journal.emotion.toLowerCase();
    emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
  });
  
  return Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([emotion]) => emotion);
}

export async function getInsightSummary(entries: any[]): Promise<string> {
  try {
    return await geminiAI.generateJourneyInsights(entries);
  } catch (error) {
    console.error('Error generating AI insights:', error);
    
    if (entries.length === 0) {
      return "Start journaling to see insights about your thought patterns.";
    }
    
    const recentEntries = entries.slice(0, 10); // Last 10 entries
    const allDistortions: string[] = [];
    let totalIntensity = 0;
    
    recentEntries.forEach(entry => {
      const analysis = analyzeCBTEntry(
        entry.situation || "",
        entry.negativeThought || "",
        entry.emotion || "",
        entry.emotionIntensity || 5
      );
      allDistortions.push(...analysis.cognitiveDistortions);
      totalIntensity += entry.emotionIntensity || 5;
    });
    
    const avgIntensity = totalIntensity / recentEntries.length;
    const mostCommonDistortion = getMostFrequent(allDistortions);
    
    let summary = `Over your last ${recentEntries.length} entries, `;
    
    if (avgIntensity <= 4) {
      summary += "you've been managing your emotions well with an average intensity of " + avgIntensity.toFixed(1) + ". ";
    } else if (avgIntensity <= 7) {
      summary += "your emotional intensity has been moderate (avg: " + avgIntensity.toFixed(1) + "). ";
    } else {
      summary += "you've experienced higher emotional intensity (avg: " + avgIntensity.toFixed(1) + "). ";
    }
    
    if (mostCommonDistortion) {
      summary += `The most common thought pattern to watch for is ${mostCommonDistortion}. `;
    }
    
    summary += "Keep practicing self-awareness and self-compassion.";
    
    return summary;
  }
}

function getMostFrequent(arr: string[]): string | null {
  if (arr.length === 0) return null;
  
  const frequency: { [key: string]: number } = {};
  let maxCount = 0;
  let mostFrequent = "";
  
  arr.forEach(item => {
    frequency[item] = (frequency[item] || 0) + 1;
    if (frequency[item] > maxCount) {
      maxCount = frequency[item];
      mostFrequent = item;
    }
  });
  
  return maxCount > 1 ? mostFrequent : null;
}