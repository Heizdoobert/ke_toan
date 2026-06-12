/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Safely parses any value into a floating-point number, defaulting to 0 if invalid.
 */
export function safeNum(val) {
  if (val === undefined || val === null) return 0;
  if (typeof val === "number") return val;
  const str = String(val).replace(/[^0-9.-]/g, ""); // Strip currency symbols/commas
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * Normalizes Excel dates from serial codes or strings to YYYY-MM-DD format.
 */
export function detectDate(val, cellType) {
  if (val === undefined || val === null) return "";
  
  // 1. Check if XLSX serial number date
  if (cellType === "n" && typeof val === "number" && val >= 35000 && val <= 70000) {
    try {
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      return formatDate(date);
    } catch {
      // Fallback
    }
  }

  const str = String(val).trim();
  
  // 2. Parse common string date regexes
  // Match DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Match YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, "0");
    const day = ymdMatch[3].padStart(2, "0");
    
    // Check if time is also included
    const timeMatch = str.match(/T?(\d{2}):(\d{2}):(\d{2})/);
    if (timeMatch) {
      return `${year}-${month}-${day} ${timeMatch[1]}:${timeMatch[2]}:${timeMatch[3]}`;
    }
    return `${year}-${month}-${day}`;
  }

  // Fallback to JS standard parser
  const parsedTimestamp = Date.parse(str);
  if (!isNaN(parsedTimestamp)) {
    const d = new Date(parsedTimestamp);
    // Ignore invalid default epochs like 1970 if possible
    if (d.getFullYear() > 1990 && d.getFullYear() < 2100) {
      return formatDate(d);
    }
  }

  return str;
}

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const r = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${r}`;
}

/**
 * Checks if a column represents amounts and total financial values.
 */
export function isNumericColumn(colName) {
  if (!colName) return false;
  const name = colName.toLowerCase();
  const patterns = [
    "số tiền", "giá trị", "amount", "value", "total", "revenue", 
    "cost", "balance", "debit", "credit", "sum", "thành tiền", 
    "đơn giá", "quy đổi", "số lượng", "vận chuyển", "thuế"
  ];
  return patterns.some(p => name.includes(p));
}

/**
 * Analyzes both column titles and row samples to recognize date cells.
 */
export function isDateColumn(colName, sampleValues = []) {
  if (!colName) return false;
  const name = colName.toLowerCase();
  const datePatterns = ["ngày", "date", "time", "tháng", "năm", "chu kỳ", "hạn"];
  if (datePatterns.some(p => name.includes(p))) {
    return true;
  }

  if (sampleValues.length === 0) return false;

  // Verify sample cell parse compliance rate against date pattern matches
  let parseableCount = 0;
  const checks = sampleValues.slice(0, 20).filter(v => v !== undefined && v !== null && v !== "");
  if (checks.length === 0) return false;

  checks.forEach(val => {
    const str = String(val).trim();
    // basic regex check
    if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(str) || /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(str)) {
      parseableCount++;
    }
  });

  return (parseableCount / checks.length) >= 0.50;
}
