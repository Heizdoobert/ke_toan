/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.activeTab = "recon";
    this.charts = {}; // holds chart references { bar, line, pie, doughnut }
    this.selectedGridRowIdx = null; // keeps track of selected row in editor grid
    
    this.debounceTimer = null;

    this.init();
  }

  async init() {
    this.setupTabControls();
    this.setupDropzones();
    this.setupKeyConfigListeners();
    this.setupInputsToggle();
    this.setupSpreadsheetToolbar();
    this.setupChartSelectors();
    this.setupTopActions();

    // Fetch previous database state and history from backend JSON server
    try {
      this.view.showProgressBar(15);
      const res = await fetch("/api/db");
      if (res.ok) {
        const db = await res.json();
        if (db && db.config) {
          this.model.matchKeys = db.config.matchKeys || [];
          this.model.compareColumns = db.config.compareColumns || [];
          this.model.history = db.history || [];
          
          this.renderHistoryLog();
        }
      }
      this.view.showProgressBar(100);
      setTimeout(() => this.view.showProgressBar(0), 1000);
    } catch (err) {
      this.view.showToast("Không thể tải cấu hình lưu trữ từ máy chủ JSON", "warning");
    }

    // Trigger visual icons building
    window.lucide?.createIcons();
  }

  /**
   * Refreshes the saved run histories inside the corporate logs box.
   */
  renderHistoryLog() {
    const container = document.getElementById("history-list-box");
    if (!container) return;

    const history = this.model.history || [];
    if (history.length === 0) {
      container.innerHTML = `
        <div class="text-center py-6 text-slate-400 text-xs">
          Chưa lưu chép lịch sử phiên đối chiếu nào trên hệ thống máy chủ.
        </div>
      `;
      return;
    }

    let itemsHtml = history.map((item, idx) => {
      const dateStr = new Date(item.timestamp).toLocaleString("vi-VN");
      const matchRate = parseFloat(item.matchRate || 0).toFixed(1);
      
      let badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-250";
      if (matchRate < 80) badgeColor = "bg-rose-50 text-rose-800 border-rose-250";
      else if (matchRate < 95) badgeColor = "bg-amber-50 text-amber-800 border-amber-250";

      return `
        <div class="flex items-center justify-between p-3 rounded-lg border border-slate-150 bg-slate-55 text-xs transition hover:bg-slate-100 gap-3">
          <div class="flex flex-col gap-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-slate-800">Khớp: ${matchRate}%</span>
              <span class="text-[10px] text-slate-400 font-mono">${dateStr}</span>
            </div>
            <div class="text-[10px] text-slate-500 font-medium truncate">
              Nguồn A: [${item.fileA}] (${item.countA} dòng) &bull; Nguồn B: [${item.fileB}] (${item.countB} dòng)
            </div>
            <div class="text-[9px] text-slate-400 font-mono">Thời gian giải quyết: ${item.elapsedTime || 0} ms</div>
          </div>
          <button class="delete-history-btn p-1 text-slate-400 hover:text-rose-600 rounded transition shrink-0 cursor-pointer" data-idx="${idx}">
            <i data-lucide="trash-2" class="h-3.5 w-3.5"></i>
          </button>
        </div>
      `;
    }).join("");

    container.innerHTML = `<div class="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">${itemsHtml}</div>`;
    window.lucide?.createIcons();

    // Bind delete click actions
    container.querySelectorAll(".delete-history-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = parseInt(btn.getAttribute("data-idx"));
        this.deleteHistoryItem(idx);
      });
    });
  }

  async deleteHistoryItem(idx) {
    if (!confirm("Bạn có chắc chắn muốn xóa bản ghi lịch sử này khỏi máy chủ?")) return;
    try {
      this.model.history.splice(idx, 1);
      await this.syncDBStateWithServer();
      this.renderHistoryLog();
      this.view.showToast("Đã xóa lịch sử bản đối chiếu thành công");
    } catch {
      this.view.showToast("Lỗi khi xóa lịch sử", "error");
    }
  }

  /**
   * Synchronises client cache adjustments with backend Node server recon_db.json.
   */
  async syncDBStateWithServer() {
    try {
      const payload = {
        config: {
          matchKeys: this.model.matchKeys,
          compareColumns: this.model.compareColumns,
          groupByEnabled: false
        },
        history: this.model.history || []
      };

      await fetch("/api/db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("[controller.js] Failed syncing config to Express:", err);
    }
  }

  setupTabControls() {
    this.view.tabReconBtn.addEventListener("click", () => {
      this.activeTab = "recon";
      this.view.switchTab("recon");
    });

    this.view.tabAnalysisBtn.addEventListener("click", () => {
      this.activeTab = "analysis";
      this.view.switchTab("analysis");
      // Trigger canvas resizing checks to fix layout scale bugs on loaded canvases
      setTimeout(() => this.resizeVisibleCharts(), 100);
    });
  }

  setupInputsToggle() {
    this.view.tabBtnFileA.addEventListener("click", () => {
      this.view.tabBtnFileA.className = "px-3 py-1 bg-white text-slate-800 shadow-xs border border-slate-200 font-bold rounded-l text-[11px] cursor-pointer";
      this.view.tabBtnPasteA.className = "px-3 py-1 bg-slate-100 text-slate-500 hover:text-slate-700 text-[11px] rounded-r cursor-pointer";
      this.view.wrapperFileA.classList.remove("hidden");
      this.view.wrapperPasteA.classList.add("hidden");
    });

    this.view.tabBtnPasteA.addEventListener("click", () => {
      this.view.tabBtnPasteA.className = "px-3 py-1 bg-white text-slate-800 shadow-xs border border-slate-200 font-bold rounded-r text-[11px] cursor-pointer";
      this.view.tabBtnFileA.className = "px-3 py-1 bg-slate-100 text-slate-500 hover:text-slate-700 text-[11px] rounded-l cursor-pointer";
      this.view.wrapperPasteA.classList.remove("hidden");
      this.view.wrapperFileA.classList.add("hidden");
    });

    this.view.tabBtnFileB.addEventListener("click", () => {
      this.view.tabBtnFileB.className = "px-3 py-1 bg-white text-slate-800 shadow-xs border border-slate-200 font-bold rounded-l text-[11px] cursor-pointer";
      this.view.tabBtnPasteB.className = "px-3 py-1 bg-slate-100 text-slate-500 hover:text-slate-705 text-[11px] rounded-r cursor-pointer";
      this.view.wrapperFileB.classList.remove("hidden");
      this.view.wrapperPasteB.classList.add("hidden");
    });

    this.view.tabBtnPasteB.addEventListener("click", () => {
      this.view.tabBtnPasteB.className = "px-3 py-1 bg-white text-slate-800 shadow-xs border border-slate-200 font-bold rounded-r text-[11px] cursor-pointer";
      this.view.tabBtnFileB.className = "px-3 py-1 bg-slate-100 text-slate-500 hover:text-slate-705 text-[11px] rounded-l cursor-pointer";
      this.view.wrapperPasteB.classList.remove("hidden");
      this.view.wrapperFileB.classList.add("hidden");
    });

    this.view.btnPasteParseA.addEventListener("click", () => this.handlePasteImport("A"));
    this.view.btnPasteParseB.addEventListener("click", () => this.handlePasteImport("B"));
  }

  async handlePasteImport(side) {
    const rawText = side === "A" ? this.view.pasteAreaA.value : this.view.pasteAreaB.value;
    if (!rawText.trim()) {
      this.view.showToast("Vui lòng dán dữ liệu dạng bảng có tiêu đề phân cách bằng Tab hoặc Dấu phẩy", "error");
      return;
    }

    this.view.showProgressBar(30);
    const start = performance.now();

    try {
      const delimiter = rawText.includes("\t") ? "\t" : ",";
      const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
      
      if (lines.length < 1) {
        this.view.showToast("Dữ liệu nhập rỗng", "error");
        this.view.showProgressBar(0);
        return;
      }

      const rawHeaders = lines[0].split(delimiter).map(h => h.trim());
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(delimiter).map(c => c.trim().replace(/^"|"$/g, ""));
        const rowObj = {};
        rawHeaders.forEach((h, colIdx) => {
          rowObj[h] = cells[colIdx] !== undefined ? cells[colIdx] : "";
        });
        rowObj["Origin_File_Name"] = `Dán_Trực_Tiếp_${side}.csv`;
        rows.push(rowObj);
      }

      const fileName = `Dữ liệu dán tay (${rows.length} dòng)`;
      const columns = rawHeaders;

      if (side === "A") {
        this.model.sourceA = { fileName, columns, rows };
        this.view.renderSourcePreview("A", columns, rows, fileName);
        this.setupClearButtons("A");
      } else {
        this.model.sourceB = { fileName, columns, rows };
        this.view.renderSourcePreview("B", columns, rows, fileName);
        this.setupClearButtons("B");
      }

      this.updateRuleSelectorsAndSetup();
      this.view.showPerformance(Math.round(performance.now() - start));
      this.view.showProgressBar(100);
      setTimeout(() => this.view.showProgressBar(0), 1000);
      this.view.showToast(`Đã nhận dữ liệu tay Nguồn ${side} thành công!`);
    } catch (err) {
      this.view.showToast("Không thể phân tích văn bản bảng dán", "error");
      this.view.showProgressBar(0);
    }
  }

  setupDropzones() {
    const dragHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Prevent default browser loading drops
    window.addEventListener("dragover", dragHandler);
    window.addEventListener("drop", dragHandler);

    const enrichDropzone = (zone, input, side) => {
      zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.classList.add("border-indigo-400", "bg-indigo-50/20");
      });

      zone.addEventListener("dragleave", () => {
        zone.classList.remove("border-indigo-400", "bg-indigo-50/20");
      });

      zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("border-indigo-400", "bg-indigo-50/20");
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          input.files = files;
          this.handleFileUploaded(files, side);
        }
      });

      input.addEventListener("change", (e) => {
        const files = e.target.files;
        if (files.length > 0) {
          this.handleFileUploaded(files, side);
        }
      });
    };

    enrichDropzone(this.view.dropzoneA, this.view.fileInputA, "Nguồn A");
    enrichDropzone(this.view.dropZoneB, this.view.fileInputB, "Nguồn B");
    
    // Tab 2 Dropzone
    this.view.dropzoneSingle.addEventListener("dragover", (e) => {
      e.preventDefault();
      this.view.dropzoneSingle.classList.add("border-indigo-400", "bg-indigo-50/20");
    });
    this.view.dropzoneSingle.addEventListener("dragleave", () => {
      this.view.dropzoneSingle.classList.remove("border-indigo-400", "bg-indigo-50/20");
    });
    this.view.dropzoneSingle.addEventListener("drop", (e) => {
      e.preventDefault();
      this.view.dropzoneSingle.classList.remove("border-indigo-400", "bg-indigo-50/20");
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.view.fileInputSingle.files = files;
        this.handleAnalysisFileUploaded(files[0]);
      }
    });

    this.view.fileInputSingle.addEventListener("change", (e) => {
      const files = e.target.files;
      if (files.length > 0) {
        this.handleAnalysisFileUploaded(files[0]);
      }
    });
  }

  /**
   * Evaluates corporate file uploads guardrails.
   * Max 50MB and max 100k rows.
   */
  async handleFileUploaded(files, side) {
    const file = files[0];
    if (!file) return;

    // File size guardrail check
    if (file.size > 50 * 1024 * 1024) {
      this.view.showToast(`Bị chặn: Tệp "${file.name}" vượt quá giới hạn 50MB cho phép.`, "error");
      return;
    }

    this.view.showProgressBar(20);
    const start = performance.now();

    try {
      await this.model.loadFile(file, side);
      
      const loadedData = side === "Nguồn A" ? this.model.sourceA : this.model.sourceB;
      
      // Rows guardrail check
      if (loadedData.rows.length > 100000) {
        this.view.showToast(`Bị chặn: Tệp "${file.name}" chứa quá 100,000 bản ghi.`, "error");
        if (side === "Nguồn A") this.model.sourceA = { fileName: "", columns: [], rows: [] };
        else this.model.sourceB = { fileName: "", columns: [], rows: [] };
        this.view.showProgressBar(0);
        return;
      }

      this.view.showProgressBar(70);
      const visualSide = side === "Nguồn A" ? "A" : "B";
      this.view.renderSourcePreview(visualSide, loadedData.columns, loadedData.rows, file.name);
      this.setupClearButtons(visualSide);

      this.updateRuleSelectorsAndSetup();
      this.view.showPerformance(Math.round(performance.now() - start));
      this.view.showProgressBar(100);
      setTimeout(() => this.view.showProgressBar(0), 1000);
      this.view.showToast(`Đã tải thành công tệp ${side}!`);
    } catch (err) {
      console.error(err);
      this.view.showToast("Không thể tải tệp, vui lòng kiểm tra lại cấu trúc bảng", "error");
      this.view.showProgressBar(0);
    }
  }

  setupClearButtons(side) {
    const clearBtn = document.getElementById(`btn-clear-preview-${side}`);
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (side === "A") {
          this.model.sourceA = { fileName: "", columns: [], rows: [] };
          this.view.renderSourcePreview("A", [], []);
        } else {
          this.model.sourceB = { fileName: "", columns: [], rows: [] };
          this.view.renderSourcePreview("B", [], []);
        }
        this.updateRuleSelectorsAndSetup();
        this.view.resultsCardBlock.classList.add("hidden");
      });
    }
  }

  async handleAnalysisFileUploaded(file) {
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      this.view.showToast(`Bị chặn: Tệp "${file.name}" vượt quá giới hạn 50MB cho phép.`, "error");
      return;
    }

    this.view.showProgressBar(25);
    const start = performance.now();

    try {
      await this.model.loadAnalysisFile(file);

      if (this.model.analysisData.rows.length > 100000) {
        this.view.showToast(`Bị chặn: Tệp "${file.name}" chứa quá 100,000 bản ghi.`, "error");
        this.model.analysisData = { fileName: "", columns: [], rows: [] };
        this.view.showProgressBar(0);
        return;
      }

      this.view.showProgressBar(80);
      this.refreshAnalysisGridUI();

      this.view.showPerformance(Math.round(performance.now() - start));
      this.view.showProgressBar(100);
      setTimeout(() => this.view.showProgressBar(0), 1000);
      this.view.showToast("Đã nhập dữ liệu để phân tích độc lập!");
    } catch (err) {
      console.error(err);
      this.view.showToast("Không thể tải tệp để phân tích độc lập", "error");
      this.view.showProgressBar(0);
    }
  }

  refreshAnalysisGridUI() {
    this.view.renderAnalysisGrid(
      this.model.analysisData.columns,
      this.model.analysisData.rows,
      (rowIdx, colKey, newVal) => this.handleCellEdited(rowIdx, colKey, newVal)
    );
    this.setupRowBindsHighlight();
    this.rebuildCharts();
  }

  /**
   * Dynamic row highlight cell click tracking inside spreadsheets.
   */
  setupRowBindsHighlight() {
    const container = this.view.analysisGridContainer;
    const rows = container.querySelectorAll(".spreadsheet-row");
    rows.forEach(row => {
      row.addEventListener("click", () => {
        rows.forEach(r => r.classList.remove("bg-indigo-50/50", "border-indigo-300"));
        row.classList.add("bg-indigo-50/50");
        this.selectedGridRowIdx = parseInt(row.getAttribute("data-row-idx"));
      });
    });
  }

  handleCellEdited(rowIdx, colKey, newVal) {
    // Determine dynamic values parsing based on whether numeric col is selected
    const isNum = this.view.chartYSelect.value === colKey;
    const cleanVal = isNum ? parseFloat(newVal) || 0 : String(newVal).trim();

    if (this.model.analysisData.rows[rowIdx]) {
      this.model.analysisData.rows[rowIdx][colKey] = cleanVal;
      this.rebuildChartsDebounced();
    }
  }

  updateRuleSelectorsAndSetup() {
    const headersA = this.model.sourceA.columns;
    const headersB = this.model.sourceB.columns;

    // Refresh Setup Control Panel DOM elements
    this.view.renderSetupPanel(headersA, headersB, this.model.matchKeys, this.model.compareColumns);
    this.setupMappingCheckboxes();
  }

  setupMappingCheckboxes() {
    const keyCheckboxes = document.querySelectorAll("input[name='matchKeySelector']");
    const compCheckboxes = document.querySelectorAll("input[name='compKeySelector']");

    const onKeyChange = () => {
      const selectedKeys = [];
      keyCheckboxes.forEach(cb => {
        if (cb.checked) selectedKeys.push(cb.value);
      });

      // Limit composite keys selector to max 4 columns
      if (selectedKeys.length > 4) {
        this.view.showToast("Tối đa chỉ chọn 4 cột khóa để thiết lập Composite Key", "warning");
        // uncheck last checked one
        selectedKeys.pop();
        keyCheckboxes.forEach(cb => {
          if (cb.value === event.target.value) cb.checked = false;
        });
      }

      this.model.setMatchKeys(selectedKeys);
      this.syncDBStateWithServer();
    };

    const onCompChange = () => {
      const selectedComps = [];
      compCheckboxes.forEach(cb => {
        if (cb.checked) {
          selectedComps.push(cb.value);
          cb.parentElement.classList.add("bg-indigo-50", "border-indigo-250");
          cb.parentElement.classList.remove("bg-slate-55");
        } else {
          cb.parentElement.classList.remove("bg-indigo-50", "border-indigo-250");
          cb.parentElement.classList.add("bg-slate-55");
        }
      });

      this.model.setCompareColumns(selectedComps);
      this.syncDBStateWithServer();
    };

    keyCheckboxes.forEach(cb => cb.addEventListener("change", onKeyChange));
    compCheckboxes.forEach(cb => cb.addEventListener("change", onCompChange));
  }

  setupKeyConfigListeners() {
    this.view.btnRunRecon.addEventListener("click", () => this.handleRunReconcile());
    this.view.btnExportExcel.addEventListener("click", () => this.handleExportWorkbook());
    this.setupReconciliationRowDetails();
  }

  setupReconciliationRowDetails() {
    if (this.view.reconcileOutputTable) {
      this.view.reconcileOutputTable.addEventListener("click", (e) => {
        const tr = e.target.closest("tr.recon-result-row");
        if (!tr) return;

        // Highlight selected row with an active state effect
        this.view.reconcileOutputTable.querySelectorAll("tr.recon-result-row").forEach(r => {
          r.classList.remove("bg-indigo-50/70", "font-medium");
        });
        tr.classList.add("bg-indigo-50/70", "font-medium");

        const idx = parseInt(tr.getAttribute("data-index"), 10);
        const results = this.model.reconciliationResult && this.model.reconciliationResult.allCombined;
        if (results && results[idx]) {
          this.openDetailView(results[idx]);
        }
      });
    }

    // Modal Close actions setup
    if (this.view.detailModalClose) {
      this.view.detailModalClose.addEventListener("click", () => this.closeDetailView());
    }
    if (this.view.detailModalCloseBtn) {
      this.view.detailModalCloseBtn.addEventListener("click", () => this.closeDetailView());
    }
    if (this.view.detailModal) {
      this.view.detailModal.addEventListener("click", (e) => {
        if (e.target === this.view.detailModal) {
          this.closeDetailView();
        }
      });
    }
  }

  openDetailView(item) {
    const colsA = this.model.sourceA.columns || [];
    const colsB = this.model.sourceB.columns || [];
    this.view.renderDetailModal(item, colsA, colsB, this.model.matchKeys);
  }

  closeDetailView() {
    this.view.hideDetailModal();
  }

  async handleRunReconcile() {
    if (this.model.matchKeys.length === 0) {
      this.view.showToast("Vui lòng chọn ít nhất 1 Cột khóa làm Anchor quy chiếu liên kết!", "warning");
      return;
    }

    this.view.showProgressBar(30);
    const start = performance.now();

    try {
      this.model.runReconciliation();
      this.view.showProgressBar(75);

      const result = this.model.reconciliationResult;
      
      // Update screen visual preview grids
      this.view.renderKPIs(result.summary);
      
      this.view.renderReconciliationResult(
        result.allCombined,
        this.model.sourceA.columns,
        this.model.sourceB.columns,
        this.model.matchKeys,
        this.model.compareColumns
      );

      // Log execution to persistent history database on server
      const grandCount = result.allCombined.length;
      const ratePct = grandCount > 0 ? (result.summary.matchedCount * 2 / (result.summary.totalA + result.summary.totalB)) * 100 : 100;
      
      const historyItem = {
        timestamp: new Date().toISOString(),
        fileA: this.model.sourceA.fileName,
        fileB: this.model.sourceB.fileName,
        countA: result.summary.totalA,
        countB: result.summary.totalB,
        matchRate: ratePct,
        elapsedTime: Math.round(performance.now() - start)
      };

      if (!this.model.history) this.model.history = [];
      this.model.history.unshift(historyItem);
      await this.syncDBStateWithServer();
      
      this.renderHistoryLog();

      this.view.showPerformance(Math.round(performance.now() - start));
      this.view.showProgressBar(100);
      setTimeout(() => this.view.showProgressBar(0), 1000);
      this.view.showToast("Đối chiếu hai kênh ledger hoàn thành hoàn tất!");
    } catch (err) {
      console.error(err);
      this.view.showToast("Lỗi trong lúc ghép trục so sánh dữ liệu sổ cái", "error");
      this.view.showProgressBar(0);
    }
  }

  /**
   * Spreadsheet interactive editor buttons binding logic.
   */
  setupSpreadsheetToolbar() {
    // Add Row
    this.view.btnAddRow.addEventListener("click", () => {
      if (!this.model.analysisData.rows || this.model.analysisData.rows.length === 0) {
        this.view.showToast("Tải tệp bảng phân tích trước khi thêm dòng!", "warning");
        return;
      }
      const newEmptyRow = {};
      this.model.analysisData.columns.forEach(col => {
        newEmptyRow[col] = "";
      });
      newEmptyRow["Origin_File_Name"] = "Thêm_Bởi_Editor.csv";
      this.model.analysisData.rows.push(newEmptyRow);
      
      this.refreshAnalysisGridUI();
      this.view.showToast("Đã chèn thêm 1 dòng trống ở cuối bảng");
    });

    // Delete Row
    this.view.btnDelRow.addEventListener("click", () => {
      if (!this.model.analysisData.rows || this.model.analysisData.rows.length === 0) return;
      
      let deletedRowIdx = this.selectedGridRowIdx;
      // Default to deleting the last row if no specific row is double clicked / highlighted
      if (deletedRowIdx === null || deletedRowIdx >= this.model.analysisData.rows.length) {
        deletedRowIdx = this.model.analysisData.rows.length - 1;
      }

      this.model.analysisData.rows.splice(deletedRowIdx, 1);
      this.selectedGridRowIdx = null;

      this.refreshAnalysisGridUI();
      this.view.showToast(`Đã xóa thành công dòng thứ ${deletedRowIdx + 1}`);
    });

    // Add Column
    this.view.btnAddCol.addEventListener("click", () => {
      if (!this.model.analysisData.rows || this.model.analysisData.rows.length === 0) {
        this.view.showToast("Tải tệp bảng phân tích trước khi thêm cột!", "warning");
        return;
      }
      const newColName = prompt("Nhập tên cột mới cần thêm vào bảng:").trim();
      if (!newColName) return;

      if (this.model.analysisData.columns.includes(newColName)) {
        this.view.showToast("Tên cột trùng lặp!", "error");
        return;
      }

      this.model.analysisData.columns.push(newColName);
      this.model.analysisData.rows.forEach(row => {
        row[newColName] = "";
      });

      this.refreshAnalysisGridUI();
      this.view.showToast(`Đã thêm cột mới [${newColName}]`);
    });

    // Delete Column
    this.view.btnDelCol.addEventListener("click", () => {
      if (!this.model.analysisData.rows || this.model.analysisData.rows.length === 0) return;
      const columns = this.model.analysisData.columns;
      const term = prompt(`Nhập chính xác tên cột muốn xóa bỏ từ danh sách sau:\n(${columns.join(", ")})`).trim();
      if (!term) return;

      const idx = columns.indexOf(term);
      if (idx === -1) {
        this.view.showToast("Tên cột không tồn tại!", "error");
        return;
      }

      this.model.analysisData.columns.splice(idx, 1);
      this.model.analysisData.rows.forEach(row => {
        delete row[term];
      });

      // Clear dynamic chart configurations if active selected column was removed
      if (this.model.chartConfig.xAxis === term) this.model.chartConfig.xAxis = "";
      if (this.model.chartConfig.yAxis === term) this.model.chartConfig.yAxis = "";

      this.refreshAnalysisGridUI();
      this.view.showToast(`Đã loại bỏ cột [${term}] khỏi bảng dữ liệu`);
    });
  }

  setupChartSelectors() {
    const handleAxesChange = () => {
      const xKey = this.view.chartXSelect.value;
      const yKey = this.view.chartYSelect.value;

      this.model.setChartConfig(xKey, yKey);
      this.rebuildChartsDebounced();
    };

    this.view.chartXSelect.addEventListener("change", handleAxesChange);
    this.view.chartYSelect.addEventListener("change", handleAxesChange);

    // Bind checkboxes to show/hide canvas Cards dynamically
    const wireToggle = (toggle, cardKey, cardElement) => {
      toggle.addEventListener("change", () => {
        if (toggle.checked) {
          cardElement.classList.remove("hidden");
          const chart = this.charts[cardKey];
          if (chart) chart.resize();
        } else {
          cardElement.classList.add("hidden");
        }
      });
    };

    wireToggle(this.view.toggleBar, "bar", this.view.cardBar);
    wireToggle(this.view.toggleLine, "line", this.view.cardLine);
    wireToggle(this.view.togglePie, "pie", this.view.cardPie);
    wireToggle(this.view.toggleDoughnut, "doughnut", this.view.cardDoughnut);
  }

  rebuildChartsDebounced() {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.rebuildCharts();
    }, 300);
  }

  /**
   * Safely destroys prior canvas contexts and creates 4 fresh graphs styled elegantly.
   */
  rebuildCharts() {
    const pivot = this.model.getPivotData();
    const xVal = this.model.chartConfig.xAxis;
    const yVal = this.model.chartConfig.yAxis;

    this.view.renderPivotTable(pivot.labels, pivot.dataset, xVal, yVal);

    if (!pivot.labels || pivot.labels.length === 0) {
      this.destroyAllCharts();
      return;
    }

    this.destroyAllCharts();

    const chartColors = [
      "rgba(79, 70, 229, 0.8)",    // Indigo primary hover
      "rgba(14, 116, 144, 0.8)",   // Slate complementary
      "rgba(16, 185, 129, 0.8)",   // Emerald highlight
      "rgba(217, 119, 6, 0.8)",    // Amber warning
      "rgba(219, 39, 119, 0.8)",   // Pink bold
      "rgba(75, 85, 99, 0.7)",     // Cool Gray balanced
      "rgba(99, 102, 241, 0.7)",   // Light purple
      "rgba(20, 184, 166, 0.7)"    // Teal modern
    ];

    const chartBorderColors = chartColors.map(c => c.replace("0.8", "1.0").replace("0.7", "1.0"));

    // Options Configuration factory
    const generateOptions = (typeLabel) => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: ["pie", "doughnut"].includes(typeLabel),
          position: "bottom",
          labels: { font: { family: "Inter", size: 10 }, boxWidth: 12 }
        },
        tooltip: {
          backgroundColor: "#1e293b",
          bodyFont: { family: "Inter", size: 11 },
          titleFont: { family: "Inter", size: 11, weight: "bold" }
        }
      },
      scales: ["pie", "doughnut"].includes(typeLabel) ? {} : {
        x: { grid: { display: false }, ticks: { font: { family: "Inter", size: 9 }, maxRotation: 45, minRotation: 0 } },
        y: { grid: { color: "#f1f5f9" }, ticks: { font: { family: "Inter", size: 9 } } }
      }
    });

    const ChartClass = window.Chart;
    if (!ChartClass) {
      this.view.showToast("Không tìm thấy bộ thư viện biểu đồ Chart.js CDN!", "error");
      return;
    }

    try {
      // 1. BAR CHART
      this.charts.bar = new ChartClass(this.view.canvasBar, {
        type: "bar",
        data: {
          labels: pivot.labels,
          datasets: [{
            label: yVal ? `Tổng ${yVal}` : "Tần suất",
            data: pivot.dataset,
            backgroundColor: chartColors,
            borderColor: chartBorderColors,
            borderWidth: 1.5,
            borderRadius: 4
          }]
        },
        options: generateOptions("bar")
      });

      // 2. LINE CHART
      this.charts.line = new ChartClass(this.view.canvasLine, {
        type: "line",
        data: {
          labels: pivot.labels,
          datasets: [{
            label: yVal ? `Tổng ${yVal}` : "Tần suất",
            data: pivot.dataset,
            backgroundColor: "rgba(79, 70, 229, 0.1)",
            borderColor: "rgba(79, 70, 229, 1.0)",
            borderWidth: 2.5,
            fill: true,
            tension: 0.25,
            pointBackgroundColor: "rgba(79, 70, 229, 1.0)"
          }]
        },
        options: generateOptions("line")
      });

      // 3. PIE CHART
      this.charts.pie = new ChartClass(this.view.canvasPie, {
        type: "pie",
        data: {
          labels: pivot.labels,
          datasets: [{
            data: pivot.dataset,
            backgroundColor: chartColors,
            borderWidth: 1
          }]
        },
        options: generateOptions("pie")
      });

      // 4. DOUGHNUT CHART
      this.charts.doughnut = new ChartClass(this.view.canvasDoughnut, {
        type: "doughnut",
        data: {
          labels: pivot.labels,
          datasets: [{
            data: pivot.dataset,
            backgroundColor: chartColors,
            borderWidth: 1,
            cutout: "60%"
          }]
        },
        options: generateOptions("doughnut")
      });
    } catch (e) {
      console.warn("ChartJS setup exception occurred:", e);
    }
  }

  destroyAllCharts() {
    Object.keys(this.charts).forEach(key => {
      if (this.charts[key]) {
        this.charts[key].destroy();
        this.charts[key] = null;
      }
    });
  }

  resizeVisibleCharts() {
    Object.keys(this.charts).forEach(key => {
      const chart = this.charts[key];
      if (chart) {
        chart.resize();
      }
    });
  }

  setupTopActions() {
    this.view.clearCacheBtn.addEventListener("click", () => this.handleClearCache());
  }

  async handleClearCache() {
    if (!confirm("Bạn có chắc chắn muốn xóa sạch cấu hình, lịch sử đối chiếu và làm mới hệ thống?")) return;

    try {
      this.view.showProgressBar(30);
      
      // Wipe remote JSON db variables
      const payload = {
        config: { matchKeys: [], compareColumns: [], groupByEnabled: false },
        history: []
      };

      await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      localStorage.clear();

      this.destroyAllCharts();
      this.model.reset();
      this.view.resetAllViews();
      this.renderHistoryLog();

      this.view.showProgressBar(100);
      setTimeout(() => this.view.showProgressBar(0), 800);
      this.view.showToast("Bản ghi và cơ sở dữ liệu đã được giải phóng sạch sẽ!");
    } catch (err) {
      console.error(err);
      this.view.showToast("Lỗi khi xóa bộ nhớ đệm", "error");
    }
  }

  /**
   * Sheets 3-Way Exporter using SheetJS libraries client side.
   */
  handleExportWorkbook() {
    const XLSX = window.XLSX;
    if (!XLSX) {
      this.view.showToast("Không tìm thấy bộ thư viện SheetJS để kết xuất Excel!", "error");
      return;
    }

    const { sourceA, sourceB, reconciliationResult, matchKeys, compareColumns } = this.model;
    if (!reconciliationResult || reconciliationResult.allCombined.length === 0) {
      this.view.showToast("Chưa có báo cáo kết quả đối chiếu để xuất!", "warning");
      return;
    }

    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Source A Complete rows
      const wsA = XLSX.utils.json_to_sheet(sourceA.rows);
      XLSX.utils.book_append_sheet(wb, wsA, "Nguồn A Clean");

      // Sheet 2: Source B Complete rows
      const wsB = XLSX.utils.json_to_sheet(sourceB.rows);
      XLSX.utils.book_append_sheet(wb, wsB, "Nguồn B Clean");

      // Sheet 3: Reconciliation Detailed comparison
      const columnsSpec = reconciliationResult.allCombined.map(row => {
        const itemResult = {};

        // [NHÓM TIÊU CHÍ QY CHIẾU]
        itemResult["Mã khóa quy chiếu (Composite Key)"] = row.compositeKey;

        // [NHÓM SỐ LIỆU GỐC NGUỒN A]
        compareColumns.forEach(col => {
          itemResult[`Nguồn A - ${col}`] = row.rowA ? (row.rowA[col] !== undefined ? row.rowA[col] : "") : "";
        });

        // [NHÓM SỐ LIỆU GỐC NGUỒN B]
        compareColumns.forEach(col => {
          itemResult[`Nguồn B - ${col}`] = row.rowB ? (row.rowB[col] !== undefined ? row.rowB[col] : "") : "";
        });

        // Track files provenance references
        itemResult["File gốc Nguồn A"] = row.rowA ? (row.rowA["Origin_File_Name"] || "") : "";
        itemResult["File gốc Nguồn B"] = row.rowB ? (row.rowB["Origin_File_Name"] || "") : "";

        // Status & Suggestion
        itemResult["Trạng thái Đối chiếu"] = row.status;
        itemResult["Lệch dòng / Khuyến nghị xử lý"] = row.discrepancy;

        return itemResult;
      });

      const wsResults = XLSX.utils.json_to_sheet(columnsSpec);
      XLSX.utils.book_append_sheet(wb, wsResults, "Chi Tiết Đối Chiếu");

      // Trigger automatic workbook file download
      const dateTag = new Date().toISOString().split("T")[0];
      XLSX.writeFile(wb, `Bao_Cao_Doi_Chieu_${dateTag}.xlsx`);
      
      this.view.showToast("Đã tải xuống thành công Báo cáo đối chiếu 3 lớp!");
    } catch (e) {
      this.view.showToast("Lỗi kết xuất Excel", "error");
      console.error(e);
    }
  }
}
