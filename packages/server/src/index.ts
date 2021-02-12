import cors from "cors";
import express from "express";
import http from "http";
import { resolve } from "path";
import { ActivityAPI } from "./apis/activity";
import { CoursesAPI } from "./apis/courses";
// @ts-ignore
import { BlackboardController, sharedController } from "./blackboard-controller/controller";

const app = express();
const server = new http.Server(app);

app.use(cors())

app.set("view engine", "pug");
app.set("view cache", false);
app.set("json spaces", 2);
app.set("views", resolve(__dirname, "..", "templates"));

app.locals.env = process.env;

app.use((req, res, next) => {
    if (req.query.refresh) req.refresh = true;
    next();
});

const staticPath = (folder: string) => resolve(__dirname, "..", folder);
const makeStatic = (folder: string) => express.static(staticPath(folder));
app.use("/css", makeStatic("css"));
app.use("/js", makeStatic("client-dist"));

app.get("/", (req, res) => {
    res.render("page");
});

app.use(async (req, res, next) => {
    while (!sharedController || !sharedController.userID) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    next();
});

app.use(CoursesAPI);
app.use(ActivityAPI);

server.listen(3333, () => {
    console.log("heloo");
});

BlackboardController.make().then(async controller => {
    await controller.boot();

    console.log("boot");
});