/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";
import { ReconciliationSchema, SourceData, ReconciliationResult } from "../src/types";

export interface ReconHistoryItem {
  id: string;
  timestamp: string;
  fileNameA: string;
  fileNameB: string;
  matchedCount: number;
  unmatchedCount: number;
  totalA: number;
  totalB: number;
  elapsedTime: number;
}

export interface DatabaseState {
  schema: ReconciliationSchema;
  sourceA: SourceData;
  sourceB: SourceData;
  reconciledResults: ReconciliationResult[];
  history: ReconHistoryItem[];
}

const DB_FILE_PATH = path.join(process.cwd(), "recon_db.json");

const DEFAULT_STATE: DatabaseState = {
  schema: {
    keysA: [""],
    keysB: [""],
    comparePairs: [{ colA: "", colB: "" }],
    groupByEnabled: false
  },
  sourceA: { headers: [], rows: [], fileName: "" },
  sourceB: { headers: [], rows: [], fileName: "" },
  reconciledResults: [],
  history: []
};

// Ensure database file exists
export function initDatabase(): DatabaseState {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(DEFAULT_STATE, null, 2), "utf8");
      return DEFAULT_STATE;
    }
    const rawData = fs.readFileSync(DB_FILE_PATH, "utf8");
    return JSON.parse(rawData);
  } catch (err) {
    console.error("Failed to initialize or parse JSON database file. Resetting to default.", err);
    return DEFAULT_STATE;
  }
}

export function getDatabase(): DatabaseState {
  return initDatabase();
}

export function saveDatabase(data: DatabaseState): void {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed writing state to JSON database file.", err);
  }
}

export function updateSchema(schema: ReconciliationSchema): DatabaseState {
  const db = getDatabase();
  db.schema = schema;
  saveDatabase(db);
  return db;
}

export function updateSources(sourceA: SourceData, sourceB: SourceData): DatabaseState {
  const db = getDatabase();
  db.sourceA = sourceA;
  db.sourceB = sourceB;
  saveDatabase(db);
  return db;
}

export function updateResults(results: ReconciliationResult[], elapsedMs: number): DatabaseState {
  const db = getDatabase();
  db.reconciledResults = results;
  
  // Add a history item for this run
  const matchedCount = results.filter((r) => r.status === "Matched").length;
  const unmatchedCount = results.filter((r) => r.status === "Unmatched" || r.status.includes("Not Found")).length;
  
  const historyItem: ReconHistoryItem = {
    id: `run_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    fileNameA: db.sourceA.fileName || "N/A",
    fileNameB: db.sourceB.fileName || "N/A",
    matchedCount,
    unmatchedCount,
    totalA: db.sourceA.rows.length,
    totalB: db.sourceB.rows.length,
    elapsedTime: elapsedMs
  };
  
  db.history.unshift(historyItem); // Add to beginning of history list
  saveDatabase(db);
  return db;
}

export function clearDatabase(): DatabaseState {
  saveDatabase(DEFAULT_STATE);
  return DEFAULT_STATE;
}

export function deleteHistoryItem(id: string): DatabaseState {
  const db = getDatabase();
  db.history = db.history.filter((item) => item.id !== id);
  saveDatabase(db);
  return db;
}
