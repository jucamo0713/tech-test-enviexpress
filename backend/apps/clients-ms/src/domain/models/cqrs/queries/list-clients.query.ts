import { Query } from '@nestjs/cqrs';
import type { Client } from '../../entities/client';

export class ListClientsQuery extends Query<Client[]> {}
