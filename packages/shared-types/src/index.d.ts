export * from './dto/create-person.dto';
export * from './dto/create-project.dto';
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
}
export interface Money {
    cents: number;
    currency: string;
}
export interface DateRange {
    start: Date;
    end: Date;
}
//# sourceMappingURL=index.d.ts.map