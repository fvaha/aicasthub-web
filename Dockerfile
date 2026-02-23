# Frontend Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3009

CMD ["npm", "run", "start", "--", "-p", "3009"]
