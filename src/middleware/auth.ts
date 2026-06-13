import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/SendResponse";
import { StatusCodes } from "http-status-codes";
import { verifyToken } from "../utils/jwt";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            sendResponse(res, StatusCodes.UNAUTHORIZED, "Access denied, no token provided", undefined, "No token provided");
            return;
        }

        const decoded = verifyToken(token);
        req.user = decoded;
        next();

    } catch (error) {
        sendResponse(res, StatusCodes.UNAUTHORIZED, "Invalid or expired token", undefined, "Invalid or expired token");
        return;
    }
}

export const authorizeRole = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            sendResponse(res, StatusCodes.FORBIDDEN, "Access denied, insufficient permission");
            return;
        };
        next();
    };
}