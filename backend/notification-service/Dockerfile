FROM node:18-alpine
WORKDIR /app
COPY shared ./shared
COPY notification-service/package*.json ./notification-service/
WORKDIR /app/notification-service
RUN npm install
COPY notification-service .
CMD ["npm", "start"]
