export declare enum PersonType {
    EMPLOYEE = "EMPLOYEE",
    CONTRACTOR = "CONTRACTOR"
}
export declare enum Seniority {
    JUNIOR = "JUNIOR",
    MID = "MID",
    SENIOR = "SENIOR",
    PRINCIPAL = "PRINCIPAL",
    PARTNER = "PARTNER"
}
export declare class CreatePersonDto {
    name: string;
    email: string;
    type: PersonType;
    roleId: string;
    departmentId?: string;
    costRateCents: number;
    costRateCurrency?: string;
    defaultHoursPerWeek?: number;
    workingDays?: number[];
    seniority: Seniority;
    utilisationTarget?: number;
    startDate: string;
    endDate?: string;
    notes?: string;
    practiceIds?: string[];
}
//# sourceMappingURL=create-person.dto.d.ts.map