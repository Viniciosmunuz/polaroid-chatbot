FROM ghcr.io/puppeteer/puppeteer:21.6.0

WORKDIR /app

ENV NODE_ENV=production

# Copiar package.json
COPY package.json ./

# Instalar dependências npm
RUN npm install --legacy-peer-deps --omit=dev

# Copiar código da aplicação
COPY . .

# Usar dumb-init para iniciar o processo
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
