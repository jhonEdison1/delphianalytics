import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthenticationCommonService } from "../authentication";
import { Role } from "../models/roles.model";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { PayloadToken } from "../models/token.model";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private readonly authenticationCommonService: AuthenticationCommonService) {}

  async canActivate(context: ExecutionContext): Promise<any> {
    // const isPublic = this.reflector.get(IS_PUBLIC, context.getHandler());

    // if (isPublic) {
    //   return true;
    // }

    const roles = this.reflector.get<Role[]>(ROLES_KEY, context.getHandler());

    if (!roles) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user as PayloadToken;

    //console.log("user", user);

    const record = await this.authenticationCommonService.findUserAutenticated(user.id);

    //console.log("record", record.role);

    const isNotForbiddenRole = roles.some((role) => role === record.rol);

    //const isNotForbiddenRole = roles.some((role) => role === record.role);

    if (!isNotForbiddenRole) {
      throw new ForbiddenException("Acceso prohibido");
    }

    return isNotForbiddenRole;
  }
}