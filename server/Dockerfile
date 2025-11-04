FROM node:18-alpine
WORKDIR /app

# install deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --production

# copy source
COPY . .

# ensure DB dir exists
RUN mkdir -p /app

EXPOSE 4000

CMD ["node", "index.js"]
