# Container image that runs your code
FROM node:16

RUN apt-get update && apt-get install -y rsync && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY package-lock.json package.json rsync-save.js rsync-restore.js /

RUN chmod 755 /rsync-save.js /rsync-restore.js

RUN npm ci

