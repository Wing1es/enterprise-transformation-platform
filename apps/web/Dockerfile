FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start Vite dev server on all interfaces so Docker can expose it
CMD ["npm", "run", "dev", "--", "--host"]
