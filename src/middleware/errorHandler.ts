import type { NextFunction, Request, Response } from "express";
import { sendResponse } from "../utils/SendResponse";
import { StatusCodes } from "http-status-codes";

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
)=>{
    console.error(err.stack);

    sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Internal Server Error",undefined, err.message);
};