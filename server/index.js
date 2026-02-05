import express from "express";
import cors from "cors";
import multer from "multer";
import { Queue } from "bullmq";
import { ChatOllama } from "@langchain/ollama";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OllamaEmbeddings } from "@langchain/ollama";

const queue = new Queue("file-upload-queue", {
    connection: {
        host: "localhost",
        port: 6379,
    }
});





const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
})

const upload = multer({ storage: storage })


const app = express();
app.use(cors());

app.get("/", (req, res) => {
    return res.json
        ({ status: "All good" })
});


app.post('/upload/pdf', upload.single('pdf'), async (req, res) => {
    queue.add('file-ready', JSON.stringify({
        filename: req.file.originalname,
        destination: req.file.destination,
        path: req.file.path,

    }))
    return res.json({ message: "PDF uploaded successfully" })
});

app.get('/chat', async (req, res) => {
    try {
        const userQuery = req.query.message;

        const embeddings = new OllamaEmbeddings({
            model: "nomic-embed-text",
            baseUrl: "http://localhost:11434",
        });

        const vectorStore = await QdrantVectorStore.fromExistingCollection(
            embeddings,
            {
                url: "http://localhost:6333",
                collectionName: "pdf_docs",
            }
        );

        const ret = vectorStore.asRetriever({ k: 2 });
        const result = await ret.invoke(userQuery);

        const SYSTEM_PROMPT = `You are helpful assistant.who answers the users query based on the data provided.
        context:
        ${JSON.stringify(result)}
        
        `;
        const llm = new ChatOllama({
            model: "llama3.2:1b",
            temperature: 0,
            baseUrl: "http://localhost:11434",
        });

        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userQuery },
        ];

        const chatResult = await llm.invoke(messages);

        return res.json({ message: chatResult.content, docs: result });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: e.message });
    }
});

app.listen(8000, () => {
    console.log(`Server is running on port :${8000}`);
});