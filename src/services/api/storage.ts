type Job = {
  id: string;
  urls: string[];
  outputType: "music" | "video"; 
  outputFormat: string;
  status: "idle" | "running" | "done" | "error";
  progress: number;
};

const jobs = new Map<string, Job>();


const createJob = (job: Job) => {
    
    jobs.set(job.id, job);
    return job;
};

const getJob = (jobId: string) => {
    return jobs.get(jobId);
}

const updateJob = (jobId: string, progress: number, status: string) => {
    const job = jobs.get(jobId);
    if (job) {
        job.progress = progress;
        job.status = status as Job["status"];
    } 
};

const deleteJob = (jobId: string) => {
    jobs.delete(jobId);
};

export {
    createJob,
    getJob,
    updateJob,
    deleteJob,
};