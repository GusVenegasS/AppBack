FROM node:20

RUN mkdir -p /appasear/src/student

WORKDIR /appasear/src/student

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 50002

CMD ["npm", "run", "dev"]