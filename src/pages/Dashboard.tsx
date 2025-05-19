
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/useAuthStore";
import { 
  Calendar, 
  LineChart, 
  User, 
  Clock, 
  Bell, 
  LogOut, 
  Search, 
  MessageSquare,
  Heart,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [wellnessScore, setWellnessScore] = useState(78);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-16 md:w-64 bg-sidebar border-r border-border flex flex-col">
        <div className="p-4 flex items-center justify-center md:justify-start gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            M
          </div>
          <h1 className="text-xl font-bold hidden md:block">Mindlyfe</h1>
        </div>
        
        <div className="mt-8 flex-1">
          <NavigationMenu orientation="vertical" className="max-w-none">
            <NavigationMenuList className="flex flex-col items-start space-y-2 px-2">
              <NavigationMenuItem className="w-full">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <NavigationMenuLink className="w-full flex items-center gap-3 px-3 py-2">
                    <Activity size={20} />
                    <span className="hidden md:inline">Dashboard</span>
                  </NavigationMenuLink>
                </Button>
              </NavigationMenuItem>
              
              <NavigationMenuItem className="w-full">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <NavigationMenuLink className="w-full flex items-center gap-3 px-3 py-2">
                    <User size={20} />
                    <span className="hidden md:inline">Profile</span>
                  </NavigationMenuLink>
                </Button>
              </NavigationMenuItem>
              
              <NavigationMenuItem className="w-full">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <NavigationMenuLink className="w-full flex items-center gap-3 px-3 py-2">
                    <Calendar size={20} />
                    <span className="hidden md:inline">Appointments</span>
                  </NavigationMenuLink>
                </Button>
              </NavigationMenuItem>
              
              <NavigationMenuItem className="w-full">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <NavigationMenuLink className="w-full flex items-center gap-3 px-3 py-2">
                    <Heart size={20} />
                    <span className="hidden md:inline">Wellness Programs</span>
                  </NavigationMenuLink>
                </Button>
              </NavigationMenuItem>
              
              <NavigationMenuItem className="w-full">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <NavigationMenuLink className="w-full flex items-center gap-3 px-3 py-2">
                    <MessageSquare size={20} />
                    <span className="hidden md:inline">Community</span>
                  </NavigationMenuLink>
                </Button>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        <div className="p-4">
          <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">Sign Out</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="container flex items-center justify-between h-16 px-4">
            <div>
              <h1 className="text-2xl font-bold">
                Hi, {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-sm text-muted-foreground">Let's track your mental health today!</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="container py-6 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-6">
              {/* Mental Wellness Section */}
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Mental Wellness Score</CardTitle>
                    <Button variant="outline" size="sm">Check Now</Button>
                  </div>
                  <CardDescription>
                    Your current wellness assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="relative h-32 w-32 mx-auto md:mx-0">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold">{wellnessScore}%</span>
                      </div>
                      <svg className="transform -rotate-90" width="100%" height="100%" viewBox="0 0 120 120">
                        <circle
                          cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="12"
                        />
                        <circle
                          cx="60" cy="60" r="54" fill="none" stroke="#21A9E1" strokeWidth="12"
                          strokeDasharray="339.3"
                          strokeDashoffset={339.3 * (1 - wellnessScore / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-1">Progress by category</p>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Sleep Quality</span>
                            <span>85%</span>
                          </div>
                          <Progress value={85} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Stress Management</span>
                            <span>70%</span>
                          </div>
                          <Progress value={70} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm">
                            <span>Mood Stability</span>
                            <span>80%</span>
                          </div>
                          <Progress value={80} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Appointments */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Your scheduled therapy sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-primary/5 rounded-lg p-4 mb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Dr. Emily Johnson</h4>
                          <p className="text-sm text-muted-foreground">Cognitive Behavioral Therapy</p>
                        </div>
                      </div>
                      <Button size="sm">Join Session</Button>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Tomorrow, 2:00 PM</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>60 minutes</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-secondary/5 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
                          <User className="h-5 w-5 text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Dr. Michael Williams</h4>
                          <p className="text-sm text-muted-foreground">Mindfulness Training</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">View Details</Button>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Friday, 10:00 AM</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>45 minutes</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Wellness Programs */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Your Wellness Programs</CardTitle>
                  <CardDescription>Track your progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Stress Management</h4>
                        <div className="flex items-center mt-1">
                          <Progress value={60} className="h-2 w-32" />
                          <span className="ml-2 text-sm text-muted-foreground">60%</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Continue</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Anxiety Reduction</h4>
                        <div className="flex items-center mt-1">
                          <Progress value={45} className="h-2 w-32" />
                          <span className="ml-2 text-sm text-muted-foreground">45%</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Continue</Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Sleep Improvement</h4>
                        <div className="flex items-center mt-1">
                          <Progress value={85} className="h-2 w-32" />
                          <span className="ml-2 text-sm text-muted-foreground">85%</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Continue</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Community Support */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Community Support</CardTitle>
                  <CardDescription>Connect with others</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-primary/5 rounded-lg p-3">
                      <h4 className="font-medium">Anxiety Support Group</h4>
                      <p className="text-sm text-muted-foreground mb-2">2 new messages</p>
                      <Button size="sm" className="w-full">View Group</Button>
                    </div>
                    
                    <div className="bg-secondary/5 rounded-lg p-3">
                      <h4 className="font-medium">Mindfulness Practice</h4>
                      <p className="text-sm text-muted-foreground mb-2">Weekly session tomorrow</p>
                      <Button variant="outline" size="sm" className="w-full">Join Session</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Self-Help Resources */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Self-Help Resources</CardTitle>
                  <CardDescription>Recommended for you</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="articles">
                    <TabsList className="grid w-full grid-cols-3 mb-2">
                      <TabsTrigger value="articles">Articles</TabsTrigger>
                      <TabsTrigger value="meditations">Meditations</TabsTrigger>
                      <TabsTrigger value="exercises">Exercises</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="articles">
                      <ul className="space-y-2">
                        <li className="text-sm text-primary hover:underline cursor-pointer">Understanding Anxiety Triggers</li>
                        <li className="text-sm text-primary hover:underline cursor-pointer">The Science of Mindfulness</li>
                        <li className="text-sm text-primary hover:underline cursor-pointer">Improving Sleep Quality</li>
                      </ul>
                    </TabsContent>
                    
                    <TabsContent value="meditations">
                      <ul className="space-y-2">
                        <li className="text-sm text-primary hover:underline cursor-pointer">5-Minute Breathing Exercise</li>
                        <li className="text-sm text-primary hover:underline cursor-pointer">Body Scan Meditation</li>
                        <li className="text-sm text-primary hover:underline cursor-pointer">Sleep Wind-Down</li>
                      </ul>
                    </TabsContent>
                    
                    <TabsContent value="exercises">
                      <ul className="space-y-2">
                        <li className="text-sm text-primary hover:underline cursor-pointer">Progressive Muscle Relaxation</li>
                        <li className="text-sm text-primary hover:underline cursor-pointer">Thought Challenging Worksheet</li>
                        <li className="text-sm text-primary hover:underline cursor-pointer">Gratitude Journal Template</li>
                      </ul>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Quick Actions Section */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <Button className="h-auto py-4 px-6 justify-start bg-primary/10 hover:bg-primary/20 text-primary-foreground">
                <div className="text-left">
                  <div className="font-medium">Take Mental Health Assessment</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Complete a comprehensive assessment of your mental well-being
                  </div>
                </div>
              </Button>

              <Button className="h-auto py-4 px-6 justify-start bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground">
                <div className="text-left">
                  <div className="font-medium">Schedule a Session</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Book a session with your therapist or counselor
                  </div>
                </div>
              </Button>

              <Button className="h-auto py-4 px-6 justify-start bg-primary/10 hover:bg-primary/20 text-primary-foreground">
                <div className="text-left">
                  <div className="font-medium">Join a Support Group</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Connect with others facing similar challenges
                  </div>
                </div>
              </Button>

              <Button className="h-auto py-4 px-6 justify-start bg-secondary/10 hover:bg-secondary/20 text-secondary-foreground">
                <div className="text-left">
                  <div className="font-medium">Track Your Mood</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Record your daily mood and monitor patterns
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
