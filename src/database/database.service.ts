import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy{
  constructor(private configService: ConfigService) {
    super({
        datasources:{
            db: {
                url: configService.get('DATABASE_URL')
            }
        }
    })
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}