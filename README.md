# Ultra Reconciler Pro - Giải Pháp Đối Chiếu Số Liệu Kế Toán Doanh Nghiệp

Universal Accounting Data Reconciler & Analyzer là một ứng dụng full-stack tinh giản, nhanh gọn, hoạt động hoàn toàn trực tiếp trên trình duyệt của bạn (local MVC) nhằm hỗ trợ tự động đối chiếu hai nguồn dữ liệu kế toán (Source A & B), phân tích số liệu độc lập qua biểu đồ trực quan, và xuất báo cáo đối chiếu Excel 3-sheet tiêu chuẩn. Toàn bộ thiết lập đối chiếu và lịch sử chạy đối chiếu được lưu trữ bền vững tại máy chủ Node.js thông qua cơ sở dữ liệu tệp tin JSON an toàn.

---

## English Summary

**Ultra Reconciler Pro** is an executive-grade financial and accounting data reconciliation application. It leverages a server-plus-client (MVC) architecture with persistent JSON storage to allow users to upload dual ledgers (Source A & Source B), map up to 4 compound matching keys, automatically join the datasets with dynamic tolerance adjustments, review KPI balances and status highlights, and download a professional, segmented 3-sheet Excel workbook. 

Key technologies include Node.js, Express, Tailwind CSS, Chart.js, and SheetJS. Previous execution histories and custom rules are persisted in a secure local database file (`server/recon_db.json`) on the backend server, allowing session continuity and fast performance.

---

## Thư Mục Dự Án (Directory Structure)

```text
ultra-reconciler-pro/
├── package.json           # Khai báo script và các thư viện phụ thuộc (Express, XLSX)
├── server.js              # Máy chủ Express phục vụ tĩnh (Static files) & 2 cổng API (GET/POST /api/db)
├── server/
│   └── db.js              # Mô-đun xử lý đọc/ghi và khởi tạo tệp cơ sở dữ liệu JSON an toàn
├── public/
│   ├── index.html         # Giao diện người dùng HTML5 tích hợp Tailwind CDN & CDN thư viện ngoài
│   └── js/
│       ├── main.js        # Điểm nhập cuộc (Entry point) khởi chạy nền tảng
│       ├── model.js       # Quản lý RAM state, phân tích Excel/CSV, động cơ join và so sánh dữ liệu
│       ├── view.js        # Điều khiển hiển thị DOM, kiến tạo KPIs, bảng cuộn dính và xuất biểu đồ
│       ├── controller.js  # Hệ thống kích hoạt sự kiện, kết nối luồng hoạt động MVC & đồng bộ DB
│       └── utils.js       # Thư viện tiện ích nén số thực, chuẩn hóa ngày tháng và hash mã hóa tệp
└── .gitignore             # Khai báo bỏ qua tải lên git cho node_modules và tệp cơ sở dữ liệu địa phương
```

---

## Các Tính Năng Vượt Trội (Key Features)

### 1. Tab đối chiếu song song hai nguồn (Source A & B)
- **Tải tệp đa dạng**: Hỗ trợ kéo thả (drag & drop) hoặc tải lên thủ công đối với các định dạng Excel phổ biến (`.xlsx`, `.xls`) hoặc tệp phẳng chứa bảng (`.csv`).
- **Nhập liệu nhanh bằng tay**: Tích hợp trình dán tay (Paste Area) tự động phân tách bằng phím Tab hoặc dấu phẩy tiện lợi.
- **Kỹ thuật đối chiếu Khóa Hợp Phần (Composite Key Matching)**: Người dùng có thể tùy chọn và ghép nối cùng lúc lên tới 4 cột dữ liệu khóa tự động (ví dụ: số chứng từ, ngày giao dịch, mã số phụ, số tiền) tạo thành khóa duy nhất để đảm bảo kết quả chính xác hơn.
- **KPIs Trực Quan hóa**: Hiển thị cán cân tổng số dư dòng bên A, bên B, hiệu số cân bằng, số lượng cặp trùng khớp, tỉ lệ phần trăm khớp kế toán.
- **Báo cáo trạng thái màu sắc**: Đánh dấu tình trạng rõ ràng từng cặp giao dịch gồm: `Đã Khớp (Matched)`, `Chỉ có bên A (Only in A)`, `Chỉ có bên B (Only in B)`, kèm theo dòng khuyến nghị chênh lệch chi tiết số lượng tiền.
- **Xuất tệp Excel 3-sheet**: Kết xuất tệp báo cáo chuyên biệt bao gồm:
  1. **Sheet 1 (Nguồn A)**: Danh sách dòng dữ liệu gốc bên A.
  2. **Sheet 2 (Nguồn B)**: Danh sách dòng dữ liệu gốc bên B.
  3. **Sheet 3 (Kết quả Đối chiếu)**: Biểu mẫu phân vùng kế toán, dồn toàn bộ cột khóa, dữ liệu gộp từ hai nguồn tương ứng kèm trạng thái khớp.

