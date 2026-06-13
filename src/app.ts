import express, { type Application } from "express";
import authRouter from "./modules/auth/auth.routes";
import issueRouter from "./modules/issues/issues.routes";


const app:Application= express();
app.use(express.json());
app.use("/api/auth",authRouter);
app.use("/api",issueRouter)

app.get("/", (req, res) => {
    res.send("Hello World!");
})

export default app;