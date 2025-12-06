FROM node:18-alpine

WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --omit=dev

# Copiar código da aplicação
COPY . .

# Comando para iniciar a aplicação
CMD ["npm", "start"]
