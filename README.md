# Bot WhatsApp - Restaurante e Lanchonete PAPALEGUAS 🍽️

Bot de atendimento automático para receber pedidos e gerenciar reservas de forma inteligente via WhatsApp.

## ⚡ Quick Start

```bash
npm install
node chatbot-papaleguas.js
```

## 🔧 Configuração

Crie um arquivo `.env`:

```env
OWNER_NUMBER=55XXXXXXXXXXXX@c.us
```

**Formato:** `55` + `DDD` + `Número` + `@c.us` (sem espaços)

Na primeira execução, escaneie o QR code com WhatsApp para autenticar.

## ✨ Funcionalidades

- ✅ Menu com 2 opções principais
- ✅ Cardápio, horário e taxa visíveis no menu
- ✅ Pedidos com formato estruturado
- ✅ Suporte ao atendente (forma livre)
- ✅ Máquina de estados
- ✅ Timeout após 30 min inatividade
- ✅ Bloqueia grupos e contatos salvos
- ✅ Confirmação de pedido

## 📂 Estrutura

```
├── chatbot-papaleguas.js  # Lógica principal do bot
├── teste-novo.js          # Teste interativo local
├── package.json           # Dependências
├── .env                   # Configurações (não commitado)
└── README.md              # Este arquivo
```

## 🎯 Fluxos

| Opção | Descrição |
|-------|-----------|
| **1** | **Fazer um Pedido** - Formato estruturado (Nome, Pedido, Endereço, Pagamento) |
| **2** | **Falar com Atendente** - Suporte direto |

## 📋 Formato de Pedido (Opção 1)

```
Nome: Seu Nome Completo
Pedido: O que você quer comer
Endereço: Rua, número, bairro
Pagamento: 1 (Pix) / 2 (Dinheiro) / 3 (Cartão)
```

## ⏰ Informações do Restaurante

- **Horário:** Todos os dias 5:30 - 23:30
- **Taxa de Entrega:** R$ 3,00
- **Cardápio:** [Google Drive Link](https://drive.google.com/file/d/1-exemplo-cardapio/view?usp=drive_link)

## 🚀 Deploy

O bot está pronto para rodar em Railway, Heroku ou similar.

Certifique-se de adicionar `OWNER_NUMBER` nas variáveis de ambiente da plataforma.

## 📝 Notas

- O bot ignora grupos e contatos salvos
- Reseta automaticamente após 30 minutos de inatividade
- Envia notificações para o proprietário com cada novo pedido
| **3** | Orçamento: Tipo → Data |
| **4** | Suporte humano |
| **5** | Drone: Nome |

## 🔍 Desenvolvedor

Mensagens estão centralizadas em `RESPONSES`. Para editar:

```javascript
// Em chatbot.js
const RESPONSES = {
  MENU: 'Seu novo menu aqui...',
  // ... outras respostas
};
```

## 📝 Notas

- Bot ignora automaticamente grupos e contatos salvos
- Estados são mantidos por usuário
- Dados são limpos ao fim do fluxo
- Código otimizado e limpo
- Sem dependências desnecessárias

## 🚀 Deploy

Use BotCloud, Render ou servidor próprio. Precisará de Node.js 14+.
