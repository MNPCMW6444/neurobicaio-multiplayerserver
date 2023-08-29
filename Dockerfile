FROM 988253048728.dkr.ecr.us-east-1.amazonaws.com/node:lts as BUILDER
WORKDIR /app
ARG CODEARTIFACT_TOKEN
COPY package.json /app/package.json
COPY tsconfig.json /app/tsconfig.json
COPY tsconfig.prod.json /app/tsconfig.prod.json
COPY build.ts /app/build.ts
COPY src /app/src
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set @failean:registry https://failean-988253048728.d.codeartifact.us-east-1.amazonaws.com/npm/failean/ && \
    echo "//failean-988253048728.d.codeartifact.us-east-1.amazonaws.com/npm/failean/:_authToken=${CODEARTIFACT_TOKEN}" > .npmrc
RUN npm run prod
RUN npm run clean:prod
RUN npm i --omit=dev
RUN rm -rf .npmrc
FROM 988253048728.dkr.ecr.us-east-1.amazonaws.com/node:lts-slim
WORKDIR /app
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist
CMD ["node", "./dist/src"]
EXPOSE 6555
