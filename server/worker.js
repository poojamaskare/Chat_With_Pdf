import { Worker } from "bullmq";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OllamaEmbeddings } from "@langchain/ollama";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { CharacterTextSplitter } from "@langchain/textsplitters";

const worker = new Worker(
  "file-upload-queue",
  async (job) => {
    try {
      console.log("Worker started...");
      const data = JSON.parse(job.data);

      // 1️⃣ Load PDF
      const loader = new PDFLoader(data.path);
      const docs = await loader.load();

      // 2️⃣ Split text
      const splitter = new CharacterTextSplitter({
        chunkSize: 300,
        chunkOverlap: 0,
      });
      const texts = await splitter.splitDocuments(docs);

      // 3️⃣ Ollama embeddings (NO API KEY)
      const embeddings = new OllamaEmbeddings({
        model: "nomic-embed-text",
        baseUrl: "http://localhost:11434",
      });

      // 4️⃣ Store embeddings in Qdrant
      await QdrantVectorStore.fromDocuments(texts, embeddings, {
        url: "http://localhost:6333",
        collectionName: "pdf_docs",
      });

      console.log("PDF embeddings stored successfully ✅");
    } catch (error) {
      console.error("Worker failed:", error);
      throw error;
    }
  },

  {
    concurrency: 100,
    connection: {
      host: "localhost",
      port: 6379,
    },
  }
);
