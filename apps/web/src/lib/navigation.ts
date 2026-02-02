import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Building2,
  Calendar,
  Clock,
  BarChart3,
  Bot,
  Settings,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const navigationConfig: NavSection[] = [
  {
    items: [
      {
        title: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
        description: 'Overview and quick stats',
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        title: 'People',
        href: '/people',
        icon: Users,
        description: 'Team members and contractors',
      },
      {
        title: 'Projects',
        href: '/projects',
        icon: FolderKanban,
        description: 'Client engagements',
      },
      {
        title: 'Clients',
        href: '/clients',
        icon: Building2,
        description: 'Client companies',
      },
    ],
  },
  {
    title: 'Planning',
    items: [
      {
        title: 'Schedule',
        href: '/schedule',
        icon: Calendar,
        description: 'Resource scheduling',
      },
      {
        title: 'Time Tracking',
        href: '/time',
        icon: Clock,
        description: 'Time entries and approvals',
      },
    ],
  },
  {
    title: 'Insights',
    items: [
      {
        title: 'Reports',
        href: '/reports',
        icon: BarChart3,
        description: 'Analytics and reports',
      },
      {
        title: 'AI Assistant',
        href: '/ai',
        icon: Bot,
        description: 'AI-powered insights',
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'System configuration',
      },
    ],
  },
];
