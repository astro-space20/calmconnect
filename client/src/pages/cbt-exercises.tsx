import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, Clock } from "lucide-react";
import { Link } from "wouter";
import MobileLayout from "@/components/mobile-layout";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface CBTExercise {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  category: "breathing" | "mindfulness" | "grounding" | "cognitive";
  difficulty: "beginner" | "intermediate" | "advanced";
  steps: CBTStep[];
}

interface CBTStep {
  id: string;
  instruction: string;
  duration: number; // in seconds
  audioText: string;
  type: "instruction" | "breathing" | "reflection" | "action";
}

const cbtExercises: CBTExercise[] = [
  {
    id: "box-breathing",
    title: "Box Breathing",
    description: "A calming breathing technique to reduce anxiety and stress",
    duration: 5,
    category: "breathing",
    difficulty: "beginner",
    steps: [
      {
        id: "intro",
        instruction: "Find a comfortable position and close your eyes",
        duration: 10,
        audioText: "Welcome to box breathing. Find a comfortable position, either sitting or lying down. Close your eyes and let your body relax.",
        type: "instruction"
      },
      {
        id: "inhale",
        instruction: "Breathe in slowly for 4 counts",
        duration: 4,
        audioText: "Breathe in slowly through your nose. One... two... three... four.",
        type: "breathing"
      },
      {
        id: "hold1",
        instruction: "Hold your breath for 4 counts",
        duration: 4,
        audioText: "Hold your breath gently. One... two... three... four.",
        type: "breathing"
      },
      {
        id: "exhale",
        instruction: "Exhale slowly for 4 counts",
        duration: 4,
        audioText: "Exhale slowly through your mouth. One... two... three... four.",
        type: "breathing"
      },
      {
        id: "hold2",
        instruction: "Hold empty for 4 counts",
        duration: 4,
        audioText: "Hold with empty lungs. One... two... three... four.",
        type: "breathing"
      }
    ]
  },
  {
    id: "54321-grounding",
    title: "5-4-3-2-1 Grounding",
    description: "Use your senses to ground yourself in the present moment",
    duration: 8,
    category: "grounding",
    difficulty: "beginner",
    steps: [
      {
        id: "intro",
        instruction: "This technique uses your five senses to bring you back to the present",
        duration: 15,
        audioText: "This is the 5-4-3-2-1 grounding technique. We'll use your five senses to anchor you in the present moment and reduce anxiety.",
        type: "instruction"
      },
      {
        id: "sight",
        instruction: "Look around and identify 5 things you can see",
        duration: 60,
        audioText: "Look around you and identify 5 things you can see. Take your time. Notice their colors, shapes, and textures. Name them in your mind.",
        type: "action"
      },
      {
        id: "touch",
        instruction: "Identify 4 things you can touch or feel",
        duration: 45,
        audioText: "Now identify 4 things you can touch or feel. This might be your clothes, a chair, the temperature of the air, or the ground beneath your feet.",
        type: "action"
      },
      {
        id: "sound",
        instruction: "Listen for 3 sounds around you",
        duration: 45,
        audioText: "Listen carefully and identify 3 sounds around you. Maybe it's traffic, birds, air conditioning, or voices in the distance.",
        type: "action"
      },
      {
        id: "smell",
        instruction: "Notice 2 things you can smell",
        duration: 30,
        audioText: "Try to identify 2 things you can smell. This might be coffee, perfume, fresh air, or any scent in your environment.",
        type: "action"
      },
      {
        id: "taste",
        instruction: "Notice 1 thing you can taste",
        duration: 20,
        audioText: "Finally, notice 1 thing you can taste. This might be gum, coffee, or just the taste in your mouth right now.",
        type: "action"
      }
    ]
  },
  {
    id: "thought-challenging",
    title: "Thought Challenging",
    description: "Question and reframe negative thought patterns",
    duration: 10,
    category: "cognitive",
    difficulty: "intermediate",
    steps: [
      {
        id: "identify",
        instruction: "Identify the negative thought that's troubling you",
        duration: 60,
        audioText: "Think about what's been bothering you. What specific thought or worry keeps coming up? Take a moment to clearly identify this thought.",
        type: "reflection"
      },
      {
        id: "evidence",
        instruction: "What evidence do you have that this thought is true?",
        duration: 90,
        audioText: "Now ask yourself: What actual evidence do I have that this thought is true? Look for facts, not feelings or assumptions.",
        type: "reflection"
      },
      {
        id: "counter-evidence",
        instruction: "What evidence suggests this thought might not be completely true?",
        duration: 90,
        audioText: "Consider the other side. What evidence suggests this thought might not be completely true or accurate? Have there been times when similar thoughts were wrong?",
        type: "reflection"
      },
      {
        id: "reframe",
        instruction: "Create a more balanced, realistic thought",
        duration: 90,
        audioText: "Now, create a more balanced thought. What would you tell a friend in this situation? What's a more realistic way to think about this?",
        type: "reflection"
      },
      {
        id: "practice",
        instruction: "Practice this new thought and notice how you feel",
        duration: 60,
        audioText: "Repeat this new, more balanced thought to yourself. Notice how it feels different in your body. This is your new go-to thought for this situation.",
        type: "reflection"
      }
    ]
  },
  {
    id: "body-scan",
    title: "Progressive Muscle Relaxation",
    description: "Release tension by systematically relaxing your body",
    duration: 12,
    category: "mindfulness",
    difficulty: "beginner",
    steps: [
      {
        id: "setup",
        instruction: "Lie down or sit comfortably and close your eyes",
        duration: 20,
        audioText: "Find a comfortable position, either lying down or sitting in a chair. Close your eyes and take three deep breaths.",
        type: "instruction"
      },
      {
        id: "feet",
        instruction: "Focus on your feet. Tense for 5 seconds, then relax",
        duration: 15,
        audioText: "Start with your feet. Curl your toes and tense your feet. Hold... and release. Feel the tension flowing away.",
        type: "action"
      },
      {
        id: "legs",
        instruction: "Tense your leg muscles, then relax",
        duration: 15,
        audioText: "Now your legs. Tighten your calf and thigh muscles. Hold the tension... and let it go. Feel your legs becoming heavy and relaxed.",
        type: "action"
      },
      {
        id: "abdomen",
        instruction: "Tense your stomach muscles, then relax",
        duration: 15,
        audioText: "Tense your stomach muscles. Pull them in tight. Hold... and release. Let your breathing become natural and easy.",
        type: "action"
      },
      {
        id: "hands",
        instruction: "Make fists with your hands, then relax",
        duration: 15,
        audioText: "Make tight fists with your hands. Feel the tension in your hands and forearms. Hold... and let go. Let your hands fall naturally.",
        type: "action"
      },
      {
        id: "shoulders",
        instruction: "Raise your shoulders to your ears, then drop them",
        duration: 15,
        audioText: "Raise your shoulders up to your ears. Hold the tension... and drop them down. Feel the weight falling away.",
        type: "action"
      },
      {
        id: "face",
        instruction: "Scrunch your face muscles, then relax",
        duration: 15,
        audioText: "Scrunch up your face. Squeeze your eyes, furrow your brow. Hold... and let everything soften. Feel your face becoming peaceful.",
        type: "action"
      },
      {
        id: "complete",
        instruction: "Notice your whole body relaxed and at peace",
        duration: 60,
        audioText: "Now notice your whole body. Feel how relaxed and heavy it is. Take a few moments to enjoy this feeling of complete relaxation.",
        type: "reflection"
      }
    ]
  }
];

