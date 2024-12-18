FROM node:18

WORKDIR /app

COPY package.json package-lock.json ./
COPY contacts.json ./contacts.json
COPY server.js ./server.js

RUN npm install

EXPOSE 5000

CMD ["node", "server.js"]
