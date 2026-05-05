/*
 Navicat Premium Dump SQL

 Source Server         : PAYROLL_MYSQL
 Source Server Type    : MySQL
 Source Server Version : 80044 (8.0.44)
 Source Host           : localhost:3306
 Source Schema         : payroll_2026

 Target Server Type    : MySQL
 Target Server Version : 80044 (8.0.44)
 File Encoding         : 65001

 Date: 05/05/2026 16:06:37
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for attendance
-- ----------------------------
DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance`  (
  `AttendanceID` int NOT NULL AUTO_INCREMENT,
  `EmployeeID` int NULL DEFAULT NULL,
  `WorkDays` int NOT NULL,
  `AbsentDays` int NULL DEFAULT 0,
  `LeaveDays` int NULL DEFAULT 0,
  `AttendanceMonth` date NOT NULL,
  `CreatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `OvertimeHours` decimal(6, 2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`AttendanceID`) USING BTREE,
  UNIQUE INDEX `ux_attendance_employee_month`(`EmployeeID` ASC, `AttendanceMonth` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 73 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of attendance
-- ----------------------------
INSERT INTO `attendance` VALUES (61, 1, 22, 1, 0, '2024-08-31', '2026-05-01 00:38:10', 0.00);
INSERT INTO `attendance` VALUES (62, 2, 21, 0, 1, '2024-08-31', '2026-05-01 00:38:10', 0.00);
INSERT INTO `attendance` VALUES (63, 3, 23, 0, 0, '2024-08-31', '2026-05-01 00:38:10', 0.00);
INSERT INTO `attendance` VALUES (64, 4, 22, 2, 0, '2024-08-31', '2026-05-01 00:38:10', 0.00);
INSERT INTO `attendance` VALUES (65, 5, 18, 3, 2, '2024-08-31', '2026-05-01 00:38:10', 0.00);
INSERT INTO `attendance` VALUES (66, 6, 24, 0, 0, '2024-08-31', '2026-05-01 00:38:10', 0.00);
INSERT INTO `attendance` VALUES (67, 7, 20, 1, 1, '2024-08-31', '2026-05-01 00:38:10', 0.00);
INSERT INTO `attendance` VALUES (68, 8, 19, 2, 0, '2024-08-31', '2026-05-01 00:38:10', 0.00);
INSERT INTO `attendance` VALUES (69, 9, 16, 0, 2, '2024-08-31', '2026-05-01 00:38:10', 0.00);
INSERT INTO `attendance` VALUES (70, 10, 22, 1, 0, '2024-08-31', '2026-05-01 00:38:10', 0.00);
INSERT INTO `attendance` VALUES (72, 1, 25, 1, 0, '2026-05-01', '2026-05-01 23:14:33', 2.00);

-- ----------------------------
-- Table structure for audit_logs
-- ----------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs`  (
  `LogID` int NOT NULL AUTO_INCREMENT,
  `UserID` int NULL DEFAULT NULL,
  `Username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `Action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'CREATE,UPDATE,DELETE,LOGIN,EXPORT,BACKUP',
  `EntityType` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Employee,Payroll,SalaryPolicy,User,Backup,KPI,Performance',
  `EntityID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `OldValues` json NULL,
  `NewValues` json NULL,
  `IPAddress` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `CreatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LogID`) USING BTREE,
  INDEX `idx_al_user`(`UserID` ASC) USING BTREE,
  INDEX `idx_al_entity`(`EntityType` ASC, `EntityID` ASC) USING BTREE,
  INDEX `idx_al_created`(`CreatedAt` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of audit_logs
-- ----------------------------
INSERT INTO `audit_logs` VALUES (1, 1, 'admin@docusync.local', 'DELETE', 'Employee', '99991', '{\"Status\": \"Inactive\", \"FullName\": \"Codex Test Employee Updated\", \"SyncedAt\": \"2026-04-30T18:22:03.000Z\", \"EmployeeID\": 99991, \"PositionID\": 2, \"DepartmentID\": 2}', '{\"Status\": \"Inactive\", \"FullName\": \"Codex Test Employee Updated\", \"SyncedAt\": \"2026-05-01T16:07:08.943Z\", \"EmployeeID\": 99991, \"PositionID\": 2, \"DepartmentID\": 2}', '::1', '2026-05-01 23:07:09');
INSERT INTO `audit_logs` VALUES (2, 1, 'admin@docusync.local', 'CREATE', 'Employee', '15', NULL, '{\"Status\": \"Probation\", \"FullName\": \"Khánh\", \"SyncedAt\": \"2026-05-01T16:12:07.523Z\", \"EmployeeID\": 15, \"PositionID\": 1, \"DepartmentID\": 1}', '::1', '2026-05-01 23:12:07');
INSERT INTO `audit_logs` VALUES (3, 1, 'admin', 'CREATE', 'Attendance', '72', NULL, '{\"WorkDays\": 25, \"CreatedAt\": \"2026-05-01T16:14:32.919Z\", \"LeaveDays\": 0, \"AbsentDays\": 1, \"EmployeeID\": 1, \"AttendanceID\": 72, \"OvertimeHours\": \"2.00\", \"AttendanceMonth\": \"2026-05-01T00:00:00.000Z\"}', '::ffff:127.0.0.1', '2026-05-01 23:14:32');
INSERT INTO `audit_logs` VALUES (4, 1, 'admin', 'CREATE', 'Employee', '18', NULL, '{\"Status\": \"Probation\", \"FullName\": \"Hà An\", \"SyncedAt\": \"2026-05-05T00:19:45.965Z\", \"EmployeeID\": 18, \"PositionID\": 1, \"DepartmentID\": 1}', '::1', '2026-05-05 07:19:46');
INSERT INTO `audit_logs` VALUES (5, 1, 'admin', 'DELETE', 'Employee', '11', '{\"Status\": \"Inactive\", \"FullName\": \"Hà An\", \"SyncedAt\": \"2026-05-01T15:44:34.000Z\", \"EmployeeID\": 11, \"PositionID\": 1, \"DepartmentID\": 1}', NULL, '::1', '2026-05-05 07:52:16');
INSERT INTO `audit_logs` VALUES (6, 1, 'admin', 'DELETE', 'Employee', '12', '{\"Status\": \"Inactive\", \"FullName\": \"Hà An\", \"SyncedAt\": \"2026-04-30T18:54:22.000Z\", \"EmployeeID\": 12, \"PositionID\": 1, \"DepartmentID\": 1}', NULL, '::1', '2026-05-05 07:52:21');
INSERT INTO `audit_logs` VALUES (7, 1, 'admin', 'DELETE', 'Employee', '14', '{\"Status\": \"Inactive\", \"FullName\": \"An\", \"SyncedAt\": \"2026-04-30T18:38:04.000Z\", \"EmployeeID\": 14, \"PositionID\": 122, \"DepartmentID\": 111}', NULL, '::1', '2026-05-05 07:52:25');
INSERT INTO `audit_logs` VALUES (8, 1, 'admin', 'DELETE', 'Employee', '99991', '{\"Status\": \"Inactive\", \"FullName\": \"Codex Test Employee Updated\", \"SyncedAt\": \"2026-05-01T16:07:09.000Z\", \"EmployeeID\": 99991, \"PositionID\": 2, \"DepartmentID\": 2}', NULL, '::1', '2026-05-05 07:52:30');
INSERT INTO `audit_logs` VALUES (9, 1, 'admin', 'DELETE', 'Employee', '99992', '{\"Status\": \"Inactive\", \"FullName\": \"Codex Fresh Create Test\", \"SyncedAt\": \"2026-04-30T18:29:47.000Z\", \"EmployeeID\": 99992, \"PositionID\": 1, \"DepartmentID\": 1}', NULL, '::1', '2026-05-05 07:52:34');
INSERT INTO `audit_logs` VALUES (10, 1, 'admin', 'DEACTIVATE', 'Employee', '15', '{\"Status\": \"Probation\", \"FullName\": \"Khánh\", \"SyncedAt\": \"2026-05-01T16:12:08.000Z\", \"EmployeeID\": 15, \"PositionID\": 1, \"DepartmentID\": 1}', '{\"Status\": \"Inactive\", \"FullName\": \"Khánh\", \"SyncedAt\": \"2026-05-05T01:20:49.559Z\", \"EmployeeID\": 15, \"PositionID\": 1, \"DepartmentID\": 1}', '::1', '2026-05-05 08:20:50');
INSERT INTO `audit_logs` VALUES (11, 1, 'admin', 'CREATE', 'Employee', '13', NULL, '{\"Status\": \"Inactive\", \"FullName\": \"Giáng My\", \"SyncedAt\": \"2026-05-05T08:59:16.615Z\", \"EmployeeID\": 13, \"PositionID\": 6, \"DepartmentID\": 1}', '::1', '2026-05-05 15:59:16');
INSERT INTO `audit_logs` VALUES (12, 1, 'admin', 'UPDATE', 'Employee', '13', '{\"Status\": \"Inactive\", \"FullName\": \"Giáng My\", \"SyncedAt\": \"2026-05-05T08:59:17.000Z\", \"EmployeeID\": 13, \"PositionID\": 6, \"DepartmentID\": 1}', '{\"Status\": \"Active\", \"FullName\": \"Giáng My\", \"SyncedAt\": \"2026-05-05T08:59:42.724Z\", \"EmployeeID\": 13, \"PositionID\": 6, \"DepartmentID\": 1}', '::1', '2026-05-05 15:59:42');
INSERT INTO `audit_logs` VALUES (13, 1, 'admin', 'UPDATE', 'Employee', '15', '{\"Status\": \"Inactive\", \"FullName\": \"Khánh\", \"SyncedAt\": \"2026-05-05T01:20:50.000Z\", \"EmployeeID\": 15, \"PositionID\": 1, \"DepartmentID\": 1}', '{\"Status\": \"Active\", \"FullName\": \"Khánh\", \"SyncedAt\": \"2026-05-05T08:59:53.922Z\", \"EmployeeID\": 15, \"PositionID\": 1, \"DepartmentID\": 1}', '::1', '2026-05-05 15:59:53');

-- ----------------------------
-- Table structure for benefits_insurance
-- ----------------------------
DROP TABLE IF EXISTS `benefits_insurance`;
CREATE TABLE `benefits_insurance`  (
  `BenefitID` int NOT NULL AUTO_INCREMENT,
  `EmployeeID` int NOT NULL,
  `BenefitType` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Health,Social,Unemployment,Dental,Life,Other',
  `Provider` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `PolicyNumber` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `StartDate` date NULL DEFAULT NULL,
  `EndDate` date NULL DEFAULT NULL,
  `MonthlyCost` decimal(15, 2) NULL DEFAULT 0.00,
  `EmployerShare` decimal(15, 2) NULL DEFAULT 0.00,
  `EmployeeShare` decimal(15, 2) NULL DEFAULT 0.00,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'Active' COMMENT 'Active,Expired,Cancelled',
  `Notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `CreatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`BenefitID`) USING BTREE,
  INDEX `idx_bi_employee`(`EmployeeID` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of benefits_insurance
-- ----------------------------
INSERT INTO `benefits_insurance` VALUES (1, 1, 'Health', 'Bảo hiểm ABC', 'HI-001', '2026-01-01', NULL, 900000.00, 700000.00, 200000.00, 'Active', 'Gói sức khỏe tiêu chuẩn', '2026-05-01 21:43:26', '2026-05-01 21:43:26');
INSERT INTO `benefits_insurance` VALUES (2, 2, 'Social', 'BHXH Việt Nam', 'SI-002', '2026-01-01', NULL, 1200000.00, 900000.00, 300000.00, 'Active', 'Bảo hiểm xã hội', '2026-05-01 21:43:26', '2026-05-01 21:43:26');
INSERT INTO `benefits_insurance` VALUES (3, 3, 'Life', 'Bảo hiểm XYZ', 'LI-003', '2026-02-01', NULL, 600000.00, 500000.00, 100000.00, 'Active', 'Bảo hiểm nhân thọ', '2026-05-01 21:43:26', '2026-05-01 21:43:26');

-- ----------------------------
-- Table structure for departments_payroll
-- ----------------------------
DROP TABLE IF EXISTS `departments_payroll`;
CREATE TABLE `departments_payroll`  (
  `DepartmentID` int NOT NULL,
  `DepartmentName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SyncedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`DepartmentID`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of departments_payroll
-- ----------------------------
INSERT INTO `departments_payroll` VALUES (1, 'Phòng Nhân sự', '2026-05-01 01:55:48');
INSERT INTO `departments_payroll` VALUES (2, 'Phòng Kế toán', '2026-05-01 01:55:48');
INSERT INTO `departments_payroll` VALUES (3, 'Phòng Kỹ thuật', '2026-05-01 01:55:48');
INSERT INTO `departments_payroll` VALUES (4, 'Phòng Kinh doanh', '2026-05-01 01:55:48');
INSERT INTO `departments_payroll` VALUES (5, 'Phòng Hành chính', '2026-05-01 01:55:48');
INSERT INTO `departments_payroll` VALUES (6, 'Phòng Marketing', '2026-05-01 01:55:48');
INSERT INTO `departments_payroll` VALUES (7, 'Phòng Sản xuất', '2026-05-01 01:55:48');
INSERT INTO `departments_payroll` VALUES (8, 'Phòng Bảo trì', '2026-05-01 01:55:48');
INSERT INTO `departments_payroll` VALUES (9, 'Phòng Nghiên cứu & Phát triển', '2026-05-01 01:55:48');
INSERT INTO `departments_payroll` VALUES (10, 'Phòng Dịch vụ khách hàng', '2026-05-01 01:55:48');

-- ----------------------------
-- Table structure for employee_lifecycle
-- ----------------------------
DROP TABLE IF EXISTS `employee_lifecycle`;
CREATE TABLE `employee_lifecycle`  (
  `LifecycleID` int NOT NULL AUTO_INCREMENT,
  `EmployeeID` int NOT NULL,
  `EventType` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Hired,Promoted,Transferred,OnLeave,Terminated,Rehired',
  `EventDate` date NOT NULL,
  `FromPosition` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ToPosition` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `FromDept` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ToDept` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `Notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `CreatedBy` int NULL DEFAULT NULL,
  `CreatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`LifecycleID`) USING BTREE,
  INDEX `idx_el_employee`(`EmployeeID` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of employee_lifecycle
-- ----------------------------
INSERT INTO `employee_lifecycle` VALUES (1, 1, 'Hired', '2025-01-10', NULL, 'Nhân viên HR', NULL, 'Nhân sự', 'Tuyển dụng đầu năm', 1, '2026-05-01 21:43:26');
INSERT INTO `employee_lifecycle` VALUES (2, 2, 'Promoted', '2026-04-01', 'Chuyên viên', 'Trưởng nhóm', 'Kế toán', 'Kế toán', 'Thăng chức sau đánh giá Q1', 1, '2026-05-01 21:43:26');
INSERT INTO `employee_lifecycle` VALUES (3, 4, 'Transferred', '2026-03-15', 'Nhân viên', 'Nhân viên', 'Vận hành', 'Nhân sự', 'Điều chuyển nội bộ', 1, '2026-05-01 21:43:26');

-- ----------------------------
-- Table structure for employees_payroll
-- ----------------------------
DROP TABLE IF EXISTS `employees_payroll`;
CREATE TABLE `employees_payroll`  (
  `EmployeeID` int NOT NULL,
  `FullName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DepartmentID` int NULL DEFAULT NULL,
  `PositionID` int NULL DEFAULT NULL,
  `Status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `SyncedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`EmployeeID`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of employees_payroll
-- ----------------------------
INSERT INTO `employees_payroll` VALUES (1, 'Nguyễn Văn An', 1, 1, 'Active', '2026-05-01 22:44:34');
INSERT INTO `employees_payroll` VALUES (2, 'Lê Thị Bình', 2, 3, 'Active', '2026-05-01 22:44:34');
INSERT INTO `employees_payroll` VALUES (3, 'Trần Quốc Cường', 3, 7, 'Active', '2026-05-01 22:44:34');
INSERT INTO `employees_payroll` VALUES (4, 'Phạm Hồng Dung', 4, 2, 'Active', '2026-05-01 22:44:34');
INSERT INTO `employees_payroll` VALUES (5, 'Võ Thành Đạt', 5, 4, 'On Leave', '2026-05-01 22:44:34');
INSERT INTO `employees_payroll` VALUES (6, 'Đặng Minh Hạnh', 6, 1, 'Active', '2026-05-01 22:44:34');
INSERT INTO `employees_payroll` VALUES (7, 'Lưu Trung Hiếu', 7, 5, 'Active', '2026-05-01 22:44:34');
INSERT INTO `employees_payroll` VALUES (8, 'Ngô Thu Lan', 8, 8, 'Probation', '2026-05-01 22:44:34');
INSERT INTO `employees_payroll` VALUES (9, 'Bùi Văn Minh', 9, 9, 'Intern', '2026-05-01 22:44:34');
INSERT INTO `employees_payroll` VALUES (10, 'Hoàng Thị Oanh', 10, 6, 'Active', '2026-05-01 22:44:34');
INSERT INTO `employees_payroll` VALUES (13, 'Giáng My', 1, 6, 'Active', '2026-05-05 15:59:43');
INSERT INTO `employees_payroll` VALUES (15, 'Khánh', 1, 1, 'Active', '2026-05-05 15:59:54');
INSERT INTO `employees_payroll` VALUES (18, 'Hà An', 1, 1, 'Probation', '2026-05-05 07:19:46');

-- ----------------------------
-- Table structure for kpi_okr
-- ----------------------------
DROP TABLE IF EXISTS `kpi_okr`;
CREATE TABLE `kpi_okr`  (
  `KpiID` int NOT NULL AUTO_INCREMENT,
  `EmployeeID` int NOT NULL,
  `Period` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'e.g. 2025-Q1, 2025-H1, 2025',
  `PeriodType` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'Quarterly' COMMENT 'Monthly,Quarterly,HalfYear,Yearly',
  `Title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `TargetValue` decimal(10, 2) NULL DEFAULT NULL,
  `ActualValue` decimal(10, 2) NULL DEFAULT NULL,
  `Weight` decimal(5, 2) NULL DEFAULT 100.00 COMMENT 'percentage weight',
  `Score` decimal(5, 2) NULL DEFAULT NULL COMMENT 'calculated score 0-100',
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'Active' COMMENT 'Active,Completed,Cancelled',
  `CreatedBy` int NULL DEFAULT NULL,
  `CreatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `BonusAmount` decimal(15, 2) NULL DEFAULT 0.00,
  PRIMARY KEY (`KpiID`) USING BTREE,
  INDEX `idx_kpi_employee`(`EmployeeID` ASC) USING BTREE,
  INDEX `idx_kpi_period`(`Period` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of kpi_okr
-- ----------------------------
INSERT INTO `kpi_okr` VALUES (1, 1, '2026-Q2', 'Quarterly', 'Tỷ lệ hoàn tất hồ sơ nhân sự', 'Hoàn tất hồ sơ đúng hạn', 100.00, 92.00, 40.00, 92.00, 'Active', 1, '2026-05-01 21:43:26', '2026-05-01 21:43:26', 0.00);
INSERT INTO `kpi_okr` VALUES (2, 2, '2026-Q2', 'Quarterly', 'Độ chính xác bảng lương', 'Giảm lỗi tính lương', 100.00, 96.00, 35.00, 96.00, 'Active', 1, '2026-05-01 21:43:26', '2026-05-01 21:43:26', 0.00);
INSERT INTO `kpi_okr` VALUES (3, 3, '2026-Q2', 'Quarterly', 'Tỷ lệ xử lý yêu cầu vận hành', 'Xử lý yêu cầu trong SLA', 100.00, 88.00, 25.00, 88.00, 'Active', 1, '2026-05-01 21:43:26', '2026-05-01 21:43:26', 0.00);

-- ----------------------------
-- Table structure for leave_requests
-- ----------------------------
DROP TABLE IF EXISTS `leave_requests`;
CREATE TABLE `leave_requests`  (
  `LeaveID` int NOT NULL AUTO_INCREMENT,
  `EmployeeID` int NOT NULL,
  `LeaveType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Annual,Sick,Maternity,Unpaid,Other',
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `TotalDays` decimal(5, 1) NOT NULL DEFAULT 1.0,
  `Reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'Pending' COMMENT 'Pending,Approved,Rejected,Cancelled',
  `ApprovedBy` int NULL DEFAULT NULL,
  `ApprovedAt` datetime NULL DEFAULT NULL,
  `CreatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`LeaveID`) USING BTREE,
  INDEX `idx_lr_employee`(`EmployeeID` ASC) USING BTREE,
  INDEX `idx_lr_status`(`Status` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of leave_requests
-- ----------------------------
INSERT INTO `leave_requests` VALUES (1, 2, 'Annual', '2026-05-06', '2026-05-07', 2.0, 'Nghỉ phép cá nhân', 'Approved', 1, '2026-05-01 21:43:26', '2026-05-01 21:43:26', '2026-05-01 21:43:26');
INSERT INTO `leave_requests` VALUES (2, 5, 'Sick', '2026-05-03', '2026-05-03', 1.0, 'Nghỉ ốm', 'Pending', NULL, NULL, '2026-05-01 21:43:26', '2026-05-01 21:43:26');
INSERT INTO `leave_requests` VALUES (3, 3, 'Unpaid', '2026-05-12', '2026-05-12', 1.0, 'Việc gia đình', 'Rejected', 1, '2026-05-01 21:43:26', '2026-05-01 21:43:26', '2026-05-01 21:43:26');

-- ----------------------------
-- Table structure for onboarding_offboarding
-- ----------------------------
DROP TABLE IF EXISTS `onboarding_offboarding`;
CREATE TABLE `onboarding_offboarding`  (
  `RecordID` int NOT NULL AUTO_INCREMENT,
  `EmployeeID` int NOT NULL,
  `ProcessType` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Onboarding,Offboarding',
  `StartDate` date NULL DEFAULT NULL,
  `TargetDate` date NULL DEFAULT NULL,
  `CompletedDate` date NULL DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'InProgress' COMMENT 'InProgress,Completed,Cancelled',
  `ChecklistJSON` json NULL COMMENT 'Array of checklist items with completion flags',
  `AssignedTo` int NULL DEFAULT NULL,
  `Notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `CreatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`RecordID`) USING BTREE,
  INDEX `idx_oo_employee`(`EmployeeID` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of onboarding_offboarding
-- ----------------------------
INSERT INTO `onboarding_offboarding` VALUES (1, 1, 'Onboarding', '2025-01-10', '2025-01-17', '2025-01-16', 'Completed', '[\"Tạo tài khoản\", \"Bàn giao thiết bị\", \"Đào tạo nội quy\"]', 1, 'Hoàn tất đúng hạn', '2026-05-01 21:43:26', '2026-05-01 21:43:26');
INSERT INTO `onboarding_offboarding` VALUES (2, 5, 'Offboarding', '2026-05-01', '2026-05-15', NULL, 'InProgress', '[\"Thu hồi thiết bị\", \"Khóa tài khoản\", \"Chốt công nợ\"]', 1, 'Đang xử lý', '2026-05-01 21:43:26', '2026-05-01 21:43:26');

-- ----------------------------
-- Table structure for overtime_requests
-- ----------------------------
DROP TABLE IF EXISTS `overtime_requests`;
CREATE TABLE `overtime_requests`  (
  `OvertimeID` int NOT NULL AUTO_INCREMENT,
  `EmployeeID` int NOT NULL,
  `OvertimeDate` date NOT NULL,
  `StartTime` time NOT NULL,
  `EndTime` time NOT NULL,
  `Hours` decimal(5, 2) NOT NULL,
  `Reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `OvertimeType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'Weekday' COMMENT 'Weekday,Weekend,Holiday',
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'Pending' COMMENT 'Pending,Approved,Rejected,Cancelled',
  `ApprovedBy` int NULL DEFAULT NULL,
  `ApprovedAt` datetime NULL DEFAULT NULL,
  `CreatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`OvertimeID`) USING BTREE,
  INDEX `idx_or_employee`(`EmployeeID` ASC) USING BTREE,
  INDEX `idx_or_date`(`OvertimeDate` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of overtime_requests
-- ----------------------------
INSERT INTO `overtime_requests` VALUES (1, 1, '2026-05-04', '17:30:00', '19:30:00', 2.00, 'Hoàn tất báo cáo tháng', 'Weekday', 'Approved', 1, '2026-05-01 21:43:26', '2026-05-01 21:43:26', '2026-05-01 21:43:26');
INSERT INTO `overtime_requests` VALUES (2, 3, '2026-05-09', '08:00:00', '12:00:00', 4.00, 'Hỗ trợ vận hành cuối tuần', 'Weekend', 'Pending', NULL, NULL, '2026-05-01 21:43:26', '2026-05-01 21:43:26');

-- ----------------------------
-- Table structure for payroll_adjustments
-- ----------------------------
DROP TABLE IF EXISTS `payroll_adjustments`;
CREATE TABLE `payroll_adjustments`  (
  `AdjustmentID` int NOT NULL AUTO_INCREMENT,
  `EmployeeID` int NOT NULL,
  `SalaryMonth` date NOT NULL COMMENT 'First day of month',
  `AdjustType` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Bonus,Deduction,Allowance,Commission',
  `Amount` decimal(15, 2) NOT NULL,
  `Reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `ApprovedBy` int NULL DEFAULT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'Pending' COMMENT 'Pending,Approved,Applied,Rejected',
  `CreatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`AdjustmentID`) USING BTREE,
  INDEX `idx_pa_employee`(`EmployeeID` ASC) USING BTREE,
  INDEX `idx_pa_month`(`SalaryMonth` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of payroll_adjustments
-- ----------------------------
INSERT INTO `payroll_adjustments` VALUES (1, 1, '2026-05-01', 'Bonus', 1500000.00, 'Thưởng hoàn thành KPI', 1, 'Approved', '2026-05-01 21:43:26', '2026-05-01 21:43:26');
INSERT INTO `payroll_adjustments` VALUES (2, 2, '2026-05-01', 'Allowance', 800000.00, 'Phụ cấp trách nhiệm', 1, 'Approved', '2026-05-01 21:43:26', '2026-05-01 21:43:26');
INSERT INTO `payroll_adjustments` VALUES (3, 3, '2026-05-01', 'Deduction', 300000.00, 'Đi muộn trong kỳ', 1, 'Pending', '2026-05-01 21:43:26', '2026-05-01 21:43:26');

-- ----------------------------
-- Table structure for performance_reviews
-- ----------------------------
DROP TABLE IF EXISTS `performance_reviews`;
CREATE TABLE `performance_reviews`  (
  `ReviewID` int NOT NULL AUTO_INCREMENT,
  `EmployeeID` int NOT NULL,
  `ReviewPeriod` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ReviewDate` date NULL DEFAULT NULL,
  `ReviewerID` int NULL DEFAULT NULL,
  `OverallScore` decimal(5, 2) NULL DEFAULT NULL,
  `Competency` decimal(5, 2) NULL DEFAULT NULL COMMENT '0-5 scale',
  `Attitude` decimal(5, 2) NULL DEFAULT NULL,
  `Teamwork` decimal(5, 2) NULL DEFAULT NULL,
  `Productivity` decimal(5, 2) NULL DEFAULT NULL,
  `Leadership` decimal(5, 2) NULL DEFAULT NULL,
  `Grade` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'A+,A,B+,B,C,D',
  `Strengths` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `Weaknesses` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `Goals` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'Draft' COMMENT 'Draft,Submitted,Approved,Rejected',
  `CreatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ReviewID`) USING BTREE,
  INDEX `idx_pr_employee`(`EmployeeID` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of performance_reviews
-- ----------------------------
INSERT INTO `performance_reviews` VALUES (1, 1, '2026-Q1', '2026-04-05', 1, 91.00, 4.50, 4.60, 4.40, 4.50, 4.00, 'A', 'Chủ động và ổn định', 'Cần cải thiện báo cáo phân tích', 'Nâng chất lượng báo cáo HR', 'Approved', '2026-05-01 21:43:26', '2026-05-01 21:43:26');
INSERT INTO `performance_reviews` VALUES (2, 2, '2026-Q1', '2026-04-06', 1, 94.00, 4.70, 4.50, 4.60, 4.80, 4.20, 'A+', 'Chính xác trong nghiệp vụ lương', 'Cần chia sẻ kiến thức nhiều hơn', 'Chuẩn hóa checklist tính lương', 'Submitted', '2026-05-01 21:43:26', '2026-05-01 21:43:26');

-- ----------------------------
-- Table structure for permissions
-- ----------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UQ_permissions_name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 592 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of permissions
-- ----------------------------
INSERT INTO `permissions` VALUES (1, 'employee.read', 'employee.read', '2026-05-04 23:57:22.631104', '2026-05-05 03:53:34.937882');
INSERT INTO `permissions` VALUES (2, 'employee.create', 'employee.create', '2026-05-04 23:57:22.636286', '2026-05-05 03:53:34.954063');
INSERT INTO `permissions` VALUES (3, 'employee.update', 'employee.update', '2026-05-04 23:57:22.642819', '2026-05-05 03:53:34.958473');
INSERT INTO `permissions` VALUES (4, 'employee.delete', 'employee.delete', '2026-05-04 23:57:22.646804', '2026-05-05 03:53:34.968479');
INSERT INTO `permissions` VALUES (5, 'attendance.read', 'attendance.read', '2026-05-04 23:57:22.650245', '2026-05-05 03:53:34.981007');
INSERT INTO `permissions` VALUES (6, 'attendance.create', 'attendance.create', '2026-05-04 23:57:22.654639', '2026-05-05 03:53:34.985550');
INSERT INTO `permissions` VALUES (7, 'attendance.update', 'attendance.update', '2026-05-04 23:57:22.659211', '2026-05-05 03:53:35.008208');
INSERT INTO `permissions` VALUES (8, 'payroll.read', 'payroll.read', '2026-05-04 23:57:22.664017', '2026-05-05 03:53:35.017031');
INSERT INTO `permissions` VALUES (9, 'payroll.calculate', 'payroll.calculate', '2026-05-04 23:57:22.668122', '2026-05-05 03:53:35.027098');
INSERT INTO `permissions` VALUES (10, 'payroll.update', 'payroll.update', '2026-05-04 23:57:22.672119', '2026-05-05 03:53:35.031824');
INSERT INTO `permissions` VALUES (11, 'reports.read', 'reports.read', '2026-05-04 23:57:22.677198', '2026-05-05 03:53:35.136209');
INSERT INTO `permissions` VALUES (12, 'dashboard.read', 'dashboard.read', '2026-05-04 23:57:22.681551', '2026-05-05 03:53:34.921694');
INSERT INTO `permissions` VALUES (13, 'user.manage', 'user.manage', '2026-05-04 23:57:22.699621', '2026-05-05 03:53:35.161857');
INSERT INTO `permissions` VALUES (14, 'role.manage', 'role.manage', '2026-05-04 23:57:22.703321', '2026-05-05 03:53:35.166403');
INSERT INTO `permissions` VALUES (15, 'audit.read', 'audit.read', '2026-05-04 23:57:22.707501', '2026-05-05 03:53:35.145333');
INSERT INTO `permissions` VALUES (16, 'system.manage', 'system.manage', '2026-05-04 23:57:22.711007', '2026-05-05 03:53:35.181447');
INSERT INTO `permissions` VALUES (102, 'employee.manage', 'employee.manage', '2026-05-05 03:53:34.972800', '2026-05-05 03:53:34.972800');
INSERT INTO `permissions` VALUES (103, 'lifecycle.read', 'lifecycle.read', '2026-05-05 03:53:34.976951', '2026-05-05 03:53:34.976951');
INSERT INTO `permissions` VALUES (107, 'benefits.read', 'benefits.read', '2026-05-05 03:53:35.012804', '2026-05-05 03:53:35.012804');
INSERT INTO `permissions` VALUES (111, 'payroll.manage', 'payroll.manage', '2026-05-05 03:53:35.047900', '2026-05-05 03:53:35.047900');
INSERT INTO `permissions` VALUES (112, 'department.manage', 'department.manage', '2026-05-05 03:53:35.087813', '2026-05-05 03:53:35.087813');
INSERT INTO `permissions` VALUES (113, 'position.manage', 'position.manage', '2026-05-05 03:53:35.092260', '2026-05-05 03:53:35.092260');
INSERT INTO `permissions` VALUES (114, 'shift.manage', 'shift.manage', '2026-05-05 03:53:35.096878', '2026-05-05 03:53:35.096878');
INSERT INTO `permissions` VALUES (115, 'leave.read', 'leave.read', '2026-05-05 03:53:35.100821', '2026-05-05 03:53:35.100821');
INSERT INTO `permissions` VALUES (116, 'leave.manage', 'leave.manage', '2026-05-05 03:53:35.104683', '2026-05-05 03:53:35.104683');
INSERT INTO `permissions` VALUES (117, 'overtime.manage', 'overtime.manage', '2026-05-05 03:53:35.108602', '2026-05-05 03:53:35.108602');
INSERT INTO `permissions` VALUES (118, 'kpi.read', 'kpi.read', '2026-05-05 03:53:35.123506', '2026-05-05 03:53:35.123506');
INSERT INTO `permissions` VALUES (119, 'kpi.manage', 'kpi.manage', '2026-05-05 03:53:35.128094', '2026-05-05 03:53:35.128094');
INSERT INTO `permissions` VALUES (120, 'performance.manage', 'performance.manage', '2026-05-05 03:53:35.132139', '2026-05-05 03:53:35.132139');
INSERT INTO `permissions` VALUES (122, 'report.read', 'report.read', '2026-05-05 03:53:35.141189', '2026-05-05 03:53:35.141189');
INSERT INTO `permissions` VALUES (124, 'alert.read', 'alert.read', '2026-05-05 03:53:35.149276', '2026-05-05 03:53:35.149276');
INSERT INTO `permissions` VALUES (125, 'alert.manage', 'alert.manage', '2026-05-05 03:53:35.153099', '2026-05-05 03:53:35.153099');
INSERT INTO `permissions` VALUES (126, 'backup.manage', 'backup.manage', '2026-05-05 03:53:35.157714', '2026-05-05 03:53:35.157714');

-- ----------------------------
-- Table structure for pit_tax_brackets
-- ----------------------------
DROP TABLE IF EXISTS `pit_tax_brackets`;
CREATE TABLE `pit_tax_brackets`  (
  `BracketID` int NOT NULL AUTO_INCREMENT,
  `EffectiveDate` date NOT NULL,
  `MinIncome` decimal(15, 2) NOT NULL DEFAULT 0.00,
  `MaxIncome` decimal(15, 2) NULL DEFAULT NULL,
  `Rate` decimal(5, 2) NOT NULL,
  `Deduction` decimal(15, 2) NOT NULL DEFAULT 0.00,
  `IsActive` tinyint(1) NULL DEFAULT 1,
  `CreatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`BracketID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 8 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of pit_tax_brackets
-- ----------------------------
INSERT INTO `pit_tax_brackets` VALUES (1, '2024-01-01', 0.00, 5000000.00, 5.00, 0.00, 1, '2026-05-05 03:47:09');
INSERT INTO `pit_tax_brackets` VALUES (2, '2024-01-01', 5000000.00, 10000000.00, 10.00, 250000.00, 1, '2026-05-05 03:47:09');
INSERT INTO `pit_tax_brackets` VALUES (3, '2024-01-01', 10000000.00, 18000000.00, 15.00, 750000.00, 1, '2026-05-05 03:47:09');
INSERT INTO `pit_tax_brackets` VALUES (4, '2024-01-01', 18000000.00, 32000000.00, 20.00, 1650000.00, 1, '2026-05-05 03:47:09');
INSERT INTO `pit_tax_brackets` VALUES (5, '2024-01-01', 32000000.00, 52000000.00, 25.00, 3250000.00, 1, '2026-05-05 03:47:09');
INSERT INTO `pit_tax_brackets` VALUES (6, '2024-01-01', 52000000.00, 80000000.00, 30.00, 5850000.00, 1, '2026-05-05 03:47:09');
INSERT INTO `pit_tax_brackets` VALUES (7, '2024-01-01', 80000000.00, NULL, 35.00, 9850000.00, 1, '2026-05-05 03:47:09');

-- ----------------------------
-- Table structure for positions_payroll
-- ----------------------------
DROP TABLE IF EXISTS `positions_payroll`;
CREATE TABLE `positions_payroll`  (
  `PositionID` int NOT NULL,
  `PositionName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `SyncedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PositionID`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of positions_payroll
-- ----------------------------
INSERT INTO `positions_payroll` VALUES (1, 'Nhân viên', '2026-05-01 15:31:24');
INSERT INTO `positions_payroll` VALUES (2, 'Trưởng nhóm', '2026-05-01 15:31:24');
INSERT INTO `positions_payroll` VALUES (3, 'Phó phòng', '2026-05-01 15:31:24');
INSERT INTO `positions_payroll` VALUES (4, 'Trưởng phòng', '2026-05-01 15:31:24');
INSERT INTO `positions_payroll` VALUES (5, 'Giám đốc', '2026-05-01 15:31:24');
INSERT INTO `positions_payroll` VALUES (6, 'Thư ký', '2026-05-01 15:31:24');
INSERT INTO `positions_payroll` VALUES (7, 'Kỹ sư', '2026-05-01 15:31:24');
INSERT INTO `positions_payroll` VALUES (8, 'Nhân viên thử việc', '2026-05-01 15:31:24');
INSERT INTO `positions_payroll` VALUES (9, 'Thực tập sinh', '2026-05-01 15:31:24');
INSERT INTO `positions_payroll` VALUES (10, 'Cố vấn kỹ thuật', '2026-05-01 15:31:24');

-- ----------------------------
-- Table structure for role_permissions
-- ----------------------------
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions`  (
  `roleId` int NOT NULL,
  `permissionId` int NOT NULL,
  PRIMARY KEY (`roleId`, `permissionId`) USING BTREE,
  INDEX `FK_role_permissions_permission`(`permissionId` ASC) USING BTREE,
  CONSTRAINT `FK_role_permissions_permission` FOREIGN KEY (`permissionId`) REFERENCES `permissions` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `FK_role_permissions_role` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of role_permissions
-- ----------------------------
INSERT INTO `role_permissions` VALUES (1, 1);
INSERT INTO `role_permissions` VALUES (2, 1);
INSERT INTO `role_permissions` VALUES (3, 1);
INSERT INTO `role_permissions` VALUES (4, 1);
INSERT INTO `role_permissions` VALUES (1, 2);
INSERT INTO `role_permissions` VALUES (2, 2);
INSERT INTO `role_permissions` VALUES (1, 3);
INSERT INTO `role_permissions` VALUES (2, 3);
INSERT INTO `role_permissions` VALUES (1, 4);
INSERT INTO `role_permissions` VALUES (2, 4);
INSERT INTO `role_permissions` VALUES (1, 5);
INSERT INTO `role_permissions` VALUES (2, 5);
INSERT INTO `role_permissions` VALUES (3, 5);
INSERT INTO `role_permissions` VALUES (4, 5);
INSERT INTO `role_permissions` VALUES (1, 6);
INSERT INTO `role_permissions` VALUES (2, 6);
INSERT INTO `role_permissions` VALUES (1, 7);
INSERT INTO `role_permissions` VALUES (2, 7);
INSERT INTO `role_permissions` VALUES (1, 8);
INSERT INTO `role_permissions` VALUES (3, 8);
INSERT INTO `role_permissions` VALUES (4, 8);
INSERT INTO `role_permissions` VALUES (1, 9);
INSERT INTO `role_permissions` VALUES (3, 9);
INSERT INTO `role_permissions` VALUES (1, 10);
INSERT INTO `role_permissions` VALUES (3, 10);
INSERT INTO `role_permissions` VALUES (1, 11);
INSERT INTO `role_permissions` VALUES (2, 11);
INSERT INTO `role_permissions` VALUES (3, 11);
INSERT INTO `role_permissions` VALUES (1, 12);
INSERT INTO `role_permissions` VALUES (2, 12);
INSERT INTO `role_permissions` VALUES (3, 12);
INSERT INTO `role_permissions` VALUES (4, 12);
INSERT INTO `role_permissions` VALUES (1, 13);
INSERT INTO `role_permissions` VALUES (1, 14);
INSERT INTO `role_permissions` VALUES (1, 15);
INSERT INTO `role_permissions` VALUES (1, 16);
INSERT INTO `role_permissions` VALUES (1, 102);
INSERT INTO `role_permissions` VALUES (2, 102);
INSERT INTO `role_permissions` VALUES (1, 103);
INSERT INTO `role_permissions` VALUES (2, 103);
INSERT INTO `role_permissions` VALUES (1, 107);
INSERT INTO `role_permissions` VALUES (3, 107);
INSERT INTO `role_permissions` VALUES (1, 111);
INSERT INTO `role_permissions` VALUES (3, 111);
INSERT INTO `role_permissions` VALUES (1, 112);
INSERT INTO `role_permissions` VALUES (2, 112);
INSERT INTO `role_permissions` VALUES (1, 113);
INSERT INTO `role_permissions` VALUES (2, 113);
INSERT INTO `role_permissions` VALUES (1, 114);
INSERT INTO `role_permissions` VALUES (2, 114);
INSERT INTO `role_permissions` VALUES (3, 114);
INSERT INTO `role_permissions` VALUES (1, 115);
INSERT INTO `role_permissions` VALUES (2, 115);
INSERT INTO `role_permissions` VALUES (3, 115);
INSERT INTO `role_permissions` VALUES (4, 115);
INSERT INTO `role_permissions` VALUES (1, 116);
INSERT INTO `role_permissions` VALUES (2, 116);
INSERT INTO `role_permissions` VALUES (3, 116);
INSERT INTO `role_permissions` VALUES (4, 116);
INSERT INTO `role_permissions` VALUES (1, 117);
INSERT INTO `role_permissions` VALUES (2, 117);
INSERT INTO `role_permissions` VALUES (3, 117);
INSERT INTO `role_permissions` VALUES (4, 117);
INSERT INTO `role_permissions` VALUES (1, 118);
INSERT INTO `role_permissions` VALUES (2, 118);
INSERT INTO `role_permissions` VALUES (3, 118);
INSERT INTO `role_permissions` VALUES (4, 118);
INSERT INTO `role_permissions` VALUES (1, 119);
INSERT INTO `role_permissions` VALUES (2, 119);
INSERT INTO `role_permissions` VALUES (3, 119);
INSERT INTO `role_permissions` VALUES (4, 119);
INSERT INTO `role_permissions` VALUES (1, 120);
INSERT INTO `role_permissions` VALUES (2, 120);
INSERT INTO `role_permissions` VALUES (4, 120);
INSERT INTO `role_permissions` VALUES (1, 122);
INSERT INTO `role_permissions` VALUES (2, 122);
INSERT INTO `role_permissions` VALUES (3, 122);
INSERT INTO `role_permissions` VALUES (1, 124);
INSERT INTO `role_permissions` VALUES (2, 124);
INSERT INTO `role_permissions` VALUES (3, 124);
INSERT INTO `role_permissions` VALUES (1, 125);
INSERT INTO `role_permissions` VALUES (2, 125);
INSERT INTO `role_permissions` VALUES (1, 126);

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `UQ_roles_name`(`name` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 85 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO `roles` VALUES (1, 'ADMIN', 'System administrator', '2026-05-04 23:57:22.534691', '2026-05-05 03:53:54.260830');
INSERT INTO `roles` VALUES (2, 'HR_MANAGER', 'HR manager', '2026-05-04 23:57:22.595664', '2026-05-05 03:53:54.292159');
INSERT INTO `roles` VALUES (3, 'PAYROLL_MANAGER', 'Payroll manager', '2026-05-04 23:57:22.622009', '2026-05-05 03:53:54.323914');
INSERT INTO `roles` VALUES (4, 'EMPLOYEE', 'Employee', '2026-05-04 23:57:22.626840', '2026-05-05 03:53:54.328598');

-- ----------------------------
-- Table structure for salaries
-- ----------------------------
DROP TABLE IF EXISTS `salaries`;
CREATE TABLE `salaries`  (
  `SalaryID` int NOT NULL AUTO_INCREMENT,
  `EmployeeID` int NULL DEFAULT NULL,
  `SalaryMonth` date NOT NULL,
  `BaseSalary` decimal(12, 2) NOT NULL,
  `Bonus` decimal(12, 2) NULL DEFAULT 0.00,
  `Deductions` decimal(12, 2) NULL DEFAULT 0.00,
  `NetSalary` decimal(12, 2) NOT NULL,
  `CreatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`SalaryID`) USING BTREE,
  UNIQUE INDEX `ux_salaries_employee_month`(`EmployeeID` ASC, `SalaryMonth` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 114 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

-- ----------------------------
-- Records of salaries
-- ----------------------------
INSERT INTO `salaries` VALUES (15, 5, '2024-09-01', 9000000.00, 0.00, 300000.00, 8700000.00, '2025-10-20 19:15:00');
INSERT INTO `salaries` VALUES (69, 2, '2026-09-01', 10000000.00, 800000.00, 100000.00, 10700000.00, '2026-05-01 15:10:50');
INSERT INTO `salaries` VALUES (102, 1, '2024-09-01', 12000000.00, 500000.00, 200000.00, 12300000.00, '2026-05-01 19:14:24');
INSERT INTO `salaries` VALUES (103, 2, '2024-09-01', 10000000.00, 800000.00, 100000.00, 10700000.00, '2026-05-01 19:14:24');
INSERT INTO `salaries` VALUES (104, 3, '2024-09-01', 15000000.00, 600000.00, 0.00, 15600000.00, '2026-05-01 19:14:24');
INSERT INTO `salaries` VALUES (105, 4, '2024-09-01', 11000000.00, 400000.00, 100000.00, 11300000.00, '2026-05-01 19:14:24');
INSERT INTO `salaries` VALUES (106, 6, '2024-09-01', 9500000.00, 500000.00, 0.00, 10000000.00, '2026-05-01 19:14:24');
INSERT INTO `salaries` VALUES (107, 7, '2024-09-01', 18000000.00, 1000000.00, 0.00, 19000000.00, '2026-05-01 19:14:24');
INSERT INTO `salaries` VALUES (108, 8, '2024-09-01', 7000000.00, 200000.00, 0.00, 7200000.00, '2026-05-01 19:14:24');
INSERT INTO `salaries` VALUES (109, 9, '2024-09-01', 5000000.00, 0.00, 0.00, 5000000.00, '2026-05-01 19:14:25');
INSERT INTO `salaries` VALUES (110, 10, '2024-09-01', 8500000.00, 300000.00, 100000.00, 8700000.00, '2026-05-01 19:14:25');
INSERT INTO `salaries` VALUES (111, 11, '2024-09-01', 10000000.00, 50000.00, 0.00, 10050000.00, '2026-05-01 19:35:36');
INSERT INTO `salaries` VALUES (112, 1, '2026-05-01', 12000000.00, 500000.00, 200000.00, 12134616.00, '2026-05-01 23:14:34');
INSERT INTO `salaries` VALUES (113, 18, '2024-09-01', 10000000.00, 100000.00, 1060000.00, 9040000.00, '2026-05-05 07:20:41');

-- ----------------------------
-- Table structure for salary_policies
-- ----------------------------
DROP TABLE IF EXISTS `salary_policies`;
CREATE TABLE `salary_policies`  (
  `PolicyID` int NOT NULL AUTO_INCREMENT,
  `PolicyName` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PolicyCode` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `BaseSalaryMin` decimal(15, 2) NULL DEFAULT 0.00,
  `BaseSalaryMax` decimal(15, 2) NULL DEFAULT NULL,
  `OvertimeRate` decimal(5, 2) NULL DEFAULT 1.50 COMMENT 'multiplier e.g. 1.5x',
  `HolidayRate` decimal(5, 2) NULL DEFAULT 2.00,
  `TaxRate` decimal(5, 2) NULL DEFAULT 10.00 COMMENT 'percent',
  `SocialIns` decimal(5, 2) NULL DEFAULT 8.00 COMMENT 'percent employee',
  `HealthIns` decimal(5, 2) NULL DEFAULT 1.50 COMMENT 'percent employee',
  `UnemployIns` decimal(5, 2) NULL DEFAULT 1.00 COMMENT 'percent employee',
  `EffectiveDate` date NULL DEFAULT NULL,
  `ExpiryDate` date NULL DEFAULT NULL,
  `IsActive` tinyint(1) NULL DEFAULT 1,
  `Description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `CreatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`PolicyID`) USING BTREE,
  UNIQUE INDEX `PolicyCode`(`PolicyCode` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of salary_policies
-- ----------------------------
INSERT INTO `salary_policies` VALUES (1, 'Chính sách lương văn phòng 2026', 'OFFICE-2026', 8000000.00, 30000000.00, 1.50, 2.00, 10.00, 8.00, 1.50, 1.00, '2026-01-01', NULL, 1, 'Áp dụng cho nhân viên khối văn phòng', '2026-05-01 21:43:26', '2026-05-01 21:43:26');
INSERT INTO `salary_policies` VALUES (2, 'Chính sách vận hành ca', 'SHIFT-2026', 7000000.00, 25000000.00, 1.70, 2.20, 10.00, 8.00, 1.50, 1.00, '2026-01-01', NULL, 1, 'Áp dụng cho nhân viên làm ca', '2026-05-01 21:43:26', '2026-05-01 21:43:26');

-- ----------------------------
-- Table structure for shift_assignments
-- ----------------------------
DROP TABLE IF EXISTS `shift_assignments`;
CREATE TABLE `shift_assignments`  (
  `AssignmentID` int NOT NULL AUTO_INCREMENT,
  `EmployeeID` int NOT NULL,
  `ShiftID` int NOT NULL,
  `EffectiveDate` date NOT NULL,
  `EndDate` date NULL DEFAULT NULL,
  `CreatedBy` int NULL DEFAULT NULL,
  `CreatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`AssignmentID`) USING BTREE,
  INDEX `idx_sa_employee`(`EmployeeID` ASC) USING BTREE,
  INDEX `idx_sa_shift`(`ShiftID` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 5 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of shift_assignments
-- ----------------------------
INSERT INTO `shift_assignments` VALUES (1, 1, 1, '2026-05-01', NULL, 1, '2026-05-01 21:43:26', '2026-05-01 21:43:26');
INSERT INTO `shift_assignments` VALUES (2, 2, 1, '2026-05-01', NULL, 1, '2026-05-01 21:43:26', '2026-05-01 21:43:26');
INSERT INTO `shift_assignments` VALUES (3, 3, 2, '2026-05-01', NULL, 1, '2026-05-01 21:43:26', '2026-05-01 21:43:26');
INSERT INTO `shift_assignments` VALUES (4, 4, 3, '2026-05-01', NULL, 1, '2026-05-01 21:43:26', '2026-05-01 21:43:26');

-- ----------------------------
-- Table structure for sync_status
-- ----------------------------
DROP TABLE IF EXISTS `sync_status`;
CREATE TABLE `sync_status`  (
  `StatusID` int NOT NULL AUTO_INCREMENT,
  `SyncType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `StartedAt` datetime NULL DEFAULT NULL,
  `CompletedAt` datetime NULL DEFAULT NULL,
  `Details` json NULL,
  `CreatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`StatusID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of sync_status
-- ----------------------------

-- ----------------------------
-- Table structure for system_backups
-- ----------------------------
DROP TABLE IF EXISTS `system_backups`;
CREATE TABLE `system_backups`  (
  `BackupID` int NOT NULL AUTO_INCREMENT,
  `BackupType` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'Manual' COMMENT 'Manual,Scheduled,Auto',
  `BackupName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `FilePath` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `FileSize` bigint NULL DEFAULT NULL COMMENT 'bytes',
  `Status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'Running' COMMENT 'Running,Completed,Failed',
  `StartedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `CompletedAt` datetime NULL DEFAULT NULL,
  `Duration` int NULL DEFAULT NULL COMMENT 'seconds',
  `CreatedBy` int NULL DEFAULT NULL,
  `Notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `RestoredAt` datetime NULL DEFAULT NULL,
  `RestoredBy` int NULL DEFAULT NULL,
  PRIMARY KEY (`BackupID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of system_backups
-- ----------------------------
INSERT INTO `system_backups` VALUES (1, 'Manual', 'backup-payroll-2026-05-01', 'D:/backups/payroll_2026_20260501.sql', 5242880, 'Completed', '2026-05-01 21:43:26', '2026-05-01 21:43:26', 18, 1, 'Bản sao lưu demo cho đồ án', NULL, NULL);

-- ----------------------------
-- Table structure for user_roles
-- ----------------------------
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles`  (
  `userId` int NOT NULL,
  `roleId` int NOT NULL,
  PRIMARY KEY (`userId`, `roleId`) USING BTREE,
  INDEX `FK_user_roles_role`(`roleId` ASC) USING BTREE,
  CONSTRAINT `FK_user_roles_role` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `FK_user_roles_user` FOREIGN KEY (`userId`) REFERENCES `users` (`UserID`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user_roles
-- ----------------------------
INSERT INTO `user_roles` VALUES (1, 1);
INSERT INTO `user_roles` VALUES (3, 2);
INSERT INTO `user_roles` VALUES (4, 3);
INSERT INTO `user_roles` VALUES (5, 4);

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `UserID` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Email` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `PasswordHash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `FullName` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `Role` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'Employee' COMMENT 'Admin,HR_Manager,Payroll_Manager,Employee',
  `EmployeeID` int NULL DEFAULT NULL COMMENT 'linked employee record',
  `IsActive` tinyint(1) NULL DEFAULT 1,
  `LastLoginAt` datetime NULL DEFAULT NULL,
  `CreatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `ResetPasswordToken` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `ResetPasswordExpiry` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`UserID`) USING BTREE,
  UNIQUE INDEX `Username`(`Username` ASC) USING BTREE,
  UNIQUE INDEX `Email`(`Email` ASC) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO `users` VALUES (1, 'admin', 'admin@docusync.local', 'scrypt$07b7c4dbefe0c5669bbe6f8d453a455f$923db9e4b5fad74f3d232e311e0a66617284eeeb873dbd85920fa81d89145044345b7f0126bccb945a9f4f620781ef3128355f11668a9ea65dc8c7e68d4258e7', 'Quản trị viên', 'Admin', NULL, 1, '2026-05-05 16:03:35', '2026-05-01 21:08:06', '2026-05-05 16:03:34', NULL, NULL);
INSERT INTO `users` VALUES (3, 'hr@company.local', 'hr@company.local', 'scrypt$7e80c647eb6cf116940833e2743b7e2a$a864ff7bb7c6efc9c9a8dd1e4557b91d8c274edf0377787612f06d46d7f4020ae789de8f6c06c78b7ae25faa7a8e623301337c0f97b4d71b52f836badb749480', 'Quản lý nhân sự', 'HR_Manager', NULL, 1, '2026-05-05 16:02:23', '2026-05-05 00:20:45', '2026-05-05 16:02:23', NULL, NULL);
INSERT INTO `users` VALUES (4, 'payroll@company.local', 'payroll@company.local', 'scrypt$094a27e6f43429abc0fc53a82b4cef6e$136aec78c3d2984b1b0e378a5fb41239c6594889845056f3aed26c76ad61825579df98546bd740765970c3dff9779a43555ea814f200c26d706220e407ff7641', 'Quản lý lương', 'Payroll_Manager', NULL, 1, '2026-05-05 15:54:36', '2026-05-05 00:20:45', '2026-05-05 15:54:36', NULL, NULL);
INSERT INTO `users` VALUES (5, 'employee@company.local', 'employee@company.local', 'scrypt$49d6113c2a1c470b075cb43518c5630c$8c4cd56d794f2ff075b72400af2cc4acb214b6f97e801f11e2c613816cd83a2bf249a77fe4e824dec6043c4d82dc4168cd4a67774bfd245d4880adcf3c2eae42', 'Nhân viên Demo', 'Employee', NULL, 1, '2026-05-05 16:04:07', '2026-05-05 00:20:45', '2026-05-05 16:04:07', NULL, NULL);

-- ----------------------------
-- Table structure for work_shifts
-- ----------------------------
DROP TABLE IF EXISTS `work_shifts`;
CREATE TABLE `work_shifts`  (
  `ShiftID` int NOT NULL AUTO_INCREMENT,
  `ShiftName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `StartTime` time NOT NULL,
  `EndTime` time NOT NULL,
  `BreakMinutes` int NULL DEFAULT 60,
  `IsNightShift` tinyint(1) NULL DEFAULT 0,
  `Description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `IsActive` tinyint(1) NULL DEFAULT 1,
  `CreatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ShiftID`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 4 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of work_shifts
-- ----------------------------
INSERT INTO `work_shifts` VALUES (1, 'Ca hành chính', '08:00:00', '17:00:00', 60, 0, 'Ca làm việc văn phòng tiêu chuẩn', 1, '2026-05-01 21:43:25', '2026-05-01 21:43:25');
INSERT INTO `work_shifts` VALUES (2, 'Ca sáng', '06:00:00', '14:00:00', 45, 0, 'Ca vận hành buổi sáng', 1, '2026-05-01 21:43:25', '2026-05-01 21:43:25');
INSERT INTO `work_shifts` VALUES (3, 'Ca tối', '14:00:00', '22:00:00', 45, 1, 'Ca vận hành buổi tối', 1, '2026-05-01 21:43:25', '2026-05-01 21:43:25');

SET FOREIGN_KEY_CHECKS = 1;
