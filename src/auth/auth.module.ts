import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AdminJwtStrategy } from './strategy/admin-jwt.strategy';
import { UserJwtStrategy } from './strategy/user-jwt.strategy';
import { SuperAdminJwtStrategy } from './strategy/superadmin-jwt.strategy';

@Module({
  imports: [DatabaseModule, ConfigModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, AdminJwtStrategy, UserJwtStrategy, SuperAdminJwtStrategy],
})
export class AuthModule {}
