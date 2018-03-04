FROM node:latest
WORKDIR /usr/src/app

COPY package*.json ./
COPY bower.json ./

RUN npm install
RUN npx bower i --allow-root

COPY . .

EXPOSE 8080
CMD [ "npm", "start" ]
