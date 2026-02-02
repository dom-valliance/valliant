import { Injectable, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prisma } from '@vrm/database';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { person: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      person: user.person
        ? {
            id: user.person.id,
            name: user.person.name,
          }
        : null,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { person: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      personId: user.personId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        person: user.person,
      },
    };
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // User Management Methods
  async getAllUsers() {
    const users = await prisma.user.findMany({
      include: { person: true },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user: typeof users[number]) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      person: user.person
        ? {
            id: user.person.id,
            name: user.person.name,
          }
        : null,
    }));
  }

  async getUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { person: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      personId: user.personId,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      person: user.person
        ? {
            id: user.person.id,
            name: user.person.name,
          }
        : null,
    };
  }

  async createUser(data: { email: string; password: string; role: string; personId?: string }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        role: data.role as any,
        personId: data.personId || null,
      },
      include: { person: true },
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      person: user.person
        ? {
            id: user.person.id,
            name: user.person.name,
          }
        : null,
    };
  }

  async updateUser(id: string, data: { email?: string; password?: string; role?: string; personId?: string; isActive?: boolean }) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.email && data.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const updateData: any = {};
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    if (data.personId !== undefined) updateData.personId = data.personId || null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { person: true },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
      person: updatedUser.person
        ? {
            id: updatedUser.person.id,
            name: updatedUser.person.name,
          }
        : null,
    };
  }

  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await prisma.user.delete({ where: { id } });

    return { success: true };
  }
}
