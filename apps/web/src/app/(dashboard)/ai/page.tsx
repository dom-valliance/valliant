import { Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AIAssistantPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground mt-1">
          Claude-powered insights and recommendations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Coming Soon
          </CardTitle>
          <CardDescription>
            The AI assistant feature is under development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This feature will help you:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
            <li>Get smart assignment recommendations based on skills and availability</li>
            <li>Ask natural language questions about your data</li>
            <li>Identify skill gaps and capacity issues</li>
            <li>Optimize team compositions for budget constraints</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
