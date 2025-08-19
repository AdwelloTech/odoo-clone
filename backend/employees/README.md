# Employee Management API

This Django app provides a REST API for managing employee profiles in the Odoo clone system, following the exact same patterns and conventions as the authentication profile.

## Features

- **OneToOneField Relationship**: Each employee maps to one user (following authentication profile pattern)
- **Full CRUD Operations**: Create, Read, Update, and Delete employee profiles
- **User Creation**: Automatically creates user accounts when creating employees
- **Consistent Structure**: Follows the same patterns as the authentication profile
- **Department Management**: Separate Department model for organizational structure
- **Job Role Management**: Separate JobRole model with department relationships
- **Manager Relationships**: Self-referential ForeignKey for manager-subordinate relationships
- **No Hardcoded Values**: All data stored in database tables
- **Soft Delete**: Deactivate employees instead of permanent deletion
- **Profile Images**: Support for profile picture uploads
- **Admin Interface**: Full Django admin integration

## Architecture

The Employee model follows the exact same pattern as the authentication profile:

- **Department Model**: Manages organizational departments
- **JobRole Model**: Manages job roles with department relationships
- **Employee Model**: Contains employee-specific fields and has a OneToOneField with User
- **User Model**: Handles authentication, email, phone_number, and basic user data
- **Manager Relationship**: Self-referential ForeignKey for organizational hierarchy
- **Relationship**: Each employee has exactly one user account, one job role, and one department (via role)

## API Endpoints

### Base URL: `/api/employees/`

#### Department Endpoints

| Method | Endpoint                 | Description            |
| ------ | ------------------------ | ---------------------- |
| `GET`  | `/api/departments/`      | List all departments   |
| `GET`  | `/api/departments/{id}/` | Get department details |

#### Job Role Endpoints

| Method | Endpoint               | Description          |
| ------ | ---------------------- | -------------------- |
| `GET`  | `/api/job-roles/`      | List all job roles   |
| `GET`  | `/api/job-roles/{id}/` | Get job role details |

#### Employee Endpoints

| Method      | Endpoint                      | Description                       |
| ----------- | ----------------------------- | --------------------------------- |
| `GET`       | `/api/employees/`             | List all employees                |
| `POST`      | `/api/employees/create/`      | Create a new employee + user      |
| `GET`       | `/api/employees/{id}/`        | Get employee details by ID        |
| `PUT/PATCH` | `/api/employees/{id}/`        | Update employee                   |
| `DELETE`    | `/api/employees/{id}/delete/` | Deactivate employee (soft delete) |

#### Additional Endpoints

| Method | Endpoint                          | Description                       |
| ------ | --------------------------------- | --------------------------------- |
| `GET`  | `/api/employees/active/`          | Get only active employees         |
| `GET`  | `/api/employees/inactive/`        | Get only inactive employees       |
| `POST` | `/api/employees/{id}/reactivate/` | Reactivate a deactivated employee |

## Models

### Department Model

| Field         | Type          | Description            | Required |
| ------------- | ------------- | ---------------------- | -------- |
| `id`          | AutoField     | Primary key            | Auto     |
| `name`        | CharField     | Department name        | Yes      |
| `description` | TextField     | Department description | No       |
| `created_at`  | DateTimeField | Creation timestamp     | Auto     |
| `updated_at`  | DateTimeField | Last update timestamp  | Auto     |

### JobRole Model

| Field         | Type          | Description           | Required |
| ------------- | ------------- | --------------------- | -------- |
| `id`          | AutoField     | Primary key           | Auto     |
| `name`        | CharField     | Role name (unique)    | Yes      |
| `description` | TextField     | Role description      | No       |
| `department`  | ForeignKey    | Department            | Yes      |
| `created_at`  | DateTimeField | Creation timestamp    | Auto     |
| `updated_at`  | DateTimeField | Last update timestamp | Auto     |

### Employee Model

| Field           | Type          | Description                 | Required             |
| --------------- | ------------- | --------------------------- | -------------------- |
| `user`          | OneToOneField | User account (auto-created) | Yes                  |
| `first_name`    | CharField     | Employee's first name       | Yes                  |
| `last_name`     | CharField     | Employee's last name        | Yes                  |
| `address`       | TextField     | Home address                | No                   |
| `manager`       | ForeignKey    | Manager (self-referential)  | No                   |
| `date_joined`   | DateField     | Hire date (auto-set)        | Auto                 |
| `profile_image` | ImageField    | Profile picture             | No                   |
| `role`          | ForeignKey    | Job role                    | Yes                  |
| `is_active`     | BooleanField  | Active status               | Auto (default: True) |

