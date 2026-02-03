import { Worker } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { CharacterTextSplitter } from "@langchain/textsplitters";
const worker = new Worker('file-upload-queue',
    async job => {
        console.log("Worker successfully started and processing job...");
        console.log(`job:`, job.data);
        const data = JSON.parse(job.data);
        const loader = new PDFLoader(data.path);
        const docs = await loader.load();
        const splitter = new CharacterTextSplitter({ chunkSize: 300, chunkOverlap: 0 });
        const texts = await splitter.splitDocuments(docs);
        console.log(`texts:`, texts);
    }, {
    concurrency: 100,
    connection: {
        host: "localhost",
        port: 6379,
    }
});

