
import { LayoutDashboard, Book, Calendar, MessageSquare, User, Users, Heart, HelpCircle, BarChart, Settings, FileText } from "lucide-react";

// Centralized sidebar configuration for ALL sections
export const sidebarLinks = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Assessment", path: "/assessment", icon: FileText },
  { label: "Progress", path: "/progress", icon: BarChart },
  { label: "Professional Support", path: "/support", icon: Users },
  { label: "Therapy Sessions", path: "/sessions", icon: Calendar },
  { label: "Resources", path: "/resources", icon: Book },
  { label: "Self-Help Tools", path: "/tools", icon: Heart },
  { label: "Community", path: "/community", icon: MessageSquare },
  { label: "Wellness Programs", path: "/wellness", icon: Heart },
  { label: "Crisis Support", path: "/crisis", icon: HelpCircle },
  { label: "Lifestyle", path: "/lifestyle", icon: User },
  { label: "Smart Features", path: "/ai", icon: BarChart },
  { label: "Personalization", path: "/personalization", icon: Settings },
  { label: "Gamification", path: "/gamification", icon: BarChart },
  { label: "Admin", path: "/admin", icon: Settings },
];

