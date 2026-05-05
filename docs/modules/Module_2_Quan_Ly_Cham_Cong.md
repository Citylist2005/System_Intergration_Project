# Module 2: Quản lý Chấm công (Time & Attendance)

## Danh sách Use Cases

- **UC.06: Quản lý Ca làm việc (Manage Work Shifts)**
- **UC.07: Kiểm soát Nghỉ phép & Tăng ca (Control Overtime & Leave)**
- **UC.08: Theo dõi Chấm công hàng ngày (Track Daily Attendance)**
- **UC.09: Duyệt yêu cầu Nghỉ phép/Tăng ca (Approve Requests)**
- **UC.10: Đồng bộ & Báo cáo Chấm công (Attendance Sync & Reporting)**

## Kiến trúc Implement

- **Frontend:** Tạo các trang (Pages) tương ứng trong rontend/src/pages/.
- **Backend:** 
  - **Controller:** Định nghĩa các RESTful API endpoints.
  - **Service:** Xử lý Business Logic cho từng Use Case.
  - **Entity:** Tương tác với cơ sở dữ liệu thông qua TypeORM.
- **Phân quyền:** Sử dụng RolesGuard và PermissionsGuard để bảo vệ các endpoints.
