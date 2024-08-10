import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { DatabaseService } from "src/database/database.service";


@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'jwt-admin'){
    constructor(private configService: ConfigService, private databaseService: DatabaseService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('ADMIN_JWT_SECRET'),
        });
    }

    async validate(payload: any){
        
        const admin = await this.databaseService.admin.findUnique({
            where: {id: payload.sub},
        });
        if(!admin){
            return null;
        }
        delete admin.password;
        return admin;
    }
}