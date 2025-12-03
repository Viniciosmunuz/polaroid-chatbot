require('dotenv').config();
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

// ═══════════════════════════════════════════════════════════════════
//                       CONFIGURAÇÕES GERAIS
// ═══════════════════════════════════════════════════════════════════

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║           🤖 BOT POLAROID CHATBOT INICIANDO...                ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

console.log('📦 Criando cliente WhatsApp...');
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

const userStages = {};
const userData = {};
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
const ownerNumber = process.env.OWNER_NUMBER || '5592999130838@c.us';

console.log('✅ Configurações carregadas');
console.log('📱 Número do proprietário:', ownerNumber);
console.log('⏳ Aguardando conexão com WhatsApp...\n');

// ═══════════════════════════════════════════════════════════════════
//                      FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════

const delay = ms => new Promise(res => setTimeout(res, ms));
const isInitialTrigger = text => /(oi|ola|olá|menu|boa tarde|boa noite|bom dia)/i.test(text);

// ═══════════════════════════════════════════════════════════════════
//                    INICIALIZAÇÃO DO CLIENTE
// ═══════════════════════════════════════════════════════════════════

client.on('qr', qr => {
    try {
        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║                     QR CODE GERADO!                           ║');
        console.log('╚════════════════════════════════════════════════════════════════╝\n');
        
        // Gera o QR code visual
        qrcode.generate(qr, { small: true });
        
        // Log detalhado da URL
        console.log('\n' + '═'.repeat(70));
        console.log('📱 QR CODE URL:');
        console.log('═'.repeat(70));
        console.log(qr);
        console.log('═'.repeat(70));
        console.log('💡 Dica: Escaneie o QR code acima com seu WhatsApp Web para conectar!');
        console.log('═'.repeat(70) + '\n');
    } catch (error) {
        console.error('❌ Erro ao gerar QR code:', error.message);
    }
});

client.on('ready', () => {
    console.log('✅ Bot WhatsApp conectado e pronto para receber mensagens!');
});

// Handler de erros
client.on('error', error => {
    console.error('❌ ERRO NO BOT:', error);
});

process.on('unhandledRejection', error => {
    console.error('❌ ERRO NÃO TRATADO:', error);
});

console.log('🔄 Inicializando cliente WhatsApp...');
client.initialize().catch(error => {
    console.error('❌ ERRO ao inicializar:', error.message);
    process.exit(1);
});

// ═══════════════════════════════════════════════════════════════════
//                    RESPOSTAS CENTRALIZADAS
// ═══════════════════════════════════════════════════════════════════

