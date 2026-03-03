import { Router } from "express";
import db from "../services/db.js";

const router = Router();

// GET /api/favorites
router.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM favorites ORDER BY created_at DESC");
  res.json(result.rows);
});

// POST /api/favorites  { summoner_name, region, puuid }
router.post("/", async (req, res) => {
  const { summoner_name, region, puuid } = req.body;
  const result = await db.query(
    `INSERT INTO favorites (summoner_name, region, puuid)
     VALUES ($1, $2, $3)
     ON CONFLICT (puuid) DO NOTHING
     RETURNING *`,
    [summoner_name, region, puuid]
  );
  res.status(201).json(result.rows[0] ?? { message: "Already in favorites" });
});

// DELETE /api/favorites/:id
router.delete("/:id", async (req, res) => {
  await db.query("DELETE FROM favorites WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

export default router;
