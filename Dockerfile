FROM node:18-alpine

# Instalar only essential dependencies
RUN apk add --no-cache \
    chromium \
    ca-certificates

WORKDIR /app

ENV NODE_ENV=production

# Copiar package.json
COPY package.json ./

# Instalar dependências npm
RUN npm install --legacy-peer-deps --omit=dev

# Copiar código da aplicação
COPY . .

# Comando para iniciar a aplicação
CMD ["npm", "start"]
