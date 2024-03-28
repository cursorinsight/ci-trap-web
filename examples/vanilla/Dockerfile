# syntax=docker/dockerfile:1.2-labs

# Usage
# =====
#
# Use the following command to build the image:
#
#     $ docker build --ssh default --build-arg GIT_USER=build . \
#         -t ci-trap-snippet-example
#
# Replace `build` with your Git user to be able to clone sources from Gerrit.
#
# Then run the built image with:
#
#     $ docker run --rm -p 8080:80 --name example ci-trap-snippet-example
#
# Your example application server will be available at
# https://docker-server:8080/.

# Source image name
ARG CI_TRAP_IMAGE_NAME=ci-trap-web

# Source image tag
ARG CI_TRAP_IMAGE_TAG=latest

#===============================================================================
# Source
#===============================================================================

FROM ${CI_TRAP_IMAGE_NAME}:${CI_TRAP_IMAGE_TAG} AS source

#===============================================================================
# Runtime
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

# Copy application and tracker code to its final place
COPY public/index.html /opt/app
COPY --from=source /opt/app/gt.min.js /opt/app
