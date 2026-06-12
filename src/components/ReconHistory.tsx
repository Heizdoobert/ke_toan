/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { History, Calendar, Trash2, Clock, CheckCircle2, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { ReconHistoryItem } from "../controllers/ReconController";

interface ReconHistoryProps {
  history: ReconHistoryItem[];
  onDeleteHistory: (id: string) => void;
}

export default function ReconHistory({ history, onDeleteHistory }: ReconHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 font-sans flex flex-col items-center justify-center text-center gap-1.5 opacity-80">
        <History className="h-8 w-8 text-slate-300 stroke-1" />
        <h4 className="font-semibold text-xs text-slate-600 uppercase tracking-wide">Historical Reconciliation runs</h4>
        <p className="text-[11px] text-slate-400 max-w-xs">
          No records are stored in the server `.json` database file yet. Complete an audit run to log executions.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 font-sans flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-indigo-700" />
          <h3 className="font-semibold text-sm text-slate-800 tracking-tight">
            Database Run History Ledger <span className="text-slate-400 font-normal font-mono text-xs">({history.length})</span>
          </h3>
        </div>
        <span className="text-[10px] bg-slate-150 border border-slate-200 px-2 py-0.5 rounded font-mono text-slate-500">
          Persistent JSON Storage DB
        </span>
      </div>

      <div className="max-h-[250px] overflow-y-auto flex flex-col gap-2.5 pr-1" id="history-items-container">
        {history.map((item) => {
          const formattedDate = new Date(item.timestamp).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
          });

          // Compute matched percentages
          const totalRowsCombined = item.totalA + item.totalB;
          const matchRate = totalRowsCombined > 0 
            ? ((item.matchedCount * 2) / totalRowsCombined) * 100 
            : 100;
          
          let alertColor = "text-emerald-600 bg-emerald-50 border border-emerald-100";
          if (matchRate < 60) {
            alertColor = "text-rose-600 bg-rose-50 border border-rose-100";
          } else if (matchRate < 95) {
            alertColor = "text-amber-600 bg-amber-50 border border-amber-100";
          }

          return (
            <div 
              key={item.id} 
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border border-slate-150 bg-slate-50 hover:bg-slate-55 transition gap-3"
            >
              <div className="flex items-start gap-3 flex-grow">
                <div className={`mt-0.5 p-1.5 rounded-full ${alertColor}`}>
                  {matchRate >= 95 ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                </div>

                <div className="flex flex-col gap-0.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-xs font-bold text-slate-800">
                      Match Rate: {matchRate.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-405 font-mono flex items-center gap-0.5">
                      <Calendar className="h-3 w-3" /> {formattedDate}
                    </span>
                  </div>

                  {/* Datasets file labels */}
                  <div className="text-[11px] text-slate-500 font-medium flex flex-wrap items-center gap-1.5">
                    <span className="flex items-center gap-0.5 text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-1 py-0.2 rounded text-[10px]">
                      A: {item.fileNameA}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-0.5 text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-1 py-0.2 rounded text-[10px]">
                      B: {item.fileNameB}
                    </span>
                  </div>

                  {/* Summary of entries */}
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
                    <span>A Row count: {item.totalA}</span>
                    <span>•</span>
                    <span>B Row count: {item.totalB}</span>
                    <span>•</span>
                    <span>Matches: {item.matchedCount}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-slate-500">
                      <Clock className="h-3 w-3" /> {item.elapsedTime} ms
                    </span>
                  </div>
                </div>
              </div>

              {/* Delete run logging entry */}
              <button
                type="button"
                onClick={() => onDeleteHistory(item.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-white border border-transparent hover:border-slate-202 transition shrink-0 cursor-pointer"
                title="Delete run record"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
