# HR Payroll - System Integration Project

Ứng dụng quản lý nhân sự, chấm công, tính lương, báo cáo và đồng bộ dữ liệu giữa:

- `HUMAN_2025`: cơ sở dữ liệu nguồn trên SQL Server.
- `payroll_2026`: cơ sở dữ liệu đích trên MySQL.
- Backend: NestJS REST API.
- Frontend: React + Vite.

## 1. Yêu Cầu

Cài trước:

- Node.js 20+
- npm
- SQL Server có database `HUMAN_2025`
- MySQL có database `payroll_2026`
- Windows PowerShell

Kiểm tra:

```powershell
node -v
npm -v
```

## 2. Cài Đặt Lần Đầu

Mở terminal tại thư mục project:

```powershell
cd D:\CMU-CS-445\Source
```

Cài backend:

```powershell
cd backend
npm install
```

Cài frontend:

```powershell
cd ..\frontend
npm install
```

Quay lại thư mục gốc:

```powershell
cd ..
```

## 3. Cấu Hình Backend

Copy file env mẫu:

```powershell
Copy-Item backend\.env.example backend\.env
```

Mở `backend\.env` và sửa mật khẩu SQL Server/MySQL cho đúng máy.

Ví dụ:

```env
PORT=3000
CORS_ORIGIN=http://127.0.0.1:5173

HUMAN_DB_HOST=localhost
HUMAN_DB_PORT=1433
HUMAN_DB_USER=sa
HUMAN_DB_PASS=your_sql_server_password
HUMAN_DB_NAME=HUMAN_2025

PAYROLL_DB_HOST=localhost
PAYROLL_DB_PORT=3306
PAYROLL_DB_USER=root
PAYROLL_DB_PASS=your_mysql_password
PAYROLL_DB_NAME=payroll_2026

ADMIN_EMAIL=admin@docusync.local
ADMIN_PASSWORD=change-me
AUTH_TOKEN_SECRET=change-this-secret-before-sharing
```

Tài khoản dev mặc định:

```text
admin@docusync.local / change-me  (role: ADMIN)
```

> Sau khi chạy `npm run seed:rbac`, có thêm các tài khoản demo cho từng vai trò — xem **Mục 15**.

## 4. Tạo Schema MySQL

Nếu máy chưa có đủ bảng trong `payroll_2026`, chạy file:

```text
backend\sql\payroll_2026_schema.sql
```

File này tạo các bảng:

- `departments_payroll`
- `positions_payroll`
- `employees_payroll`
- `attendance`
- `salaries`

Sau đó chạy seeder RBAC để tạo bảng phân quyền và tài khoản demo:

```powershell
cd D:\CMU-CS-445\Source\backend
npm run seed:rbac
```

Seeder sẽ:

- Tạo bảng `roles`, `permissions`, `user_roles`, `role_permissions` (nếu chưa có)
- Seed 4 vai trò và 16 quyền mặc định
- Tạo 4 tài khoản demo (xem Mục 15)

Các khóa quan trọng:

- `attendance`: unique theo `(EmployeeID, AttendanceMonth)`
- `salaries`: unique theo `(EmployeeID, SalaryMonth)`

## 5. Chạy Nhanh Cả Backend Và Frontend

Tại thư mục gốc:

```powershell
npm start
```

Lệnh này sẽ:

- Chạy backend tại `http://127.0.0.1:3000/api/v1`
- Chạy frontend tại `http://127.0.0.1:5173`
- Tự mở trình duyệt vào web
- Không chạy trùng nếu backend/frontend đã mở sẵn

Lệnh tương đương:

```powershell
npm run dev
npm run start:all
```

## 6. Chạy Riêng

Backend:

```powershell
npm run start:backend
```

Frontend:

```powershell
npm run start:frontend
```

Build backend:

```powershell
npm run build:backend
```

Build frontend:

```powershell
npm run build:frontend
```

## 7. Đăng Nhập

Mở:

```text
http://127.0.0.1:5173
```

Tài khoản demo theo từng vai trò (sau khi chạy `npm run seed:rbac`):

| Email | Mật khẩu | Vai trò | Quyền |
|---|---|---|---|
| `admin@docusync.local` | `change-me` | ADMIN | Toàn quyền |
| `hr@company.local` | `change-me` | HR_MANAGER | Nhân viên, Chấm công, Báo cáo |
| `payroll@company.local` | `change-me` | PAYROLL_MANAGER | Lương, Báo cáo |
| `employee@company.local` | `change-me` | EMPLOYEE | Xem hồ sơ, Chấm công, Lương (của mình) |

