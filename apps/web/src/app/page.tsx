import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Valliance Resource Management
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Value-based resource management for AI consultancy excellence
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>People Management</CardTitle>
              <CardDescription>
                Manage consultants, engineers, and contractors across practices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/people">
                <Button className="w-full">View People</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Projects</CardTitle>
              <CardDescription>
                Track bootcamps, pilots, and use case rollouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/projects">
                <Button className="w-full">View Projects</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Schedule</CardTitle>
              <CardDescription>
                Allocate resources and manage capacity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/schedule">
                <Button className="w-full">View Schedule</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Time Tracking</CardTitle>
              <CardDescription>
                Log time and manage approvals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/time">
                <Button className="w-full">Track Time</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>
                Utilisation, margin, and value analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/reports">
                <Button className="w-full">View Reports</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>
                Claude-powered scheduling recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/ai">
                <Button className="w-full">Ask Claude</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Built with NextJS, NestJS, Prisma, and Claude AI
          </p>
        </div>
      </div>
    </main>
  );
}
