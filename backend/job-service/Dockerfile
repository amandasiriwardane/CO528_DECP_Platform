FROM node:18-alpine
WORKDIR /app
COPY shared ./shared
COPY job-service/package*.json ./job-service/
WORKDIR /app/job-service
RUN npm install
COPY job-service .
CMD ["npm", "start"]
