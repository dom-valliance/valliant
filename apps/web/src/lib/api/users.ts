import { apiClient } from '../api-client';

export interface User {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  person: {
    id: string;
    name: string;
  } | null;
}

export interface CreateUserData {
  email: string;
  password: string;
  role: string;
  personId?: string;
}

export interface UpdateUserData {
  email?: string;
  password?: string;
  role?: string;
  personId?: string;
  isActive?: boolean;
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get('/auth/users');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/auth/users/${id}`);
    return response.data;
  },

  create: async (data: CreateUserData): Promise<User> => {
    const response = await apiClient.post('/auth/users', data);
    return response.data;
  },

  update: async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await apiClient.put(`/auth/users/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/auth/users/${id}`);
  },
};