Nếu bị lỗi token sau khi đổi code, xóa `hr_token` và `hr_user` trong Local Storage rồi đăng nhập lại.

## 8. Cấu Trúc Project

```text
Source/
  backend/
    src/
      modules/
        auth/        Đăng nhập, JWT, JwtAuthGuard, RolesGuard, PermissionsGuard
        employees/   Quản lý nhân viên
        attendance/  Chấm công
        payroll/     Tính lương, nhập lương, sửa lương
        users/       Quản lý tài khoản và phân quyền
        audit/       Nhật ký hệ thống
        sync/        Đồng bộ dữ liệu
      database/
        human/       Entity SQL Server HUMAN_2025
        payroll/
          entities/  Entity MySQL payroll_2026 (users, roles, permissions, ...)
          seeders/   rbac.seeder.ts — tạo bảng + seed dữ liệu
      config/        Cấu hình database
    sql/
      payroll_2026_schema.sql
  frontend/
    src/
      pages/         Các màn hình chính
      components/    Component UI dùng chung
      hooks/         useAuth — đọc roles/permissions từ localStorage
      api/           Axios client và service gọi API
      utils/         Format, export Excel/PDF, analytics
  docs/
    RBAC_DATABASE_DESIGN.md   Thiết kế RBAC, bảng, vai trò, quyền
  scripts/
    start-dev.ps1    Script chạy backend + frontend và mở trình duyệt
```

## 9. Chức Năng Chính

### Nhân Viên

- Xem danh sách nhân viên.
- Tạo, sửa, xóa mềm nhân viên.
- Lọc theo trạng thái.
- Tìm kiếm theo tên nhân viên.

### Chấm Công

- Xem dữ liệu chấm công.
- Xem tổng hợp chấm công theo nhân viên.
- Lọc theo tháng, năm, nhân viên.
- Đồng bộ chấm công từ SQL Server sang MySQL.

### Lương

- Chọn tháng/năm.
- Lọc theo nhân viên hoặc phòng ban.
- Tạo bảng lương.
- Nhập lương cho nhân viên mới.
- Sửa lương của nhân viên cũ.
- Xem chi tiết từng dòng lương.
- Xuất Excel/PDF cho bảng lương.

Công thức hiện tại:

```text
Thực lĩnh = Lương cơ bản + Thưởng - Khấu trừ thủ công - Khấu trừ vắng mặt
```

Trong đó:

```text
Khấu trừ vắng mặt = Lương cơ bản / 26 * Số ngày vắng
```

Lưu ý:

- `Inactive` và `On Leave` không được tính trong kỳ lương mặc định.
- Khi tính lại cùng tháng/năm, hệ thống cập nhật bản ghi mới nhất và dọn trùng theo nhân viên/kỳ lương.
- Cột `Deductions` là khấu trừ thủ công. Khấu trừ vắng mặt được tính riêng từ bảng chấm công để tránh cộng trùng khi tính lại nhiều lần.

### Báo Cáo

- Báo cáo nhân sự.
- Báo cáo lương.
- Báo cáo chấm công.
- Báo cáo tổng hợp.
- Xuất Excel/PDF.

### Đồng Bộ

- Đồng bộ phòng ban.
- Đồng bộ chức vụ.
- Đồng bộ nhân viên.
- Đồng bộ chấm công.
- Đồng bộ toàn bộ.
- Nhân viên có trong MySQL nhưng không còn trong nguồn SQL Server sẽ được chuyển sang `Inactive`.

## 10. API Chính

Base URL:

```text
http://127.0.0.1:3000/api/v1
```

Đăng nhập:

```http
POST /auth/login
```

Các API còn lại cần header:

```http
Authorization: Bearer <accessToken>
```

Nhân viên:

```http
GET    /employees
POST   /employees
PUT    /employees/:id
DELETE /employees/:id
```

Chấm công:

```http
GET /attendance
GET /attendance/summary
```

Lương:

```http
GET  /payroll
POST /payroll/calculate
POST /payroll/manual
PUT  /payroll/:id
```

Đồng bộ:

```http
GET  /sync/status
POST /sync/employees
POST /sync/departments
POST /sync/positions
POST /sync/attendance
POST /sync/all
```

## 11. Test Và Kiểm Tra

Build backend:

```powershell
cd backend
npm run build
```

Test backend:

```powershell
npm test -- --runInBand
```

Build frontend:

```powershell
cd ..\frontend
npm run build
```