export default function CBTExercises() {
  const [selectedExercise, setSelectedExercise] = useState<CBTExercise | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Text-to-speech function
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Try to use a calm, female voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') ||
        voice.name.includes('Karen') ||
        voice.gender === 'female'
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Start exercise
  const startExercise = (exercise: CBTExercise) => {
    setSelectedExercise(exercise);
    setCurrentStepIndex(0);
    setIsPlaying(true);
    setIsPaused(false);
    setProgress(0);
    
    const firstStep = exercise.steps[0];
    setTimeRemaining(firstStep.duration);
    speak(firstStep.audioText);
    
    startTimer(firstStep.duration);
  };

  // Timer management
  const startTimer = (duration: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    let timeLeft = duration;
    setTimeRemaining(timeLeft);
    
    intervalRef.current = setInterval(() => {
      timeLeft -= 1;
      setTimeRemaining(timeLeft);
      
      if (selectedExercise) {
        const totalDuration = selectedExercise.steps[currentStepIndex].duration;
        setProgress(((totalDuration - timeLeft) / totalDuration) * 100);
      }
      
      if (timeLeft <= 0) {
        clearInterval(intervalRef.current!);
        nextStep();
      }
    }, 1000);
  };

  // Next step
  const nextStep = () => {
    if (!selectedExercise) return;
    
    const nextIndex = currentStepIndex + 1;
    
    if (nextIndex >= selectedExercise.steps.length) {
      // Exercise completed
      setIsPlaying(false);
      speak("Great job! You've completed this exercise. Take a moment to notice how you feel.");
      return;
    }
    
    setCurrentStepIndex(nextIndex);
    const nextStepData = selectedExercise.steps[nextIndex];
    setTimeRemaining(nextStepData.duration);
    setProgress(0);
    
    // Brief pause before next instruction
    setTimeout(() => {
      speak(nextStepData.audioText);
      startTimer(nextStepData.duration);
    }, 1000);
  };

  // Pause/Resume
  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      startTimer(timeRemaining);
      window.speechSynthesis.resume();
    } else {
      setIsPaused(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.speechSynthesis.pause();
    }
  };

  // Reset exercise
  const resetExercise = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    window.speechSynthesis.cancel();
    setSelectedExercise(null);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setTimeRemaining(0);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors = {
      breathing: "bg-blue-100 text-blue-800",
      mindfulness: "bg-green-100 text-green-800",
      grounding: "bg-purple-100 text-purple-800",
      cognitive: "bg-orange-100 text-orange-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: "bg-green-500",
      intermediate: "bg-yellow-500",
      advanced: "bg-red-500"
    };
    return colors[difficulty as keyof typeof colors] || "bg-gray-500";
  };

  if (selectedExercise && isPlaying) {
    const currentStep = selectedExercise.steps[currentStepIndex];
    const totalSteps = selectedExercise.steps.length;
    const overallProgress = ((currentStepIndex + 1) / totalSteps) * 100;

    return (
      <MobileLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="sm" onClick={resetExercise}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            <h1 className="text-lg font-semibold text-gray-800">
              {selectedExercise.title}
            </h1>
            <div className="w-16" /> {/* Spacer */}
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStepIndex + 1} of {totalSteps}</span>
              <span>{Math.ceil(timeRemaining)}s remaining</span>
            </div>
            <Progress value={progress} className="mb-2" />
            <Progress value={overallProgress} className="h-2 opacity-50" />
          </div>

          {/* Current Instruction */}
          <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {currentStep.instruction}
              </h2>
              <div className="flex items-center justify-center text-2xl font-mono text-primary">
                <Clock className="w-6 h-6 mr-2" />
                {Math.ceil(timeRemaining)}s
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            <Button
              size="lg"
              variant={isPaused ? "default" : "secondary"}
              onClick={togglePause}
              className="flex items-center space-x-2"
            >
              {isPaused ? (
                <><Play className="w-5 h-5" /> <span>Resume</span></>
              ) : (
                <><Pause className="w-5 h-5" /> <span>Pause</span></>
              )}
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              onClick={resetExercise}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset</span>
            </Button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      {/* Header */}
      <header className="gradient-bg text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/">
            <a className="flex items-center text-white">
              <ArrowLeft className="w-6 h-6 mr-2" />
            </a>
          </Link>
          <h1 className="text-xl font-semibold">CBT Exercises</h1>
          <div className="w-8" />
        </div>
        <p className="text-blue-100 text-sm">
          Guided cognitive behavioral therapy exercises with audio support
        </p>
      </header>

      {/* Main Content */}
      <main className="px-6 pb-24 -mt-4">
        <div className="space-y-6">
          {cbtExercises.map((exercise) => (
            <Card key={exercise.id} className="card-shadow hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{exercise.title}</CardTitle>
                    <p className="text-gray-600 text-sm mb-3">{exercise.description}</p>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getCategoryColor(exercise.category)}>
                        {exercise.category}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getDifficultyColor(exercise.difficulty)}`} />
                        <span className="text-xs text-gray-500 capitalize">{exercise.difficulty}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {exercise.duration} min • {exercise.steps.length} steps
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Button 
                  className="w-full gradient-bg hover:opacity-90"
                  onClick={() => startExercise(exercise)}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Exercise
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Volume2 className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800 mb-1">Audio Guidance</h3>
                <p className="text-sm text-blue-700">
                  These exercises include voice guidance to help you through each step. 
                  Make sure your device volume is on and find a quiet space.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </MobileLayout>
  );
}