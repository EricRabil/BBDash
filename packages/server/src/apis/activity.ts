import express from "express";
import { sharedController } from "../blackboard-controller/controller";

export const ActivityAPI = express.Router();

ActivityAPI.get("/stream-entries", async (req, res) => {
    const entries = await sharedController.api.stream.allEntries(!req.refresh);

    res.json({
        entries
    });
});