type Job = {
  id: string;
  urls: string[];
  outputType: "audio" | "video"; 
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

const updateJob = (job: Job) => {
    const existingJob = jobs.get(job.id);
    if (existingJob) {
        jobs.set(job.id, job);
        return job;
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