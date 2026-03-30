const express = require("express");
const cors = require("cors");
const { myQueue, mapJobForDashboard } = require("./queue");

// dashboard
const { setQueues, BullAdapter, router } = require("bull-board");

const app = express();
app.use(express.json());
app.use(cors());

// ===== DASHBOARD =====
setQueues([new BullAdapter(myQueue)]);
app.use("/admin", router);

const createJob = async (type, priority) => {
    const job = await myQueue.add(
        { type },
        {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 2000
            },
            priority: priority || 5
        }
    );

    return mapJobForDashboard(job);
};

// ===== CREATE JOB =====
app.post("/jobs", async (req, res) => {
    const { type, priority } = req.body;

    if (!type) {
        return res.status(400).json({
            error: "Missing required field: type"
        });
    }

    const jobInfo = await createJob(type, priority);
    return res.json(jobInfo);
});

// ===== BACKWARD COMPATIBLE ROUTE =====
app.post("/job", async (req, res) => {
    const { type, priority } = req.body;

    if (!type) {
        return res.status(400).json({
            error: "Missing required field: type"
        });
    }

    const jobInfo = await createJob(type, priority);
    return res.json(jobInfo);
});

// ===== SEED SAMPLE JOBS =====
app.post("/jobs/seed", async (req, res) => {
    const count = Math.max(1, Number(req.body?.count || 8));
    const types = ["email", "report", "thumbnail", "sync", "fail"];

    const createdJobs = [];

    for (let i = 0; i < count; i += 1) {
        const type = types[i % types.length];
        const job = await myQueue.add(
            { type },
            {
                priority: 1 + (i % 5),
                delay: (i % 3) * 500,
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 2000
                }
            }
        );

        createdJobs.push(job.id);
    }

    return res.json({
        message: `Seeded ${createdJobs.length} jobs`,
        jobIds: createdJobs
    });
});

// ===== GET JOBS (CHO REACT) =====
app.get("/jobs", async (req, res) => {
    const jobs = await myQueue.getJobs([
        "waiting",
        "active",
        "completed",
        "failed",
        "delayed"
    ]);

    const mappedJobs = await Promise.all(jobs.map(mapJobForDashboard));
    const sortedJobs = mappedJobs.sort((a, b) => Number(b.id) - Number(a.id));

    return res.json(sortedJobs);
});

app.get("/health", async (_req, res) => {
    const counts = await myQueue.getJobCounts(
        "waiting",
        "active",
        "completed",
        "failed",
        "delayed"
    );

    return res.json({
        service: "async-server",
        queue: counts
    });
});

// ===== START =====
app.listen(3000, () => {
    console.log("Server: http://localhost:3000");
    console.log("Dashboard: http://localhost:3000/admin");
});