import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
    // Placeholder – byts mot riktig API-fetch + cache
    res.json({
        location: "Linköping",
        temperatureC: 0,
        description: "placeholder",
        updatedAt: new Date().toISOString(),
    });
});

export default router;
