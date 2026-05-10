FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY backend/package.json backend/package.json
COPY shared/package.json shared/package.json
RUN npm install

FROM deps AS build
COPY backend backend
COPY shared shared
RUN npm run build --workspace backend

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules node_modules
COPY --from=build /app/backend/dist backend/dist
COPY backend/package.json backend/package.json
EXPOSE 4040
CMD ["node", "backend/dist/server.js"]
