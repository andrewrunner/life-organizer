import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { InjectRepository } from "@nestjs/typeorm";
import { ExtractJwt, Strategy } from "passport-jwt";

import { JwtPayload } from "./dto/jwt-payload.interface";
import { User } from "./user.entity";
import { UsersRepository } from "./users.repository";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @InjectRepository(UsersRepository)
        private userRepository: UsersRepository,
        private configService: ConfigService
    ) {
        super({
            secretOrKey     : configService.get('JWT_SECRET'),
            jwtFromRequest  : ExtractJwt.fromAuthHeaderAsBearerToken(),
        })
    }

    async validate(payload: JwtPayload): Promise<User> {
        const {username} = payload;
        const user = await this.userRepository.findOneBy({username});

        if(!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}