const RESPONSES = {
    MENU: 'Olá! Bem-vindo(a) ao espaço polaroid 📸\nComo posso te ajudar hoje?\n\n1️⃣ Ver Catálogo e Preços (Fotos Simples e Pacotes de Eventos)\n2️⃣ Fazer Pedido de Fotos Simples\n3️⃣ 📅 Orçamento para Eventos\n4️⃣ Falar com Suporte\n5️⃣ 🚁 Serviços de Drone',
    CATALOGO_LINK: 'https://drive.google.com/file/d/1-3RjbAjgm1t_lpJLwi9wjhS87TJyktj9/view?usp=drive_link',
    CATALOGO_INFO: (link) => `Confira nossos modelos e valores no link abaixo:\n\n👉 ${link} \n\nSe deseja fazer um pedido de fotos simples, digite *2* ou *3* para orçamento de eventos.`,
    AGUARDANDO_NOME: 'Vamos lá! Primeiro, qual é o seu *Nome Completo*?',
    AGUARDANDO_QTD: (nome) => `Prazer, ${nome}! Quantas fotos polaroid você deseja revelar? (Digite a quantidade, pode ser por extenso ou em número)`,
    VALIDACAO_QTD_ERRO: '⚠️ Valor inválido. Por favor, digite a *quantidade* de fotos desejada. Se for um número por extenso (ex: "doze"), não se preocupe, nosso atendente irá conferir.',
    AGUARDANDO_ENDERECO: "Certo. Para finalizar, qual o *Endereço de Entrega* (ou digite 'Retirada' se for buscar)?",
    PEDIDO_CONFIRMACAO: (nome, qtd, endereco) => `✅ *Resumo do Pedido*\n\nNome: ${nome}\nQuantidade: ${qtd} fotos\nLocal: ${endereco}\n\n*Tudo certo?* Digite:\n👉 *SIM* para confirmar e enviar para cálculo\n👉 *NÃO* para cancelar e voltar ao menu`,
    PEDIDO_CONFIRMADO: (nome, qtd, endereco) => `✅ *Pedido Confirmado!*\nNome: ${nome}\nQtd: ${qtd} fotos\nLocal: ${endereco}\n\n📸 *PRÓXIMO PASSO:* Por favor, envie as fotos que você quer revelar aqui no chat.\n\nSeu pedido foi encaminhado para análise de valor. *Aguarde a mensagem de um atendente com o valor total e o QR Code Pix*.`,
    AGUARDANDO_TIPO_EVENTO: 'Ótimo! Para pacotes de eventos, qual é o *Tipo de Evento*? (Ex: Aniversário, Casamento, Corporativo)',
    AGUARDANDO_DATA_EVENTO: (tipo) => `Qual é a *Data* do seu evento "${tipo}"? (Ex: DD/MM/AAAA)`,
    VALIDACAO_DATA_ERRO: '⚠️ Formato inválido. Por favor, digite a data no formato *DD/MM/AAAA* (Ex: 01/12/2024).',
    PEDIDO_AVISO_DONO: (nome, numeroCliente, qtd, endereco) => `🚨 *NOVO PEDIDO PARA CÁLCULO* 🚨\n\nCliente: ${nome}\nWhatsApp: https://wa.me/${numeroCliente}\nQtd: ${qtd} fotos\nLocal: ${endereco}\n\n👉 *AÇÃO:* Calcule o valor total, envie as instruções Pix e o QR Code/Chave para o cliente.`,
    PEDIDO_AGUARDANDO_CALCULO: 'Seu pedido está em análise de valor. Por favor, aguarde o atendente enviar o valor e o Pix para pagamento. Se precisar de outra coisa, digite *Menu*.',
    MIDIA_RECEBIDA: '📸 Recebi sua foto/vídeo! Continue enviando todas as que deseja revelar. Assim que o atendente enviar o valor e o Pix, seu pedido estará completo.',
    ORCAMENTO_CLIENTE: (tipo, data) => `Seu pedido de orçamento para o evento "${tipo}" na data ${data} foi registrado!\n\nUm de nossos especialistas em eventos entrará em contato com você em breve para apresentar a proposta e o pacote ideal.`,
    ORCAMENTO_AVISO_DONO: (tipo, data, nomeCliente, numeroCliente) => `🚨🚨 *ORÇAMENTO DE EVENTO RECEBIDO!* 🚨🚨\n\nTipo: ${tipo}\nData: ${data}\nCliente: ${nomeCliente}\nWhatsApp: https://wa.me/${numeroCliente}\n\nEntre em contato o mais rápido possível!`,
    SUPORTE_INICIO: 'Ok! Um atendente humano já vai te responder em instantes. Para voltar ao menu, digite *Menu*.',
    SUPORTE_AVISO_DONO: (nomeCliente, numeroCliente) => `👤 *NOVO CLIENTE EM SUPORTE* 👤\n\nCliente: ${nomeCliente}\nWhatsApp: https://wa.me/${numeroCliente}\n\n👉 *AÇÃO:* O cliente está aguardando atendimento humano.`,
    INATIVIDADE: 'Olá! Parece que ficamos inativos por um tempo. Para recomeçar, digite *Menu* ou escolha uma opção:',
    RESPOSTA_PADRAO: 'Desculpe, não consegui entender sua última mensagem. Digite *Menu* para ver as opções ou aguarde nosso suporte.',
    DRONE_AGUARDANDO_NOME: 'Entendido! Para o serviço de drone, qual é o seu *Nome e Sobrenome*?',
    DRONE_FINALIZADO_CLIENTE: (nome) => `Obrigado(a), ${nome}! 🚁\n\nSeu interesse em *Serviços de Drone* foi registrado com sucesso!\n\nLogo um atendente vai responder com mais informações sobre seu projeto. Até logo!`,
    DRONE_AVISO_DONO: (nome, numeroCliente) => `🚁 *NOVO ORÇAMENTO DE DRONE* 🚁\n\nCliente: ${nome}\nWhatsApp: https://wa.me/${numeroCliente}\n\n👉 *AÇÃO:* Entre em contato para entender a necessidade e enviar um orçamento.`,
};

