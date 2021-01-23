FROM node:12.18.0

WORKDIR /home/senswap-app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run prod

EXPOSE 80
CMD [ "npm", "run", "serve" ]
