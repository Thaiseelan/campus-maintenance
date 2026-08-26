# BIT Campus Maintenance Request Desk

A full-stack campus maintenance management system that allows students and staff to report infrastructure issues, enables administrators to manage and assign complaints to technicians, and allows technicians to track and resolve assigned issues.

The system is designed specifically for managing maintenance requests within a college campus, covering issues such as electrical faults, plumbing, networking, furniture, civil infrastructure, and cleaning.


### 👨‍🎓 Student / Staff

* Register and log in securely.
* Submit maintenance complaints.
* Upload complaint images.
* Provide issue details and location.
* Track complaint status.
* View complaint history.
* Receive updates regarding complaint assignment and resolution.

### 👨‍💼 Administrator

* Secure administrator authentication.
* View all maintenance complaints.
* Monitor complaint statistics and system activity.
* View registered technicians.
* Assign/manage technicians based on specialization and availability.
* Monitor complaint progress.
* Manage the overall maintenance workflow.

### 🔧 Technician

* View assigned complaints.
* View complaint details and uploaded images.
* Update complaint progress.
* Upload completion/resolution images.
* Mark maintenance requests as resolved.

### 📍 Campus Location Management

* Maintenance requests can be associated with predefined campus locations.
* Locations are managed by the backend.
* Designed to restrict issue reporting to the college campus.

### 🔐 Authentication & Authorization

* JWT-based authentication.
* Role-based authorization.
* Protected REST APIs.
* BCrypt password hashing.
* Separate access levels for:

  * `STUDENT`
  * `STAFF`
  * `TECHNICIAN`
  * `ADMIN`

### 📧 Notifications

The system is designed to support email notifications for important complaint events such as:

* Complaint assignment
* Complaint resolution
* Status updates

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      React UI        │
                    │  React + TypeScript  │
                    │      + Tailwind      │
                    └──────────┬───────────┘
                               │
                         REST API / JWT
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Spring Boot API   │
                    │                      │
                    │ Controllers          │
                    │ Services             │
                    │ Repositories         │
                    │ Security / JWT       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      PostgreSQL      │
                    │                      │
                    │ Users                │
                    │ Complaints           │
                    │ Technicians          │
                    │ Locations            │
                    │ Complaint History    │
                    └──────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios

### Backend

* Java 17
* Spring Boot
* Spring Security
* Spring Data JPA
* Hibernate
* JWT
* BCrypt
* Maven

### Database

* PostgreSQL

### Development / Testing

* Git & GitHub
* Postman
* IntelliJ IDEA / VS Code
* PostgreSQL

---


## 🔑 Authentication Flow

The application uses JWT for stateless authentication.

```text
User
 │
 │ Login
 ▼
Spring Boot Authentication API
 │
 │ Validate credentials
 ▼
PostgreSQL
 │
 │ Valid user
 ▼
JWT Token
 │
 ▼
React Frontend
 │
 │ Authorization: Bearer <token>
 ▼
Protected REST APIs
```

Passwords are never stored as plain text. BCrypt is used for password hashing.


## 🗄️ Database

The application uses **PostgreSQL** with Spring Data JPA and Hibernate.

The database contains entities for core system functionality, including:

* Users
* Complaints
* Technicians
* Locations
* Complaint history
* Uploaded complaint/resolution information

During development, Hibernate is configured with:

```properties
spring.jpa.hibernate.ddl-auto=update
```

For production, a proper database migration solution such as **Flyway** should be used.

---

## ⚙️ Backend Setup

### Prerequisites

Make sure the following are installed:

* Java 17+
* Maven
* PostgreSQL
* Node.js and npm
* Git

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd campus-maintenance-backend
```

### 2. Create the PostgreSQL database

Create a database named:

```text
campus_maintenance
```

Example:

```sql
CREATE DATABASE campus_maintenance;
```

### 3. Configure the application

Update `application.properties` or, preferably, provide these values through environment variables.

```properties
server.port=8080

spring.datasource.url=jdbc:postgresql://localhost:5432/campus_maintenance
spring.datasource.username=postgres
spring.datasource.password=YOUR_POSTGRES_PASSWORD

app.jwt.secret=YOUR_LONG_RANDOM_JWT_SECRET
app.jwt.expiration-ms=86400000

spring.mail.username=YOUR_EMAIL
spring.mail.password=YOUR_GMAIL_APP_PASSWORD

app.upload.dir=uploads
```

### 4. Run the backend

Using Maven:

```bash
./mvnw spring-boot:run
```

On Windows:

```bash
mvnw.cmd spring-boot:run
```

The backend will start at:

```text
http://localhost:8080
```

---

## 💻 Frontend Setup

Clone the frontend repository and install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## 🔐 Important Security Note

**Do not commit real credentials or secrets to GitHub.**

The following values must be kept private:

* PostgreSQL password
* JWT secret
* Gmail password / App Password
* Production credentials
* API keys

Use environment variables or a secrets manager for production deployments.

Example:

```properties
spring.datasource.password=${DB_PASSWORD}
app.jwt.secret=${JWT_SECRET}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
```

The default admin credentials configured for development should also be changed before using the system in a real environment.

---

## 🌱 Initial Admin Setup

The backend includes an automatic admin bootstrap mechanism through the application's data seeding process.

Example development configuration:

```properties
app.admin.name=Campus Admin
app.admin.email=admin@bitsathy.ac.in
app.admin.password=ChangeThisPassword123
```

**Change the default password before any real deployment.**

---

## 📡 REST API

The backend exposes REST APIs for the major system modules.

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Complaints

```text
/api/complaints
```

### Technicians

```text
/api/technicians
```

### Locations

```text
/api/locations
```

Additional endpoints are available for complaint management, assignment, status updates, history, and related operations.

All protected endpoints require a valid JWT:

```http
Authorization: Bearer <JWT_TOKEN>


## 📄 License

This project is developed for academic purposes as part of the Bannari Amman Institute of Technology campus maintenance project.
