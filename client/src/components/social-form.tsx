import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSocialExposureSchema, type InsertSocialExposure } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface SocialFormProps {
  onSuccess?: () => void;
}

const USER_ID = "demo-user";

export default function SocialForm({ onSuccess }: SocialFormProps) {
  const [expectedEnergy, setExpectedEnergy] = useState([5]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<InsertSocialExposure>({
    resolver: zodResolver(insertSocialExposureSchema),
    defaultValues: {
      userId: USER_ID,
      expectedEnergy: 5,
      completed: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertSocialExposure) => {
      const response = await apiRequest("POST", "/api/social-exposures", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social-exposures"] });
      toast({
        title: "Social exposure planned!",
        description: "You're stepping out of your comfort zone. That's brave!",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log social exposure. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertSocialExposure) => {
    mutation.mutate({
      ...data,
      expectedEnergy: expectedEnergy[0],
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Social Activity</Label>
        <Input
          {...register("title")}
          placeholder="e.g., Coffee with coworker, Phone call with friend"
          className="mt-1"
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      <div>
        <Label className="flex items-center justify-between">
          Expected Energy Level
          <span className="text-sm text-gray-500">{expectedEnergy[0]}/10</span>
        </Label>
        <Slider
          value={expectedEnergy}
          onValueChange={setExpectedEnergy}
          max={10}
          min={1}
          step={1}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Drained (1)</span>
          <span>Energized (10)</span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          How do you expect to feel after this interaction?
        </p>
      </div>

      <div>
        <Label htmlFor="feelings">Expected Feelings</Label>
        <Input
          {...register("feelings")}
          placeholder="e.g., nervous, excited, worried"
          className="mt-1"
        />
        <p className="text-xs text-gray-600 mt-1">
          What emotions are you anticipating?
        </p>
      </div>

      <Button 
        type="submit" 
        className="w-full gradient-bg hover:opacity-90"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Saving..." : "Plan Social Exposure"}
      </Button>
    </form>
  );
}
