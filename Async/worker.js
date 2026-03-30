const { myQueue } = require("./queue");

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const durationByType = {
    email: 1500,
    report: 5000,
    thumbnail: 2500,
    sync: 3500,
    fail: 1200
};

// xử lý 3 job song song
myQueue.process(3, async (job) => {
    console.log("Processing job:", job.id, job.data);

    const total = durationByType[job.data.type] || 2000;
    const steps = 5;

    // test lỗi
    if (job.data.type === "fail") {
        await delay(total);
        throw new Error("Job failed!");
    }

    for (let i = 1; i <= steps; i += 1) {
        await delay(Math.ceil(total / steps));
        await job.progress(Math.round((i / steps) * 100));
    }

    console.log("Done job:", job.id);

    return {
        message: "DONE",
        processedType: job.data.type,
        durationMs: total
    };
});

// log
myQueue.on("completed", job => {
    console.log("Completed:", job.id);
});

myQueue.on("failed", (job, err) => {
    console.log(" Failed:", job.id, err.message);
});

console.log("Worker is running in background process mode.");