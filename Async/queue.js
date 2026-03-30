const Queue = require("bull");

const myQueue = new Queue("job-queue", {
    redis: { host: "127.0.0.1", port: 6379 },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 2000
        },
        removeOnComplete: 200,
        removeOnFail: 200
    }
});

const getStatusFromState = (state) => {
    if (state === "completed") return "DONE";
    if (state === "failed") return "FAILED";
    if (state === "active") return "PROCESSING";
    if (state === "delayed") return "DELAYED";
    return "PENDING";
};

const mapJobForDashboard = async (job) => {
    const state = await job.getState();
    let progress = 0;

    if (typeof job.progress === "function") {
        progress = (await job.progress()) || 0;
    } else if (typeof job._progress === "number") {
        progress = job._progress;
    }

    return {
        id: job.id,
        type: job.data.type,
        status: getStatusFromState(state),
        state,
        progress,
        attemptsMade: job.attemptsMade,
        result: job.returnvalue || null,
        error: job.failedReason || null,
        createdAt: job.timestamp,
        processedAt: job.processedOn || null,
        finishedAt: job.finishedOn || null
    };
};

module.exports = { myQueue, mapJobForDashboard };