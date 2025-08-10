import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertActivitySchema, type InsertActivity } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";

interface ActivityFormProps {
  onSuccess?: () => void;
}

const USER_ID = "demo-user";

export default function ActivityForm({ onSuccess }: ActivityFormProps) {
  const [duration, setDuration] = useState([30]);
  const [selectedFeeling, setSelectedFeeling] = useState<string>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<InsertActivity>({
    resolver: zodResolver(insertActivitySchema),
    defaultValues: {
      userId: USER_ID,
      duration: 30,
      feeling: "😊",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertActivity) => {
      const response = await apiRequest("POST", "/api/activities", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      toast({
        title: "Activity logged!",
        description: "Great job moving your body today!",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log activity. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertActivity) => {
    mutation.mutate({
      ...data,
      duration: duration[0],
      feeling: selectedFeeling || "😊",
    });
  };

  const feelings = [
    { emoji: "😊", value: "happy" },
    { emoji: "😐", value: "neutral" },
    { emoji: "😴", value: "tired" },
    { emoji: "💪", value: "energized" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="type">Activity Type</Label>
        <Select onValueChange={(value) => setValue("type", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select activity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="walking">Walking</SelectItem>
            <SelectItem value="yoga">Yoga</SelectItem>
            <SelectItem value="swimming">Swimming</SelectItem>
            <SelectItem value="tai chi">Tai Chi</SelectItem>
            <SelectItem value="meditation">Meditation</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
      </div>

      <div>
        <Label>Duration: {duration[0]} minutes</Label>
        <Slider
          value={duration}
          onValueChange={setDuration}
          max={120}
          min={5}
          step={5}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>5 min</span>
          <span>2 hours</span>
        </div>
      </div>

      <div>
        <Label>How did you feel?</Label>
        <div className="flex justify-between mt-2">
          {feelings.map(({ emoji, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedFeeling(emoji)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                selectedFeeling === emoji
                  ? "bg-primary text-white"
                  : "bg-gray-100 hover:bg-primary hover:text-white"
              }`}
            >
              <span className="text-xl">{emoji}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          {...register("notes")}
          placeholder="How did this activity make you feel?"
          className="mt-1"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full gradient-bg hover:opacity-90"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Saving..." : "Save Activity"}
      </Button>
    </form>
  );
}
