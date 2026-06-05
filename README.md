# Ikonex Academy Student Management System

## Overview

The Ikonex Academy Student Management System is a full-stack web application designed to streamline the management of students, class streams, subjects, assessments, results processing, and academic reporting.

The platform enables school administrators and teachers to efficiently manage academic records, monitor student performance, generate report cards, and analyze class performance through an intuitive dashboard.

---

## Features

### Authentication & Authorization

* Secure user authentication using JWT
* Role-based access control
* Admin and Teacher user roles
* Protected routes and API endpoints

### Class Stream Management

* Create class streams (e.g., Form 1A, Form 1B)
* View all class streams
* Update class stream information
* Delete class streams
* View class stream details

### Student Management

* Register new students
* Assign students to class streams
* Update student information
* Delete student records
* Search and filter students
* View individual student profiles

### Subject Management

* Create and manage subjects
* Assign subjects to class streams
* Update subject information
* Delete subjects
* View all subjects

### Assessment Management

* Record Continuous Assessment Test (CAT) scores
* Record examination scores
* Edit student scores
* Validate score entries
* Prevent duplicate score submissions

### Results Processing

* Calculate total marks
* Calculate average scores
* Generate grades automatically
* Rank students by performance
* Calculate subject positions
* Calculate overall class positions

### Reporting

* Generate individual student report cards
* Generate class performance reports
* Export reports as PDF
* Print-ready report templates

### Analytics Dashboard

* Student performance statistics
* Subject performance analysis
* Grade distribution charts
* Top-performing students
* Class performance trends

---

## Technology Stack

### Frontend

* React.js
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios
* React Hook Form
* TanStack Table
* Recharts

### Backend

* Node.js
* Express.js
* TypeScript
* JWT Authentication
* Prisma ORM

### Database

* PostgreSQL

### Testing

* Jest
* Supertest
* React Testing Library

### Deployment

* Vercel (Frontend)
* Railway (Backend)
* PostgreSQL Database

---

## Project Structure

```bash
student-management-system/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── routes/
│   │   └── utils/
│   │
│   └── public/
│
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── prisma/
│   │   ├── validations/
│   │   └── utils/
│   │
│   └── tests/
│
├── docs/
├── README.md
└── package.json
```

---

## Database Schema

### Main Tables

* Users
* Roles
* ClassStreams
* Students
* Subjects
* ClassSubjects
* Assessments
* Scores
* GradingScales
* ReportCards

### Relationships

* A Class Stream has many Students.
* A Student belongs to one Class Stream.
* A Class Stream can have many Subjects.
* A Subject can belong to many Class Streams.
* A Student can have many Assessment Scores.
* A Report Card belongs to one Student.

---

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/student-management-system.git
cd student-management-system
```

### Install Frontend Dependencies

```bash
cd client
npm install
```

### Install Backend Dependencies

```bash
cd ../server
npm install
```

---

## Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000

DATABASE_URL=postgresql://username:password@localhost:5432/student_management_db

JWT_SECRET=your_secret_key

NODE_ENV=development
```

---

## Database Migration

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

---

## Running the Application

### Start Backend

```bash
npm run dev
```

### Start Frontend

```bash
npm run dev
```

Frontend:

```bash
http://localhost:5173
```

Backend:

```bash
http://localhost:5000
```

---

## API Endpoints

### Authentication

| Method | Endpoint           | Description   |
| ------ | ------------------ | ------------- |
| POST   | /api/auth/login    | User Login    |
| POST   | /api/auth/register | Register User |

### Students

| Method | Endpoint          |
| ------ | ----------------- |
| GET    | /api/students     |
| GET    | /api/students/:id |
| POST   | /api/students     |
| PUT    | /api/students/:id |
| DELETE | /api/students/:id |

### Class Streams

| Method | Endpoint               |
| ------ | ---------------------- |
| GET    | /api/class-streams     |
| POST   | /api/class-streams     |
| PUT    | /api/class-streams/:id |
| DELETE | /api/class-streams/:id |

### Subjects

| Method | Endpoint          |
| ------ | ----------------- |
| GET    | /api/subjects     |
| POST   | /api/subjects     |
| PUT    | /api/subjects/:id |
| DELETE | /api/subjects/:id |

### Assessments

| Method | Endpoint             |
| ------ | -------------------- |
| GET    | /api/assessments     |
| POST   | /api/assessments     |
| PUT    | /api/assessments/:id |
| DELETE | /api/assessments/:id |

---

## Testing

Run backend tests:

```bash
npm run test
```

Run frontend tests:

```bash
npm run test
```

---

## Security Features

* JWT Authentication
* Password Hashing with bcrypt
* Input Validation
* CORS Protection
* Rate Limiting
* SQL Injection Prevention
* XSS Protection

---

## Future Improvements

* SMS Notifications
* Email Report Cards
* Parent Portal
* Attendance Management
* School Fee Management
* Timetable Management
* Mobile Application

---

## Author

**Kelvin Kigen**

Software Developer | Backend Engineer | Full-Stack Developer

---

## License

This project is licensed under the MIT License.

---

## Acknowledgements

* Ikonex Academy
* React Community
* Node.js Community
* Prisma ORM
* PostgreSQL
* Open Source Contributors
