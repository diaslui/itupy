import { Router } from "express";
import { getJob } from "../api/storage.ts";
const routes = Router();

routes.get("/", (req, res) => {
  res.render("index");
});

routes.get("/download", (req, res) => {
  res.render("download");
});

routes.get("/job/:jobId", (req, res) => {
  const { jobId } = req.params;
  const job = getJob(jobId);

  if (!job) {
    return res.status(404).send("Job not found");
  }
  res.render("job", { job });
});

export default routes;
