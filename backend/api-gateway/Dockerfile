FROM node:18-alpine
WORKDIR /app
COPY shared ./shared
COPY api-gateway/package*.json ./api-gateway/
WORKDIR /app/api-gateway
RUN npm install
COPY api-gateway .
CMD ["npm", "start"]
