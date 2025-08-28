# ===== Base image (jangan set NODE_ENV di sini) =====
FROM node:20.19 AS base
WORKDIR /app

# ===== Stage: deps (development deps untuk build) =====
FROM base AS deps
ENV NODE_ENV=development
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# ===== Stage: builder (build app) =====
FROM base AS builder
ENV NODE_ENV=development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma (berguna jika build butuh Prisma types)
RUN npx prisma generate
# Build aplikasi (sesuaikan dengan script Anda di package.json)
RUN npm run build
# Pastikan folder public ada agar COPY di runner selalu sukses
RUN [ -d public ] || mkdir -p public

# ===== Stage: prod-deps (hanya production deps + prisma generate) =====
FROM base AS prod-deps
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci --omit=dev
RUN npx prisma generate

# ===== Stage: runner (final image) =====
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

# Buat user non-root untuk runtime
RUN groupadd -r nodejs && useradd -r -g nodejs nextjs

# node_modules (sudah berisi Prisma Client) → WAJIB dimiliki user runtime
COPY --from=prod-deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Artefak build dan file runtime (read-only, tidak wajib chown)
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# node_modules sudah siap; tidak perlu npm ci di sini
CMD ["npm", "start"]