### 2. Tab Phân tích nguồn độc lập & Trình Tạo Biểu Đồ Dynamic
- **Xây dựng biểu đồ linh hoạt**: Tải một tệp số liệu lên bảng Editor tính toán để tự động kích hoạt 4 đồ thị Chart.js đồng thời (Cột đứng, Đường thẳng, Tròn phần trăm, Vòng khuyên).
- **Phân khúc dữ liệu trực quan**: Người dùng tùy chọn linh hoạt trường phân loại cho Trục X và trường cộng tổng giá trị cho Trục Y.
- **Trình soạn thảo Pivot Table trực tiếp**: Biên bản bảng trực quan cho phép nhấn đúp chỉnh sửa ô kế toán trực tiếp, hỗ trợ thêm/xóa dòng, thêm/xóa cột số liệu linh hoạt.

### 3. Đồng bộ hóa và Lưu trữ lịch sử tại Server (JSON Database)
- Máy chủ Node.js sẽ lưu tệp trạng thái `recon_db.json` trong thư mục `server/`.
- Khi máy khách tải lại trang, hệ thống tự động phục hồi lịch sử các lần đối chiếu trước đó kèm chỉ số khớp và các tham số khóa đối lập mà không làm phiền người dùng phải lập lại quy trình thiết lập.

---

## Yêu Cầu Hệ Thống (Prerequisites)

- **Node.js**: Phiên bản 18 trở lên.
- **NPM**: Đi kèm với cài đặt Node.js tiêu chuẩn.

---

## Quy Trình Cài Đặt (Installation)

1. Tải toàn bộ nguồn dự án về máy tính hoặc môi trường lưu trữ của bạn.
2. Mở cửa sổ Dòng lệnh (Terminal) tại thư mục chứa dự án và chạy lệnh sau để tải xuống toàn bộ thư viện cần thiết:
   ```bash
   npm install
   ```

---

## Cách Khởi Chạy Ứng Dụng (Usage)

1. Khởi chạy máy chủ Express trên máy tính của bạn thông qua câu lệnh:
   ```bash
   npm start
   ```
2. Mở trình duyệt web của bạn và truy cập vào đường link sau:
   - **Địa chỉ**: [http://localhost:3000](http://localhost:3000)

---

## Hướng Dẫn Đóng Gói Và Đẩy Lên Kho Lưu Trữ GitHub

Nếu bạn muốn tạo mới kho lưu trữ (repository) để quản lý mã nguồn bằng Git, bạn có thể thực hiện theo các thao tác lệnh dưới đây:

<!--
```bash
# 1. Khởi tạo Git bên trong thư mục gốc của dự án
git init

# 2. Đưa toàn bộ các tệp dự án vào danh sách theo dõi (Sẽ tự động bỏ qua node_modules và recon_db.json theo file .gitignore)
git add .

# 3. Thực hiện cam kết (commit) mã nguồn ban đầu
git commit -m "Initial release: Ultra Reconciler Pro v1.0"

# 4. Liên kết tới máy chủ GitHub của bạn (thần thế liên danh bằng link thực tế của bạn)
git remote add origin <your-repo-url>

# 5. Đẩy tệp tin lên nhánh chính (main) của dự án
git push -u origin main
```
-->
