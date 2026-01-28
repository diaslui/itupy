import { Router } from "express";
import type { Request, Response } from "express";
import { spawn } from "child_process";
import { createJob, getJob, deleteJob, updateJob } from "./storage.ts";

const routes = Router();

routes.post("/inspect", async (req, res) => {
  const { urls } = req.body;
  console.log(urls);

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "urls must be a non-empty array" });
  }

  const detailed = urls.length === 1;
  const results: any[] = [];

  let pending = urls.length;

  for (const url of urls) {
    const ytdlp = spawn("yt-dlp", [
      "--js-runtimes",
      "node",
      "--dump-json",
      url,
    ]);

    let output = "";

    ytdlp.stdout.on("data", (data) => {
      output += data.toString();
    });

    ytdlp.on("close", () => {
      try {
        const info = JSON.parse(output);

        if (detailed) {
          results.push({
            id: info.id,
            title: info.title,
            duration: info.duration,
            thumbnail: info.thumbnail,
            formats: info.formats
              .filter((f: any) => f.ext === "mp4" && f.height)
              .map((f: any) => ({
                formatId: f.format_id,
                label: `${f.height}p`,
                filesize: f.filesize || f.filesize_approx,
              })),
            audio: info.formats
              .filter((f: any) => f.vcodec === "none")
              .map((f: any) => ({
                formatId: f.format_id,
                ext: f.ext,
                bitrate: f.abr,
              })),
          });
        } else {
          results.push({
            id: info.id,
            title: info.title,
            duration: info.duration,
            bestFormat: (() => {
              const bestVideo = (info.formats || [])
                .filter((f: any) => f.ext === "mp4" && f.height)
                .sort(
                  (a: any, b: any) =>
                    (b.height || 0) - (a.height || 0) ||
                    (b.filesize || 0) - (a.filesize || 0),
                )[0];

              return bestVideo
                ? {
                    formatId: bestVideo.format_id,
                    label: `${bestVideo.height}p`,
                    filesize:
                      bestVideo.filesize ?? bestVideo.filesize_approx ?? null,
                  }
                : null;
            })(),
            thumbnail: info.thumbnail,
          });
        }
      } catch (err) {
        return res.status(500).json({ error: "Failed to parse yt-dlp output" });
      }

      pending--;

      if (pending === 0) {
        res.json({
          count: results.length,
          mode: detailed ? "single" : "multi",
          videos: results,
        });
      }
    });

    ytdlp.stderr.on("data", (data) => {
      console.error(data.toString());
    });
  }
});

routes.post("/download/create", async (req: Request, res: Response) => {
  const { urls, outputType, outputFormat } = req.body;

  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "urls must be a non-empty array" });
  }

  const jobId =
    Math.random().toString(36).substring(2, 10) +
    Date.now().toString(36).substring(4, 10);

  createJob({
    id: jobId,
    urls,
    outputType,
    outputFormat,
    status: "idle",
    progress: 0,
  });

  res.json({
    jobId,
    sseUrl: `/api/download/sse/${jobId}`,
    streamUrl: `/api/download/stream/${jobId}`,
    message: "Download job created",
  });
});

routes.get("/download/stream/:jobId", async (req: Request, res: Response) => {
  console.log("Download stream requested");
  const { jobId } = req.params;
  if (!jobId) {
    return res.status(400).json({ error: "jobId is required" });
  }
  const job = getJob(jobId.toString());

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  if (job.status === "running") {
    return res.status(409).json({ error: "Job already running" });
  }

  job.status = "running";
  job.progress = 0;

  updateJob(job);

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="itupy.${job.outputFormat ?? "bin"}"`
  );

  const args: string[] = [
    "--js-runtimes",
    "node",
    "--newline",
    "-o",
    "-", 
  ];

  if (job.outputType === "audio") {
    args.push("-f", "bestaudio");
  } else {
    args.push(
      "-f",
      "bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]",
      "--merge-output-format",
      "mp4"
    );
  }

  args.push(...job.urls);

  const ytdlp = spawn("yt-dlp", args);

  ytdlp.stdout.pipe(res);

  ytdlp.stderr.on("data", (data) => {
    const text = data.toString();
    const match = text.match(/(\d+\.\d+)%/);

    if (match) {
      job.progress = parseFloat(match[1]);
      updateJob(job);
    }
  });

  ytdlp.on("close", (code) => {
    if (code === 0) {
      job.progress = 100;
      job.status = "done";
    } else {
      job.status = "error";
    }

    updateJob(job);

    setTimeout(() => deleteJob(job.id), 30_000);
  });

  req.on("close", () => {
    ytdlp.kill("SIGKILL");
  });
});


routes.get("/download/sse/:jobId", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { jobId } = req.params;
  if (!jobId) {
    res.write(`data: ${JSON.stringify({ error: "jobId is required" })}\n\n`);
    return res.end();
  }


  const worker = setInterval(() => {
    const job = getJob(jobId.toString());
    if (!job) {
      res.write(`data: ${JSON.stringify({ error: "Job not found" })}\n\n`);
      clearInterval(worker);
      return res.end();
    }

    if (job) {
      res.write(`data: ${JSON.stringify({ progress: job.progress, status: job.status })}\n\n`);
    }
  }, 500);
  req.on("close", () => {
    worker && clearInterval(worker);
    res.end();
  });
});

export default routes;
