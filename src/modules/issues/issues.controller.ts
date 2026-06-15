import { type Request, type Response } from "express";
import { createIssue, deleteIssue, getAllIssues, getIssueById, updateIssue } from "./issues.service";

export const createIssueController = async(req:Request, res:Response)=>{
    const {title, description, type}=req.body;
    const reporter_id= req.user!.id;
    await createIssue(res, title, description, type, reporter_id);
};

export const getAllIssuesController = async(req:Request, res:Response)=>{
    const {sort, type, status}=req.query as Record<string, string>;
    await getAllIssues(res, sort, type, status);
}

export const getIssueByIdController = async(req:Request, res:Response)=>{
    const {id}=req.params;
    await getIssueById(res, Number(id));
}

export const updateIssueController = async(req:Request, res:Response)=>{
    const {id}=req.params;
    const {title, description, type, status}=req.body;
    const userId=req.user!.id;
    const userRole=req.user!.role;
    await updateIssue(res, Number(id), userId, userRole, title, description, type, status);

};

export const deleteIssueController = async(req:Request, res:Response)=>{
    const {id}=req.params;
    await deleteIssue(res, Number(id));
}