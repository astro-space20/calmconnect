// AI guidance and motivation for social exposure therapy
// Provides encouragement, coaching, and celebration for social anxiety challenges

export interface SocialExposureGuidance {
  preExposureEncouragement: string[];
  duringExposureReminders: string[];
  postExposureReflection: string[];
  difficultyAdjustments: string[];
  celebrationMessage: string;
}

export interface SocialExposureMotivation {
  encouragement: string;
  confidenceBooster: string;
  practicalTip: string;
  affirmation: string;
}

export interface ExposureContext {
  exposureType: string;
  anxietyLevel: number;
  description: string;
  isFirstTime: boolean;
  recentAttempts: number;
  successRate: number;
}

const exposureTypes = {
  conversation: {
    name: "Starting Conversations",
    encouragement: [
      "Every conversation you start is a victory over anxiety.",
      "Your voice and thoughts matter - people want to hear from you.",
      "Small talk leads to meaningful connections over time."
    ],
    tips: [
      "Start with a genuine compliment or observation about your surroundings",
      "Ask open-ended questions to keep the conversation flowing",
      "Remember: most people appreciate friendly interaction"
    ],
    affirmations: [
      "I am worthy of connection and friendship",
      "People generally respond positively to genuine interest",
      "Each conversation makes the next one easier"
    ]
  },
  public_speaking: {
    name: "Public Speaking",
    encouragement: [
      "Your message deserves to be heard by others.",
      "Nervousness shows you care about doing well - channel that energy positively.",
      "Every great speaker started with their first nervous speech."
    ],
    tips: [
      "Focus on your message rather than your anxiety",
      "Make eye contact with friendly faces in the audience",
      "Remember: people want you to succeed, not fail"
    ],
    affirmations: [
      "I have valuable insights to share with others",
      "My nervousness will transform into excitement as I speak",
      "I am becoming more confident with each speaking opportunity"
    ]
  },
  group_activities: {
    name: "Group Activities",
    encouragement: [
      "Joining groups is how we find our tribe and community.",
      "Your unique perspective adds value to any group you join.",
      "Group activities become more enjoyable as you settle in."
    ],
    tips: [
      "Arrive a few minutes early to have smaller conversations before the crowd",
      "Look for others who seem quiet or new - they often appreciate friendly approaches",
      "Focus on the activity itself rather than social performance"
    ],
    affirmations: [
      "I belong in social groups and have something to contribute",
      "Others are often feeling as nervous as I am",
      "I can find common ground with almost anyone"
    ]
  },
  social_events: {
    name: "Social Events",
    encouragement: [
      "Showing up is already a huge step toward overcoming social anxiety.",
      "Social events are practice grounds for building lasting friendships.",
      "Your comfort zone expands every time you attend social gatherings."
    ],
    tips: [
      "Have a few conversation starters ready about current events or shared interests",
      "Give yourself permission to leave early if you feel overwhelmed",
      "Look for one person to have a meaningful conversation with rather than trying to work the room"
    ],
    affirmations: [
      "I am interesting and people enjoy my company",
      "Social events are opportunities, not tests I can fail",
      "I can handle any social situation that comes my way"
    ]
  },
  phone_calls: {
    name: "Phone Calls",
    encouragement: [
      "Phone calls build confidence in your voice and communication skills.",
      "Making calls gets easier with practice - you're building a valuable life skill.",
      "Phone anxiety is common, but you're taking action to overcome it."
    ],
    tips: [
      "Write down key points you want to cover before calling",
      "Smile while talking - it changes the tone of your voice",
      "Practice the opening lines beforehand to feel more confident"
    ],
    affirmations: [
      "My voice is clear and my communication is effective",
      "Phone calls are just conversations without visual distractions",
      "I am becoming more comfortable with phone communication"
    ]
  },
  asking_for_help: {
    name: "Asking for Help",
    encouragement: [
      "Asking for help shows strength and wisdom, not weakness.",
      "Most people feel good when they can help others - you're giving them a gift.",
      "Learning to ask for help builds stronger relationships and community."
    ],
    tips: [
      "Be specific about what kind of help you need",
      "Express genuine gratitude for people's time and assistance",
      "Remember: the worst they can say is no, and that's okay"
    ],
    affirmations: [
      "It's natural and healthy to need help from others sometimes",
      "People respect those who are honest about their needs",
      "Asking for help connects me more deeply with my community"
    ]
  }
};

