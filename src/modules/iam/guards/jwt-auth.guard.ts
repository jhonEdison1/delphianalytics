import { ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { AuthenticationCommonService } from "../authentication";

@Injectable()
export class JwtAuthAccessGuard extends AuthGuard("jwt-access") {

    // constructor(private reflector: Reflector, private readonly authenticationCommonService: AuthenticationCommonService) {}

    constructor(
        private readonly reflector: Reflector,
        private readonly authenticationCommonService: AuthenticationCommonService

    ) {
        super();
    }




    async canActivate(context: ExecutionContext): Promise<any> {

        const req = context.switchToHttp().getRequest();       
        return super.canActivate(context);

    }

}
