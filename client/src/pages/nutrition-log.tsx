import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus } from "lucide-react";
import { Link } from "wouter";
import type { NutritionLog } from "@shared/schema";
import MobileLayout from "@/components/mobile-layout";
import BottomNavigation from "@/components/bottom-navigation";
import NutritionForm from "@/components/nutrition-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const USER_ID = "demo-user";

export default function NutritionLog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: nutritionLogs, isLoading } = useQuery<NutritionLog[]>({
    queryKey: ["/api/nutrition-logs"],
  });

  const handleNutritionSaved = () => {
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading nutrition logs...</p>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      {/* Header */}
      <header className="gradient-bg text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <a className="mr-4">
                <ArrowLeft className="w-6 h-6" />
              </a>
            </Link>
            <h1 className="text-xl font-semibold">Nutrition Log</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm" className="bg-white bg-opacity-20 hover:bg-opacity-30">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm mx-auto">
              <DialogHeader>
                <DialogTitle>Log Nutrition</DialogTitle>
              </DialogHeader>
              <NutritionForm onSuccess={handleNutritionSaved} />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 pb-24">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Your Nutrition</h2>
          <p className="text-sm text-gray-600">
            Track meals with mood-supportive nutrients to nourish your mental wellness.
          </p>
        </div>

        {!nutritionLogs?.length ? (
          <Card className="text-center py-8">
            <CardContent>
              <div className="w-16 h-16 bg-calm-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-medium mb-2">No nutrition logs yet</h3>
              <p className="text-gray-600 mb-4">
                Start tracking your meals to see how nutrition affects your mood!
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-bg">Log Your First Meal</Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm mx-auto">
                  <DialogHeader>
                    <DialogTitle>Log Nutrition</DialogTitle>
                  </DialogHeader>
                  <NutritionForm onSuccess={handleNutritionSaved} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {nutritionLogs.map((log) => (
              <Card key={log.id} className="card-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base capitalize">{log.mealType}</CardTitle>
                    <span className="text-sm text-gray-500">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {log.protein > 0 && <Badge variant="secondary">Protein: {log.protein}/3</Badge>}
                    {log.complexCarbs > 0 && <Badge variant="secondary">Carbs: {log.complexCarbs}/3</Badge>}
                    {log.healthyFats > 0 && <Badge variant="secondary">Fats: {log.healthyFats}/3</Badge>}
                    {log.omega3 > 0 && <Badge variant="secondary">Omega-3: {log.omega3}/3</Badge>}
                    {log.magnesium > 0 && <Badge variant="secondary">Magnesium: {log.magnesium}/3</Badge>}
                    {log.bVitamins > 0 && <Badge variant="secondary">B-Vitamins: {log.bVitamins}/3</Badge>}
                  </div>
                  {log.notes && (
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2">
                      {log.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </MobileLayout>
  );
}
