import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { DatabaseService } from "src/database/database.service";


@Injectable()
export class UserJwtStrategy extends PassportStrategy(Strategy, 'jwt-user'){
    constructor(private configService: ConfigService, private databaseService: DatabaseService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('USER_JWT_SECRET'),
        });
    }

    async validate(payload: {sub: number, email: string}){
        const user = await this.databaseService.user.findUnique({
            where: {id: payload.sub},
        });
        if(!user){
            return null;
        }
        return {id: user.id, email: user.email, name: user.name};
    }
}