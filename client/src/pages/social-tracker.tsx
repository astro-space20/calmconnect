import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, CheckCircle, Brain } from "lucide-react";
import { Link } from "wouter";
import type { SocialExposure } from "@shared/schema";
import MobileLayout from "@/components/mobile-layout";
import BottomNavigation from "@/components/bottom-navigation";
import SocialForm from "@/components/social-form";
import { PreExposureMotivation, PostExposureFeedback } from "@/components/social-exposure-ai";
import DailySocialMotivation from "@/components/daily-social-motivation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const USER_ID = "demo-user";

export default function SocialTracker() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [completingExposure, setCompletingExposure] = useState<SocialExposure | null>(null);
  const [actualEnergy, setActualEnergy] = useState([5]);
  const [wentWell, setWentWell] = useState("");
  const [tryDifferently, setTryDifferently] = useState("");
  const [showMotivation, setShowMotivation] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: socialExposures, isLoading } = useQuery<SocialExposure[]>({
    queryKey: ["/api/social-exposures"],
  });

  const completeMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SocialExposure> }) => {
      const response = await apiRequest("PATCH", `/api/social-exposures/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-exposures"] });
      toast({
        title: "Social exposure completed!",
        description: "You stepped out of your comfort zone. That's a win!",
      });
      setCompletingExposure(null);
      setWentWell("");
      setTryDifferently("");
      setActualEnergy([5]);
      setShowFeedback(completingExposure.id);
    },
  });

  const handleSocialSaved = () => {
    setIsDialogOpen(false);
  };

  const handleCompleteExposure = (exposure: SocialExposure) => {
    setCompletingExposure(exposure);
    setActualEnergy([exposure.expectedEnergy]);
  };

  const submitCompletion = () => {
    if (!completingExposure) return;
    
    completeMutation.mutate({
      id: completingExposure.id,
      updates: {
        actualEnergy: actualEnergy[0],
        wentWell,
        tryDifferently,
        completed: 1,
      },
    });
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading social exposures...</p>
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
            <h1 className="text-xl font-semibold">Social Tracker</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm" className="bg-white bg-opacity-20 hover:bg-opacity-30">
                <Plus className="w-4 h-4 mr-2" />
                Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm mx-auto">
              <DialogHeader>
                <DialogTitle>Plan Social Exposure</DialogTitle>
              </DialogHeader>
              <SocialForm onSuccess={handleSocialSaved} />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 pb-24">
        {/* Daily Social Motivation */}
        <DailySocialMotivation />
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Social Exposures</h2>
          <p className="text-sm text-gray-600">
            Plan and track social interactions to gradually build confidence.
          </p>
        </div>

        {!socialExposures?.length ? (
          <Card className="text-center py-8">
            <CardContent>
              <div className="w-16 h-16 bg-calm-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No social exposures yet</h3>
              <p className="text-gray-600 mb-4">
                Start planning social interactions to track your energy and growth!
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-bg">Plan Your First Exposure</Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm mx-auto">
                  <DialogHeader>
                    <DialogTitle>Plan Social Exposure</DialogTitle>
                  </DialogHeader>
                  <SocialForm onSuccess={handleSocialSaved} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {socialExposures.map((exposure) => (
              <Card key={exposure.id} className="card-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{exposure.title}</CardTitle>
                    {exposure.completed ? (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowFeedback(exposure.id)}
                        >
                          <Brain className="w-3 h-3 mr-1" />
                          Feedback
                        </Button>
                        <Badge className="bg-accent text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Done
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowMotivation(exposure.id)}
                        >
                          <Brain className="w-3 h-3 mr-1" />
                          AI Support
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompleteExposure(exposure)}
                        >
                          Complete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Expected Energy:</span>
                      <span className="font-medium">{exposure.expectedEnergy}/10</span>
                    </div>
                    {exposure.actualEnergy && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Actual Energy:</span>
                        <span className="font-medium">{exposure.actualEnergy}/10</span>
                      </div>
                    )}
                    {exposure.feelings && (
                      <div className="text-sm">
                        <span className="text-gray-600">Feelings:</span>
                        <span className="ml-2">{exposure.feelings}</span>
                      </div>
                    )}
                    {exposure.wentWell && (
                      <div className="bg-green-50 rounded-lg p-2">
                        <p className="text-xs text-gray-600 mb-1">What went well:</p>
                        <p className="text-sm text-gray-700">{exposure.wentWell}</p>
                      </div>
                    )}
                    {exposure.tryDifferently && (
                      <div className="bg-blue-50 rounded-lg p-2">
                        <p className="text-xs text-gray-600 mb-1">Try differently:</p>
                        <p className="text-sm text-gray-700">{exposure.tryDifferently}</p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(exposure.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* AI Motivation Dialog */}
        {showMotivation && (
          <Dialog open={!!showMotivation} onOpenChange={() => setShowMotivation(null)}>
            <DialogContent className="max-w-sm mx-auto max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>AI Motivation & Support</DialogTitle>
              </DialogHeader>
              {(() => {
                const exposure = socialExposures?.find(e => e.id === showMotivation);
                if (!exposure) return null;
                
                return (
                  <PreExposureMotivation
                    exposureType={exposure.exposureType}
                    anxietyLevel={exposure.anxietyBefore}
                    description={exposure.description || ""}
                    isFirstTime={!socialExposures.some(e => e.exposureType === exposure.exposureType && e.id !== exposure.id)}
                  />
                );
              })()}
            </DialogContent>
          </Dialog>
        )}

        {/* AI Feedback Dialog */}
        {showFeedback && (
          <Dialog open={!!showFeedback} onOpenChange={() => setShowFeedback(null)}>
            <DialogContent className="max-w-sm mx-auto max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>AI Insights & Celebration</DialogTitle>
              </DialogHeader>
              {(() => {
                const exposure = socialExposures?.find(e => e.id === showFeedback);
                if (!exposure) return null;
                
                return (
                  <PostExposureFeedback
                    exposureType={exposure.exposureType}
                    anxietyLevel={exposure.anxietyBefore}
                    description={exposure.description || ""}
                    isFirstTime={!socialExposures.some(e => e.exposureType === exposure.exposureType && e.id !== exposure.id)}
                    completed={true}
                    beforeAnxiety={exposure.anxietyBefore}
                    afterAnxiety={exposure.anxietyAfter || exposure.anxietyBefore}
                    notes={exposure.wentWell || exposure.tryDifferently}
                  />
                );
              })()}
            </DialogContent>
          </Dialog>
        )}
      </main>

      {/* Completion Dialog */}
      <Dialog open={!!completingExposure} onOpenChange={() => setCompletingExposure(null)}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Complete Social Exposure</DialogTitle>
          </DialogHeader>
          {completingExposure && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">{completingExposure.title}</p>
              
              <div>
                <Label className="flex items-center justify-between">
                  Actual Energy Level
                  <span className="text-sm text-gray-500">{actualEnergy[0]}/10</span>
                </Label>
                <Slider
                  value={actualEnergy}
                  onValueChange={setActualEnergy}
                  max={10}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>What went well?</Label>
                <Textarea
                  value={wentWell}
                  onChange={(e) => setWentWell(e.target.value)}
                  placeholder="Celebrate the positive aspects..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label>What would you try differently?</Label>
                <Textarea
                  value={tryDifferently}
                  onChange={(e) => setTryDifferently(e.target.value)}
                  placeholder="Ideas for next time..."
                  className="mt-1"
                />
              </div>

              <Button 
                onClick={submitCompletion}
                className="w-full gradient-bg"
                disabled={completeMutation.isPending}
              >
                {completeMutation.isPending ? "Saving..." : "Complete Exposure"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </MobileLayout>
  );
}
