import express from "express";
import { sharedController } from "../blackboard-controller/controller";

declare global {
    namespace Express {
        interface Request {
            refresh?: boolean;
        }
    }
}

export const CoursesAPI = express.Router();

CoursesAPI.get("/courses", async (req, res) => {
    const courses = await sharedController.api.courses.all(!req.refresh);

    res.json({
        courses
    });
});

CoursesAPI.get("/grades", async (req, res) => {
    const all = !!req.query.all;
    const grades = await sharedController.api.grades.all(!all, !req.refresh);

    res.json({
        grades
    });
});