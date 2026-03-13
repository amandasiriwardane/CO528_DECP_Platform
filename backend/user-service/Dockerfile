FROM node:18-alpine
WORKDIR /app
COPY shared ./shared
COPY user-service/package*.json ./user-service/
WORKDIR /app/user-service
RUN npm install
COPY user-service .
CMD ["npm", "start"]
