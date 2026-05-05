# Module 3: Quản lý Tiền lương & Phúc lợi (Payroll & Compensation)

## Danh sách Use Cases

- **UC.11: Quản lý Chính sách lương (Manage Salary Policies)**
- **UC.12: Quản lý Phúc lợi & Bảo hiểm (Manage Benefits & Insurance)**
- **UC.13: Điều chỉnh Tính lương (Adjust Payroll Calculation)**
- **UC.14: Tính lương hàng tháng (Calculate Monthly Payroll)**
- **UC.15: Xuất báo cáo Lương & Phiếu lương (Export Payroll Reports)**

## Kiến trúc Implement

- **Frontend:** Tạo các trang (Pages) tương ứng trong rontend/src/pages/.
- **Backend:** 
  - **Controller:** Định nghĩa các RESTful API endpoints.
  - **Service:** Xử lý Business Logic cho từng Use Case.
  - **Entity:** Tương tác với cơ sở dữ liệu thông qua TypeORM.
- **Phân quyền:** Sử dụng RolesGuard và PermissionsGuard để bảo vệ các endpoints.
