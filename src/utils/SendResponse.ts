import type { Response } from "express";

export const sendResponse = <T>(
    res: Response,
    statusCode: number,
    message: string,
    data?: T,
    errors?: unknown
) => {
    res.status(statusCode).json({
        success: errors ? false : true,
        message,
        ...(errors ? { errors } : { data })

    });
};