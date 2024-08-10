import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user-dto';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from 'src/database/database.service';
import { ConfigService } from '@nestjs/config';
import { Gender, Prisma, Role } from '@prisma/client';
import { LoginAdminDto } from './dto/login-admin.dto';
import { JwtService } from '@nestjs/jwt';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AuthService {
  constructor(private databaseService: DatabaseService, private configService: ConfigService, private jwtService: JwtService) { }
  async createUser(createUserData: CreateUserDto) {
    const { email, password, ...rest } = createUserData;
    try {
      const existingUser = await this.databaseService.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new ConflictException('User with this Email already Exists.');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = await this.createUserId(createUserData.gender);
      await this.databaseService.user.create({
        data: {
          email,
          password: hashedPassword,
          ...rest,
          ploggersid: userId,
        },
      });

      return {
        message: 'User Created Successfully',
        userId,
      }
    } catch (error) {
      console.error("error in create user", error);
      if (error.code === 'P2002' && error.meta.target.includes('email')) {
        throw new ConflictException('User with this Email already Exists.');
      }
      throw error;
    }
  }

  async loginUser(loginUserData: LoginUserDto) {
    const { userId, password } = loginUserData;
    try {
      let user: any;
      if (userId.includes('@')) {
        user = await this.databaseService.user.findUnique({
          where: { email: userId }
        });
        if (!user) {
          throw new UnauthorizedException('Invalid Email Address.');
        }
      } else {
        user = await this.databaseService.user.findUnique({
          where: { ploggersid: userId }
        });
        if (!user) {
          throw new UnauthorizedException('Invalid Ploggers Id.');
        }
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid Password.');
      }

      const payload = { email: user.email, id: user.id };
      const token = await this.generateUserToken(payload);
      return {
        message: 'Login Successful',
        token: token,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

  async update(updateAuthData: UpdateUserDto, id: number) {
    try {
      if (updateAuthData.password) {
        updateAuthData.password = await bcrypt.hash(updateAuthData.password, 10);
      }
      const user = await this.databaseService.user.update({
        where: { id },
        data: updateAuthData,
      });
      delete user.password;
      return {
        message: 'User Updated Successfully',
        user,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException('User not found.');
        }
      }
      console.error(error);
      throw new InternalServerErrorException('An unexpected error occurred.');
    };
  }

  async loginAdmin(loginAdminData: LoginAdminDto) {
    const { email, password } = loginAdminData;
    try {
      const admin = await this.databaseService.admin.findUnique({
        where: {
          email: email,
        }
      });
      if (!admin) {
        throw new UnauthorizedException("Invalid Email Address.");
      }
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException("Invalid Password.");
      }
      const payload = { email: admin.email, id: admin.id, role: admin.role };
      const token = await this.generateAdminToken(payload)
      return {
        message: "Login Successful",
        token,
      }

    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException("An unexpected error occurred.");
    }

  }

  async createAdmin(createAdminData: CreateAdminDto) {
    const { email, password, name } = createAdminData;
    try {
      const existingAdmin = await this.databaseService.admin.findUnique({
        where: {
          email,
        }
      });
      if (existingAdmin) {
        throw new ConflictException('Admin with this Email already Exists.');
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.databaseService.admin.create({
        data: {
          name,
          email,
          password: hashedPassword,
        }
      });
      return {
        message: "Admin Created Successfully",
        data: {
          email,
        }
      }
    } catch (error) {
      console.error("error in create user", error);
      if (error.code === 'P2002' && error.meta.target.includes('email')) {
        throw new ConflictException('User with this Email already Exists.');
      }
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const users = await this.databaseService.user.findMany({
        orderBy:{
          id: 'asc',
        }
      });
      if (users.length === 0) {
        throw new NotFoundException('No Users Found');
      }
      users.forEach(user => {
        delete user.password;
      });
      return {
        message: 'Users Found',
        users,
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error("error in get all users", error);
      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

  async createUserId(gender: Gender): Promise<string> {
    let lastUser = await this.databaseService.user.findFirst({
      select: { id: true },
      orderBy: { id: 'desc' },
    });

    const lastId = lastUser ? lastUser.id : 0;
    const newId = lastId + 1;

    const year = new Date().getFullYear().toString().slice(-2);

    const genderCode = gender === "Male" ? 1 : gender === "Female" ? 2 : 3;

    const autoGeneratedId = newId.toString().padStart(5, '0');

    const userId = `${year}${genderCode}${autoGeneratedId}`;
    return userId;
  }

  async generateUserToken(payload: { email: string, id: number }): Promise<string> {
    const data = {
      email: payload.email,
      sub: payload.id,
    }
    const token = await this.jwtService.signAsync(data, {
      secret: this.configService.get('USER_JWT_SECRET'),
      expiresIn: '2h',
    });
    return token;
  }

  async generateAdminToken(payload: { email: string, id: number, role: Role }): Promise<string> {
    const data = {
      email: payload.email,
      sub: payload.id,
      role: payload.role,
    }
    const token = await this.jwtService.signAsync(data, {
      secret: this.configService.get('ADMIN_JWT_SECRET'),
      expiresIn: '6h',
    });
    return token;
  }
}
