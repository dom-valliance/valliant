export declare enum EventType {
    PERSON_CREATED = "person.created",
    PERSON_UPDATED = "person.updated",
    PERSON_ARCHIVED = "person.archived",
    PROJECT_CREATED = "project.created",
    PROJECT_UPDATED = "project.updated",
    PROJECT_STATUS_CHANGED = "project.status_changed",
    PROJECT_TEAM_UPDATED = "project.team_updated",
    PHASE_CREATED = "phase.created",
    PHASE_UPDATED = "phase.updated",
    PHASE_BUDGET_WARNING = "phase.budget_warning",
    PHASE_BUDGET_EXCEEDED = "phase.budget_exceeded",
    ALLOCATION_CREATED = "allocation.created",
    ALLOCATION_UPDATED = "allocation.updated",
    ALLOCATION_DELETED = "allocation.deleted",
    OVERALLOCATION_DETECTED = "allocation.overallocation_detected",
    TIME_ENTRY_SUBMITTED = "time_entry.submitted",
    TIME_ENTRY_APPROVED = "time_entry.approved",
    TIME_ENTRY_REJECTED = "time_entry.rejected",
    TIMESHEET_LOCKED = "timesheet.locked",
    AI_RECOMMENDATION_REQUESTED = "ai.recommendation_requested",
    AI_RECOMMENDATION_COMPLETED = "ai.recommendation_completed"
}
export interface BaseEvent {
    type: EventType;
    metadata: {
        timestamp: string;
        correlationId: string;
        userId?: string;
    };
}
export interface PersonCreatedEvent extends BaseEvent {
    type: EventType.PERSON_CREATED;
    payload: {
        personId: string;
        name: string;
        email: string;
        type: string;
        roleId: string;
    };
}
export interface ProjectCreatedEvent extends BaseEvent {
    type: EventType.PROJECT_CREATED;
    payload: {
        projectId: string;
        name: string;
        code: string;
        clientId: string;
        primaryPracticeId: string;
        valuePartnerId: string;
    };
}
export interface AllocationCreatedEvent extends BaseEvent {
    type: EventType.ALLOCATION_CREATED;
    payload: {
        allocationId: string;
        personId: string;
        projectId: string;
        phaseId?: string;
        startDate: string;
        endDate: string;
        hoursPerDay: number;
        costRateCentsSnapshot: number;
    };
}
export interface TimeEntrySubmittedEvent extends BaseEvent {
    type: EventType.TIME_ENTRY_SUBMITTED;
    payload: {
        timeEntryId: string;
        personId: string;
        projectId?: string;
        phaseId?: string;
        date: string;
        hours: number;
    };
}
export interface PhaseBudgetWarningEvent extends BaseEvent {
    type: EventType.PHASE_BUDGET_WARNING;
    payload: {
        phaseId: string;
        projectId: string;
        phaseName: string;
        projectName: string;
        estimatedCostCents: number;
        actualCostCents: number;
        percentageConsumed: number;
        alertThreshold: number;
    };
}
export type VRMEvent = PersonCreatedEvent | ProjectCreatedEvent | AllocationCreatedEvent | TimeEntrySubmittedEvent | PhaseBudgetWarningEvent;
//# sourceMappingURL=event-types.d.ts.map