// ═══════════════════════════════════════════════════════════════════
//                    HANDLER DE MENSAGENS
// ═══════════════════════════════════════════════════════════════════

client.on('message', async (msg) => {
  try {
    const from = msg.from;
    const body = (msg.body || '').trim();

    // 🛑 Bloqueia grupos e mensagens inválidas
    if (!from || from.endsWith('@g.us')) return;

    // 🛑 Bloqueia contatos salvos (apenas números não salvos)
    const contact = await msg.getContact();
    if (contact.isMyContact) return;

    let state = userStages[from] || null;
    const now = Date.now();

    // ⏱️ Verifica inatividade (30 minutos)
    if (state && userData[from]?.lastActivity && (now - userData[from].lastActivity > INACTIVITY_TIMEOUT)) {
        await client.sendMessage(from, RESPONSES.INATIVIDADE);
        state = null;
        delete userStages[from];
        delete userData[from];
    }

    // Atualiza timestamp de atividade
    if (state !== 'SUPORTE') {
        userData[from] = userData[from] || {};
        userData[from].lastActivity = now;
    }

    // Simula digitação (UX mais humano)
    await msg.getChat().then(chat => chat.sendStateTyping());
    await delay(300);

    // Sair de SUPORTE com "Menu"
    if (state === 'SUPORTE' && isInitialTrigger(body)) {
        await client.sendMessage(from, RESPONSES.MENU);
        userStages[from] = 'MENU_PRINCIPAL';
        return;
    }

    // Iniciar conversa
    if (!state && isInitialTrigger(body)) {
      await client.sendMessage(from, RESPONSES.MENU);
      userStages[from] = 'MENU_PRINCIPAL';
      return;
    }

    // 📋 MENU PRINCIPAL
    if (state === 'MENU_PRINCIPAL') {
      if (body === '1') {
        await client.sendMessage(from, RESPONSES.CATALOGO_INFO(RESPONSES.CATALOGO_LINK));
        return;
      }
      if (body === '2') {
        await client.sendMessage(from, RESPONSES.AGUARDANDO_NOME);
        userStages[from] = 'AGUARDANDO_NOME';
        userData[from] = userData[from] || {};
        return;
      }
      if (body === '3') {
        await client.sendMessage(from, RESPONSES.AGUARDANDO_TIPO_EVENTO);
        userStages[from] = 'AGUARDANDO_TIPO_EVENTO';
        userData[from] = userData[from] || {};
        return;
      }
      if (body === '4') {
        const nomeCliente = userData[from]?.nome || 'Cliente Novo';
        const numeroCliente = from.replace('@c.us', '');
        await client.sendMessage(ownerNumber, RESPONSES.SUPORTE_AVISO_DONO(nomeCliente, numeroCliente));
        await client.sendMessage(from, RESPONSES.SUPORTE_INICIO);
        userStages[from] = 'SUPORTE';
        return;
      }
      if (body === '5') {
        await client.sendMessage(from, RESPONSES.DRONE_AGUARDANDO_NOME);
        userStages[from] = 'AGUARDANDO_NOME_DRONE';
        userData[from] = userData[from] || {};
        return;
      }
      await client.sendMessage(from, RESPONSES.RESPOSTA_PADRAO);
      return;
    }

    // 🛍️ FUNIL: PEDIDO DE FOTOS SIMPLES
    if (state === 'AGUARDANDO_NOME') {
      userData[from].nome = body;
      const nomeCurto = userData[from].nome.split(" ")[0];
      await client.sendMessage(from, RESPONSES.AGUARDANDO_QTD(nomeCurto));
      userStages[from] = 'AGUARDANDO_QTD';
      return;
    }

    if (state === 'AGUARDANDO_QTD') {
      const isNumber = /^\d+$/.test(body);
      const isPositiveNumber = isNumber && parseInt(body) > 0;
      if (isPositiveNumber || body.length > 2) {
          userData[from].qtd = body;
          await client.sendMessage(from, RESPONSES.AGUARDANDO_ENDERECO);
          userStages[from] = 'AGUARDANDO_ENDERECO';
          return;
      }
      await client.sendMessage(from, RESPONSES.VALIDACAO_QTD_ERRO);
      return;
    }

    if (state === 'AGUARDANDO_ENDERECO') {
      userData[from].endereco = body;
      const { nome, qtd, endereco } = userData[from];
      await client.sendMessage(from, RESPONSES.PEDIDO_CONFIRMACAO(nome, qtd, endereco));
      userStages[from] = 'PEDIDO_AGUARDANDO_CONFIRMACAO';
      return;
    }

    if (state === 'PEDIDO_AGUARDANDO_CONFIRMACAO') {
      const confirmacao = body.toUpperCase().trim();
      if (confirmacao === 'SIM' || confirmacao === 'S') {
        const { nome, qtd, endereco } = userData[from];
        const numeroCliente = from.replace('@c.us', '');
        await client.sendMessage(from, RESPONSES.PEDIDO_CONFIRMADO(nome, qtd, endereco));
        await delay(1000);
        await client.sendMessage(ownerNumber, RESPONSES.PEDIDO_AVISO_DONO(nome, numeroCliente, qtd, endereco));
        userStages[from] = 'PEDIDO_AGUARDANDO_CALCULO';
        return;
      }
      if (confirmacao === 'NÃO' || confirmacao === 'NAO' || confirmacao === 'N') {
        await client.sendMessage(from, `Pedido cancelado. Voltando ao menu...\n\n${RESPONSES.MENU}`);
        userStages[from] = 'MENU_PRINCIPAL';
        delete userData[from];
        return;
      }
      await client.sendMessage(from, '⚠️ Por favor, digite *SIM* para confirmar ou *NÃO* para cancelar.');
      return;
    }

    if (state === 'PEDIDO_AGUARDANDO_CALCULO') {
        if (msg.hasMedia) {
            const media = await msg.downloadMedia();
            if (/image|video/.test(media.mimetype)) {
                const clientNumber = from.replace('@c.us', '');
                await client.sendMessage(from, RESPONSES.MIDIA_RECEBIDA);
                await client.sendMessage(ownerNumber, media, {
                    caption: `MÍDIA DO PEDIDO PENDENTE\nCliente: ${userData[from]?.nome || 'Desconhecido'}\nNúmero: https://wa.me/${clientNumber}`
                });
                return;
            }
        }
        if (isInitialTrigger(body)) {
            await client.sendMessage(from, RESPONSES.MENU);
            userStages[from] = 'MENU_PRINCIPAL';
            return;
        }
        if (body.length > 0) {
             await client.sendMessage(from, RESPONSES.PEDIDO_AGUARDANDO_CALCULO);
             return;
        }
    }

    // 📅 FUNIL: ORÇAMENTO PARA EVENTOS
    if (state === 'AGUARDANDO_TIPO_EVENTO') {
        userData[from].tipoEvento = body;
        await client.sendMessage(from, RESPONSES.AGUARDANDO_DATA_EVENTO(body));
        userStages[from] = 'AGUARDANDO_DATA_EVENTO';
        return;
    }

    if (state === 'AGUARDANDO_DATA_EVENTO') {
        userData[from].dataEvento = body;
        const nomeCliente = userData[from].nome || from;
        const numeroCliente = from.replace('@c.us', '');
        const tipoEvento = userData[from].tipoEvento;
        await client.sendMessage(from, RESPONSES.ORCAMENTO_CLIENTE(tipoEvento, body));
        await client.sendMessage(ownerNumber, RESPONSES.ORCAMENTO_AVISO_DONO(tipoEvento, body, nomeCliente, numeroCliente));
        delete userStages[from];
        delete userData[from];
        return;
    }

    // 🚁 FUNIL: SERVIÇOS DE DRONE
    if (state === 'AGUARDANDO_NOME_DRONE') {
        const nomeCliente = body;
        const numeroCliente = from.replace('@c.us', '');
        await client.sendMessage(from, RESPONSES.DRONE_FINALIZADO_CLIENTE(nomeCliente.split(' ')[0]));
        await client.sendMessage(ownerNumber, RESPONSES.DRONE_AVISO_DONO(nomeCliente, numeroCliente));
        delete userStages[from];
        delete userData[from];
        return;
    }

    // Resposta padrão
    if (state !== 'SUPORTE' && state !== 'PEDIDO_AGUARDANDO_CALCULO' && !isInitialTrigger(body)) {
        await client.sendMessage(from, RESPONSES.RESPOSTA_PADRAO);
    }

  } catch (err) {
    console.error('❌ Erro ao processar mensagem:', err);
  }
});
