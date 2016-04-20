FROM node:argon

# Set up environment variables
ENV NODE_ENV production
ENV BUILD_VERSION 11

# List the Google Analytics ID as an arg to docker build, and save as env var
ARG GOOGLE_ANALYTICS_ID_ARG
ENV GOOGLE_ANALYTICS_ID $GOOGLE_ANALYTICS_ID_ARG
# Same for stripe vars
ARG STRIPE_PUBKEY_LIVE_ARG
ENV STRIPE_PUBKEY_LIVE $STRIPE_PUBKEY_LIVE_ARG
ARG STRIPE_PUBKEY_TEST_ARG
ENV STRIPE_PUBKEY_TEST $STRIPE_PUBKEY_TEST_ARG

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install app dependencies
COPY package.json /app
RUN npm install

# Bundle app source
COPY . /app

# Remove any bundles if they exist
RUN rm -f /app/dist/bundle.js

# Build production bundle
RUN node /app/node_modules/webpack/bin/webpack.js --config /app/webpack.config.prod.js

EXPOSE 4000
CMD [ "npm", "run", "prod" ]