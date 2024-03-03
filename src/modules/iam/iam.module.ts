import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigType } from '@nestjs/config';
import config from 'src/config';
import { HashingService } from 'src/providers/hashing.service';
import { BcryptService } from 'src/providers/bcrypt.service';
import { AuthenticationCommonService } from './authentication/authentication.common.service';
import { AuthenticationService } from './authentication/authentication.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAccessTokenStrategy } from './strategies/jwt-auth-access.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-auth-refresh.strategy ';
import { AuthenticationController } from './authentication/authentication.controller';


@Module({
    imports: [
        TypeOrmModule.forFeature([Usuario]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [config.KEY],
            useFactory: async (configService: ConfigType<typeof config>) => {
                return {
                    secret: configService.session.jwtAccessTokenSecret,
                    signOptions: {
                        expiresIn: configService.session.jwtAccessTokenExpiresTime,
                    },
                };
            },

        })
    ],
    providers: [
        { provide: HashingService, useClass: BcryptService },
        AuthenticationCommonService,
        AuthenticationService,
        LocalStrategy,
        JwtAccessTokenStrategy,
        JwtRefreshTokenStrategy
    ],
    controllers: [
        AuthenticationController
    ],
    exports: [AuthenticationCommonService, AuthenticationService]



})
export class IamModule { }
