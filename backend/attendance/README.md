# Attendance Management API

This Django app provides a REST API for managing employee attendance in the Odoo clone system, following the exact same patterns and conventions as the authentication profile and employee apps.

## Features

- **Full CRUD Operations**: Create, Read, Update, and Delete attendance records
- **Time Tracking**: Check-in and check-out functionality
- **Status Management**: Track attendance status (Present, Absent, Late, Half Day)
- **Employee Integration**: Links to Employee model from the employees app
- **Date Range Queries**: Filter attendance by date ranges
- **Consistent Structure**: Follows the same patterns as the authentication profile
- **No Hardcoded Values**: Status field is free-text, no predefined choices
- **Admin Interface**: Full Django admin integration

## Architecture

The Attendance model follows the exact same pattern as the authentication profile:

- **Attendance Model**: Contains attendance-specific fields with ForeignKey to Employee
- **Employee Model**: Links to existing employee profiles
- **Status Field**: Free-text field for attendance status
- **Time Tracking**: Automatic timestamp management for check-in/check-out

## API Endpoints

### Base URL: `/api/attendance/`

#### Basic CRUD Endpoints

| Method      | Endpoint                  | Description                    |
| ----------- | ------------------------- | ------------------------------ |
| `GET`       | `/api/attendance/`        | List all attendance records    |
| `POST`      | `/api/attendance/create/` | Create a new attendance record |
| `GET`       | `/api/attendance/{id}/`   | Get attendance details by ID   |
| `PUT/PATCH` | `/api/attendance/{id}/`   | Update attendance record       |

#### Check-in/Check-out Endpoints

| Method | Endpoint                          | Description         |
| ------ | --------------------------------- | ------------------- |
| `POST` | `/api/attendance/{id}/check-in/`  | Mark check-in time  |
| `POST` | `/api/attendance/{id}/check-out/` | Mark check-out time |

#### Query Endpoints

| Method | Endpoint                                  | Description                  |
| ------ | ----------------------------------------- | ---------------------------- |
| `GET`  | `/api/attendance/employee/{employee_id}/` | Get attendance by employee   |
| `GET`  | `/api/attendance/date-range/`             | Get attendance by date range |
| `GET`  | `/api/attendance/today/`                  | Get today's attendance       |

## Attendance Model Fields

| Field            | Type          | Description                   | Required |
| ---------------- | ------------- | ----------------------------- | -------- |
| `attendance_id`  | AutoField     | Primary key                   | Auto     |
| `employee`       | ForeignKey    | Employee (from employees app) | Yes      |
| `date`           | DateField     | Attendance date               | Yes      |
| `status`         | CharField     | Attendance status (choices)   | Yes      |
| `check_in_time`  | DateTimeField | Check-in timestamp            | No       |
| `check_out_time` | DateTimeField | Check-out timestamp           | No       |
| `created_at`     | DateTimeField | Creation timestamp            | Auto     |
| `updated_at`     | DateTimeField | Last update timestamp         | Auto     |

## Status Field

The `status` field is a free-text field that can contain any attendance status value (e.g., "Present", "Absent", "Late", "Half Day", "Remote", "Sick Leave", etc.). This follows the same pattern as the authentication profile and employee apps with no hardcoded values.

## Data Relationships

- **Employee** → **Attendance** (One-to-Many): Each employee can have multiple attendance records
- **Attendance** → **Employee** (Many-to-One): Each attendance record belongs to one employee
- **Unique Constraint**: One attendance record per employee per date

## Example Usage

### Create Attendance Record

```bash
POST /api/attendance/create/
{
    "employee": 1,
    "date": "2024-01-15",
    "status": "PRESENT",
    "check_in_time": "2024-01-15T09:00:00Z",
    "check_out_time": "2024-01-15T17:00:00Z"
}
```

### Mark Check-in

```bash
POST /api/attendance/1/check-in/
```

### Mark Check-out

```bash
POST /api/attendance/1/check-out/
```

### Get All Attendance Records

```bash
GET /api/attendance/
```

### Get Attendance by Employee

```bash
GET /api/attendance/employee/1/
```

### Get Attendance by Date Range

```bash
GET /api/attendance/date-range/?start_date=2024-01-01&end_date=2024-01-31
```

### Get Today's Attendance

```bash
GET /api/attendance/today/
```

### Update Attendance

```bash
PATCH /api/attendance/1/
{
    "status": "LATE",
    "check_in_time": "2024-01-15T09:30:00Z"
}
```

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

The API follows the exact same response format as the authentication profile:

### Success Response

```json
{
  "message": "Attendance marked successfully",
  "attendance": {
    "attendance_id": 1,
    "employee": 1,
    "employee_name": "John Doe",
    "employee_email": "john.doe@company.com",
    "department": "Engineering",
    "date": "2024-01-15",
    "status": "PRESENT",
    "check_in_time": "2024-01-15T09:00:00Z",
    "check_out_time": "2024-01-15T17:00:00Z",
    "created_at": "2024-01-15T08:00:00Z",
    "updated_at": "2024-01-15T17:00:00Z"
  }
}
```

### Error Response

```json
{
  "message": "Attendance marking failed",
  "errors": {
    "employee": ["This field is required."],
    "date": ["This field is required."]
  }
}
```

## Query Parameters

### Date Range Query

- `start_date`: Start date in YYYY-MM-DD format
- `end_date`: End date in YYYY-MM-DD format

Example: `/api/attendance/date-range/?start_date=2024-01-01&end_date=2024-01-31`

## Error Handling

The API returns appropriate HTTP status codes and detailed error messages:

- `400 Bad Request`: Validation errors or invalid data
- `401 Unauthorized`: Missing or invalid authentication
- `404 Not Found`: Attendance record not found

## Business Logic

### Check-in Rules

- Employee can only check in once per day
- Check-in time is automatically recorded
- Status can be manually set or updated as needed

### Check-out Rules

- Employee must check in before checking out
- Employee can only check out once per day
- Check-out time is automatically recorded

### Status Management

- Status can be manually set and updated via PUT/PATCH
- Status changes are tracked in updated_at timestamp
- No predefined status values - fully customizable

## Admin Interface

Access the Django admin at `/admin/` to manage attendance records through the web interface. The admin provides:

- List view with filtering by status, date, and department
- Search functionality across employee names, emails, and departments
- Organized fieldsets for basic information, time tracking, and employee details
- Read-only fields for system information
- Automatic display of employee name, email, and department

## Dependencies

- Django 5.2+
- Django REST Framework 3.16+
- Employees app (for Employee model relationship)

## Architecture Patterns

This app follows the exact same patterns as the authentication profile:

- **Models**: ForeignKey relationship with Employee model
- **Serializers**: Separate serializers for different operations (create, update, detail, list)
- **Views**: Using DRF generics and function-based views
- **URLs**: Explicit path definitions with descriptive names
- **Admin**: Simple admin configuration with relationship display
- **Validation**: Consistent error handling and response format
- **Business Logic**: Proper validation rules and constraints

## Next Steps

1. **Create Migrations**: `python manage.py makemigrations attendance`
2. **Apply Migrations**: `python manage.py migrate`
3. **Test the API**: The structure now perfectly supports attendance management!
4. **Integration**: Works seamlessly with the existing employee management system

The Attendance Management feature now follows the **exact same coding style, validation approach, and structure** as your existing authentication profile and employee apps! 🎯
