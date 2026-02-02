import { Controller, Post, Get, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from './decorators/current-user.decorator';
import { UserRole } from './permissions';

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsString()
  role!: string;

  @IsString()
  @IsOptional()
  personId?: string;
}

class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  personId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return this.authService.login(user);
  }

  @Get('me')
  async getProfile(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.getProfile(user.userId);
  }

  // User Management - Partner only
  @Get('users')
  @Roles(UserRole.PARTNER)
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Get('users/:id')
  @Roles(UserRole.PARTNER)
  async getUser(@Param('id') id: string) {
    return this.authService.getUser(id);
  }

  @Post('users')
  @Roles(UserRole.PARTNER)
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Put('users/:id')
  @Roles(UserRole.PARTNER)
  async updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.updateUser(id, updateUserDto);
  }

  @Delete('users/:id')
  @Roles(UserRole.PARTNER)
  async deleteUser(@Param('id') id: string) {
    return this.authService.deleteUser(id);
  }
}
