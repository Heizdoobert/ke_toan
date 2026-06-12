/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { 
  getDatabase, 
  updateSchema, 
  updateSources, 
  updateResults, 
  clearDatabase, 
  deleteHistoryItem 
} from "./server/db";
import { reconcileDataSources } from "./src/utils/reconciler";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Max payload size to handle huge Excel file datasets loaded in RAM
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Middleware logging
  app.use((req, res, next) => {
    console.log(`[Reconciler API] ${req.method} ${req.path}`);
    next();
  });

  // ==========================================
  // CONTROLLER API ENDPOINTS (REST Interfaces)
  // ==========================================

  // Get current state of cached schemas, datasets, and run logging history
  app.get("/api/database", (req, res) => {
    try {
      const db = getDatabase();
      res.json(db);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to reload persistent storage", details: err.message });
    }
  });

  // Update rule settings schema
  app.post("/api/schema", (req, res) => {
    try {
      const { schema } = req.body;
      if (!schema) {
        return res.status(400).json({ error: "Missing schema in request body" });
      }
      const updatedDb = updateSchema(schema);
      res.json(updatedDb);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to update configuration rule", details: err.message });
    }
  });

  // Save parsed Source A and Source B datasets
  app.post("/api/sources", (req, res) => {
    try {
      const { sourceA, sourceB } = req.body;
      if (!sourceA || !sourceB) {
        return res.status(400).json({ error: "Missing sourceA or sourceB datasets" });
      }
      const updatedDb = updateSources(sourceA, sourceB);
      res.json(updatedDb);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to load ledger sources", details: err.message });
    }
  });

  // Execute dual-hash outer join lookups on the server and cache results
  app.post("/api/reconcile", (req, res) => {
    try {
      const db = getDatabase();
      const { schema } = db;
      
      if (!db.sourceA.rows.length || !db.sourceB.rows.length) {
        return res.status(400).json({ error: "Both Source A and Source B ledger datasets must be uploaded first" });
      }

      // Run our high-speed alignment reconciliation algorithm
      const { results, executionTimeMs } = reconcileDataSources(
        db.sourceA.rows, 
        db.sourceB.rows, 
        schema
      );

      // Save output sheets and update run history logging in the json DB file
      const updatedDb = updateResults(results, executionTimeMs);

      res.json({
        reconciledResults: results,
        elapsedTime: executionTimeMs,
        history: updatedDb.history
      });
    } catch (err: any) {
      console.error("Reconciliation execution failed", err);
      res.status(500).json({ error: "Reconciliation core execution failed", details: err.message });
    }
  });

  // Clear caches database
  app.post("/api/clear", (req, res) => {
    try {
      const clearedDb = clearDatabase();
      res.json(clearedDb);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to purge cache data", details: err.message });
    }
  });

  // Erase history item by uid
  app.delete("/api/history/:id", (req, res) => {
    try {
      const { id } = req.params;
      const updatedDb = deleteHistoryItem(id);
      res.json(updatedDb);
    } catch (err: any) {
      res.status(500).json({ error: "Failed to remove run logging history", details: err.message });
    }
  });

  // ==========================================
  // VITE / STATIC ROUTING ENVIRONMENT PIPELINE
  // ==========================================

  if (process.env.NODE_ENV !== "production") {
    // Mount Vite dev server middleware to handle dynamic script bundling & hot reload
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite Development Server Middleware on express dashboard.");
  } else {
    // Serve static files in production environment
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static pre-built files from dist directory.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log("===================================================================");
    console.log("   UNIVERSAL ACCOUNTING DATA RECONCILER - MVC HIGH SPEED CLOUD RUN  ");
    console.log(`   Running on port: http://localhost:${PORT}`);
    console.log("===================================================================");
  });
}

startServer().catch((err) => {
  console.error("Express startup has crashed unexpectedly", err);
});
