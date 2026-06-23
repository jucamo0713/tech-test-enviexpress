export interface OperatorUser {
  id: string;
  email: string;
  name: string;
  role: 'operator';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOperatorRequest {
  email: string;
  name: string;
  password: string;
}

export interface PaginatedOperators {
  items: OperatorUser[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
