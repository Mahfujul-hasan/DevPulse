import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { createIssueController } from "./issues.controller";

const issueRouter = Router();

issueRouter.post("/issues", authenticate, createIssueController);

export default issueRouter;