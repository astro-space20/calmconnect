import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, TrendingUp, Heart, Brain, Users } from "lucide-react";
import { Link } from "wouter";
import type { Activity, NutritionLog, SocialExposure, ThoughtJournal } from "@shared/schema";
import MobileLayout from "@/components/mobile-layout";
import BottomNavigation from "@/components/bottom-navigation";
import ProgressChart from "@/components/progress-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays, startOfDay } from "date-fns";

const USER_ID = "demo-user";

export default function Progress() {
  const { data: activities } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const { data: nutritionLogs } = useQuery<NutritionLog[]>({
    queryKey: ["/api/nutrition-logs"],
  });

  const { data: socialExposures } = useQuery<SocialExposure[]>({
    queryKey: ["/api/social-exposures"],
  });

  const { data: thoughtJournals } = useQuery<ThoughtJournal[]>({
    queryKey: ["/api/thought-journals"],
  });

  // Generate last 7 days of data
  const generateChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i));
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayActivities = activities?.filter(a => 
        format(new Date(a.createdAt), 'yyyy-MM-dd') === dateStr
      ) || [];
      
      const dayNutrition = nutritionLogs?.filter(n => 
        format(new Date(n.createdAt), 'yyyy-MM-dd') === dateStr
      ) || [];
      
      const daySocial = socialExposures?.filter(s => 
        format(new Date(s.createdAt), 'yyyy-MM-dd') === dateStr
      ) || [];
      
      const dayThoughts = thoughtJournals?.filter(t => 
        format(new Date(t.createdAt), 'yyyy-MM-dd') === dateStr
      ) || [];
      
      return {
        date: dateStr,
        activities: dayActivities.reduce((sum, a) => sum + (a.duration || 0), 0),
        nutrition: dayNutrition.length,
        energy: daySocial.length > 0 ? 
          daySocial.reduce((sum, s) => sum + (s.actualEnergy || s.expectedEnergy), 0) / daySocial.length : 
          0,
        thoughts: dayThoughts.length,
      };
    });
    
    return last7Days;
  };

  const chartData = generateChartData();

  const stats = {
    totalActivities: activities?.length || 0,
    totalActivityMinutes: activities?.reduce((sum, a) => sum + a.duration, 0) || 0,
    totalNutritionLogs: nutritionLogs?.length || 0,
    completedSocialExposures: socialExposures?.filter(s => s.completed)?.length || 0,
    totalThoughtJournals: thoughtJournals?.length || 0,
    averageEnergyLevel: socialExposures?.length ? 
      socialExposures.reduce((sum, s) => sum + (s.actualEnergy || s.expectedEnergy), 0) / socialExposures.length : 
      0,
  };

  return (
    <MobileLayout>
      {/* Header */}
      <header className="gradient-bg text-white p-6">
        <div className="flex items-center">
          <Link href="/">
            <a className="mr-4">
              <ArrowLeft className="w-6 h-6" />
            </a>
          </Link>
          <h1 className="text-xl font-semibold">Progress Dashboard</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 pb-24">
        
        {/* Overview Stats */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="card-shadow">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">{stats.totalActivities}</p>
                <p className="text-sm text-gray-600">Activities</p>
              </CardContent>
            </Card>
            
            <Card className="card-shadow">
              <CardContent className="p-4 text-center">
                <Heart className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">{stats.totalNutritionLogs}</p>
                <p className="text-sm text-gray-600">Nutrition Logs</p>
              </CardContent>
            </Card>
            
            <Card className="card-shadow">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 text-secondary mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">{stats.completedSocialExposures}</p>
                <p className="text-sm text-gray-600">Social Wins</p>
              </CardContent>
            </Card>
            
            <Card className="card-shadow">
              <CardContent className="p-4 text-center">
                <Brain className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">{stats.totalThoughtJournals}</p>
                <p className="text-sm text-gray-600">CBT Sessions</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Charts */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Trends (Last 7 Days)</h2>
          
          <Tabs defaultValue="activities" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="activities">Activity</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
              <TabsTrigger value="energy">Energy</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activities" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Activity Minutes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressChart 
                    data={chartData}
                    type="bar"
                    dataKey="activities"
                    color="hsl(236 69% 69%)"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="nutrition" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Nutrition Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressChart 
                    data={chartData}
                    type="bar"
                    dataKey="nutrition"
                    color="hsl(142 69% 58%)"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="energy" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Social Energy Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProgressChart 
                    data={chartData}
                    type="line"
                    dataKey="energy"
                    color="hsl(247 58% 75%)"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Insights */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Insights</h2>
          <Card className="card-shadow">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-primary rounded-full mr-3"></div>
                <span>
                  You've been active for <strong>{stats.totalActivityMinutes} minutes</strong> total
                </span>
              </div>
              
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-accent rounded-full mr-3"></div>
                <span>
                  Average social energy level: <strong>{stats.averageEnergyLevel.toFixed(1)}/10</strong>
                </span>
              </div>
              
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-secondary rounded-full mr-3"></div>
                <span>
                  You've completed <strong>{stats.completedSocialExposures}</strong> social exposures
                </span>
              </div>
              
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <span>
                  <strong>{stats.totalThoughtJournals}</strong> CBT thought restructuring sessions
                </span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Encouragement */}
        <section className="bg-gradient-to-r from-accent to-green-400 rounded-2xl p-5 text-white">
          <h2 className="text-lg font-semibold mb-3">You're Making Progress! 🌟</h2>
          <p className="text-sm mb-2">
            Every small step counts towards building resilience and managing anxiety.
          </p>
          <p className="text-sm text-green-100">
            Keep up the great work - you're stronger than you think! 💚
          </p>
        </section>

      </main>

      <BottomNavigation />
    </MobileLayout>
  );
}
