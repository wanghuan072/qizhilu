# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
# 用于运行当前项目的基础镜像，通过-v方式挂载文件到/home/bun目录下来更新项目，而无需每次重新构建镜像
FROM oven/bun:1 AS base
WORKDIR /home/bun


# 使用国内镜像源并安装 Node.js
RUN sed -i 's/deb.debian.org/mirrors.ustc.edu.cn/g' /etc/apt/sources.list && \
    sed -i 's|security.debian.org/debian-security|mirrors.ustc.edu.cn/debian-security|g' /etc/apt/sources.list && \
    apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*



USER root
EXPOSE 3000/tcp
WORKDIR /home/bun
ENTRYPOINT [ "bun", "run", "start" ]

