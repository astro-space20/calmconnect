import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Watch } from "lucide-react";
import { Link } from "wouter";
import type { Activity } from "@shared/schema";
import MobileLayout from "@/components/mobile-layout";
import BottomNavigation from "@/components/bottom-navigation";
import ActivityForm from "@/components/activity-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WearableDevices from "@/components/wearable-devices";

const USER_ID = "demo-user";

export default function ActivityTracker() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const handleActivitySaved = () => {
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading activities...</p>
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
            <h1 className="text-xl font-semibold">Activity Tracker</h1>
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
                <DialogTitle>Log Activity</DialogTitle>
              </DialogHeader>
              <ActivityForm onSuccess={handleActivitySaved} />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 pb-24">
        <Tabs defaultValue="activities" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="devices">
              <Watch className="w-4 h-4 mr-2" />
              Devices
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="activities" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Your Activities</h2>
              <p className="text-sm text-gray-600">
                Track low-pressure physical activities to support your mental wellness.
              </p>
            </div>

        {!activities?.length ? (
          <Card className="text-center py-8">
            <CardContent>
              <div className="w-16 h-16 bg-calm-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No activities yet</h3>
              <p className="text-gray-600 mb-4">
                Start with just 20-30 minutes, 3-4 days per week. Every step counts!
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-bg">Log Your First Activity</Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm mx-auto">
                  <DialogHeader>
                    <DialogTitle>Log Activity</DialogTitle>
                  </DialogHeader>
                  <ActivityForm onSuccess={handleActivitySaved} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <Card key={activity.id} className="card-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base capitalize">{activity.type}</CardTitle>
                    <span className="text-2xl">{activity.feeling}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>
                      {activity.steps 
                        ? `${activity.steps.toLocaleString()} steps`
                        : `${activity.duration || 0} minutes`
                      }
                    </span>
                    <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                  </div>
                  {activity.notes && (
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2">
                      {activity.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
          </TabsContent>
          
          <TabsContent value="devices">
            <WearableDevices />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />
    </MobileLayout>
  );
}
