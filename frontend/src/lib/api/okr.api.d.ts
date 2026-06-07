export interface TeamProgress {
    teamId: string;
    teamName: string;
    totalObjectives: number;
    avgObjectiveProgress: number;
    totalKeyResults: number;
    avgKeyResultProgress: number;
}
export interface UserProgress {
    userId: string;
    userName: string;
    email: string;
    role: string;
    totalObjectives: number;
    avgObjectiveProgress: number;
    totalKeyResults: number;
    avgKeyResultProgress: number;
}
export declare const periodsApi: {
    getAll: () => Promise<OkrPeriod[]>;
    getActive: () => Promise<OkrPeriod[]>;
    getById: (id: string) => Promise<OkrPeriod>;
};
export declare const objectivesApi: {
    getAll: (params?: {
        periodId?: string;
        ownerId?: string;
    }) => Promise<Objective[]>;
    getById: (id: string) => Promise<Objective>;
    create: (data: {
        title: string;
        description?: string;
        periodId: string;
        ownerId: string;
        departmentId?: string;
        teamId?: string;
        weight?: number;
    }) => Promise<Objective>;
};
export declare const keyResultsApi: {
    getAll: (params?: {
        objectiveId?: string;
        ownerId?: string;
    }) => Promise<KeyResult[]>;
    getById: (id: string) => Promise<KeyResult>;
    getCheckIns: (id: string) => Promise<CheckIn[]>;
    create: (data: {
        title: string;
        description?: string;
        objectiveId: string;
        ownerId: string;
        startValue: number;
        targetValue: number;
        unit?: string;
        weight?: number;
    }) => Promise<KeyResult>;
};
export declare const checkInsApi: {
    getAll: () => Promise<CheckIn[]>;
    create: (data: {
        keyResultId: string;
        value: number;
        note?: string;
        checkDate?: string;
    }) => Promise<CheckIn>;
};
export declare const reportsApi: {
    getDashboard: (periodId?: string) => Promise<DashboardData>;
    getTeamProgress: (periodId?: string) => Promise<TeamProgress[]>;
    getUserProgress: (periodId?: string) => Promise<UserProgress[]>;
};
export interface UserListItem {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    roleId: string;
    roleName: string;
    roleDisplayName: string;
    departmentId?: string;
    departmentName?: string;
    teamId?: string;
    teamName?: string;
    createdAt: string;
}
export interface UserListResponse {
    data: UserListItem[];
    total: number;
    page: number;
    limit: number;
}
export declare const usersApi: {
    getAll: (page?: number, limit?: number) => Promise<UserListResponse>;
    getById: (id: string) => Promise<UserListItem>;
    create: (data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        roleId: string;
        departmentId?: string;
        teamId?: string;
    }) => Promise<UserListItem>;
    update: (id: string, data: {
        firstName?: string;
        lastName?: string;
        roleId?: string;
        departmentId?: string;
        teamId?: string;
        isActive?: boolean;
    }) => Promise<UserListItem>;
    remove: (id: string) => Promise<{
        id: string;
    }>;
};
export interface Role {
    id: string;
    name: string;
    display_name: string;
}
export declare const rolesApi: {
    getAll: () => Promise<Role[]>;
};
export declare const teamsApi: {
    getAll: () => Promise<{
        id: string;
        name: string;
    }[]>;
};
export declare const departmentsApi: {
    getAll: () => Promise<{
        id: string;
        name: string;
    }[]>;
};
