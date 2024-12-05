FROM node:20

RUN mkdir -p /appasear/src/admin

WORKDIR /appasear/src/admin

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 50000

CMD ["npm", "run", "dev"]