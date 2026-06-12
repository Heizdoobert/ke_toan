/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { ReconciliationSchema, SourceData, ReconciliationResult } from "../types";

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

export class ReconController {
  /**
   * Fetches the complete database model state from the server.
   */
  static async loadDatabase(): Promise<DatabaseState> {
    const res = await fetch("/api/database");
    if (!res.ok) {
      throw new Error("Failed to load database state from Express server model.");
    }
    return res.json();
  }

  /**
   * Sets the active pairing rule schema configurations persistently.
   */
  static async saveSchema(schema: ReconciliationSchema): Promise<DatabaseState> {
    const res = await fetch("/api/schema", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ schema })
    });
    if (!res.ok) {
      throw new Error("Failed to update active rules configurations.");
    }
    return res.json();
  }

  /**
   * Uploads both ledger sources (Source A and Source B) lists to the persistent memory.
   */
  static async saveSources(sourceA: SourceData, sourceB: SourceData): Promise<DatabaseState> {
    const res = await fetch("/api/sources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sourceA, sourceB })
    });
    if (!res.ok) {
      throw new Error("Failed to upload transactional databases to RAM server storage.");
    }
    return res.json();
  }

  /**
   * Triggers server-side composite key full outer join alignment lookups.
   */
  static async executeReconciliation(): Promise<{
    reconciledResults: ReconciliationResult[];
    elapsedTime: number;
    history: ReconHistoryItem[];
  }> {
    const res = await fetch("/api/reconcile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) {
      const errRes = await res.json().catch(() => ({ details: "No response details" }));
      throw new Error(errRes.error || errRes.details || "Failed executing the core alignment algorithms.");
    }
    return res.json();
  }

  /**
   * Wipes configuration rules, sources list, and past runs history.
   */
  static async clearDatabase(): Promise<DatabaseState> {
    const res = await fetch("/api/clear", {
      method: "POST"
    });
    if (!res.ok) {
      throw new Error("Failed to wipe caches and DB state.");
    }
    return res.json();
  }

  /**
   * Removes specific history ledger run entry.
   */
  static async deleteHistoryItem(id: string): Promise<DatabaseState> {
    const res = await fetch(`/api/history/${id}`, {
      method: "DELETE"
    });
    if (!res.ok) {
      throw new Error("Failed to remove historical logger event.");
    }
    return res.json();
  }
}