Kiểm tra backend:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/api/v1
```

Kiểm tra frontend:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:5173
```

## 12. Lỗi Thường Gặp

### Không mở được web

Chạy lại:

```powershell
npm start
```

### Backend không kết nối database

Kiểm tra:

```text
backend\.env
```

Đảm bảo đúng host, port, username, password và database name.

### Port 3000 hoặc 5173 bị chiếm

Tìm process:

```powershell
netstat -ano | Select-String ":3000"
netstat -ano | Select-String ":5173"
```

Dừng process:

```powershell
Stop-Process -Id <PID> -Force
```

### Login bị lỗi sau khi cập nhật code

Xóa token cũ trong browser:

1. Mở DevTools.
2. Vào Application.
3. Vào Local Storage.
4. Xóa `hr_token` và `hr_user`.
5. Đăng nhập lại.

### API trả 401 Unauthorized

Nguyên nhân thường gặp:

- Chưa đăng nhập.
- Token cũ.
- Gọi API trực tiếp nhưng thiếu header `Authorization`.

### PDF không hiển thị tiếng Việt có dấu

PDF đang dùng font mặc định của jsPDF nên nội dung export PDF ưu tiên ASCII để tránh lỗi font. Excel vẫn giữ Unicode tiếng Việt tốt hơn.

## 13. Lệnh Tóm Tắt Gửi Nhóm

Lần đầu:

```powershell
cd D:\CMU-CS-445\Source
cd backend
npm install
Copy-Item .env.example .env
cd ..\frontend
npm install
cd ..
npm start
```

Các lần sau:

```powershell
cd D:\CMU-CS-445\Source
npm start
```

Đăng nhập:

```text
admin@docusync.local
change-me
```

## 14. Ghi Chu Demo Cuoi

Neu cac module moi nhu Ca lam viec, Nghi phep, KPI/OKR, Danh gia hoac Quan tri chua co du lieu, chay:

```powershell
cd D:\CMU-CS-445\Source\backend
node scripts\apply-new-tables.js
node scripts\seed-srs-demo-data.js
```

Du lieu seed chi dung de demo va test UI, khong thay the du lieu that trong SQL Server/MySQL.

Chuc nang sao luu database se tao ban ghi lich su trong he thong. De backup MySQL that, may can co `mysqldump` trong PATH va cau hinh dung bien database trong `backend\.env`.

## 15. Tài Khoản Demo RBAC

Sau khi chạy `npm run seed:rbac`, hệ thống có 4 tài khoản demo để kiểm tra phân quyền:

```powershell
cd D:\CMU-CS-445\Source\backend
npm run seed:rbac
```

### Tài Khoản Demo

| # | Email | Mật khẩu | Vai trò | Quyền |
|---|---|---|---|---|
| 1 | `admin@docusync.local` | `change-me` | ADMIN | Toàn bộ 16 quyền |
| 2 | `hr@company.local` | `change-me` | HR_MANAGER | employee.*, attendance.*, reports.read, dashboard.read |
| 3 | `payroll@company.local` | `change-me` | PAYROLL_MANAGER | payroll.*, reports.read, dashboard.read |
| 4 | `employee@company.local` | `change-me` | EMPLOYEE | employee.read, attendance.read, payroll.read, dashboard.read |

### Kiểm Tra Phân Quyền

**ADMIN** — thấy tất cả sidebar, tất cả nút Thêm/Sửa/Xoá, truy cập `/audit-logs`.

**HR_MANAGER** — thấy Nhân viên, Chấm công, Báo cáo. Có nút Thêm/Sửa/Xoá nhân viên. Không thấy Lương, Quản trị.

**PAYROLL_MANAGER** — thấy Lương, Báo cáo. Có nút Tạo bảng lương, Nhập lương, Sửa lương. Không thấy Nhân viên, Quản trị.

**EMPLOYEE** — chỉ thấy Bảng điều khiển. Không có nút Thêm/Sửa/Xoá. API `/employees` trả về dữ liệu (lọc theo service-level sau).

### Ghi Chú

- Seeder idempotent: chạy lại không tạo trùng user/role/permission.
- Mật khẩu hash dùng **scrypt** (giống `password.service.ts` trong backend).
- Để đổi mật khẩu demo, sửa trực tiếp trong DB hoặc tạo API `PUT /users/:id/password`.
- Tham khảo thiết kế đầy đủ tại [`docs/RBAC_DATABASE_DESIGN.md`](docs/RBAC_DATABASE_DESIGN.md).
