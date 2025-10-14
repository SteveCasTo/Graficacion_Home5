FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npx", "live-server", "--port=3000", "--host=0.0.0.0"]