import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findAll(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page = 1, pageSize = 20, ...filters } = params;
    const offset = (page - 1) * pageSize;

    return this.usersRepository.findAll({
      limit: pageSize,
      offset,
      ...filters,
    });
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUserId: string,
    currentUserRole: string,
  ) {
    // Prevent users from updating their own role
    if (id === currentUserId && updateUserDto.role) {
      throw new ForbiddenException('You cannot change your own role');
    }

    // Only admins can change roles
    if (updateUserDto.role && currentUserRole !== 'admin') {
      throw new ForbiddenException('Only admins can change user roles');
    }

    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.usersRepository.update(id, updateUserDto);
  }

  async syncFromClerk(clerkUser: any) {
    return this.usersRepository.syncFromClerk(clerkUser);
  }

  async getUserStats() {
    const allUsers = await this.usersRepository.findAll({ limit: 1000 }); // Get all users for stats

    const stats = {
      total: allUsers.totalItems,
      byRole: {} as Record<string, number>,
      activeLastMonth: 0,
      activeLastWeek: 0,
      activeToday: 0,
    };

    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    allUsers.items.forEach((user) => {
      // Count by role
      stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;

      // Count active users (based on creation date for now)
      if (user.createdAt) {
        const createdAt = new Date(user.createdAt);
        if (createdAt >= lastMonth) stats.activeLastMonth++;
        if (createdAt >= lastWeek) stats.activeLastWeek++;
        if (createdAt >= today) stats.activeToday++;
      }
    });

    return stats;
  }
}
