/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class View {
  constructor() {
    this.initDOMBindings();
  }

  initDOMBindings() {
    // Top-level Navigation Tabs
    this.tabReconBtn = document.getElementById("tab-recon-btn");
    this.tabAnalysisBtn = document.getElementById("tab-analysis-btn");
    this.tabReconContent = document.getElementById("tab-recon-content");
    this.tabAnalysisContent = document.getElementById("tab-analysis-content");

    // Top Action Buttons
    this.clearCacheBtn = document.getElementById("clear-cache-btn");

    // Tab 1 Dropzones and File Upload Panel Elements
    this.dropzoneA = document.getElementById("dropzone-A");
    this.dropZoneB = document.getElementById("dropzone-B");
    this.fileInputA = document.getElementById("file-input-A");
    this.fileInputB = document.getElementById("file-input-B");
    
    // Tab 1 Paste Area Elements
    this.pasteAreaA = document.getElementById("paste-area-A");
    this.pasteAreaB = document.getElementById("paste-area-B");
    this.btnPasteParseA = document.getElementById("btn-paste-parse-A");
    this.btnPasteParseB = document.getElementById("btn-paste-parse-B");

    // Tab 1 Input Tabs Toggle
    this.tabBtnFileA = document.getElementById("tab-btn-file-A");
    this.tabBtnPasteA = document.getElementById("tab-btn-paste-A");
    this.tabBtnFileB = document.getElementById("tab-btn-file-B");
    this.tabBtnPasteB = document.getElementById("tab-btn-paste-B");

    this.wrapperFileA = document.getElementById("wrapper-file-A");
    this.wrapperPasteA = document.getElementById("wrapper-paste-A");
    this.wrapperFileB = document.getElementById("wrapper-file-B");
    this.wrapperPasteB = document.getElementById("wrapper-paste-B");

    // Tab 1 Previews and Configuration panels
    this.previewAContainer = document.getElementById("preview-A-container");
    this.previewBContainer = document.getElementById("preview-B-container");
    this.rulesMappingBoard = document.getElementById("rules-mapping-board");

    // Tab 1 Execution and Export
    this.btnRunRecon = document.getElementById("btn-run-recon");
    this.btnExportExcel = document.getElementById("btn-export-excel");
    this.resultsCardBlock = document.getElementById("results-card-block");
    this.reconcileOutputTable = document.getElementById("reconcile-output-table");

    // Tab 2 Elements
    this.dropzoneSingle = document.getElementById("dropzone-single");
    this.fileInputSingle = document.getElementById("file-input-single");
    this.analysisGridContainer = document.getElementById("analysis-grid-container");
    this.chartXSelect = document.getElementById("chart-x-select");
    this.chartYSelect = document.getElementById("chart-y-select");
    this.summaryPivotTable = document.getElementById("summary-pivot-table");

    // Tab 2 Toolbar Editors
    this.btnAddRow = document.getElementById("btn-add-row");
    this.btnDelRow = document.getElementById("btn-del-row");
    this.btnAddCol = document.getElementById("btn-add-col");
    this.btnDelCol = document.getElementById("btn-del-col");

    // Tab 2 Chart display elements
    this.canvasBar = document.getElementById("chart-bar");
    this.canvasLine = document.getElementById("chart-line");
    this.canvasPie = document.getElementById("chart-pie");
    this.canvasDoughnut = document.getElementById("chart-doughnut");

    this.toggleBar = document.getElementById("toggle-chart-bar");
    this.toggleLine = document.getElementById("toggle-chart-line");
    this.togglePie = document.getElementById("toggle-chart-pie");
    this.toggleDoughnut = document.getElementById("toggle-chart-doughnut");

    this.cardBar = document.getElementById("card-chart-bar");
    this.cardLine = document.getElementById("card-chart-line");
    this.cardPie = document.getElementById("card-chart-pie");
    this.cardDoughnut = document.getElementById("card-chart-doughnut");

    // Detail View Modal Elements
    this.detailModal = document.getElementById("detail-modal");
    this.detailModalClose = document.getElementById("detail-modal-close");
    this.detailModalCloseBtn = document.getElementById("detail-modal-close-btn");
    this.detailModalKey = document.getElementById("detail-modal-key");
    this.detailModalStatus = document.getElementById("detail-modal-status");
    this.detailModalBanner = document.getElementById("detail-modal-banner");
    this.detailModalDiscrepancyText = document.getElementById("detail-modal-discrepancy-text");
    this.detailSourceARows = document.getElementById("detail-source-a-rows");
    this.detailSourceBRows = document.getElementById("detail-source-b-rows");
    this.detailSourceABadge = document.getElementById("detail-source-a-badge");
    this.detailSourceBBadge = document.getElementById("detail-source-b-badge");
  }

  showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `flex items-center gap-2 px-4 py-3 rounded-lg border text-xs font-semibold shadow-lg transition-transform duration-300 translate-y-5 opacity-0 ${
      type === "error" 
        ? "bg-rose-50 text-rose-800 border-rose-200" 
        : type === "warning"
        ? "bg-amber-50 text-amber-800 border-amber-200"
        : "bg-emerald-50 text-emerald-800 border-emerald-200"
    }`;
    toast.innerHTML = `
      <span class="h-1.5 w-1.5 rounded-full ${type === "error" ? "bg-rose-600" : type === "warning" ? "bg-amber-600" : "bg-emerald-600"}"></span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    
    // Trigger animations
    setTimeout(() => {
      toast.classList.remove("translate-y-5", "opacity-0");
    }, 10);

    setTimeout(() => {
      toast.classList.add("translate-y-5", "opacity-0");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4500);
  }

  switchTab(activeTab) {
    if (activeTab === "recon") {
      this.tabReconBtn.classList.add("border-indigo-650", "text-indigo-600");
      this.tabReconBtn.classList.remove("border-transparent", "text-slate-500");
      this.tabAnalysisBtn.classList.add("border-transparent", "text-slate-500");
      this.tabAnalysisBtn.classList.remove("border-indigo-650", "text-indigo-600");

      this.tabReconContent.classList.remove("hidden");
      this.tabAnalysisContent.classList.add("hidden");
    } else {
      this.tabAnalysisBtn.classList.add("border-indigo-650", "text-indigo-600");
      this.tabAnalysisBtn.classList.remove("border-transparent", "text-slate-500");
      this.tabReconBtn.classList.add("border-transparent", "text-slate-500");
      this.tabReconBtn.classList.remove("border-indigo-650", "text-indigo-600");

      this.tabAnalysisContent.classList.remove("hidden");
      this.tabReconContent.classList.add("hidden");
    }
  }

  showProgressBar(percent) {
    const slider = document.getElementById("progress-bar-slider");
    if (slider) {
      slider.style.width = `${percent}%`;
    }
  }

  showPerformance(ms) {
    const ticker = document.getElementById("elapsed-time-ticker");
    if (ticker) {
      ticker.textContent = `${ms} ms / tính toán MVC local`;
    }
  }

  /**
   * Renders the parsed rows preview inside small scroll grids for ledgers A & B.
   */
  renderSourcePreview(side, headers, rows, fileName) {
    const container = side === "A" ? this.previewAContainer : this.previewBContainer;
    if (!container) return;

    if (!rows || rows.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-400 flex flex-col items-center justify-center flex-grow h-full">
          <i data-lucide="file-spreadsheet" class="h-8 w-8 text-slate-300 stroke-1 mb-2"></i>
          <span class="text-xs">Chưa có dữ liệu nguồn ${side}...</span>
        </div>
      `;
      window.lucide?.createIcons();
      return;
    }

    let summaryText = `File: <span class="font-bold text-slate-700">${fileName}</span>  |  Số dòng: <span class="font-bold text-indigo-700">${rows.length} dòng</span>`;
    
    let tableHtml = `
      <div class="bg-indigo-50/50 px-3 py-2 border-b border-slate-150 flex items-center justify-between text-[11px] text-slate-600">
        <span class="truncate pr-2">${summaryText}</span>
        <button id="btn-clear-preview-${side}" class="text-rose-600 hover:text-rose-900 font-bold hover:underline select-none cursor-pointer">Xóa</button>
      </div>
      <div class="overflow-auto relative flex-grow max-h-[300px]">
        <table class="w-full text-left text-[10px] border-collapse bg-white">
          <thead class="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200 z-10">
            <tr>
              ${headers.map(h => `<th class="px-2.5 py-1.5 border-r border-slate-200 bg-slate-100">${h}</th>`).join("")}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${rows.slice(0, 100).map(row => `
              <tr class="hover:bg-slate-50">
                ${headers.map(h => {
                  let cellVal = row[h];
                  if (cellVal === null || cellVal === undefined) cellVal = "";
                  if (typeof cellVal === "number") cellVal = cellVal.toLocaleString("en-US", { minimumFractionDigits: 2 });
                  return `<td class="px-2.5 py-1.5 border-r border-slate-150 truncate max-w-[150px] font-mono">${cellVal}</td>`;
                }).join("")}
              </tr>
            `).join("")}
            ${rows.length > 100 ? `
              <tr class="bg-slate-50 font-semibold text-slate-400">
                <td colspan="${headers.length}" class="px-3 py-2 text-center text-[10px]">Đang hiển thị 100 dòng đầu tiên...</td>
              </tr>
            ` : ""}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = tableHtml;
    container.classList.remove("h-[380px]", "flex", "items-center", "justify-center");
  }

  /**
   * Constructs the rules mapping configuration panel multi-select list of columns.
   */
  renderSetupPanel(headersA, headersB, currentKeys, currentComp) {
    if (headersA.length === 0 || headersB.length === 0) {
      this.rulesMappingBoard.innerHTML = `
        <p class="text-xs text-slate-400 text-center py-4">Vui lòng tải tệp Nguồn A và Nguồn B để mở khóa bộ cấu hình quy tắc đối chiếu.</p>
      `;
      this.btnRunRecon.disabled = true;
      return;
    }

    this.btnRunRecon.disabled = false;

    // Filter headers commonalities or allow selecting individual keys
    let keysHtml = `
      <div class="flex flex-col gap-3">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Cột khóa đối chiếu (Chọn 1 đến 4 trường để lập composite key):</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2" id="key-selection-list">
            ${headersA.map(h => {
              const checked = currentKeys.includes(h) ? "checked" : "";
              return `
                <label class="flex items-center gap-1.5 p-2 rounded border border-slate-200 bg-slate-55 text-[11px] cursor-pointer hover:bg-slate-100 transition select-none">
                  <input type="checkbox" name="matchKeySelector" value="${h}" ${checked} class="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5" />
                  <span class="truncate text-slate-700 font-semibold" title="${h}">${h}</span>
                </label>
              `;
            }).join("")}
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1">Cột so sánh giá trị số (Ví dụ: Số tiền, Số lượng):</label>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2" id="comp-selection-list">
            ${headersA.map(h => {
              const checked = currentComp.includes(h) ? "checked" : "";
              const bgClass = checked ? "bg-indigo-50 border-indigo-250" : "bg-slate-55";
              return `
                <label class="flex items-center gap-1.5 p-2 rounded border border-slate-200 ${bgClass} text-[11px] cursor-pointer hover:bg-slate-100 transition select-none">
                  <input type="checkbox" name="compKeySelector" value="${h}" ${checked} class="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5" />
                  <span class="truncate text-slate-700 font-semibold" title="${h}">${h}</span>
                </label>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;

    this.rulesMappingBoard.innerHTML = keysHtml;
  }

  /**
   * Refreshes KPI summary widgets inside Tab 1.
   */
  renderKPIs(summary) {
    const kpiTotalA = document.getElementById("kpi-total-a");
    const kpiValA = document.getElementById("kpi-val-a");
    const kpiTotalB = document.getElementById("kpi-total-b");
    const kpiValB = document.getElementById("kpi-val-b");
    const kpiMatches = document.getElementById("kpi-matches");
    const kpiPercentLabel = document.getElementById("kpi-percent-label");

    if (kpiTotalA) kpiTotalA.textContent = `${summary.totalA} dòng`;
    if (kpiValA) kpiValA.textContent = summary.totalAVal.toLocaleString("en-US", { minimumFractionDigits: 2 });
    
    if (kpiTotalB) kpiTotalB.textContent = `${summary.totalB} dòng`;
    if (kpiValB) kpiValB.textContent = summary.totalBVal.toLocaleString("en-US", { minimumFractionDigits: 2 });

    if (kpiMatches) kpiMatches.textContent = `${summary.matchedCount} cặp`;

    const grandCombined = summary.totalA + summary.totalB;
    const rate = grandCombined > 0 ? ((summary.matchedCount * 2) / grandCombined) * 100 : 0;
    if (kpiPercentLabel) {
      kpiPercentLabel.textContent = `${rate.toFixed(1)}%`;
    }
  }

  /**
   * Populates the aligned matching cells and discrepancies into the output table.
   */
  renderReconciliationResult(results, columnsA, columnsB, matchKeys, compColumns) {
    this.resultsCardBlock.classList.remove("hidden");
    
    if (!results || results.length === 0) {
      this.reconcileOutputTable.innerHTML = `
        <tr>
          <td class="p-8 text-center text-xs text-slate-400">Không có bản ghi nào để hiển thị.</td>
        </tr>
      `;
      return;
    }

    const matchedRecords = results.filter(r => r.status === "Matched").length;
    const unmatchedRecords = results.filter(r => r.status !== "Matched").length;
    
    const countTicker = document.getElementById("outputs-stat-ticker");
    if (countTicker) {
      countTicker.innerHTML = `Đã khớp: <span class="text-emerald-600 font-bold">${matchedRecords}</span>  |  Không khớp / Lệch: <span class="text-rose-600 font-bold">${unmatchedRecords}</span>`;
    }

    // Identify side-by-side values to render
    let theadHtml = `
      <thead class="bg-slate-100 sticky top-0 z-20 border-b border-slate-200 text-slate-700 font-bold">
        <tr>
          <th class="px-3 py-2 border-r border-slate-200">Mã Khóa (Composite Key)</th>
          ${compColumns.map(col => `<th class="px-3 py-2 border-r border-slate-200 text-right bg-indigo-50">Nguồn A: ${col}</th>`).join("")}
          ${compColumns.map(col => `<th class="px-3 py-2 border-r border-slate-200 text-right bg-emerald-50">Nguồn B: ${col}</th>`).join("")}
          <th class="px-3 py-2 border-r border-slate-200">Trạng Thái</th>
          <th class="px-3 py-2 min-w-[200px]">Hiện trạng lệch / Khuyến nghị xử lý</th>
        </tr>
      </thead>
    `;

    let tbodyRowsHtml = results.map((row, idx) => {
      let statusBg = "";
      if (row.status === "Matched") {
        statusBg = "bg-emerald-50 text-emerald-800 border-emerald-300";
      } else if (row.status === "Unmatched") {
        statusBg = "bg-rose-50 text-rose-800 border-rose-300";
      } else if (row.status === "Only In A") {
        statusBg = "bg-amber-50 text-amber-800 border-amber-300";
      } else {
        statusBg = "bg-sky-50 text-sky-800 border-sky-300";
      }

      const cellTextA = compColumns.map(col => {
        const val = row.rowA ? row.rowA[col] : null;
        return val !== null && val !== undefined
          ? `<td class="px-3 py-2 border-r border-slate-150 font-mono text-right text-slate-700">${Number(val).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>`
          : `<td class="px-3 py-2 border-r border-slate-150 text-slate-300 text-center">—</td>`;
      }).join("");

      const cellTextB = compColumns.map(col => {
        const val = row.rowB ? row.rowB[col] : null;
        return val !== null && val !== undefined
          ? `<td class="px-3 py-2 border-r border-slate-150 font-mono text-right text-slate-700">${Number(val).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>`
          : `<td class="px-3 py-2 border-r border-slate-150 text-slate-300 text-center">—</td>`;
      }).join("");

      return `
        <tr class="recon-result-row hover:bg-slate-100 cursor-pointer transition-colors duration-150 border-b border-slate-100" data-index="${idx}">
          <td class="px-3 py-2 border-r border-slate-150 font-mono text-slate-800 truncate max-w-[220px]" title="${row.compositeKey}">${row.compositeKey}</td>
          ${cellTextA}
          ${cellTextB}
          <td class="px-3 py-2 border-r border-slate-150">
            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusBg}">${row.status}</span>
          </td>
          <td class="px-3 py-2 text-slate-600 font-semibold text-xs leading-relaxed">
            ${row.discrepancy || `<span class="text-emerald-600 font-normal">Dữ liệu cân đối khớp đúng</span>`}
          </td>
        </tr>
      `;
    }).join("");

    this.reconcileOutputTable.innerHTML = theadHtml + `<tbody class="divide-y divide-slate-100">${tbodyRowsHtml}</tbody>`;
  }

  /**
   * Tab 2 Independent Analysis Sandbox:
   * Render complete tabular grid that supports full inline cell-editing!
   */
  renderAnalysisGrid(columns, rows, onCellEdit) {
    const container = this.analysisGridContainer;
    if (!container) return;

    if (!rows || rows.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center text-slate-400 flex flex-col items-center justify-center flex-grow h-[350px]">
          <i data-lucide="file-spreadsheet" class="h-10 w-10 text-slate-300 stroke-1 mb-2"></i>
          <span class="text-sm font-semibold">Vui lòng tải tệp dữ liệu phân tích</span>
        </div>
      `;
      window.lucide?.createIcons();
      return;
    }

    // Generate column options for dropdown selectors
    const optionHtml = columns.map(col => `<option value="${col}">${col}</option>`).join("");
    
    // Maintain select option selections on UI thread without resets
    const currentX = this.chartXSelect.value;
    const currentY = this.chartYSelect.value;

    this.chartXSelect.innerHTML = `<option value="">-- Chọn trục X --</option>` + optionHtml;
    this.chartYSelect.innerHTML = `<option value="">-- Chọn trục Y (Số liệu) --</option>` + optionHtml;

    if (currentX) this.chartXSelect.value = currentX;
    if (currentY) this.chartYSelect.value = currentY;

    // Render interactive Excel Table
    let tableHtml = `
      <div class="overflow-auto relative max-h-[380px] border border-slate-200 rounded-md">
        <table class="w-full text-left text-[11px] border-collapse bg-white" id="editor-spreadsheet-table">
          <thead class="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200 z-10">
            <tr>
              <th class="px-1.5 py-1 text-center bg-slate-100 border-r border-slate-200 w-10">#</th>
              ${columns.map((h, colIdx) => `
                <th class="px-3 py-2 border-r border-slate-200 bg-slate-100 text-slate-800">
                  <div class="flex items-center justify-between gap-1.5">
                    <span class="font-bold truncate select-none col-header-label" data-col-idx="${colIdx}">${h}</span>
                  </div>
                </th>
              `).join("")}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${rows.slice(0, 150).map((row, rowIdx) => `
              <tr class="hover:bg-slate-50 transition spreadsheet-row" data-row-idx="${rowIdx}">
                <td class="px-1.5 py-1 text-center font-mono text-[9px] bg-slate-50 border-r border-slate-150 select-none text-slate-400 font-bold">${rowIdx + 1}</td>
                ${columns.map(col => {
                  let cellVal = row[col];
                  if (cellVal === null || cellVal === undefined) cellVal = "";
                  
                  // Limit text render width and trigger local input editor on interactions
                  return `
                    <td class="px-3 py-1.5 border-r border-slate-150 font-mono truncate max-w-[200px] outline-none cell-editable cursor-pointer relative" 
                        data-row-idx="${rowIdx}" 
                        data-col-key="${col}"
                        title="Double click để sửa">
                      <span class="cell-span-display">${cellVal}</span>
                    </td>
                  `;
                }).join("")}
              </tr>
            `).join("")}
            ${rows.length > 150 ? `
              <tr class="bg-slate-50 font-semibold text-slate-400">
                <td colspan="${columns.length + 1}" class="px-3 py-2 text-center text-[11px]">Đang hiển thị 150 dòng đầu tiên...</td>
              </tr>
            ` : ""}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = tableHtml;

    // Direct binding for double click cell inline edits
    const editableCells = container.querySelectorAll(".cell-editable");
    editableCells.forEach(cell => {
      cell.addEventListener("dblclick", () => {
        if (cell.classList.contains("editing")) return;
        cell.classList.add("editing");

        const rowIdx = parseInt(cell.getAttribute("data-row-idx"));
        const colKey = cell.getAttribute("data-col-key");
        const displaySpan = cell.querySelector(".cell-span-display");
        const initialVal = displaySpan.textContent;

        const input = document.createElement("input");
        input.type = "text";
        input.value = initialVal;
        input.className = "absolute inset-0 px-3 py-1 bg-white border border-indigo-500 font-mono text-[11px] outline-none w-full h-full z-10 rounded shadow-xs";
        
        cell.appendChild(input);
        input.focus();
        input.select();

        const handleSave = () => {
          const newVal = input.value.trim();
          displaySpan.textContent = newVal;
          input.remove();
          cell.classList.remove("editing");
          onCellEdit(rowIdx, colKey, newVal);
        };

        input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            handleSave();
          } else if (e.key === "Escape") {
            input.remove();
            cell.classList.remove("editing");
          }
        });

        input.addEventListener("blur", () => {
          handleSave();
        });
      });
    });
  }

  /**
   * Renders the summary aggregates pivot grid inside Tab 2.
   */
  renderPivotTable(labels, dataset, xCol, yCol) {
    if (!labels || labels.length === 0) {
      this.summaryPivotTable.innerHTML = `
        <thead class="bg-slate-100 text-slate-700 font-semibold text-xs bd border-b border-slate-205">
          <tr>
            <th class="px-4 py-2">Tiêu chí phân loại</th>
            <th class="px-4 py-2 text-right">Tổng hợp</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colspan="2" class="p-8 text-center text-slate-400 text-xs">Vui lòng tải tệp và chọn trục để mở phân tích biểu đồ...</td>
          </tr>
        </tbody>
      `;
      return;
    }

    const headingX = xCol || "Trục X";
    const headingY = yCol ? `Tổng (${yCol})` : "Số dòng dữ liệu";

    let grandTotalSum = dataset.reduce((a, b) => a + b, 0);

    let rowsHtml = labels.map((label, idx) => {
      const val = dataset[idx];
      const pct = grandTotalSum > 0 ? (val / grandTotalSum) * 100 : 0;
      return `
        <tr class="hover:bg-slate-50 transition text-xs border-b border-slate-100">
          <td class="px-4 py-2 font-semibold text-slate-700">${label}</td>
          <td class="px-4 py-2 font-mono text-right text-indigo-700 font-bold">${val.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
          <td class="px-4 py-2 text-right font-mono text-slate-500">${pct.toFixed(1)}%</td>
        </tr>
      `;
    }).join("");

    this.summaryPivotTable.innerHTML = `
      <thead class="bg-indigo-50/50 text-slate-700 font-bold text-[11px] border-b border-indigo-150 uppercase tracking-wide">
        <tr>
          <th class="px-4 py-2.5 text-left">${headingX}</th>
          <th class="px-4 py-2.5 text-right">${headingY}</th>
          <th class="px-4 py-2.5 text-right w-24">% Chiếm</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100">
        ${rowsHtml}
        <tr class="bg-slate-50 font-bold text-slate-800 border-t border-slate-200">
          <td class="px-4 py-2.5">TỔNG CỘNG</td>
          <td class="px-4 py-2.5 font-mono text-right text-indigo-800 font-bold">${grandTotalSum.toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
          <td class="px-4 py-2.5 text-right font-mono">100.0%</td>
        </tr>
      </tbody>
    `;
  }

  /**
   * Resets entire application layout structures.
   */
  resetAllViews() {
    this.previewAContainer.innerHTML = `
      <div class="p-8 text-center text-slate-400 flex flex-col items-center justify-center flex-grow h-full">
        <i data-lucide="file-spreadsheet" class="h-10 w-10 text-slate-300 stroke-1 mb-2"></i>
        <span class="text-xs">Dữ liệu nguồn A trống</span>
      </div>
    `;
    this.previewBContainer.innerHTML = `
      <div class="p-8 text-center text-slate-400 flex flex-col items-center justify-center flex-grow h-full">
        <i data-lucide="file-spreadsheet" class="h-10 w-10 text-slate-300 stroke-1 mb-2"></i>
        <span class="text-xs">Dữ liệu nguồn B trống</span>
      </div>
    `;
    this.previewAContainer.classList.add("h-[380px]", "flex", "items-center", "justify-center");
    this.previewBContainer.classList.add("h-[380px]", "flex", "items-center", "justify-center");

    this.rulesMappingBoard.innerHTML = `
      <p class="text-xs text-slate-400 text-center py-4">Vui lòng tải tệp Nguồn A và Nguồn B để mở khóa bộ cấu hình quy tắc đối chiếu.</p>
    `;
    this.btnRunRecon.disabled = true;
    this.resultsCardBlock.classList.add("hidden");
    this.reconcileOutputTable.innerHTML = "";

    // Reset Tab 2
    this.analysisGridContainer.innerHTML = `
      <div class="p-8 text-center text-slate-400 flex flex-col items-center justify-center flex-grow h-[350px]">
        <i data-lucide="file-spreadsheet" class="h-10 w-10 text-slate-300 stroke-1 mb-2"></i>
        <span class="text-sm font-semibold">Vui lòng tải tệp dữ liệu phân tích</span>
      </div>
    `;
    this.chartXSelect.innerHTML = `<option value="">-- Chọn trục X --</option>`;
    this.chartYSelect.innerHTML = `<option value="">-- Chọn trục Y (Số liệu) --</option>`;
    this.summaryPivotTable.innerHTML = `
      <thead class="bg-indigo-50/50 text-slate-700 font-bold text-[11px] border-b border-indigo-150 uppercase tracking-wide">
        <tr>
          <th class="px-4 py-2.5 text-left">Tiêu chí phân loại</th>
          <th class="px-4 py-2.5 text-right">Tổng hợp</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="2" class="p-8 text-center text-slate-400 text-xs">Vui lòng tải tệp và chọn trục để mở phân tích biểu đồ...</td>
        </tr>
      </tbody>
    `;

    this.showProgressBar(0);
    this.showPerformance(0);
    window.lucide?.createIcons();
  }

  renderDetailModal(item, colsA, colsB, matchKeys) {
    if (!this.detailModal) return;

    // 1. Set key title
    this.detailModalKey.textContent = `${item.compositeKey || "Cấu trúc trống"}`;
    this.detailModalKey.title = item.compositeKey || "";

    // 2. Set Status Badge with dynamic classes
    this.detailModalStatus.textContent = item.status || "Chưa xác định";
    this.detailModalStatus.className = "px-2.5 py-0.5 rounded-full text-[10px] font-bold border";
    
    let statusBg = "";
    let alertBg = "";
    if (item.status === "Matched") {
      statusBg = "bg-emerald-50 text-emerald-800 border-emerald-300";
      alertBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
    } else if (item.status === "Unmatched") {
      statusBg = "bg-rose-50 text-rose-800 border-rose-300";
      alertBg = "bg-rose-50 text-rose-800 border-rose-200";
    } else if (item.status === "Only In A") {
      statusBg = "bg-amber-50 text-amber-800 border-amber-300";
      alertBg = "bg-amber-50 text-amber-800 border-amber-200";
    } else {
      statusBg = "bg-sky-50 text-sky-800 border-sky-300";
      alertBg = "bg-sky-50 text-sky-800 border-sky-200";
    }
    
    this.detailModalStatus.classList.add(...statusBg.split(" "));

    // 3. Set Banner text & formatting
    this.detailModalBanner.className = `p-3.5 rounded-lg border flex gap-3 text-xs leading-relaxed ${alertBg}`;
    this.detailModalDiscrepancyText.innerHTML = item.discrepancy 
      ? `<strong>Phần lệch phân tích:</strong> ${item.discrepancy}` 
      : `<strong>Khớp hợp chuẩn:</strong> Cân đối trùng khớp tất cả số liệu đối sánh chọn lọc.`;

    // 4. Source A table data rendering
    if (item.rowA) {
      if (this.detailSourceABadge) {
        this.detailSourceABadge.textContent = "Hoạt động";
        this.detailSourceABadge.className = "text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded border border-indigo-200";
      }
      this.detailSourceARows.innerHTML = colsA.map(col => {
        const val = item.rowA[col];
        const isKey = matchKeys.includes(col);
        const formatVal = (val !== null && val !== undefined) ? String(val) : '<span class="text-slate-300 italic">Trống</span>';
        const isHighlightKey = isKey ? "bg-indigo-50/50 font-bold text-indigo-900" : "";
        return `
          <tr class="${isHighlightKey}">
            <td class="px-3 py-1.5 font-medium text-slate-500 flex items-center gap-1">
              ${isKey ? '<i data-lucide="key" class="h-3 w-3 text-indigo-500"></i>' : ''}
              <span>${col}</span>
            </td>
            <td class="px-3 py-1.5 text-right font-mono truncate max-w-[200px]" title="${val || ''}">${formatVal}</td>
          </tr>
        `;
      }).join("");
    } else {
      if (this.detailSourceABadge) {
        this.detailSourceABadge.textContent = "Thiếu dữ liệu";
        this.detailSourceABadge.className = "text-[10px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded border border-rose-200";
      }
      this.detailSourceARows.innerHTML = `
        <tr>
          <td colspan="2" class="p-6 text-center text-xs text-slate-400 italic bg-slate-50">
            Không có thông tin tương thích tại Nguồn A (Chỉ tồn tại ở bên B)
          </td>
        </tr>
      `;
    }

    // 5. Source B table data rendering
    if (item.rowB) {
      if (this.detailSourceBBadge) {
        this.detailSourceBBadge.textContent = "Hoạt động";
        this.detailSourceBBadge.className = "text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200";
      }
      this.detailSourceBRows.innerHTML = colsB.map(col => {
        const val = item.rowB[col];
        const isKey = matchKeys.includes(col);
        const formatVal = (val !== null && val !== undefined) ? String(val) : '<span class="text-slate-300 italic">Trống</span>';
        const isHighlightKey = isKey ? "bg-emerald-50/50 font-bold text-emerald-900" : "";
        return `
          <tr class="${isHighlightKey}">
            <td class="px-3 py-1.5 font-medium text-slate-500 flex items-center gap-1">
              ${isKey ? '<i data-lucide="key" class="h-3 w-3 text-emerald-500"></i>' : ''}
              <span>${col}</span>
            </td>
            <td class="px-3 py-1.5 text-right font-mono truncate max-w-[200px]" title="${val || ''}">${formatVal}</td>
          </tr>
        `;
      }).join("");
    } else {
      if (this.detailSourceBBadge) {
        this.detailSourceBBadge.textContent = "Thiếu dữ liệu";
        this.detailSourceBBadge.className = "text-[10px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded border border-rose-200";
      }
      this.detailSourceBRows.innerHTML = `
        <tr>
          <td colspan="2" class="p-6 text-center text-xs text-slate-400 italic bg-slate-50">
            Không có thông tin tương thích tại Nguồn B (Chỉ tồn tại ở bên A)
          </td>
        </tr>
      `;
    }

    // Trigger Lucide icons rebuild for the modal
    window.lucide?.createIcons();

    // 6. Reveal modal
    this.detailModal.classList.remove("opacity-0", "pointer-events-none");
    const modalBox = document.getElementById("detail-modal-card");
    if (modalBox) {
      modalBox.classList.remove("scale-95");
      modalBox.classList.add("scale-100");
    }
  }

  hideDetailModal() {
    if (!this.detailModal) return;
    this.detailModal.classList.add("opacity-0", "pointer-events-none");
    const modalBox = document.getElementById("detail-modal-card");
    if (modalBox) {
      modalBox.classList.remove("scale-100");
      modalBox.classList.add("scale-95");
    }
  }
}
