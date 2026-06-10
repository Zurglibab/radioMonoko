FROM node:20

WORKDIR /usr/src/app

# Install dependencies based on package.json / package-lock.json
COPY package*.json ./
RUN npm ci --no-audit --no-fund

# Copy rest of the source (will be masked by bind-mount at runtime, but node_modules will be preserved via volume)
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
