import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertNutritionLogSchema, type InsertNutritionLog } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

interface NutritionFormProps {
  onSuccess?: () => void;
}

const USER_ID = "demo-user";

export default function NutritionForm({ onSuccess }: NutritionFormProps) {
  const [protein, setProtein] = useState([0]);
  const [complexCarbs, setComplexCarbs] = useState([0]);
  const [healthyFats, setHealthyFats] = useState([0]);
  const [omega3, setOmega3] = useState([0]);
  const [magnesium, setMagnesium] = useState([0]);
  const [bVitamins, setBVitamins] = useState([0]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<InsertNutritionLog>({
    resolver: zodResolver(insertNutritionLogSchema),
    defaultValues: {
      userId: USER_ID,
      protein: 0,
      complexCarbs: 0,
      healthyFats: 0,
      omega3: 0,
      magnesium: 0,
      bVitamins: 0,
      caffeine: 0,
      sugar: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertNutritionLog) => {
      const response = await apiRequest("POST", "/api/nutrition-logs", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nutrition-logs"] });
      toast({
        title: "Nutrition logged!",
        description: "Great job nourishing your body and mind!",
      });
      onSuccess?.();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log nutrition. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertNutritionLog) => {
    mutation.mutate({
      ...data,
      protein: protein[0],
      complexCarbs: complexCarbs[0],
      healthyFats: healthyFats[0],
      omega3: omega3[0],
      magnesium: magnesium[0],
      bVitamins: bVitamins[0],
    });
  };

  const nutrients = [
    { name: "Protein", value: protein, setValue: setProtein, description: "Lean meats, fish, eggs, beans" },
    { name: "Complex Carbs", value: complexCarbs, setValue: setComplexCarbs, description: "Whole grains, vegetables" },
    { name: "Healthy Fats", value: healthyFats, setValue: setHealthyFats, description: "Nuts, avocado, olive oil" },
    { name: "Omega-3s", value: omega3, setValue: setOmega3, description: "Fish, flax seeds, walnuts" },
    { name: "Magnesium", value: magnesium, setValue: setMagnesium, description: "Leafy greens, nuts, seeds" },
    { name: "B-Vitamins", value: bVitamins, setValue: setBVitamins, description: "Whole grains, leafy greens" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="mealType">Meal Type</Label>
        <Select onValueChange={(value) => setValue("mealType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select meal type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="breakfast">Breakfast</SelectItem>
            <SelectItem value="lunch">Lunch</SelectItem>
            <SelectItem value="dinner">Dinner</SelectItem>
            <SelectItem value="snack">Snack</SelectItem>
          </SelectContent>
        </Select>
        {errors.mealType && <p className="text-sm text-red-500">{errors.mealType.message}</p>}
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-gray-800">Mood-Supportive Nutrients</h3>
        {nutrients.map(({ name, value, setValue: setNutrientValue, description }) => (
          <div key={name}>
            <Label className="flex items-center justify-between">
              {name}
              <span className="text-xs text-gray-500">{value[0]}/3</span>
            </Label>
            <Slider
              value={value}
              onValueChange={setNutrientValue}
              max={3}
              min={0}
              step={1}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
        ))}
      </div>

      <div>
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          {...register("notes")}
          placeholder="What did you eat? How did it make you feel?"
          className="mt-1"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full gradient-bg hover:opacity-90"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Saving..." : "Save Nutrition Log"}
      </Button>
    </form>
  );
}
