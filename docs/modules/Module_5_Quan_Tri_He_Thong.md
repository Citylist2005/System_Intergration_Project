# Module 5: Quản trị Hệ thống (System Administration)

## Danh sách Use Cases

- **UC.21: Quản lý Người dùng (Manage Users)**
- **UC.22: Phân quyền Truy cập (Role-Based Access Control - RBAC)**
- **UC.23: Sao lưu & Bảo mật Hệ thống (System Backup & Security)**
- **UC.24: Nhật ký Hệ thống (System Audit Logs)**
- **UC.25: Bảng điều khiển Quản trị (Dashboard & Overview)**

## Kiến trúc Implement

- **Frontend:** Tạo các trang (Pages) tương ứng trong rontend/src/pages/.
- **Backend:** 
  - **Controller:** Định nghĩa các RESTful API endpoints.
  - **Service:** Xử lý Business Logic cho từng Use Case.
  - **Entity:** Tương tác với cơ sở dữ liệu thông qua TypeORM.
- **Phân quyền:** Sử dụng RolesGuard và PermissionsGuard để bảo vệ các endpoints.
