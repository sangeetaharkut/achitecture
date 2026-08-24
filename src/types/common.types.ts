/**
 * Common Types
 * Shared types across the application
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Result<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}

export type ID = string;
