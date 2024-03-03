import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import config from "src/config";
import { PayloadToken } from "../models/token.model";
import { ExtractJwt, Strategy } from "passport-jwt";


@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, "jwt-access") {
    constructor(@Inject(config.KEY) private readonly configSerivce: ConfigType<typeof config>) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configSerivce.session.jwtAccessTokenSecret
        });
    }

    async validate(payload: PayloadToken) {
        return payload;
    }
   
}

