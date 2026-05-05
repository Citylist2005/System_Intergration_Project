# Module 4: Đánh giá Hiệu suất (Performance Management)

## Danh sách Use Cases

- **UC.16: Quản lý KPI / OKR (Manage KPI / OKR)**
- **UC.17: Đánh giá Hiệu suất nhân viên (Evaluate Employee Performance)**
- **UC.18: Thiết lập Kỳ đánh giá (Setup Evaluation Cycles)**
- **UC.19: Phản hồi 360 độ (360-Degree Feedback)**
- **UC.20: Phân tích & Báo cáo Hiệu suất (Performance Analytics)**

## Kiến trúc Implement

- **Frontend:** Tạo các trang (Pages) tương ứng trong rontend/src/pages/.
- **Backend:** 
  - **Controller:** Định nghĩa các RESTful API endpoints.
  - **Service:** Xử lý Business Logic cho từng Use Case.
  - **Entity:** Tương tác với cơ sở dữ liệu thông qua TypeORM.
- **Phân quyền:** Sử dụng RolesGuard và PermissionsGuard để bảo vệ các endpoints.
