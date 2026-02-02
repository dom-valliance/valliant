import Link from 'next/link';
import {
  Users,
  FolderKanban,
  Building2,
  Calendar,
  Clock,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const stats = [
  {
    title: 'People',
    description: 'Team members and contractors',
    icon: Users,
    href: '/people',
    color: 'text-light-blue',
  },
  {
    title: 'Projects',
    description: 'Active engagements',
    icon: FolderKanban,
    href: '/projects',
    color: 'text-emerald-400',
  },
  {
    title: 'Clients',
    description: 'Client companies',
    icon: Building2,
    href: '/clients',
    color: 'text-mauve',
  },
  {
    title: 'Schedule',
    description: 'Resource allocations',
    icon: Calendar,
    href: '/schedule',
    color: 'text-light-pink',
  },
  {
    title: 'Time Tracking',
    description: 'Hours logged this week',
    icon: Clock,
    href: '/time',
    color: 'text-light-blue',
  },
  {
    title: 'Reports',
    description: 'Analytics and insights',
    icon: BarChart3,
    href: '/reports',
    color: 'text-mauve',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to Valliance Resource Management
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.href} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <CardDescription>{stat.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
