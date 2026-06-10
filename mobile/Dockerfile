FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --no-audit --no-fund

COPY . .

EXPOSE 19000 19001 19002

CMD ["npm", "run", "start"]
