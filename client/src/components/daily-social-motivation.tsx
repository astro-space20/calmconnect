import { useQuery } from "@tanstack/react-query";
import { Brain, Heart, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DailySocialMotivation() {
  const { data: motivationData } = useQuery({
    queryKey: ["/api/social-exposures/daily-motivation"],
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

  if (!motivationData?.motivation) {
    return null;
  }

  return (
    <Card className="border-0 bg-gradient-to-r from-purple-50 to-pink-50 mb-6">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Brain className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Heart className="w-4 h-4 text-purple-600" />
              <h3 className="font-medium text-purple-800 text-sm">Social Growth Motivation</h3>
            </div>
            <p className="text-sm text-purple-700 leading-relaxed">
              {motivationData.motivation}
            </p>
          </div>
          <TrendingUp className="w-4 h-4 text-purple-400 flex-shrink-0 mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}