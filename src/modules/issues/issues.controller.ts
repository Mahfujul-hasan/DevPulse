import { type Request, type Response } from "express";
import { createIssue } from "./issues.service";

export const createIssueController = async(req:Request, res:Response)=>{
    const {title, description, type}=req.body;
    const reporter_id= req.user!.id;
    await createIssue(res, title, description, type, reporter_id);
};