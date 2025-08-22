import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export class GeminiAIService {
  // AI Counsellor Chat
  async generateCounsellorResponse(
    userMessage: string,
    journalEntry: any = null,
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    try {
      let prompt = `You are a warm, empathetic AI wellness counsellor specializing in anxiety support and mental health. You provide:
- Compassionate, non-judgmental responses
- Evidence-based cognitive behavioral therapy techniques  
- Motivational support and encouragement
- Practical coping strategies
- Active listening and validation

Guidelines:
- Keep responses supportive and under 150 words
- Ask thoughtful follow-up questions
- Validate emotions while gently challenging negative thought patterns
- Suggest practical techniques when appropriate
- Maintain professional boundaries

Current conversation context:`;

      if (conversationHistory.length > 0) {
        prompt += `\n\nPrevious conversation:\n`;
        conversationHistory.forEach(msg => {
          prompt += `${msg.role === 'user' ? 'User' : 'Counsellor'}: ${msg.content}\n`;
        });
      }

      if (journalEntry) {
        prompt += `\n\nUser's journal entry context:
- Situation: ${journalEntry.situation}
- Negative thought: ${journalEntry.negativeThought}
- Emotion: ${journalEntry.emotion} (intensity: ${journalEntry.emotionIntensity}/10)
- Reframing attempt: ${journalEntry.reframing || 'Not yet attempted'}`;
      }

      prompt += `\n\nUser's current message: "${userMessage}"

Respond as a supportive counsellor:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini counsellor error:', error);
      return "I understand you're reaching out, and I want you to know that's a brave step. While I'm having technical difficulties right now, please remember that your feelings are valid and you're not alone in this journey.";
    }
  }

  // Thought Journal AI Analysis
  async analyzeThoughtEntry(
    situation: string,
    thoughts: string,
    emotions: string,
    behaviors: string,
    reframe?: string
  ): Promise<string> {
    const prompt = `
As a mental wellness AI assistant specializing in CBT (Cognitive Behavioral Therapy), analyze this thought journal entry and provide supportive insights:

Situation: ${situation}
Automatic Thoughts: ${thoughts}
Emotions: ${emotions}
Behaviors: ${behaviors}
${reframe ? `Reframed Thoughts: ${reframe}` : ''}

Please provide:
1. A brief validation of their feelings
2. One cognitive pattern observation (if any)
3. A gentle, encouraging insight
4. A practical suggestion for moving forward

Keep the response supportive, non-judgmental, and under 200 words. Focus on self-compassion and progress.
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini AI analysis error:', error);
      return "Your thoughts and feelings are valid. Take a moment to acknowledge your experience with kindness.";
    }
  }

  // Multi-day Journey Insights
  async generateJourneyInsights(entries: any[]): Promise<string> {
    if (!entries || entries.length === 0) {
      return "Start journaling to receive personalized insights about your thought patterns and emotional journey.";
    }

    const recentEntries = entries.slice(0, 5).map((entry, index) => 
      `Entry ${index + 1}: Situation: ${entry.situation}, Emotions: ${entry.emotions}, Thoughts: ${entry.automaticThoughts}`
    ).join('\n');

    const prompt = `
As a mental wellness AI, analyze these recent thought journal entries and provide encouraging insights about patterns and progress:

${recentEntries}

Please provide:
1. One positive pattern or growth you notice
2. A gentle observation about emotional awareness
3. An encouraging note about their self-reflection journey
4. One suggestion for continued growth

Keep the response hopeful, validating, and under 150 words. Focus on progress and self-compassion.
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini journey insights error:', error);
      return "Your commitment to self-reflection shows strength. Each journal entry is a step toward greater self-awareness.";
    }
  }

  // CBT Exercise Guidance
  async generateCBTGuidance(
    exerciseType: string,
    stage: 'pre' | 'post',
    userContext?: string
  ): Promise<{ preExerciseGuidance?: string; postExerciseCompletion?: string }> {
    const exerciseDescriptions = {
      'deep-breathing': 'deep breathing and mindfulness',
      'progressive-muscle-relaxation': 'progressive muscle relaxation',
      'grounding-5-4-3-2-1': '5-4-3-2-1 grounding technique',
      'loving-kindness': 'loving-kindness meditation'
    };

    const exerciseName = exerciseDescriptions[exerciseType as keyof typeof exerciseDescriptions] || exerciseType;

    if (stage === 'pre') {
      const prompt = `
As a supportive mental wellness coach, provide encouraging pre-exercise guidance for someone about to do ${exerciseName}.

${userContext ? `Context: ${userContext}` : ''}

Please provide:
1. A warm, encouraging opening
2. Brief reminder of the exercise benefits
3. A gentle motivation to begin
4. Simple preparation tip

Keep the response supportive, concise (under 100 words), and motivating. Focus on self-compassion and the value of taking time for self-care.
`;

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return { preExerciseGuidance: response.text() };
      } catch (error) {
        console.error('Gemini pre-exercise guidance error:', error);
        return { 
          preExerciseGuidance: "You're taking a wonderful step for your well-being. Find a comfortable space and give yourself this gift of mindfulness."
        };
      }
    } else {
      const prompt = `
As a supportive mental wellness coach, provide encouraging post-completion feedback for someone who just finished ${exerciseName}.

${userContext ? `Context: ${userContext}` : ''}

Please provide:
1. Celebration of their self-care effort
2. Brief acknowledgment of the exercise benefits
3. Encouraging note about building healthy habits
4. Gentle suggestion for future practice

Keep the response warm, validating (under 100 words), and encouraging. Focus on celebrating their commitment to self-care.
`;

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return { postExerciseCompletion: response.text() };
      } catch (error) {
        console.error('Gemini post-exercise feedback error:', error);
        return { 
          postExerciseCompletion: "Well done! You've just invested in your mental wellness. Every moment of mindfulness builds resilience."
        };
      }
    }
  }

  // Mood Check-in Support
  async generateMoodSupport(
    mood: string,
    intensity: number,
    userContext?: string
  ): Promise<{ validation: string; encouragement: string }> {
    const prompt = `
As an empathetic mental wellness AI, provide supportive validation and encouragement for someone experiencing:
Mood: ${mood}
Intensity: ${intensity}/10
${userContext ? `Context: ${userContext}` : ''}

Please provide:
1. Validation: A brief, empathetic acknowledgment of their current emotional state
2. Encouragement: A gentle, hopeful message that promotes self-compassion

Each response should be 1-2 sentences. Keep the tone warm, non-judgmental, and supportive. Focus on normalizing their experience and promoting self-care.
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to split the response into validation and encouragement
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length >= 2) {
        return {
          validation: lines[0].replace(/^(Validation:\s*|1\.\s*)/i, '').trim(),
          encouragement: lines[1].replace(/^(Encouragement:\s*|2\.\s*)/i, '').trim()
        };
      } else {
        return {
          validation: "Your feelings are completely valid and it's okay to experience them.",
          encouragement: text.trim() || "Be gentle with yourself today. You're doing the best you can."
        };
      }
    } catch (error) {
      console.error('Gemini mood support error:', error);
      return {
        validation: "Your feelings are completely valid and it's okay to experience them.",
        encouragement: "Be gentle with yourself today. You're doing the best you can."
      };
    }
  }

  // Social Exposure AI Support
  async generateSocialSupport(
    exposureType: string,
    stage: 'pre' | 'post',
    anxietyLevel?: number,
    completed?: boolean
  ): Promise<string> {
    if (stage === 'pre') {
      const prompt = `
As a supportive anxiety coach, provide encouraging pre-exposure motivation for someone about to attempt: ${exposureType}
${anxietyLevel ? `Current anxiety level: ${anxietyLevel}/10` : ''}

Please provide:
1. Validation of their courage for trying
2. Brief reminder that anxiety is normal
3. Encouraging motivation to take this step
4. Simple grounding reminder

Keep the response supportive, brief (under 80 words), and empowering. Focus on their bravery and capability.
`;

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        console.error('Gemini pre-social support error:', error);
        return "You're showing incredible courage by taking this step. It's normal to feel anxious - you've got this!";
      }
    } else {
      const prompt = `
As a supportive anxiety coach, provide encouraging post-exposure feedback for someone who attempted: ${exposureType}
${completed ? 'They completed the exposure!' : 'They attempted the exposure.'}
${anxietyLevel ? `Final anxiety level: ${anxietyLevel}/10` : ''}

Please provide:
1. Celebration of their effort and courage
2. Acknowledgment of their growth
3. Encouragement about building confidence
4. Positive note about progress

Keep the response celebratory, warm (under 80 words), and encouraging. Focus on their bravery and progress.
`;

      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error) {
        console.error('Gemini post-social support error:', error);
        return "Amazing work! Every step you take builds your confidence. You should be proud of your courage today.";
      }
    }
  }

  // Daily Encouragement
  async generateDailyEncouragement(userProgress?: any): Promise<string> {
    const prompt = `
As a supportive mental wellness AI, provide a brief daily encouragement message for someone working on their anxiety and mental wellness.

${userProgress ? `Their recent progress: ${JSON.stringify(userProgress)}` : ''}

Please provide a warm, motivating message (under 60 words) that:
1. Encourages continued self-care
2. Acknowledges their efforts
3. Promotes self-compassion
4. Inspires hope

Keep the tone uplifting and supportive.
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini daily encouragement error:', error);
      return "You're doing great work taking care of your mental wellness. Every small step matters. Be kind to yourself today.";
    }
  }
}

export const geminiAI = new GeminiAIService();