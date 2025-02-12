# Gunakan Node.js 20 sebagai base image
FROM node:20-alpine

# Tentukan working directory di dalam container
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies berdasarkan package-lock.json
RUN npm ci --only=production

# Copy seluruh source code ke dalam container
COPY . .

# Expose port aplikasi
EXPOSE 4000

# Perintah untuk menjalankan backend
CMD ["node", "index.js"]
