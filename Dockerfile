# 使用官方 Bun 映像檔作為基礎
FROM oven/bun:1 AS base

# 安裝依賴階段
FROM base AS deps
WORKDIR /app

# 複製 package.json 和 bun.lock
COPY package.json bun.lock ./

# 安裝依賴 (使用 --frozen-lockfile 確保 lockfile 一致性)
RUN bun install --frozen-lockfile

# 建置階段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 設定環境變數以略過遙測
ENV NEXT_TELEMETRY_DISABLED=1

# 執行建置
# Next.js 將會生成 .next/standalone 資料夾 (因為已經在 next.config.ts 設定了 output: 'standalone')
RUN bun run build

# 執行階段
FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 建立系統使用者以提升安全性
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 複製建置產物
# 複製 public 資料夾
COPY --from=builder /app/public ./public

# 自動複製 standalone 輸出以減少映像檔大小
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切換至非 root 使用者
USER nextjs

# 開放連接埠
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 啟動伺服器 (standalone 模式下產生的是 server.js)
CMD ["bun", "server.js"]
