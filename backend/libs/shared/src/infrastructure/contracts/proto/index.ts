export const GrpcProtoFiles = {
  audit: 'audit.proto',
  auth: 'auth.proto',
  clients: 'clients.proto',
  packages: 'packages.proto',
  packageStatus: 'package-status.proto',
  users: 'users.proto',
} as const;

export type GrpcProtoFile = (typeof GrpcProtoFiles)[keyof typeof GrpcProtoFiles];

export * as AuditProto from './audit';
export * as AuthProto from './auth';
export * as ClientsProto from './clients';
export * as PackagesProto from './packages';
export * as PackageStatusProto from './package-status';
export * as UsersProto from './users';
