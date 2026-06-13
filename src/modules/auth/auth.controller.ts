import type { Request, Response } from "express";
import { loginUser, registerUser } from "./auth.service";

export const signup = async (req: Request, res: Response) => {
    const {name, email, password, role}=req.body;
    await registerUser(res,name, email, password, role);
};

export const login = async(req: Request, res: Response)=>{
    const {email, password}=req.body;
    await loginUser(res, email, password);

}