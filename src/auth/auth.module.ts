import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { appConfig } from '../common/config/app.config';
import { PrismaModule } from '../infrastrucure/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthRepo } from './auth.repo';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: appConfig.jwtSecret,
      signOptions: {
        expiresIn: appConfig.jwtExpiresInSeconds,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthRepo, AuthService, JwtAuthGuard, JwtStrategy, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
