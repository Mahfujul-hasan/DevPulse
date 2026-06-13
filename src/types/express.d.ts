import type { IJwtPayload } from ".";

declare global {
    namespace Express {
        interface Request {
            user?: IJwtPayload;
        }
    }
}