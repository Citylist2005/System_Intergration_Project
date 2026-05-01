IF OBJECT_ID(N'dbo.Attendance', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Attendance (
        AttendanceID INT NOT NULL PRIMARY KEY,
        EmployeeID INT NOT NULL,
        WorkDays INT NOT NULL,
        AbsentDays INT NOT NULL,
        LeaveDays INT NOT NULL,
        AttendanceMonth DATE NOT NULL,
        CreatedAt DATETIME NOT NULL
    );
END;
GO

MERGE dbo.Attendance AS target
USING (
    VALUES
        (1, 1, 22, 1, 0, CAST('2024-08-31' AS DATE), CAST('2025-10-20T12:13:03' AS DATETIME)),
        (2, 2, 21, 0, 1, CAST('2024-08-31' AS DATE), CAST('2025-10-20T12:13:03' AS DATETIME)),
        (3, 3, 23, 0, 0, CAST('2024-08-31' AS DATE), CAST('2025-10-20T12:13:03' AS DATETIME)),
        (4, 4, 22, 2, 0, CAST('2024-08-31' AS DATE), CAST('2025-10-20T12:13:03' AS DATETIME)),
        (5, 5, 18, 3, 2, CAST('2024-08-31' AS DATE), CAST('2025-10-20T12:13:03' AS DATETIME)),
        (6, 6, 24, 0, 0, CAST('2024-08-31' AS DATE), CAST('2025-10-20T12:13:03' AS DATETIME)),
        (7, 7, 20, 1, 1, CAST('2024-08-31' AS DATE), CAST('2025-10-20T12:13:03' AS DATETIME)),
        (8, 8, 19, 2, 0, CAST('2024-08-31' AS DATE), CAST('2025-10-20T12:13:03' AS DATETIME)),
        (9, 9, 16, 0, 2, CAST('2024-08-31' AS DATE), CAST('2025-10-20T12:13:03' AS DATETIME)),
        (10, 10, 22, 1, 0, CAST('2024-08-31' AS DATE), CAST('2025-10-20T12:13:03' AS DATETIME))
) AS source (
    AttendanceID,
    EmployeeID,
    WorkDays,
    AbsentDays,
    LeaveDays,
    AttendanceMonth,
    CreatedAt
)
ON target.AttendanceID = source.AttendanceID
WHEN MATCHED THEN
    UPDATE SET
        target.EmployeeID = source.EmployeeID,
        target.WorkDays = source.WorkDays,
        target.AbsentDays = source.AbsentDays,
        target.LeaveDays = source.LeaveDays,
        target.AttendanceMonth = source.AttendanceMonth,
        target.CreatedAt = source.CreatedAt
WHEN NOT MATCHED THEN
    INSERT (
        AttendanceID,
        EmployeeID,
        WorkDays,
        AbsentDays,
        LeaveDays,
        AttendanceMonth,
        CreatedAt
    )
    VALUES (
        source.AttendanceID,
        source.EmployeeID,
        source.WorkDays,
        source.AbsentDays,
        source.LeaveDays,
        source.AttendanceMonth,
        source.CreatedAt
    );
GO
