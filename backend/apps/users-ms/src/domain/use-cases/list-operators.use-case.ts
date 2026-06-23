import { UserRepository } from '../../infrastructure/driven-adapters/database/user.repository';

export class ListOperatorsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(page: number, limit: number) {
    const result = await this.userRepository.listOperators({ page, limit });

    return {
      users: result.users,
      page,
      limit,
      total: result.total,
      totalPages: Math.max(Math.ceil(result.total / limit), 1),
    };
  }
}
