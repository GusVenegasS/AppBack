FROM node:20

RUN mkdir -p /appasear/src/autentication

WORKDIR /appasear/src/autentication

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 50003

CMD ["npm", "run", "dev"]