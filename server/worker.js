import { Worker } from "bullmq";

const worker = new Worker('file-upload-queue',
    async job => {
        console.log(`job:`, job.data);
        const data=JSON.parse(job.data);
        console.log(data);

    }, {
        concurrency: 100,
    connection: {
        host: "localhost",
        port: 6379,
    }
});

