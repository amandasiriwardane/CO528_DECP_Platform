FROM node:18-alpine
WORKDIR /app
COPY shared ./shared
COPY feed-service/package*.json ./feed-service/
WORKDIR /app/feed-service
RUN npm install
COPY feed-service .
CMD ["npm", "start"]