### User Model Fields (Auto-created)

| Field          | Type       | Description          | Source              |
| -------------- | ---------- | -------------------- | ------------------- |
| `email`        | EmailField | Unique email address | From create request |
| `username`     | CharField  | Unique username      | From create request |
| `password`     | CharField  | Encrypted password   | From create request |
| `first_name`   | CharField  | First name           | From create request |
| `last_name`    | CharField  | Last name            | From create request |
| `phone_number` | CharField  | Phone number         | From create request |

## Data Relationships

- **Department** → **JobRole** (One-to-Many): Each department can have multiple job roles
- **JobRole** → **Employee** (One-to-Many): Each job role can have multiple employees
- **Employee** → **Employee** (One-to-Many): Manager-subordinate relationships
- **Employee** → **User** (One-to-One): Each employee has one user account

## Example Usage

### Get All Departments

```bash
GET /api/departments/
```

### Get Department Details

```bash
GET /api/departments/1/
```

### Get All Job Roles

```bash
GET /api/job-roles/
```

### Get Job Role Details

```bash
GET /api/job-roles/1/
```

### Create Employee (Creates User + Employee Profile)

```bash
POST /api/employees/create/
{
    "email": "john.doe@company.com",
    "username": "johndoe",
    "password": "securepassword123",
    "confirm_password": "securepassword123",
    "first_name": "John",
    "last_name": "Doe",
    "role": 1,
    "manager": 2,
    "address": "123 Main St, New York, NY"
}
```

### Get All Employees

```bash
GET /api/employees/
```

### Get Employee Details

```bash
GET /api/employees/1/
```

### Update Employee

```bash
PATCH /api/employees/1/
{
    "role": 2,
    "manager": 3
}
```

### Deactivate Employee

```bash
DELETE /api/employees/1/delete/
```

## Authentication

- **Employee Creation**: No authentication required (like user registration)
- **All Other Operations**: Require authentication with JWT token

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

The API follows the exact same response format as the authentication profile:

### Success Response

```json
{
    "message": "Employee created successfully",
    "employee": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john.doe@company.com",
        "phone_number": "+1234567890",
        "role": {
            "id": 1,
            "name": "Backend Developer",
            "description": "Software development role",
            "department": {
                "id": 1,
                "name": "Engineering",
                "description": "Software engineering department"
            }
        },
        "department": {
            "id": 1,
            "name": "Engineering",
            "description": "Software engineering department"
        },
        "manager": {
            "id": 2,
            "name": "Jane Smith",
            "email": "jane.smith@company.com"
        },
        ...
    }
}
```

### Error Response

```json
{
  "message": "Employee creation failed",
  "errors": {
    "email": ["A user with this email already exists."],
    "password": ["Passwords don't match"]
  }
}
```

## Error Handling

The API returns appropriate HTTP status codes and detailed error messages:

- `400 Bad Request`: Validation errors or invalid data
- `401 Unauthorized`: Missing or invalid authentication
- `404 Not Found`: Employee, job role, or department not found

## File Uploads

Profile images are uploaded to the `profile_images/` directory and served via the `/media/` URL path during development.

## Admin Interface

Access the Django admin at `/admin/` to manage departments, job roles, and employees through the web interface. The admin provides:

- Department management with name and description
- Job role management with department dropdown selection
- Employee management with user information display
- Manager relationship visualization
- Department information display
- List view with filtering and search
- Read-only fields for system information

## Dependencies

- Django 5.2+
- Django REST Framework 3.16+
- Pillow 10.4.0+ (for image processing)

## Architecture Patterns

This app follows the exact same patterns as the authentication profile:

- **Models**: OneToOneField relationship with User model, ForeignKey relationships for departments, roles, and managers
- **No Hardcoded Values**: All data stored in database tables (like authentication profile)
- **Serializers**: Separate serializers for different operations with user creation
- **Views**: Using DRF generics and function-based views
- **URLs**: Explicit path definitions with descriptive names
- **Admin**: Simple admin configuration with relationship display
- **Validation**: Consistent error handling and response format
- **User Creation**: Automatic user account creation when creating employees
