FROM node:20

RUN mkdir -p /appasear/src/estado

WORKDIR /appasear/src/estado

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 50001

CMD ["npm", "run", "dev"]