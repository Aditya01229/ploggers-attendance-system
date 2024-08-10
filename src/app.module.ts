import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { DriveModule } from './drive/drive.module';

@Module({
  imports: [UserModule, AuthModule, DatabaseModule, ConfigModule.forRoot({
      isGlobal: true,
    }), JwtModule, DriveModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
