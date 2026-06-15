import express, { type Application } from "express";
import authRouter from "./modules/auth/auth.routes";
import issueRouter from "./modules/issues/issues.routes";
import { errorHandler } from "./middleware/errorHandler";
import cors from "cors";


const app:Application= express();

app.use(cors())
app.use(express.json());


app.get("/", (req, res) => {
    res.send("Hello World!");
})
app.use("/api/auth",authRouter);
app.use("/api/issues",issueRouter)
app.use(errorHandler);

export default app;