# ---------- Stage 1: Install dependencies ----------
FROM node:20-alpine AS deps

# Set working directory inside the container
WORKDIR /app

# Copy only package.json and package-lock.json first (for better caching)
COPY package*.json ./

# Install dependencies using clean install (uses package-lock.json for exact versions)
RUN npm ci


# ---------- Stage 2: Build the Next.js application ----------
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files to the build container
COPY . .

# Build the Next.js production app
RUN npm run build


# ---------- Stage 3: Run the production server ----------
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Set environment variable for production
ENV NODE_ENV=production

# Copy built files from builder stage
# .next/standalone contains the compiled Next.js server
COPY --from=builder /app/.next/standalone ./

# Copy static assets (JS, CSS, images)
COPY --from=builder /app/.next/static ./.next/static

# Copy the public folder (public images/files)
COPY --from=builder /app/public ./public

# Expose port 3000 for the container
EXPOSE 3000

# Start the production server
CMD ["node", "server.js"]
