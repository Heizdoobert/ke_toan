/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), "server");
const DB_FILE_PATH = path.join(DB_DIR, "recon_db.json");

const DEFAULT_STATE = {
  config: {
    matchKeys: [],
    compareColumns: [],
    groupByEnabled: false
  },
  history: []
};

/**
 * Ensures that the DB folder and file exist, and returns the parsed contents.
 */
export function readDB() {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(DEFAULT_STATE, null, 2), "utf8");
      return DEFAULT_STATE;
    }
    
    const raw = fs.readFileSync(DB_FILE_PATH, "utf8");
    if (!raw.trim()) {
      return DEFAULT_STATE;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("[db.js] Error parsing JSON database state:", err);
    return DEFAULT_STATE;
  }
}

/**
 * Writes the given DB object back to recon_db.json.
 */
export function writeDB(data) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data || DEFAULT_STATE, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("[db.js] Error writing JSON database state:", err);
    return false;
  }
}
