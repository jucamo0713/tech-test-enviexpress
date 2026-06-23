export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
  isRegistered?: boolean;
}

export interface CreateClientRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface PaginatedClients {
  items: Client[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  registrationStats?: ClientRegistrationStats;
}

export interface ClientRegistrationStats {
  registered: number;
  unregistered: number;
  registeredPercentage: number;
  unregisteredPercentage: number;
}
