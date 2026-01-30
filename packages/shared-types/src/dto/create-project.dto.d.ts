export declare enum ProjectStatus {
    PROSPECT = "PROSPECT",
    DISCOVERY = "DISCOVERY",
    CONFIRMED = "CONFIRMED",
    ACTIVE = "ACTIVE",
    ON_HOLD = "ON_HOLD",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED"
}
export declare enum CommercialModel {
    VALUE_SHARE = "VALUE_SHARE",
    FIXED_PRICE = "FIXED_PRICE",
    HYBRID = "HYBRID"
}
export declare enum ProjectType {
    BOOTCAMP = "BOOTCAMP",
    PILOT = "PILOT",
    USE_CASE_ROLLOUT = "USE_CASE_ROLLOUT"
}
export declare enum TeamModel {
    THREE_IN_BOX = "THREE_IN_BOX",
    FLEXIBLE = "FLEXIBLE"
}
export declare class CreateProjectDto {
    name: string;
    code: string;
    clientId: string;
    primaryPracticeId: string;
    valuePartnerId: string;
    status?: ProjectStatus;
    commercialModel: CommercialModel;
    estimatedValueCents?: number;
    valueSharePct?: number;
    agreedFeeCents?: number;
    contingencyPct?: number;
    startDate: string;
    endDate?: string;
    projectType: ProjectType;
    parentProjectId?: string;
    teamModel?: TeamModel;
    notes?: string;
}
//# sourceMappingURL=create-project.dto.d.ts.map