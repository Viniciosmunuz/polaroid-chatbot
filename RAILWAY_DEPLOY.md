# 🚀 Deploy Chatbot no Railway

## Pré-requisitos
- Conta no [Railway.app](https://railway.app)
- Repositório GitHub conectado

## Passo a Passo para Deploy

### 1️⃣ Conectar Railway ao GitHub
1. Acesse [railway.app](https://railway.app)
2. Clique em **"New Project"**
3. Selecione **"Deploy from GitHub"**
4. Autentique sua conta GitHub
5. Selecione o repositório **`polaroid-chatbot`**

### 2️⃣ Configurar Variáveis de Ambiente
No painel do Railway:
1. Vá para **"Variables"**
2. Adicione as seguintes variáveis:
   ```
   OWNER_NUMBER=5592999130838@c.us
   NODE_ENV=production
   ```

### 3️⃣ Verificar Configuração
- O Railway detectará automaticamente o `Procfile`
- Ele rodará o comando: `node chatbot.js`
- O bot ficará online **24/7** 🎉

### 4️⃣ Monitorar Logs
1. No painel do Railway, abra a aba **"Logs"**
2. Você verá em tempo real:
   - QR code gerado
   - Mensagens recebidas
   - Erros (se houver)

## 📱 Usar o Bot
Depois de deployado:
1. Abra o chat do Railway para ver o QR code
2. Escaneie com WhatsApp Web
3. O bot estará pronto para receber mensagens!

## ⚠️ Importante
- O arquivo `.env` **não será enviado** (está no `.gitignore`)
- As variáveis de ambiente devem ser configuradas no painel do Railway
- O bot reiniciará automaticamente em caso de erro

## 🔄 Atualizações
Quando fazer push de mudanças:
```bash
git add .
git commit -m "mensagem da mudança"
git push origin main
```
O Railway fará o deploy automaticamente!

## 📞 Suporte
Se tiver problemas, verifique:
- ✅ Variáveis de ambiente configuradas
- ✅ Repositório público no GitHub
- ✅ Node.js version compatível (>=14)
- ✅ Logs no painel do Railway

---
**Bot criado com ❤️ usando WhatsApp Web.js e Node.js**
