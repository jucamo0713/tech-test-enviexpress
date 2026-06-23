export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;
}

export interface CreateClientRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
}
