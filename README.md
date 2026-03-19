# DECP: Department Engagement & Career Platform

DECP is a modern, microservices-based web application designed to bridge the gap between students, alumni, and department administrators. It features real-time notifications, a professional career hub with CV uploads, research collaboration tools, and an integrated messaging system.

## 🚀 Features

- **Real-time Feed**: Share updates, images, and videos with interactive likes and comments.
- **Career Hub**: Post and apply for jobs/internships with PDF resume uploads (integrated with MinIO S3).
- **Research Hub**: Create collaborative projects and share research documents.
- **Event Management**: RSVP to department workshops and announcements with live notifications.
- **Advanced Messaging**: Seamless direct messaging and group chat functionality.
- **Admin Analytics**: A dedicated dashboard for platform-wide insights.
- **Premium UI**: Sleek, responsive design with glassmorphism, micro-animations, and a unified layout.

## 🛠️ Architecture

The platform follows a **Service-Oriented Architecture (SOA)**:
- **API Gateway**: Centralized entry point and proxy.
- **Microservices**: User, Feed, Job, Event, and Notification services (Node.js).
- **Communication**: Event-driven via **RabbitMQ**.
- **Storage**: PostgreSQL (DB), MinIO (S3 Media), and Redis (Cache).

## 📦 Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- [Node.js](https://nodejs.org/) (optional, for local frontend development).

### 1. Run the Platform (Docker Compose)
The entire stack is containerized for "one-command" setup.

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd CO528_DECP_Platform
   ```
2. Build and launch all 17 containers:
   ```bash
   docker compose up -d --build
   ```
3. Wait for the services to initialize (~1 minute).

### 2. Access the Application
- **Web App**: [http://localhost:5173](http://localhost:5173)
- **API Gateway**: [http://localhost:8080/health](http://localhost:8080/health)
- **MinIO Dashboard**: [http://localhost:9001](http://localhost:9001) (Admin: `admin` / `password123`)
- **RabbitMQ**: [http://localhost:15672](http://localhost:15672)

### 3. Testing Credentials
You can register a new account or use these pre-defined roles:
- **Admin**: Create an account and select the **Admin** role to access the Analytics Dashboard.
- **General**: Register as **Student** or **Alumni** to access the Feed and Jobs.

---

## 🔧 Deployment
For production deployment instructions to a VPS or Cloud provider, please refer to the [Deployment Guide](./deployment_guide.md).

## 📄 License
This project was developed for the CO528 Department Engagement & Career Platform assignment.