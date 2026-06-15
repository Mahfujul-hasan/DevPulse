import type { Response } from "express";
import type { IssuesStatus, IssuesType } from "../../types";
import { sendResponse } from "../../utils/SendResponse";
import { StatusCodes } from "http-status-codes";
import { sql } from "../../db";


// --------- Create Issue--------------
export const createIssue = async (res: Response, title: string, description: string, type: IssuesType, reporter_id: number) => {

    // 1. Validation
    if (!title || !description || !type) {
        sendResponse(res, StatusCodes.BAD_REQUEST, "validation error", undefined, "All fields are required");
        return;
    }

    if (title.length > 150) {
        sendResponse(res, StatusCodes.BAD_REQUEST, "validation error", undefined, "Title must be less than 150 characters");
        return;
    }

    if (description.length < 20) {
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

    // 1. Validate query params
    const validTypes = ["bug", "feature_request"];
    const validStatuses = ["open", "in_progress", "resolved"];

    if (type && !validTypes.includes(type)) {
        sendResponse(res, StatusCodes.BAD_REQUEST, "validation error", undefined, "Invalid type value");
        return;
    }

    if (status && !validStatuses.includes(status)) {
        sendResponse(
            res,
            StatusCodes.BAD_REQUEST,
            "validation error",
            undefined,
            "Invalid status value"
        );
        return;
    }

    // 2. Fetch issues conditionally 
    const orderBy = sort === "oldest" ? sql`ASC` : sql`DESC`;

    let issues;

    if (type && status) {
        issues = await sql`
            SELECT * FROM issues
            WHERE type=${type} AND status=${status}
            ORDER BY created_at ${orderBy}
        `;
    } else if (type) {
        issues = await sql`
            SELECT * FROM issues
            WHERE type=${type}
            ORDER BY created_at ${orderBy}
        `;
    } else if (status) {
        issues = await sql`
            SELECT * FROM issues
            WHERE status=${status}
            ORDER BY created_at ${orderBy}
        `;
    } else {
        issues = await sql`
            SELECT * FROM issues
            ORDER BY created_at ${orderBy}
        `;
    }

    // 3. Empty check 
    if (issues.length === 0) {
        sendResponse(res, StatusCodes.OK, "Issues retrieved successfully", []);
        return;
    }

    // 4. Fetch reporters (no JOIN)
    const reporterIds = [...new Set(issues.map(issue => issue.reporter_id))];
    const reporters = await sql`SELECT id, name, role FROM users WHERE id = ANY(${reporterIds}::int[])`;

    // 5. Merge reporter into each issue 
    const reporterMap = Object.fromEntries(reporters.map(reporter => [reporter.id, reporter]));
    const data = issues.map(issue => ({
        ...issue,
        reporter: reporterMap[issue.reporter_id] || null,
        reporter_id: undefined,
    }));

    sendResponse(res, StatusCodes.OK, "Issues retrieved successfully", data);

};

export const getIssueById = async (res: Response, id: number) => {
    const result = await sql`SELECT * FROM issues WHERE id=${id}`;
    if (result.length === 0) {
        sendResponse(res, StatusCodes.NOT_FOUND, "Issue not found", undefined, "Issue not found");
        return;
    }
    const issue = result[0];

    if (!issue) {
        sendResponse(res, StatusCodes.NOT_FOUND, "Issue not found",undefined, "Issue not found");
        return;
    }
    const reporter = await sql`SELECT id, name, role FROM users WHERE id=${issue.reporter_id}`;
    const data = {
        ...issue,
        reporter: reporter[0] || null,
        reporter_id: undefined,
    };
    sendResponse(res, StatusCodes.OK, "Issue retrieved successfully", data);

}


export const updateIssue = async (
    res: Response,
    id: number,
    userId: number,
    userRole: string,
    title?: string,
    description?: string,
    type?: IssuesType,
    status?: IssuesStatus,
) => {
    // 1. Issue exists check 
    const result = await sql`SELECT * FROM issues WHERE id=${id}`;
    if (result.length === 0) {
        sendResponse(res, StatusCodes.NOT_FOUND, "Issue not found",undefined, "Issue not found");
        return;
    }
    const issue = result[0];

    if (!issue) {
        return;
    }

    // 2. Permission check
    if (userRole === "contributor") {
        if (issue.reporter_id !== userId) {
            sendResponse(res, StatusCodes.FORBIDDEN, "Access denied, you can only update your own issues");
            return;
        }
        if (issue.status !== "open") {
            sendResponse(res, StatusCodes.CONFLICT, "You can only update issues with open status");
            return;
        }
    }

    // 3. Validation 
    if (title && title.length > 150) {
        sendResponse(res, StatusCodes.BAD_REQUEST, "validation error", undefined, "Description must be at least 20 characters");
        return;
    }

    if (description && description.length < 20) {
        sendResponse(res, StatusCodes.BAD_REQUEST, "Validation error", undefined, "Description must be at least 20 characters");
        return;
    }

    const validStatuses: IssuesStatus[] = ["open", "in_progress", "resolved"]
    if (status && !validStatuses.includes(status)) {
        sendResponse(res, StatusCodes.BAD_REQUEST, "Validation error", undefined, "Invalid status value");
        return;
    }

    // 4. Use existing values if not provided
    const updatedTitle = title ?? issue.title;
    const updatedDescription = description ?? issue.description;
    const updatedType = type ?? issue.type;
    const updatedStatus = status ?? issue.status;

    // 5. Update
    const updated = await sql`
        UPDATE issues SET
            title = ${updatedTitle},
            description = ${updatedDescription},
            type = ${updatedType},
            status = ${updatedStatus},
            updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
    `;

    sendResponse(res, StatusCodes.OK, "Issue updated successfully", updated[0]);

}

export const deleteIssue = async (res: Response, id: number) => {
    const result = await sql`SELECT id FROM issues WHERE id=${id}`;
    if (result.length === 0) {
        sendResponse(res, StatusCodes.NOT_FOUND, "Issue not found", undefined, "Issue not found");
        return;
    }
    await sql`DELETE FROM issues WHERE id=${id}`;
    sendResponse(res, StatusCodes.OK, "Issue deleted successfully");
}