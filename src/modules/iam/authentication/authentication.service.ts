import { ConflictException, Injectable } from "@nestjs/common";
import { AuthenticationCommonService } from "./authentication.common.service";
import { SigninPayload } from "../models/signin.model";
import { PayloadToken } from "../models/token.model";
import { handleDbError } from "src/utils/error.message";

import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";



@Injectable()
export class AuthenticationService {
    constructor(
        private readonly authcommonService: AuthenticationCommonService,
      

    ) { }

    async signIn(payload: SigninPayload) {
        try {
            const data: PayloadToken = { id: payload.id, rol: payload.rol };
            const [accessToken, refreshToken] = await Promise.all([
                this.authcommonService.generateJwtAccessToken(data),
                this.authcommonService.generateJwtRefreshoken(data)
            ]);

            payload.password = undefined;

            const user = await this.authcommonService.findUserAutenticated(payload.id); 
            delete user.password
            return {
                message: "Acceso autorizado",
                accessToken,
                refreshToken,
                user: user
                
            };
        } catch (error) {
            console.log('error', error)
            const message = handleDbError(error)
            return {message}
        }
    }

    async generateNewAccessToken(payload: SigninPayload, refreshToken: string) {
        try {
            /** Data para generar el access y refresh Token */
            const data: PayloadToken = { id: payload.id, rol: payload.rol };

            const accesstoken = await this.authcommonService.generateJwtAccessToken(data);
            const user = await this.authcommonService.findUserAutenticated(payload.id);

            delete user.password;

            return {
                message: "Acceso autorizado",
                accesstoken,
                refreshToken,
                user
            };
        } catch (error) {
            const message = handleDbError(error)
            return {message}
        }
    }






}