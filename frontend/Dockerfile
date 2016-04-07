FROM node:argon

# Set up environment variables
ENV NODE_ENV production

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY package.json /app
RUN npm install

# Bundle app source
COPY . /app

# Build production bundle
RUN node /app/node_modules/webpack/bin/webpack.js --config /app/webpack.config.prod.js

EXPOSE 4000
CMD [ "npm", "run", "prod" ]