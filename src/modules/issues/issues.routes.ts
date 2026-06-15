import { Router } from "express";
import { authenticate, authorizeRole } from "../../middleware/auth";
import { createIssueController, deleteIssueController, getAllIssuesController, getIssueByIdController, updateIssueController } from "./issues.controller";

const issueRouter = Router();

issueRouter.post("/", authenticate, createIssueController);
issueRouter.get("/", getAllIssuesController);
issueRouter.get("/:id", getIssueByIdController);
issueRouter.patch("/:id",authenticate, updateIssueController);
issueRouter.delete("/:id",authenticate, authorizeRole("maintainer"), deleteIssueController);



export default issueRouter;