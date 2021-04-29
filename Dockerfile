FROM node:14

WORKDIR /var/jenkins_home/workspace/BBDash_master

RUN yarn install --immutable --inline-builds
