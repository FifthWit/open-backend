FROM node:20-alpine
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# install packages
COPY package.json ./
COPY pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# build source
COPY . ./
RUN pnpm run build

# start server
EXPOSE 80
ENV MWB_SERVER__PORT=80
ENV NODE_ENV=production
CMD ["pnpm", "run", "start"]
