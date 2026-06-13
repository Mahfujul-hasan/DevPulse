import type { Response } from "express";
import type { UserRole } from "../../types";
import { sendResponse } from "../../utils/SendResponse";
import { StatusCodes } from "http-status-codes";
import { sql } from "../../db";
import bcrypt from "bcrypt";
import { signToken } from "../../utils/jwt";
export const registerUser = async (res: Response, name: string, email: string, password: string, role: UserRole) => {
    // 1. Validation
    if (!name || !email || !password || !role) {
        sendResponse(res, StatusCodes.BAD_REQUEST, "validation error", undefined, "All fields are required")
    }

    const validRole: UserRole[] = ["contributor", "maintainer"];
    if (!validRole.includes(role)) {
        sendResponse(res, StatusCodes.BAD_REQUEST, "validation error", undefined, "Role must be contributor or maintainer")
    }

    // 2. Already existing email check
    const existing = await sql`SELECT id FROM users WHERE email=${email}`;
    if (existing.length > 0) {
        sendResponse(res, StatusCodes.BAD_REQUEST, "Validation error", undefined, "Email already exists")
    }

    // 3. Hash password 
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insert user
    const result = await sql`
    INSERT INTO users (name, email, password, role)
    VALUES (${name}, ${email}, ${hashedPassword}, ${role})
    RETURNING id, name, email, role, created_at, updated_at
    `;

    sendResponse(res, StatusCodes.CREATED, "user registered successfully", result[0])
}

export const loginUser = async (res: Response, email: string, password: string) => {
    //1. Validation
    if (!email || !password) {
        sendResponse(res, StatusCodes.BAD_REQUEST, "Validation error", undefined, "Email and Password are required")
    }

    // 2. User exists check
    const result = await sql`SELECT * FROM users WHERE email=${email}`;
    if (result.length === 0) {
        sendResponse(res, StatusCodes.UNAUTHORIZED, "Invalid credentials");
        return;
    }

    const user = result[0];

    if (!user) {
        sendResponse(res, StatusCodes.UNAUTHORIZED, "Invalid credentials");
        return;
    }

    // 3. Password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        sendResponse(res, StatusCodes.UNAUTHORIZED, "Invalid credentials");
        return;
    }

    // 4. Sign token 
    const token = signToken({ id: user.id, name: user.name, role: user.role });

    sendResponse(res, StatusCodes.OK, "Login successful", {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
        }
    })

}