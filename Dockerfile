FROM node:14

WORKDIR /var/bbdash

# Copy `yarn.lock` and all `package.json` files from the first build stage in
# preparation for `yarn install`.
COPY package.json package.json
COPY yarn.lock yarn.lock
COPY .yarnrc.yml .yarnrc.yml
COPY .yarn .yarn
COPY packages/app/package.json packages/app/package.json 
COPY packages/bb-api/package.json packages/bb-api/package.json
COPY packages/chrome-extension/package.json packages/chrome-extension/package.json
COPY packages/chrome-remote-objects/package.json packages/chrome-remote-objects/package.json
COPY packages/shared/package.json packages/shared/package.json

# Install all dependencies and verify that `yarn.lock` will not be modified
# during the process. If `yarn.lock` needs to be modified, this step is
# deliberately designed to fail (Please refer to the article for the remedy.).
# This is to prevent `yarn.lock` from going out-of-sync with the `package.json`
# files inside each workspace, which can happen if npm is used as the package
# manager on the host side.
RUN yarn install --immutable --inline-builds
