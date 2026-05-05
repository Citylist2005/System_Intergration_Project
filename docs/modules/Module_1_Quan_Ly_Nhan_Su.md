# Module 1: Quản lý Nhân sự (Employee Management)

## Danh sách Use Cases

- **UC.01: Quản lý Hồ sơ nhân viên (Manage Employee Profiles)**
- **UC.02: Quản lý Vòng đời nhân viên (Manage Employee Lifecycle)**
- **UC.03: Quản lý Phòng ban & Chức vụ (Manage Departments & Positions)**
- **UC.04: Quy trình Onboarding / Offboarding**
- **UC.05: Tra cứu và Lọc danh sách nhân sự (Employee Search & Filter)**

## Kiến trúc Implement

- **Frontend:** Tạo các trang (Pages) tương ứng trong rontend/src/pages/.
- **Backend:** 
  - **Controller:** Định nghĩa các RESTful API endpoints.
  - **Service:** Xử lý Business Logic cho từng Use Case.
  - **Entity:** Tương tác với cơ sở dữ liệu thông qua TypeORM.
- **Phân quyền:** Sử dụng RolesGuard và PermissionsGuard để bảo vệ các endpoints.
