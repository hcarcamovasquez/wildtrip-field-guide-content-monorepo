import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  CurrentUser,
  ICurrentUser,
} from '../auth/decorators/current-user.decorator';

@Controller('api/users')
@UseGuards(ClerkAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin', 'content_editor')
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('pageSize') pageSize?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    // Support both 'limit' and 'pageSize' for backward compatibility
    const size = limit || pageSize;

    return this.usersService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: size ? parseInt(size, 10) : undefined,
      search,
      role,
      sortBy,
      sortOrder,
    });
  }

  @Get('stats')
  @Roles('admin')
  getUserStats() {
    return this.usersService.getUserStats();
  }

  @Get('me')
  getCurrentUser(@CurrentUser() user: ICurrentUser) {
    return this.usersService.findOne(user.id);
  }

  @Get(':id')
  @Roles('admin', 'content_editor')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'content_editor')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    // Only admins can update other users
    if (user.role !== 'admin' && user.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    return this.usersService.update(id, updateUserDto, user.id, user.role);
  }
}
