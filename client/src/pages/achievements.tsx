import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Share2, Lock, Unlock, Trophy, Target, Star, Award } from "lucide-react";
import { Link } from "wouter";
import type { Achievement, SocialShare } from "@shared/schema";
import MobileLayout from "@/components/mobile-layout";
import BottomNavigation from "@/components/bottom-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Achievements() {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");
  const [shareText, setShareText] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: achievements = [], isLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  const { data: socialShares = [] } = useQuery<SocialShare[]>({
    queryKey: ["/api/social-shares"],
  });

  // Initialize achievements if user doesn't have any
  const initializeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/achievements/initialize", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      toast({
        title: "Achievements Ready!",
        description: "Your achievement system has been set up. Start tracking to unlock rewards!",
      });
    },
  });

  // Share achievement mutation
  const shareMutation = useMutation({
    mutationFn: async (data: { achievementId: string; platform: string; shareText: string }) => {
      const response = await apiRequest("POST", "/api/social-shares", {
        achievementId: data.achievementId,
        platform: data.platform,
        shareText: data.shareText,
        shareUrl: window.location.origin + "/achievements/" + data.achievementId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-shares"] });
      setShareDialogOpen(false);
      toast({
        title: "Achievement Shared!",
        description: "Your progress has been shared successfully.",
      });
    },
  });

  // Generate share text mutation
  const generateShareTextMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      const response = await apiRequest("POST", `/api/achievements/${achievementId}/share-text`, {});
      return response.json();
    },
    onSuccess: (data) => {
      setShareText(data.shareText);
    },
  });

  const handleShare = async (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    generateShareTextMutation.mutate(achievement.id);
    setShareDialogOpen(true);
  };

  const confirmShare = () => {
    if (selectedAchievement && selectedPlatform && shareText) {
      if (selectedPlatform === "clipboard") {
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to Clipboard!",
          description: "Share text has been copied to your clipboard.",
        });
        setShareDialogOpen(false);
        return;
      }

      shareMutation.mutate({
        achievementId: selectedAchievement.id,
        platform: selectedPlatform,
        shareText: shareText,
      });
    }
  };

  const getShareUrl = (platform: string, text: string) => {
    const encodedText = encodeURIComponent(text);
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${window.location.origin}&quote=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.origin}&summary=${encodedText}`,
      instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing via URL
    };
    return urls[platform as keyof typeof urls] || "";
  };

  const categoryIcons = {
    activity: "🏃",
    social: "🦋",
    nutrition: "🥗",
    mental_health: "🧠",
    overall: "🌟",
  };

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);
  const lockedAchievements = achievements.filter(a => !a.isUnlocked);
  const totalProgress = achievements.length > 0 ? (unlockedAchievements.length / achievements.length) * 100 : 0;

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
        <BottomNavigation />
      </MobileLayout>
    );
  }

  // Show initialize screen if no achievements
  if (achievements.length === 0) {
    return (
      <MobileLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl">Ready for Achievements?</CardTitle>
              <p className="text-gray-600">
                Set up your achievement system to track progress and celebrate milestones on your wellness journey.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => initializeMutation.mutate()}
                disabled={initializeMutation.isPending}
                className="w-full gradient-bg"
              >
                {initializeMutation.isPending ? "Setting up..." : "Get Started"}
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation />
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-b-3xl">
          <div className="flex items-center mb-4">
            <Link href="/dashboard">
              <button className="mr-3 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <h1 className="text-2xl font-bold">Achievements</h1>
          </div>

          <div className="bg-white/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Overall Progress</span>
              <span className="text-sm font-medium">{unlockedAchievements.length}/{achievements.length}</span>
            </div>
            <Progress value={totalProgress} className="h-2 bg-white/30" />
            <p className="text-xs opacity-75 mt-2">{Math.round(totalProgress)}% Complete</p>
          </div>
        </div>

        <div className="px-6 py-6">
          <Tabs defaultValue="unlocked" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="unlocked" className="text-xs">
                Unlocked ({unlockedAchievements.length})
              </TabsTrigger>
              <TabsTrigger value="locked" className="text-xs">
                In Progress ({lockedAchievements.length})
              </TabsTrigger>
              <TabsTrigger value="shared" className="text-xs">
                Shared ({socialShares.length})
              </TabsTrigger>
            </TabsList>

            {/* Unlocked Achievements */}
            <TabsContent value="unlocked" className="mt-6 space-y-4">
              {unlockedAchievements.length === 0 ? (
                <Card className="text-center p-8">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="font-medium text-gray-900 mb-2">No Achievements Yet</h3>
                  <p className="text-gray-500 text-sm">
                    Start tracking your wellness journey to unlock your first achievement!
                  </p>
                </Card>
              ) : (
                unlockedAchievements.map((achievement) => (
                  <Card key={achievement.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-white text-xl">
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                            <div className="flex items-center mt-2 space-x-2">
                              <Badge variant="secondary" className="text-xs">
                                {categoryIcons[achievement.category as keyof typeof categoryIcons]} {achievement.category}
                              </Badge>
                              <span className="text-xs text-green-600 font-medium">
                                Completed {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Unlock className="w-5 h-5 text-green-500" />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShare(achievement)}
                            disabled={generateShareTextMutation.isPending}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Locked Achievements */}
            <TabsContent value="locked" className="mt-6 space-y-4">
              {lockedAchievements.map((achievement) => {
                const progressPercentage = (achievement.currentProgress / achievement.milestone) * 100;
                
                return (
                  <Card key={achievement.id} className="overflow-hidden opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-xl relative">
                            {achievement.icon}
                            <Lock className="w-4 h-4 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-700">{achievement.title}</h3>
                            <p className="text-sm text-gray-500">{achievement.description}</p>
                            <div className="flex items-center mt-2 space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {categoryIcons[achievement.category as keyof typeof categoryIcons]} {achievement.category}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {achievement.currentProgress}/{achievement.milestone}
                              </span>
                            </div>
                            <div className="mt-2">
                              <Progress value={progressPercentage} className="h-1" />
                            </div>
                          </div>
                        </div>
                        <Target className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            {/* Shared Achievements */}
            <TabsContent value="shared" className="mt-6 space-y-4">
              {socialShares.length === 0 ? (
                <Card className="text-center p-8">
                  <Share2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="font-medium text-gray-900 mb-2">No Shared Achievements</h3>
                  <p className="text-gray-500 text-sm">
                    Share your achievements with friends to inspire and motivate others!
                  </p>
                </Card>
              ) : (
                socialShares.map((share) => (
                  <Card key={share.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="text-xs">
                          {share.platform}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(share.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{share.shareText}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Achievement</DialogTitle>
              <DialogDescription>
                Share your progress and inspire others on their wellness journey!
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Choose Platform</label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="clipboard">Copy to Clipboard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {shareText && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Share Text</label>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    {shareText}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={confirmShare}
                  disabled={!selectedPlatform || shareMutation.isPending}
                  className="flex-1"
                >
                  {selectedPlatform === "clipboard" ? "Copy" : "Share"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <BottomNavigation />
    </MobileLayout>
  );
}