export function getPreExposureMotivation(context: ExposureContext): SocialExposureMotivation {
  const exposureData = getExposureTypeData(context.exposureType);
  
  let encouragement = getRandomItem(exposureData.encouragement);
  let practicalTip = getRandomItem(exposureData.tips);
  let affirmation = getRandomItem(exposureData.affirmations);
  let confidenceBooster = "You've got this! Trust in your ability to navigate this social situation.";

  // Adjust based on anxiety level
  if (context.anxietyLevel >= 8) {
    encouragement = "It's okay to feel anxious - that means you're pushing your comfort zone. " + encouragement;
    confidenceBooster = "High anxiety shows you're being brave. Start small and be proud of any progress.";
    practicalTip = "Take deep breaths and remember you can always excuse yourself if needed. " + practicalTip;
  } else if (context.anxietyLevel >= 6) {
    encouragement = "Some nervousness is normal and shows you care about the outcome. " + encouragement;
    confidenceBooster = "You're building courage with each social step you take.";
  } else if (context.anxietyLevel <= 3) {
    encouragement = "You're feeling confident today - that's wonderful! " + encouragement;
    confidenceBooster = "Your calm energy will help others feel comfortable around you too.";
    practicalTip = "Since you're feeling good, consider challenging yourself a bit more. " + practicalTip;
  }

  // Adjust based on experience
  if (context.isFirstTime) {
    encouragement = "First times are always the hardest - you're being incredibly brave. " + encouragement;
    confidenceBooster = "Every expert was once a beginner. You're taking the most important step.";
  } else if (context.recentAttempts >= 3) {
    if (context.successRate >= 0.7) {
      encouragement = "You're building a great track record with these exposures! " + encouragement;
      confidenceBooster = "Your consistency is paying off - you're becoming naturally more confident.";
    } else {
      encouragement = "Practice makes progress, and you're showing real commitment. " + encouragement;
      confidenceBooster = "Each attempt teaches you something valuable, regardless of the outcome.";
    }
  }

  return {
    encouragement,
    confidenceBooster,
    practicalTip,
    affirmation
  };
}

