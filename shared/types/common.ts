// Common types shared between frontend and backend

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error: string;
  details?: any;
  stack?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface BaseEntity {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeleteEntity extends BaseEntity {
  deletedAt?: Date;
  isDeleted: boolean;
}

export interface AuditableEntity extends BaseEntity {
  createdBy: string;
  updatedBy?: string;
}

export type EntityStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';

export interface HealthStatus {
  status: 'ok' | 'warning' | 'error';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  database: {
    status: 'connected' | 'disconnected';
    responseTime: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

export interface UploadedFile {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export type UserRole = 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE' | 'FINANCE' | 'CEO';

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'WORK_FROM_HOME';

export type LeaveType = 'CASUAL' | 'SICK' | 'ANNUAL' | 'MATERNITY' | 'PATERNITY' | 'EMERGENCY';

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type ExpenseStatus = 'DRAFT' | 'SUBMITTED' | 'FINANCE_APPROVED' | 'CEO_APPROVED' | 'REJECTED' | 'PAID';

export type WorkLocation = 'OFFICE' | 'HOME' | 'CLIENT_SITE' | 'OTHER';

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface BulkOperationResult<T = any> {
  success: boolean;
  processed: number;
  successful: number;
  failed: number;
  errors: Array<{
    index: number;
    error: string;
    data?: T;
  }>;
  results: T[];
}
