import type { Response } from "express";
import type { IssuesType } from "../../types";
import { sendResponse } from "../../utils/SendResponse";
import { StatusCodes } from "http-status-codes";
import { sql } from "../../db";


// --------- Create Issue--------------
export const createIssue = async (res:Response,title:string,description:string,type:IssuesType,reporter_id:number)=>{

    // 1. Validation
    if(!title || !description || !type){
        sendResponse(res, StatusCodes.BAD_REQUEST, "validation error", undefined, "All fields are required");
    }

    if(title.length>150){
        sendResponse(res, StatusCodes.BAD_REQUEST, "validation error", undefined, "Title must be less than 150 characters");
        return;
    }

    if(description.length <20){
        sendResponse(res, StatusCodes.BAD_REQUEST, "validation error", undefined, "Description must be more than 20 characters");
        return;
    }

    const result = await sql`
        INSERT INTO issues (title, description, type, reporter_id)
        VALUES (${title}, ${description}, ${type}, ${reporter_id})
        RETURNING *
    `;

    sendResponse(res, StatusCodes.CREATED, "Issue created successfully", result[0]);

}


// ---------- Get All Issues-----------
export const getAllIssues = async (
    res: Response,
    sort: string = "newest",
    type?: string,
    status?: string
) => {
    // 1. Build query
    let query = "SELECT * FROM issues";
    const conditions: string[] = [];

    if (type) conditions.push(`type = '${type}'`);
    if (status) conditions.push(`status = '${status}'`);
    if (conditions.length > 0) query += " WHERE " + conditions.join(" AND ");

    query += sort === "oldest" ? " ORDER BY created_at ASC" : " ORDER BY created_at DESC";

    // 2. Fetch issues
    const issues = await sql.unsafe(query);

    if (issues.length === 0) {
        sendResponse(res, StatusCodes.OK, "Issues retrieved successfully", []);
        return;
    }

    // 3. Fetch reporters (no JOIN)
    const reporterIds = [...new Set(issues.map((i: any) => i.reporter_id))];
    const reporters = await sql`SELECT id, name, role FROM users WHERE id IN ${sql(reporterIds)}`;

    // 4. Merge reporter into each issue
    const reporterMap = Object.fromEntries(reporters.map((r: any) => [r.id, r]));
    const data = issues.map((issue: any) => ({
        ...issue,
        reporter: reporterMap[issue.reporter_id] || null,
        reporter_id: undefined
    }));

    sendResponse(res, StatusCodes.OK, "Issues retrieved successfully", data);
};