export function getPostExposureSupport(
  context: ExposureContext,
  completed: boolean,
  beforeAnxiety: number,
  afterAnxiety: number,
  notes?: string
): {
  celebration: string;
  reflection: string[];
  learnings: string[];
  nextSteps: string[];
} {
  const exposureData = getExposureTypeData(context.exposureType);
  const anxietyReduction = beforeAnxiety - afterAnxiety;
  
  let celebration = "You did it! Every social step forward matters.";
  const reflection: string[] = [];
  const learnings: string[] = [];
  const nextSteps: string[] = [];

  if (completed) {
    if (anxietyReduction >= 3) {
      celebration = "Wow! You not only completed the exposure but felt much better afterward. That's amazing progress!";
      reflection.push("Notice how your anxiety decreased significantly during this experience");
      learnings.push("Your body and mind learned that this social situation was manageable");
      nextSteps.push("Consider trying a similar exposure again to reinforce this positive experience");
    } else if (anxietyReduction >= 1) {
      celebration = "Great job! You completed the exposure and your anxiety improved somewhat.";
      reflection.push("You experienced some anxiety relief, which shows your coping skills are working");
      learnings.push("Even small reductions in anxiety are meaningful victories");
      nextSteps.push("Build on this success with regular practice of similar exposures");
    } else if (anxietyReduction <= -1) {
      celebration = "You completed the exposure despite feeling more anxious - that shows real courage!";
      reflection.push("Sometimes anxiety increases during exposures, and that's completely normal");
      learnings.push("Completing something despite increased anxiety builds tremendous resilience");
      nextSteps.push("Consider what made this more challenging and how to adjust for next time");
    } else {
      celebration = "You followed through with your commitment - that's what matters most!";
      reflection.push("Maintaining steady anxiety levels during new social situations shows you're managing well");
      learnings.push("Consistency in your anxiety response indicates growing emotional regulation");
      nextSteps.push("Continue with regular exposures to build lasting confidence");
    }
  } else {
    celebration = "You attempted the exposure, and that courage deserves recognition.";
    reflection.push("Not completing an exposure doesn't erase the bravery it took to try");
    reflection.push("Sometimes stepping back is the right choice for your wellbeing");
    learnings.push("You learned something about your current comfort zone and limits");
    learnings.push("Incomplete exposures still contribute to your overall growth journey");
    nextSteps.push("Consider what adjustments might make this exposure more manageable");
    nextSteps.push("Try a slightly easier version of this exposure when you're ready");
  }

  // Add type-specific insights
  if (context.exposureType === "conversation") {
    if (completed) {
      learnings.push("You practiced the fundamental skill of human connection");
      nextSteps.push("Try initiating conversations in different settings to generalize this skill");
    }
  } else if (context.exposureType === "public_speaking") {
    if (completed) {
      learnings.push("You overcame one of the most common fears and shared your voice");
      nextSteps.push("Consider joining a speaking group like Toastmasters for regular practice");
    }
  } else if (context.exposureType === "group_activities") {
    if (completed) {
      learnings.push("You practiced being part of a community, which is essential for wellbeing");
      nextSteps.push("Look for regular group activities to build ongoing social connections");
    }
  }

  // Add experience-based insights
  if (context.isFirstTime && completed) {
    learnings.push("You've proven to yourself that you can try new social challenges");
    nextSteps.push("First successes often make subsequent attempts much easier");
  }

  return {
    celebration,
    reflection,
    learnings,
    nextSteps
  };
}

export function getDailyExposureMotivation(
  recentExposures: Array<{ completed: boolean; anxietyBefore: number; createdAt: Date }>,
  userName?: string
): string {
  const today = new Date().toDateString();
  const todayExposures = recentExposures.filter(
    exp => new Date(exp.createdAt).toDateString() === today
  );
  
  const weekExposures = recentExposures.filter(
    exp => new Date(exp.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );

  const completedToday = todayExposures.filter(exp => exp.completed).length;
  const completedThisWeek = weekExposures.filter(exp => exp.completed).length;
  
  const prefix = userName && userName !== "Guest User" ? `${userName}, ` : "";

  if (completedToday >= 2) {
    return `${prefix}you're on fire today! Two social exposures completed shows real dedication to growth.`;
  } else if (completedToday === 1) {
    return `${prefix}great job completing a social exposure today! Your confidence is building.`;
  } else if (completedThisWeek >= 3) {
    return `${prefix}you've been consistently working on social exposures this week. That persistence will pay off!`;
  } else if (completedThisWeek >= 1) {
    return `${prefix}you made progress this week with social exposures. Keep that momentum going!`;
  } else {
    return `${prefix}social exposures are one of the most effective ways to build confidence. When you're ready, even small steps make a big difference.`;
  }
}

function getExposureTypeData(exposureType: string) {
  // Match exposure type to our predefined categories
  const type = exposureType.toLowerCase();
  
  if (type.includes('conversation') || type.includes('talk')) {
    return exposureTypes.conversation;
  } else if (type.includes('speaking') || type.includes('present')) {
    return exposureTypes.public_speaking;
  } else if (type.includes('group') || type.includes('activity') || type.includes('class')) {
    return exposureTypes.group_activities;
  } else if (type.includes('event') || type.includes('party') || type.includes('gathering')) {
    return exposureTypes.social_events;
  } else if (type.includes('call') || type.includes('phone')) {
    return exposureTypes.phone_calls;
  } else if (type.includes('help') || type.includes('ask')) {
    return exposureTypes.asking_for_help;
  } else {
    // Default to conversation for unknown types
    return exposureTypes.conversation;
  }
}

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}