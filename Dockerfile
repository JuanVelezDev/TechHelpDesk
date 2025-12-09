FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copiar solo archivos necesarios, excluyendo tests
COPY tsconfig*.json ./
COPY src ./src

RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]



