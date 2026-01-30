"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = void 0;
var EventType;
(function (EventType) {
    EventType["PERSON_CREATED"] = "person.created";
    EventType["PERSON_UPDATED"] = "person.updated";
    EventType["PERSON_ARCHIVED"] = "person.archived";
    EventType["PROJECT_CREATED"] = "project.created";
    EventType["PROJECT_UPDATED"] = "project.updated";
    EventType["PROJECT_STATUS_CHANGED"] = "project.status_changed";
    EventType["PROJECT_TEAM_UPDATED"] = "project.team_updated";
    EventType["PHASE_CREATED"] = "phase.created";
    EventType["PHASE_UPDATED"] = "phase.updated";
    EventType["PHASE_BUDGET_WARNING"] = "phase.budget_warning";
    EventType["PHASE_BUDGET_EXCEEDED"] = "phase.budget_exceeded";
    EventType["ALLOCATION_CREATED"] = "allocation.created";
    EventType["ALLOCATION_UPDATED"] = "allocation.updated";
    EventType["ALLOCATION_DELETED"] = "allocation.deleted";
    EventType["OVERALLOCATION_DETECTED"] = "allocation.overallocation_detected";
    EventType["TIME_ENTRY_SUBMITTED"] = "time_entry.submitted";
    EventType["TIME_ENTRY_APPROVED"] = "time_entry.approved";
    EventType["TIME_ENTRY_REJECTED"] = "time_entry.rejected";
    EventType["TIMESHEET_LOCKED"] = "timesheet.locked";
    EventType["AI_RECOMMENDATION_REQUESTED"] = "ai.recommendation_requested";
    EventType["AI_RECOMMENDATION_COMPLETED"] = "ai.recommendation_completed";
})(EventType || (exports.EventType = EventType = {}));
//# sourceMappingURL=event-types.js.map