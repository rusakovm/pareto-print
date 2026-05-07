import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "SUPER_SECRET",
    });
  }

    async validate(payload: any) {
    return {
      id: Number(payload.sub ?? payload.id ?? payload.userId),
      email: payload.email,
      roles: payload.roles ?? [],
    };
  }
}