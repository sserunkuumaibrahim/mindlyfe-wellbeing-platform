
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-10">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.firstName} {user?.lastName}
            </p>
          </div>
          <Button onClick={handleLogout}>Sign Out</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Mental Wellness Score</CardTitle>
              <CardDescription>Your current wellness assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">78/100</div>
              <p className="text-xs text-muted-foreground mt-1">
                +2% from last week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
              <CardDescription>Your scheduled therapy sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground mt-1">
                Next: Tomorrow at 2:00 PM
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Wellness Programs</CardTitle>
              <CardDescription>Your active programs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground mt-1">
                2 in progress, 1 completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Community Engagement</CardTitle>
              <CardDescription>Your group activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground mt-1">
                2 new messages this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Button className="h-auto py-4 px-6 justify-start" variant="outline">
              <div className="text-left">
                <div className="font-medium">Take Mental Health Assessment</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Complete a comprehensive assessment of your mental well-being
                </div>
              </div>
            </Button>

            <Button className="h-auto py-4 px-6 justify-start" variant="outline">
              <div className="text-left">
                <div className="font-medium">Schedule a Session</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Book a session with your therapist or counselor
                </div>
              </div>
            </Button>

            <Button className="h-auto py-4 px-6 justify-start" variant="outline">
              <div className="text-left">
                <div className="font-medium">Join a Support Group</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Connect with others facing similar challenges
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
