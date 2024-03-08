# syntax=docker/dockerfile:1.2-labs

# Usage
# =====
#
# Use the following command to build the image:
#
#     $ docker build --ssh default --build-arg GIT_USER=build . -t ci-trap
#
# Replace `build` with your Git user to be able to clone sources from Gerrit.
#
# Then run the built image with:
#
#     $ docker run --rm -p 8080:80 --name ci-trap ci-trap
#
# Your static asset server with `trap.min.js` and `gt.min.js` assets will be
# available at https://docker-server:8080/.

# Target Node version
ARG NODE_VERSION=18

# Target Alpine version
ARG ALPINE_VERSION=3.17

#===============================================================================
# Builder
#===============================================================================

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} AS build

# Internal Git username
ARG GIT_USER=build

# Trap's default envvars
ARG APP_DEFAULT_TRAP_API_KEY_NAME
ARG APP_DEFAULT_TRAP_API_KEY_VALUE
ARG APP_DEFAULT_TRAP_BUFFER_SIZE_LIMIT
ARG APP_DEFAULT_TRAP_BUFFER_TIMEOUT
ARG APP_DEFAULT_TRAP_IDLE_TIMEOUT
ARG APP_DEFAULT_TRAP_SERVER_URL

# Tracker's default envvars
ARG APP_DEFAULT_TRACKER_OBJECT_NAME

# Set up environment variables
ENV GIT_USER=${GIT_USER} \
    APP_DEFAULT_TRACKER_OBJECT_NAME=${APP_DEFAULT_TRACKER_OBJECT_NAME} \
    APP_DEFAULT_TRAP_API_KEY_NAME=${APP_DEFAULT_TRAP_API_KEY_NAME} \
    APP_DEFAULT_TRAP_API_KEY_VALUE=${APP_DEFAULT_TRAP_API_KEY_VALUE} \
    APP_DEFAULT_TRAP_BUFFER_SIZE_LIMIT=${APP_DEFAULT_TRAP_BUFFER_SIZE_LIMIT} \
    APP_DEFAULT_TRAP_BUFFER_TIMEOUT=${APP_DEFAULT_TRAP_BUFFER_TIMEOUT} \
    APP_DEFAULT_TRAP_IDLE_TIMEOUT=${APP_DEFAULT_TRAP_IDLE_TIMEOUT} \
    APP_DEFAULT_TRAP_SERVER_URL=${APP_DEFAULT_TRAP_SERVER_URL}

# Run OS dependencies
RUN --mount=type=cache,id=apk-global,sharing=locked,target=/var/cache/apk \
    ln -s /var/cache/apk /etc/apk/cache && \
    apk add --update build-base openssh-client git util-linux python3

# Set up work space
WORKDIR /opt/app

# Copy package specifications
COPY package.json package-lock.json Makefile* .

# Install dependencies
RUN --mount=type=ssh \
    make install-deps

# Copy contents
COPY . .

# Run tests
RUN --network=none \
    NPM_EXTRA_ARGS="--prefer-offline" make

# Run build
RUN --network=none \
    NPM_EXTRA_ARGS="--prefer-offline" make release

#===============================================================================
# Released runtime
#===============================================================================

FROM nginx:alpine AS runtime

# Set up service's domain
ARG APP_SERVER_DOMAIN=_

# Set up exposed port
ARG APP_SERVER_PORT=80

# Set up environment variables
ENV APP_SERVER_DOMAIN=${APP_SERVER_DOMAIN} \
    APP_SERVER_PORT=${APP_SERVER_PORT}

# Expose HTTP by default
EXPOSE ${APP_SERVER_PORT}

# Copy NGINX config
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy application to its final place
COPY --from=build /opt/app/dist /opt/app
