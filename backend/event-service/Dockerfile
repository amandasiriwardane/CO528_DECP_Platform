FROM node:18-alpine
WORKDIR /app
COPY shared ./shared
COPY event-service/package*.json ./event-service/
WORKDIR /app/shared
RUN npm install
WORKDIR /app/event-service
RUN npm install
COPY event-service .
CMD ["npm", "start"]
