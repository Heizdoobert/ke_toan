/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { safeNum, detectDate, isNumericColumn, isDateColumn } from "./utils.js";

export class Model {
  constructor() {
    this.reset();
  }

  reset() {
    this.sourceA = { fileName: "", columns: [], rows: [] };
    this.sourceB = { fileName: "", columns: [], rows: [] };
    this.matchKeys = []; // composite keys selected for matching (up to 4)
    this.compareColumns = []; // numeric comparison columns (e.g., Amount)
    this.reconciliationResult = {
      matched: [],
      onlyInA: [],
      onlyInB: [],
      allCombined: [],
      summary: { totalA: 0, totalB: 0, matchedCount: 0, onlyACount: 0, onlyBCount: 0, totalAVal: 0, totalBVal: 0 }
    };
    this.analysisData = { fileName: "", columns: [], rows: [] }; // for Tab 2
    this.chartConfig = { xAxis: "", yAxis: "" }; // dynamic chart selections
  }

  setMatchKeys(keys) {
    this.matchKeys = Array.isArray(keys) ? keys : [keys];
  }

  setCompareColumns(cols) {
    this.compareColumns = Array.isArray(cols) ? cols : [cols];
  }

  setChartConfig(xAxis, yAxis) {
    this.chartConfig = { xAxis, yAxis };
  }

  /**
   * Helper to normalize values for hashing and equality checks.
   * Strips leading/trailing spaces, and converts to lowercase.
   */
  normalizeForHash(val) {
    if (val === undefined || val === null) return "EMPTY";
    const str = String(val).trim().toLowerCase();
    return str === "" ? "EMPTY" : str;
  }

  /**
   * Parse a loaded file (Excel/CSV) into core structures using SheetJS.
   * Leverages a header scanner heuristic that bypasses corporate logo lines.
   */
  async parseTabularData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const ext = file.name.split(".").pop().toLowerCase();

