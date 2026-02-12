import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";

const app = express();

app.use(cors());
app.use(express.json());

// --- API ---
app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.use((req: Request, res: Response) => {
    res.status(404).json({
        message: `The URL ${req.originalUrl} does not exist`,
    });
});
const PORT = 8080;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});