import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hashPassword, verifyPassword } from '../common/utils/password';
import type { User } from '../infrastrucure/prisma/generated/client';
import { AuthRepo } from './auth.repo';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { JwtPayload } from './types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepo: AuthRepo,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.authRepo.findByEmail(dto.email);

    if (!user || !(await verifyPassword(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createSession(user);
  }

  async signup(dto: SignupDto): Promise<{ accessToken: string }> {
    if (await this.authRepo.findByEmail(dto.email)) {
      throw new ConflictException('An account with this email already exists');
    }

    const user = await this.authRepo.createUser({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash: await hashPassword(dto.password),
    });

    return this.createSession(user);
  }

  private async createSession(
    user: Pick<User, 'id' | 'role'>,
  ): Promise<{ accessToken: string }> {
    const payload: JwtPayload = { sub: user.id, role: user.role };

    return { accessToken: await this.jwtService.signAsync(payload) };
  }
}
