import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Calendar, Clock, Star, DollarSign, MapPin, Phone, Video, MessageCircle, User } from "lucide-react";
import type { Counsellor, CounsellingBooking } from "@shared/schema";
import MobileLayout from "@/components/mobile-layout";
import BottomNavigation from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Counselling() {
  const [selectedCounsellor, setSelectedCounsellor] = useState<Counsellor | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: counsellors, isLoading } = useQuery<Counsellor[]>({
    queryKey: ["/api/counsellors"],
  });

  const { data: myBookings } = useQuery<CounsellingBooking[]>({
    queryKey: ["/api/counselling-bookings"],
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: {
      counsellorId: string;
      appointmentDate: string;
      notes: string;
    }) => {
      const response = await apiRequest("POST", "/api/counselling-bookings", bookingData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/counselling-bookings"] });
      toast({
        title: "Booking submitted!",
        description: "Your counselling session has been requested. The counsellor will confirm shortly.",
      });
      setShowBookingDialog(false);
      setSelectedCounsellor(null);
      setBookingDate("");
      setBookingTime("");
      setBookingNotes("");
    }
  });

  const handleBookSession = (counsellor: Counsellor) => {
    setSelectedCounsellor(counsellor);
    setShowBookingDialog(true);
  };

  const submitBooking = () => {
    if (!selectedCounsellor || !bookingDate || !bookingTime) {
      toast({
        title: "Missing information",
        description: "Please select a date and time for your session.",
        variant: "destructive"
      });
      return;
    }

    const appointmentDateTime = new Date(`${bookingDate}T${bookingTime}`).toISOString();
    
    bookingMutation.mutate({
      counsellorId: selectedCounsellor.id,
      appointmentDate: appointmentDateTime,
      notes: bookingNotes
    });
  };

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading counsellors...</p>
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
            <h1 className="text-xl font-semibold">Talk to Counsellor</h1>
          </div>
          <MessageCircle className="w-6 h-6" />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 pb-24">
        {/* My Bookings Section */}
        {myBookings && myBookings.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">My Sessions</h2>
            <div className="space-y-3">
              {myBookings.slice(0, 3).map((booking) => {
                const counsellor = counsellors?.find(c => c.id === booking.counsellorId);
                return (
                  <Card key={booking.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{counsellor?.name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(booking.appointmentDate).toLocaleDateString()} at{' '}
                            {new Date(booking.appointmentDate).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        <Badge variant={
                          booking.status === 'confirmed' ? 'default' :
                          booking.status === 'pending' ? 'secondary' :
                          booking.status === 'completed' ? 'outline' : 'destructive'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {/* Available Counsellors */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Available Counsellors</h2>
            <p className="text-sm text-gray-600">{counsellors?.length || 0} counsellors</p>
          </div>

          {!counsellors?.length ? (
            <Card className="text-center py-8">
              <CardContent>
                <div className="w-16 h-16 bg-calm-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-lg font-medium mb-2">No counsellors available</h3>
                <p className="text-gray-600 mb-4">
                  Our counsellors are currently busy. Please check back later.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {counsellors.map((counsellor) => (
                <Card key={counsellor.id} className="card-shadow hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={counsellor.profileImage} alt={counsellor.name} />
                        <AvatarFallback className="bg-purple-100 text-purple-600 text-lg font-semibold">
                          {counsellor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">{counsellor.name}</h3>
                          <div className="flex items-center text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm text-gray-600 ml-1">4.8</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{counsellor.degree}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {counsellor.experience} years
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            ${counsellor.hourlyRate}/hr
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {counsellor.sessionDuration} min
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {(counsellor.specializations as string[]).slice(0, 3).map((spec, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {(counsellor.specializations as string[]).length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(counsellor.specializations as string[]).length - 3} more
                            </Badge>
                          )}
                        </div>

                        {counsellor.bio && (
                          <p className="text-sm text-gray-700 mb-4 line-clamp-2">{counsellor.bio}</p>
                        )}

                        <div className="flex space-x-2">
                          <Button 
                            onClick={() => handleBookSession(counsellor)}
                            className="gradient-bg flex-1"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Book Session
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Book Session with {selectedCounsellor?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedCounsellor && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={selectedCounsellor.profileImage} alt={selectedCounsellor.name} />
                  <AvatarFallback className="bg-purple-100 text-purple-600">
                    {selectedCounsellor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedCounsellor.name}</p>
                  <p className="text-sm text-gray-600">${selectedCounsellor.hourlyRate}/hr • {selectedCounsellor.sessionDuration} min</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <input
                    id="date"
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <input
                    id="time"
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Session notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="What would you like to discuss in this session?"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowBookingDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitBooking}
                  disabled={bookingMutation.isPending}
                  className="gradient-bg flex-1"
                >
                  {bookingMutation.isPending ? "Booking..." : "Book Session"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </MobileLayout>
  );
}