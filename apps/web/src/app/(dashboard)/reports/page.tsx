'use client';

import { Users, DollarSign, Layers } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UtilisationDashboard } from './components/utilisation-dashboard';
import { FinancialSummary } from './components/financial-summary';
import { PhaseBudgetTracker } from './components/phase-budget-tracker';

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground mt-1">
          Analytics, utilisation, and value reporting
        </p>
      </div>

      <Tabs defaultValue="utilisation" className="space-y-4">
        <TabsList>
          <TabsTrigger value="utilisation" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Utilisation
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="budgets" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Phase Budgets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="utilisation">
          <UtilisationDashboard />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialSummary />
        </TabsContent>

        <TabsContent value="budgets">
          <PhaseBudgetTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
