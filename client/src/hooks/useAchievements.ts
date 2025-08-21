import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "./use-toast";
import type { Achievement } from "@shared/schema";

export function useAchievements() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check for new achievements after user actions
  const checkAchievementsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/achievements/check", {});
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate achievements to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      
      // Show achievement unlock notifications
      if (data.unlockedAchievements && data.unlockedAchievements.length > 0) {
        data.unlockedAchievements.forEach((achievement: Achievement) => {
          toast({
            title: "🎉 Achievement Unlocked!",
            description: `${achievement.icon} ${achievement.title} - ${achievement.description}`,
            duration: 5000,
          });
        });
      }
    },
    onError: () => {
      // Silently fail achievement checks to not disrupt user experience
      console.error("Failed to check achievements");
    },
  });

  // Initialize achievements for new users
  const initializeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/achievements/initialize", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
    },
  });

  return {
    checkAchievements: () => checkAchievementsMutation.mutate(),
    initializeAchievements: () => initializeMutation.mutate(),
    isCheckingAchievements: checkAchievementsMutation.isPending,
  };
}