      if (ext === "csv") {
        reader.readAsText(file);
        reader.onload = (e) => {
          try {
            const text = e.target.result;
            const rowsArr = text.split("\n").map(line => {
              // Simple CSV split (handles basic spacing, ignores nested double quotes for complexity)
              return line.split(",").map(cell => cell.trim().replace(/^"|"$/g, ""));
            });
            const clean = this.extractCleanHeuristic(rowsArr, file.name);
            resolve(clean);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = (err) => reject(err);
      } else {
        reader.readAsArrayBuffer(file);
        reader.onload = (e) => {
          try {
            const buffer = e.target.result;
            const XLSX = window.XLSX;
            if (!XLSX) {
              reject(new Error("SheetJS CDN not fully loaded yet. Please refresh the page."));
              return;
            }
            const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rowsArr = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            const clean = this.extractCleanHeuristic(rowsArr, file.name);
            resolve(clean);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = (err) => reject(err);
      }
    });
  }

  /**
   * Scan first 12 lines of a file to detect the best row boundary as headers
   * and parse row objects cleanly to sanitize number cell formats.
   */
  extractCleanHeuristic(rawGrid, fileName) {
    if (!rawGrid || rawGrid.length === 0) {
      return { columns: [], rows: [] };
    }

    // Heuristic: identify header row with maximum populated cells in the first 12 rows
    let headerRowIdx = 0;
    let maxColumnsPopulated = 0;
    const scanLimit = Math.min(rawGrid.length, 12);

    for (let i = 0; i < scanLimit; i++) {
      const row = rawGrid[i] || [];
      const filledCount = row.filter(cell => cell !== undefined && cell !== null && String(cell).trim() !== "").length;
      if (filledCount > maxColumnsPopulated) {
        maxColumnsPopulated = filledCount;
        headerRowIdx = i;
      }
    }

    const rawHeaders = rawGrid[headerRowIdx] || [];
    const columns = rawHeaders.map((header, index) => {
      const label = String(header).trim();
      return label === "" ? `Column_${index + 1}` : label;
    });

    const rows = [];
    for (let i = headerRowIdx + 1; i < rawGrid.length; i++) {
      const rawRow = rawGrid[i];
      if (!rawRow) continue;

      // Skip blank rows or corporate totals signature block
      const isBlank = rawRow.every(c => c === undefined || c === null || String(c).trim() === "");
      if (isBlank) continue;

      const firstLeadVal = String(rawRow[0] || "").trim().toLowerCase();
      if (firstLeadVal.includes("prepared by") || firstLeadVal.includes("approved by") || firstLeadVal.startsWith("---") || firstLeadVal === "totals") {
        continue;
      }

      const rowObj = {};
      columns.forEach((header, colIndex) => {
        let cellVal = rawRow[colIndex];
        if (cellVal === undefined) cellVal = null;
        
        // Coerce types based on column heuristics
        if (isNumericColumn(header)) {
          rowObj[header] = safeNum(cellVal);
        } else if (isDateColumn(header, [cellVal])) {
          rowObj[header] = detectDate(cellVal, typeof cellVal === "number" ? "n" : "s");
        } else {
          rowObj[header] = cellVal === null ? "" : String(cellVal).trim();
        }
      });

      // Track source metadata reference
      rowObj["Origin_File_Name"] = fileName;
      rows.push(rowObj);
    }

    return { columns, rows };
  }

  /**
   * Load parsed data into state variables.
   */
  async loadFile(file, sourceLabel) {
    const data = await this.parseTabularData(file);
    if (sourceLabel === "Nguồn A") {
      this.sourceA = {
        fileName: file.name,
        columns: data.columns,
        rows: data.rows
      };
    } else {
      this.sourceB = {
        fileName: file.name,
        columns: data.columns,
        rows: data.rows
      };
    }
  }

  /**
   * Load visual sheet into Tab 2 standalone workspace.
   */
  async loadAnalysisFile(file) {
    const data = await this.parseTabularData(file);
    this.analysisData = {
      fileName: file.name,
      columns: data.columns,
      rows: data.rows
    };
  }

  /**
   * Outer Join alignments reconciling records side-by-side using hash indexing.
   */
  runReconciliation() {
    const keysA = this.matchKeys;
    const keysB = this.matchKeys; 
    const compColumns = this.compareColumns;

    const rowsA = this.sourceA.rows;
    const rowsB = this.sourceB.rows;

    const matched = [];
    const onlyInA = [];
    const onlyInB = [];

    // Counters to track duplicates / occurrences
    const seqCounterA = {};
    const seqCounterB = {};

    // Grouping index maps: key format is 'val1|val2|val3#index_occurrence'
    const mapA = {};
    const mapB = {};

    rowsA.forEach(row => {
      const keyStr = keysA.map(k => this.normalizeForHash(row[k])).join("|");
      seqCounterA[keyStr] = (seqCounterA[keyStr] === undefined) ? 0 : seqCounterA[keyStr] + 1;
      const finalHash = `${keyStr}#${seqCounterA[keyStr]}`;
      mapA[finalHash] = row;
    });

    rowsB.forEach(row => {
      const keyStr = keysB.map(k => this.normalizeForHash(row[k])).join("|");
      seqCounterB[keyStr] = (seqCounterB[keyStr] === undefined) ? 0 : seqCounterB[keyStr] + 1;
      const finalHash = `${keyStr}#${seqCounterB[keyStr]}`;
      mapB[finalHash] = row;
    });

    const allKeysHash = new Set([...Object.keys(mapA), ...Object.keys(mapB)]);
    const allCombined = [];

    allKeysHash.forEach(hashKey => {
      const rowA = mapA[hashKey];
      const rowB = mapB[hashKey];

      // Extract raw keys without occurrence sequence tag
      const rawKeyParts = hashKey.split("#")[0].split("|");

      const itemResult = {
        compositeKey: rawKeyParts.join(" | "),
        rowA: rowA || null,
        rowB: rowB || null,
        status: "",
        discrepancy: ""
      };

      if (rowA && rowB) {
        // Evaluate numerical compare pairs for discrepancies
        let isMatched = true;
        const mismatchPoints = [];

        compColumns.forEach(col => {
          const valA = rowA[col] !== undefined ? safeNum(rowA[col]) : 0;
          const valB = rowB[col] !== undefined ? safeNum(rowB[col]) : 0;
          const diff = valA - valB;

          if (Math.abs(diff) > 0.005) {
            isMatched = false;
            mismatchPoints.push(`Lệch cột [${col}]: ${diff > 0 ? "+" : ""}${diff.toFixed(2)} (A:${valA.toFixed(2)} | B:${valB.toFixed(2)})`);
          }
        });

        if (isMatched) {
          itemResult.status = "Matched";
          itemResult.discrepancy = "Khớp số liệu hoàn hảo";
          matched.push(itemResult);
        } else {
          itemResult.status = "Unmatched";
          itemResult.discrepancy = mismatchPoints.join("; ");
          onlyInA.push(itemResult); // classified as unresolved discrepancy
        }
      } else if (rowA) {
        itemResult.status = "Only In A";
        itemResult.discrepancy = "Thiếu bên Nguồn B (Thừa Nguồn A)";
        onlyInA.push(itemResult);
      } else {
        itemResult.status = "Only In B";
        itemResult.discrepancy = "Thiếu bên Nguồn A (Thừa Nguồn B)";
        onlyInB.push(itemResult);
      }

      allCombined.push(itemResult);
    });

    // Compute direct totals
    let totalAVal = 0;
    let totalBVal = 0;
    
    // Choose first compareColumn to sum if available
    const primarySumCol = compColumns[0] || "";
    if (primarySumCol) {
      rowsA.forEach(row => totalAVal += safeNum(row[primarySumCol]));
      rowsB.forEach(row => totalBVal += safeNum(row[primarySumCol]));
    }

    this.reconciliationResult = {
      matched,
      onlyInA,
      onlyInB,
      allCombined,
      summary: {
        totalA: rowsA.length,
        totalB: rowsB.length,
        matchedCount: matched.length,
        onlyACount: onlyInA.length,
        onlyBCount: onlyInB.length,
        totalAVal,
        totalBVal
      }
    };
  }

  /**
   * Generates aggregated group by metrics for independent Tab 2 pivot charts.
   */
  getPivotData() {
    const xKey = this.chartConfig.xAxis;
    const yKey = this.chartConfig.yAxis;

    if (!xKey || !this.analysisData.rows.length) {
      return { labels: [], dataset: [] };
    }

    const groups = {};
    this.analysisData.rows.forEach(row => {
      let xVal = String(row[xKey] || "Chưa phân loại").trim();
      if (xVal === "") xVal = "Chưa phân loại";

      const yVal = yKey ? safeNum(row[yKey]) : 1; // Default count aggregation if no y axis numeric column is present

      if (!groups[xVal]) {
        groups[xVal] = 0;
      }
      groups[xVal] += yVal;
    });

    // Extract sorted label list
    const sortedKeys = Object.keys(groups).sort((a, b) => groups[b] - groups[a]).slice(0, 20); // Top 20 for graphs readability
    return {
      labels: sortedKeys,
      dataset: sortedKeys.map(k => parseFloat(groups[k].toFixed(2)))
    };
  }
}
