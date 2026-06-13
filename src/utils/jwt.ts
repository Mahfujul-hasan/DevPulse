import jwt from "jsonwebtoken";
import type { IJwtPayload } from "../types";
import config from "../config";

export const verifyToken = (token: string): IJwtPayload => {
    const decode = jwt.verify(token, config.jwt_access_secret) as IJwtPayload;
    return decode;
}

export const signToken = (payload: IJwtPayload) => {
    const accessToken = jwt.sign(payload, config.jwt_access_secret, {
        expiresIn: "7d"
    });
    return accessToken;

};