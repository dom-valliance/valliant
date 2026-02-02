'use client';

import { useState } from 'react';
import { Sparkles, Loader2, User, DollarSign, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRecommendAssignment, useAIQuery } from '@/hooks/use-ai';

interface Project {
  id: string;
  name: string;
  code: string;
}

interface AIRecommendationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: Project[];
  onCreateAllocation: (personId: string) => void;
}

interface Recommendation {
  personId: string;
  personName: string;
  matchScore: number;
  reasoning: string;
  availableHours: number;
  dailyCostCents: number;
  totalCostCents: number;
  skillMatch: { skill: string; proficiency: string }[];
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(cents / 100);
}

function getMatchScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function getMatchScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent Match';
  if (score >= 60) return 'Good Match';
  return 'Partial Match';
}

export function AIRecommendationPanel({
  open,
  onOpenChange,
  projects,
  onCreateAllocation,
}: AIRecommendationPanelProps) {
  const [selectedProject, setSelectedProject] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [naturalQuery, setNaturalQuery] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [queryResponse, setQueryResponse] = useState<string | null>(null);

  const recommendAssignment = useRecommendAssignment();
  const aiQuery = useAIQuery();

  const handleGetRecommendations = async () => {
    if (!selectedProject || !startDate || !endDate) return;

    const skills = requiredSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const result = await recommendAssignment.mutateAsync({
        projectId: selectedProject,
        requiredSkills: skills,
        startDate,
        endDate,
      });
      setRecommendations(result || []);
      setQueryResponse(null);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      setRecommendations([]);
    }
  };

  const handleNaturalQuery = async () => {
    if (!naturalQuery.trim()) return;

    try {
      const result = await aiQuery.mutateAsync(naturalQuery);
      setQueryResponse(result.answer || 'No response received.');
      setRecommendations([]);
    } catch (error) {
      console.error('Failed to process query:', error);
      setQueryResponse('Failed to process your query. Please try again.');
    }
  };

  const isLoading = recommendAssignment.isPending || aiQuery.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Recommendations
          </SheetTitle>
          <SheetDescription>
            Get intelligent suggestions for team assignments and resource allocation
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-150px)] pr-4 mt-6">
          <div className="space-y-6">
            {/* Assignment Recommendations Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Assignment Recommendations</CardTitle>
                <CardDescription>
                  Find the best people for your project based on skills and availability
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label>Project</Label>
                    <Select value={selectedProject} onValueChange={setSelectedProject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label>Required Skills</Label>
                    <Input
                      placeholder="e.g., Palantir, Python, SQL"
                      value={requiredSkills}
                      onChange={(e) => setRequiredSkills(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Comma-separated list of skills
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleGetRecommendations}
                    disabled={isLoading || !selectedProject || !startDate || !endDate}
                  >
                    {recommendAssignment.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Get Recommendations
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations Results */}
            {recommendations.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">
                  Top Recommendations
                </h3>
                {recommendations.map((rec, idx) => (
                  <Card key={rec.personId} className="overflow-hidden">
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-medium">{rec.personName}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className={getMatchScoreColor(rec.matchScore)}
                              >
                                {rec.matchScore}% Match
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {getMatchScoreLabel(rec.matchScore)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onCreateAllocation(rec.personId)}
                        >
                          Assign
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>

                      <Progress value={rec.matchScore} className="h-2" />

                      <p className="text-sm text-muted-foreground">{rec.reasoning}</p>

                      <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{rec.availableHours}h available</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>{formatCurrency(rec.dailyCostCents)}/day</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{formatCurrency(rec.totalCostCents)} total</span>
                        </div>
                      </div>

                      {rec.skillMatch && rec.skillMatch.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {rec.skillMatch.map((skill) => (
                            <Badge
                              key={skill.skill}
                              variant="secondary"
                              className="text-xs"
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              {skill.skill}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Separator />

            {/* Natural Language Query Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Ask a Question</CardTitle>
                <CardDescription>
                  Use natural language to query availability and scheduling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Input
                    placeholder="e.g., Who's available next week with Palantir experience?"
                    value={naturalQuery}
                    onChange={(e) => setNaturalQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNaturalQuery();
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={handleNaturalQuery}
                    disabled={isLoading || !naturalQuery.trim()}
                  >
                    {aiQuery.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Ask AI
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Example questions:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li>Who's available next week with Palantir experience?</li>
                    <li>What's our bench capacity for February?</li>
                    <li>Which engineers are below 80% utilisation?</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Query Response */}
            {queryResponse && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    AI Response
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{queryResponse}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
