# Deployment Guide: DECP Platform

Since the platform is already built using **Docker Compose**, deployment is straightforward. This guide outlines the recommended steps to transition from local development to a production-ready environment.

## 🐳 1. Deploying to a VPS (Recommended)
The fastest way to deploy is using a Virtual Private Server (VPS) like DigitalOcean, Linode, or AWS EC2.

### Prerequisites:
- A Linux server (Ubuntu 22.04+ recommended).
- [Docker & Docker Compose installed](https://docs.docker.com/engine/install/ubuntu/).
- A Domain Name (for SSL/Proxy).

### Steps:
1. **Push your code**: Push the repository to GitHub or GitLab.
2. **Clone on the server**: `git clone <your-repo-url>`
3. **Environment Setup**: 
   - Update `.env` files in each service to use stable passwords.
   - Update the `JWT_SECRET` across all services.
   - Update `S3_ENDPOINT` to your server's IP or domain.
   - **Frontend**: Create a `.env` file in `clients/web` using the `.env.example` template. Set `VITE_API_URL` to your server's public API gateway address (e.g., `http://1.2.3.4:8080/api`).
4. **Launch**:
   ```bash
   docker compose up -d --build
   ```

## 🔐 2. Security & SSL
In production, you should never expose service ports (3000, 5672, 9000, etc.) directly.

### Using Nginx as a Reverse Proxy:
1. Install Nginx on the host.
2. Use **Certbot (Let's Encrypt)** for free SSL/HTTPS certificates.
3. Proxy all traffic from port 443 (HTTPS) to the `api-gateway` on port 8080.

## ☁️ 3. Cloud Provider Strategies
For a more scalable "enterprise" setup, consider:

- **Database**: Use a managed service like **AWS RDS (PostgreSQL)** instead of a containerized DB.
- **Media**: Use a managed **AWS S3** bucket instead of a self-hosted MinIO container.
- **Message Broker**: Use **CloudAMQP** for a managed RabbitMQ instance.
- **Scaling**: Deploy each service to **AWS ECS (Elastic Container Service)** with Fargate (serverless).

## 🚀 4. CI/CD Pipeline
Automate your deployments using **GitHub Actions**:
1. Every time you push to `main`, run a script that:
   - Builds the Docker images.
   - Pushes them to a Registry (like Docker Hub or AWS ECR).
   - Triggers a deployment on the server (e.g., `docker compose pull && docker compose up -d`).

---

> [!TIP]
> **Monitoring**: Once deployed, use tools like **Portainer** to manage your containers easily via a web UI, or **Prometheus/Grafana** for health monitoring.
