/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { readDB, writeDB } from "./server/db.js";

const app = express();
const PORT = 3000;

// Enable JSON middleware with high limits for handling complete Excel configurations
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve static compiled assets from the 'public' directory
app.use(express.static(path.join(process.cwd(), "public")));

// Route to get current settings configuration and run logging history
app.get("/api/db", (req, res) => {
  try {
    const data = readDB();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to load database state", details: err.message });
  }
});

// Route to update stored configuration schemas or logging history
app.post("/api/db", (req, res) => {
  try {
    const newDbState = req.body;
    writeDB(newDbState);
    res.json({ success: true, data: newDbState });
  } catch (err) {
    res.status(500).json({ error: "Failed to persist database state", details: err.message });
  }
});

// Wildcard fallback routing to index.html for Single Page Application
app.get("*", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("===================================================================");
  console.log("   UNIVERSAL ACCOUNTING DATA RECONCILER - MVC HIGH SPEED CONSOLE  ");
  console.log(`   Running natively on Port: http://localhost:${PORT}`);
  console.log("===================================================================");
});
