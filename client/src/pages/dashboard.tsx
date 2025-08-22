import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Activity, Apple, Users, Brain, Plus, Heart, Trophy, CheckCircle, TrendingUp } from "lucide-react";
import type { Activity as ActivityType, NutritionLog, SocialExposure } from "@shared/schema";
import MobileLayout from "@/components/mobile-layout";
import BottomNavigation from "@/components/bottom-navigation";
import MoodSelector from "@/components/mood-selector";


// Mock user ID for demo
const USER_ID = "demo-user";

export default function Dashboard() {
  const [selectedMood, setSelectedMood] = useState<string>();

  const { data: activities } = useQuery<ActivityType[]>({
    queryKey: ["/api/activities"],
  });

  const { data: nutritionLogs } = useQuery<NutritionLog[]>({
    queryKey: ["/api/nutrition-logs"],
  });

  const { data: socialExposures } = useQuery<SocialExposure[]>({
    queryKey: ["/api/social-exposures"],
  });

  const todayActivities = activities?.filter(
    activity => new Date(activity.createdAt).toDateString() === new Date().toDateString()
  ) || [];

  const todayNutrition = nutritionLogs?.filter(
    log => new Date(log.createdAt).toDateString() === new Date().toDateString()
  ) || [];

  const weeklyActivities = activities?.slice(0, 7) || [];
  const completedSocial = socialExposures?.filter(exp => exp.completed) || [];

  return (
    <MobileLayout>
      {/* Header */}
      <header className="gradient-bg text-white p-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">Good morning, Sarah</h1>
            <p className="text-blue-100 text-sm">How are you feeling today?</p>
          </div>
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <MoodSelector onSelect={setSelectedMood} selectedMood={selectedMood} />
      </header>

      {/* Main Content */}
      <main className="px-6 pb-24 -mt-4">
        
        {/* Today's Progress */}
        <section className="bg-white rounded-2xl p-5 mb-6 card-shadow animate-fade-in">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Today's Progress</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 relative">
                <div className="w-full h-full bg-calm-blue rounded-full flex items-center justify-center">
                  <Activity className="text-primary w-6 h-6" />
                </div>
                {todayActivities.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <CheckCircle className="text-white w-3 h-3" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-600">Activity</p>
              <p className="text-sm font-medium text-gray-800">
                {todayActivities.length > 0 
                  ? todayActivities[0].steps 
                    ? `${todayActivities[0].steps.toLocaleString()} steps`
                    : `${todayActivities[0].duration || 0} min ${todayActivities[0].type}`
                  : "No activity yet"
                }
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2">
                <div className="w-full h-full bg-calm-green rounded-full flex items-center justify-center">
                  <Apple className="text-accent w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-gray-600">Nutrition</p>
              <p className="text-sm font-medium text-gray-800">
                {todayNutrition.length}/3 meals
              </p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-calm-purple rounded-xl">
            <p className="text-sm text-gray-700">
              <Heart className="text-primary w-4 h-4 inline mr-2" />
              You're doing great! Small steps count.
            </p>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <Link href="/activity">
              <a className="bg-white rounded-2xl p-4 card-shadow text-left hover:scale-105 transition-transform block">
                <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-xl flex items-center justify-center mb-3">
                  <Activity className="text-primary w-6 h-6" />
                </div>
                <h3 className="font-medium text-gray-800 mb-1">Log Activity</h3>
                <p className="text-xs text-gray-600">Track your movement</p>
              </a>
            </Link>
            
            <Link href="/social">
              <a className="bg-white rounded-2xl p-4 card-shadow text-left hover:scale-105 transition-transform block">
                <div className="w-12 h-12 bg-secondary bg-opacity-10 rounded-xl flex items-center justify-center mb-3">
                  <Users className="text-secondary w-6 h-6" />
                </div>
                <h3 className="font-medium text-gray-800 mb-1">Social Check</h3>
                <p className="text-xs text-gray-600">Before/after energy</p>
              </a>
            </Link>
            
            <Link href="/cbt-exercises">
              <a className="bg-white rounded-2xl p-4 card-shadow text-left hover:scale-105 transition-transform block">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-3">
                  <Brain className="text-indigo-600 w-6 h-6" />
                </div>
                <h3 className="font-medium text-gray-800 mb-1">CBT Exercises</h3>
                <p className="text-xs text-gray-600">Guided audio therapy</p>
              </a>
            </Link>
            
            <Link href="/journal">
              <a className="bg-white rounded-2xl p-4 card-shadow text-left hover:scale-105 transition-transform block">
                <div className="w-12 h-12 bg-accent bg-opacity-10 rounded-xl flex items-center justify-center mb-3">
                  <Brain className="text-accent w-6 h-6" />
                </div>
                <h3 className="font-medium text-gray-800 mb-1">Thought Journal</h3>
                <p className="text-xs text-gray-600">CBT reframing</p>
              </a>
            </Link>

            <Link href="/achievements">
              <a className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 card-shadow text-left hover:scale-105 transition-transform block">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-3">
                  <Trophy className="text-white w-6 h-6" />
                </div>
                <h3 className="font-medium text-white mb-1">Achievements</h3>
                <p className="text-xs text-white opacity-90">Track milestones</p>
              </a>
            </Link>

            <Link href="/progress">
              <a className="bg-white rounded-2xl p-4 card-shadow text-left hover:scale-105 transition-transform block">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <TrendingUp className="text-blue-600 w-6 h-6" />
                </div>
                <h3 className="font-medium text-gray-800 mb-1">Progress</h3>
                <p className="text-xs text-gray-600">View analytics</p>
              </a>
            </Link>
          </div>
        </section>

        {/* Weekly Progress */}
        <section className="bg-white rounded-2xl p-5 mb-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">This Week</h2>
            <Link href="/progress">
              <a className="text-primary text-sm font-medium">View All</a>
            </Link>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">Activity Minutes</p>
            <div className="flex items-end justify-between h-16">
              {Array.from({ length: 7 }).map((_, index) => {
                const activity = weeklyActivities[index];
                const height = activity ? Math.max(activity.duration / 2, 10) : 10;
                const hasActivity = !!activity;
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className={`w-6 rounded-t-lg mb-2 ${hasActivity ? 'bg-primary' : 'bg-gray-200'}`}
                      style={{ height: `${height}px` }}
                    />
                    <span className="text-xs text-gray-500">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-3">Social Energy Levels</p>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-secondary h-2 rounded-full" style={{ width: "65%" }} />
              </div>
              <span className="text-sm font-medium text-secondary">6.5/10</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">↗️ Improving from last week</p>
          </div>
        </section>

        {/* Recent Wins */}
        <section className="bg-gradient-to-r from-accent to-green-400 rounded-2xl p-5 mb-6 text-white">
          <div className="flex items-center mb-3">
            <Trophy className="text-yellow-300 w-5 h-5 mr-2" />
            <h2 className="text-lg font-semibold">Recent Wins</h2>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 mr-2 text-green-200" />
              <span>Completed {weeklyActivities.length} activities this week</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 mr-2 text-green-200" />
              <span>Had {completedSocial.length} social interactions</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="w-4 h-4 mr-2 text-green-200" />
              <span>Logged nutrition {todayNutrition.length} times today</span>
            </div>
          </div>
          
          <p className="text-sm mt-3 text-green-100">
            You're building resilience one step at a time. Be proud! 💚
          </p>
        </section>

      </main>

      {/* Floating Action Button */}
      <Link href="/activity">
        <a className="fixed bottom-20 right-6 w-14 h-14 gradient-bg rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform animate-gentle-pulse">
          <Plus className="w-6 h-6" />
        </a>
      </Link>

      <BottomNavigation />
    </MobileLayout>
  );
}
