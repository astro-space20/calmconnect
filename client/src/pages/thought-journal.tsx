import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Plus, Brain } from "lucide-react";
import { Link } from "wouter";
import type { ThoughtJournal } from "@shared/schema";
import MobileLayout from "@/components/mobile-layout";
import BottomNavigation from "@/components/bottom-navigation";
import ThoughtForm from "@/components/thought-form";
import { Button } from "@/components/ui/button";
import InsightsDashboard from "@/components/insights-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const USER_ID = "demo-user";

export default function ThoughtJournal() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: thoughtJournals, isLoading } = useQuery<ThoughtJournal[]>({
    queryKey: ["/api/thought-journals"],
  });

  const handleThoughtSaved = () => {
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading thought journals...</p>
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
            <h1 className="text-xl font-semibold">Thought Journal</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm" className="bg-white bg-opacity-20 hover:bg-opacity-30">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm mx-auto max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>CBT Thought Journal</DialogTitle>
              </DialogHeader>
              <ThoughtForm onSuccess={handleThoughtSaved} />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 pb-24">
        {/* AI Insights Dashboard */}
        <div className="mb-6">
          <InsightsDashboard />
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">CBT Thought Tracking</h2>
          <p className="text-sm text-gray-600">
            Use cognitive behavioral therapy techniques to identify, challenge, and reframe negative thoughts.
          </p>
        </div>

        {!thoughtJournals?.length ? (
          <Card className="text-center py-8">
            <CardContent>
              <div className="w-16 h-16 bg-calm-green rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-lg font-medium mb-2">No thought journals yet</h3>
              <p className="text-gray-600 mb-4">
                Start challenging negative thoughts with CBT techniques!
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gradient-bg">Create Your First Entry</Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm mx-auto max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>CBT Thought Journal</DialogTitle>
                  </DialogHeader>
                  <ThoughtForm onSuccess={handleThoughtSaved} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {thoughtJournals.map((journal) => (
              <Card key={journal.id} className="card-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Thought Journal</CardTitle>
                    <Badge variant="outline">
                      {journal.emotion} {journal.emotionIntensity}/10
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Situation:</p>
                    <p className="text-sm text-gray-700">{journal.situation}</p>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Negative Thought:</p>
                    <p className="text-sm text-gray-700">{journal.negativeThought}</p>
                  </div>

                  {journal.evidenceFor && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Evidence For:</p>
                      <p className="text-sm text-gray-700">{journal.evidenceFor}</p>
                    </div>
                  )}

                  {journal.evidenceAgainst && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Evidence Against:</p>
                      <p className="text-sm text-gray-700">{journal.evidenceAgainst}</p>
                    </div>
                  )}

                  {journal.reframedThought && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Reframed Thought:</p>
                      <p className="text-sm text-gray-700">{journal.reframedThought}</p>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    {new Date(journal.createdAt).toLocaleDateString()}
                  </p>
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
