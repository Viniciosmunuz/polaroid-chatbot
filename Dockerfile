FROM node:18-alpine

# Instalar dependências necessárias para Chromium
RUN apk add --no-cache \
    chromium \
    chromium-chromedriver \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-dejavu

WORKDIR /app

ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Copiar package.json
COPY package.json ./

# Instalar dependências npm
RUN npm install --legacy-peer-deps --omit=dev

# Copiar código da aplicação
COPY . .

# Comando para iniciar a aplicação
CMD ["npm", "start"]
