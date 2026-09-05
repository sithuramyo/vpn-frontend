FROM node:22-bookworm-slim AS build
WORKDIR /src

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Public env vars are baked in at build time, everything else (AUTH_SECRET,
# AUTH_GOOGLE_ID/SECRET) is read at runtime from the container environment.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

FROM node:22-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=build /src/public ./public
COPY --from=build --chown=nextjs:nodejs /src/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /src/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
