// ═══════════════════════════════════════════════════════════════════
//  🍽️ BOT GARÇOM WEB - RESTAURANTE E LANCHONETE PAPALEGUAS
// ═══════════════════════════════════════════════════════════════════
// Bot automático para receber pedidos via WhatsApp
// ═══════════════════════════════════════════════════════════════════

require('dotenv').config();
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

// VERSÃO: 2024-12-04 - Fluxo passo a passo sem validação

// ─── CONSTANTES ───
const client = new Client({
    authStrategy: new LocalAuth()
});

// Armazena o estado de conversa de cada usuário
const userStages = {};
// Armazena dados temporários do pedido (nome, pedido, endereço)
const userData = {};
// Armazena usuários em modo atendimento (para ignorar bot)
const userInAttendance = {};
// Tempo de inatividade antes de resetar a conversa (30 minutos)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
// Tempo para ignorar cliente após pedido/atendimento (15 minutos)
const ATTENDANCE_TIMEOUT = 15 * 60 * 1000;
// Número do proprietário para receber notificações de pedidos
const ownerNumber = process.env.OWNER_NUMBER || '5592999130838@c.us';

console.log('🍽️ BOT PAPALEGUAS iniciando...');

// ─── FUNÇÕES AUXILIARES ───

/** Aguarda X milissegundos */
const delay = ms => new Promise(res => setTimeout(res, ms));

/** Verifica se mensagem é um gatilho para iniciar (oi, olá, menu, etc) */
const isInitialTrigger = text => 
    /(oi|ola|olá|menu|boa tarde|boa noite|bom dia|oi tudo|olá tudo|e aí|oq|start|help)/i.test(text);

// ─── INICIALIZAR CLIENTE ───

client.on('qr', qr => {
    console.log('\n📱 QR CODE gerado! Escaneie com WhatsApp Web:\n');
    qrcode.generate(qr, { small: true });
    
    // Log detalhado da URL
    console.log('\n' + '═'.repeat(70));
    console.log('🔗 QR CODE URL:');
    console.log('═'.repeat(70));
    console.log(qr);
    console.log('═'.repeat(70));
    console.log('💡 Dica: Use esta URL para gerar um QR code externo!');
    console.log('═'.repeat(70) + '\n');
});

client.on('ready', () => {
    console.log('✅ Bot conectado e pronto para receber pedidos!');
});

client.on('error', error => {
    console.error('❌ Erro:', error.message);
});

client.initialize().catch(error => {
    console.error('❌ Falha ao inicializar:', error.message);
    process.exit(1);
});

// ─── MENSAGENS DO BOT ───

const RESPONSES = {
    // Menu inicial
    BOAS_VINDAS: 'Olá! Bem-vindo(a) ao Restaurante e Lanchonete PAPALEGUAS 🍽️\n\n📋 *CARDÁPIO:* https://drive.google.com/file/d/1-exemplo-cardapio/view?usp=drive_link\n⏰ *HORÁRIO:* Todos os dias 5:30 - 23:30\n💰 *Taxa de Entrega:* R$ 3,00\n\nEscolha uma opção:\n\n1️⃣ Fazer um Pedido\n2️⃣ Falar com Atendente',
    
    // Links e informações
    CARDAPIO_LINK: 'https://drive.google.com/file/d/1-exemplo-cardapio/view?usp=drive_link',
    CARDAPIO_MSG: (link) => `📋 *CARDÁPIO COMPLETO*\n\n👉 ${link}\n\nDeseja fazer um pedido? Digite *2*`,
    HORARIO_FUNCIONAMENTO: '⏰ *HORÁRIO DE FUNCIONAMENTO*\n• Todos os dias: 5:30 - 23:30\n\n💰 Taxa de Entrega: R$ 3,00',
    
    // Fluxo de pedido - removido pedido de nome
    
    AGUARDANDO_ENDERECO: '*Seu Endereço de Entrega?*\n\n(Rua, número)',
    
    AGUARDANDO_PAGAMENTO: '*Como você prefere pagar?*\n\n1️⃣ Pix\n2️⃣ Dinheiro\n3️⃣ Cartão na entrega',
    
    PEDIDO_TUDO_JUNTO: '⚠️ *Envie seu pedido com as informações abaixo em UMA MENSAGEM só:*\n\n🍽️ Pedido: O que você quer\n📍 Endereço: Rua, número\n🏘️ Ponto de Referência: (ex: perto da farmácia)\n💳 Pagamento: Pix / Dinheiro / Cartão\n\n(Envie tudo junto!)',
    
    PEDIDO_CONFIRMACAO: (mensagem) => 
        `⚠️ *CONFIRME SEU PEDIDO*\n\n${mensagem}\n\n☝️ Está correto? Digite *SIM* para confirmar ou *NÃO* para enviar novamente.`,
    
    PEDIDO_CONFIRMADO: (pedido, endereco, pagamento) => 
        `✅ *Pedido Confirmado!*\n\n🍽️ ${pedido}\n📍 ${endereco}\n💳 Pagamento: ${pagamento}\n\n⏳ *Um atendente entrará em contato em breve para:*\n• Confirmar seu pedido\n• Informar o valor total\n• Informar o tempo de entrega\n\nObrigado por escolher PAPALEGUAS! 🍽️`,
    
    PEDIDO_EM_PROCESSO: '⏳ *Seu Pedido está sendo Processado!*\n\nLogo um atendente irá confirmar o pedido e informar:\n✅ Os detalhes do pedido\n💰 O valor total\n\nObrigado por escolher o Restaurante PAPALEGUAS! 🍽️',
    
    // Aviso para o dono
    PEDIDO_AVISO_DONO: (nome, numeroCliente, pedido, endereco) => 
        `🚨 *NOVO PEDIDO* 🚨\n\n👤 Cliente: ${nome}\n📱 https://wa.me/${numeroCliente}\n🍽️ Pedido: ${pedido}\n📍 Endereço: ${endereco}\n💰 Taxa: R$ 3,00\n\n👉 *AÇÃO:* Confirme o pedido, informe o valor total + taxa e o tempo de entrega.`,
    
    // Suporte
    SUPORTE_INICIO: 'Um atendente vai responder em breve! 🎯\nDigite *Menu* para voltar.',
    SUPORTE_AVISO_DONO: (numero) => `👤 *CLIENTE SOLICITANDO ATENDIMENTO*\n\n📱 https://wa.me/${numero}`,
    
    // Mensagens padrão
    INATIVIDADE: 'Ficamos inativos por um tempo. Digite *Menu* para recomeçar.',
    RESPOSTA_PADRAO: 'Não entendi. Digite *Menu* para ver as opções.',
};
      // Mensagens removidas: pedido agora é livre

client.on('message', async (msg) => {
  try {
    const from = msg.from;
    const body = (msg.body || '').trim();

    // 🛑 Ignora grupos
    if (!from || from.endsWith('@g.us')) {
        console.log(`⏭️ Grupo ignorado: ${from}`);
        return;
    }

    console.log(`\n📨 Mensagem recebida de ${from}: "${body}"`);

    // 🔇 VERIFICAR SE ESTÁ EM ATENDIMENTO - IGNORAR BOT
    if (userInAttendance[from]) {
        const now = Date.now();
        const timeInAttendance = now - userInAttendance[from].startTime;
        
        // Se passou o tempo de atendimento, liberar cliente
        if (timeInAttendance > ATTENDANCE_TIMEOUT) {
            console.log(`✅ Cliente ${from} liberado do atendimento`);
            delete userInAttendance[from];
            delete userStages[from];
            delete userData[from];
        } else {
            // Ainda em atendimento - IGNORAR TODAS AS MENSAGENS DO BOT
            console.log(`🔇 Cliente ${from} em atendimento - ignorando mensagem`);
            return;
        }
    }

    let state = userStages[from] || null;
    const now = Date.now();

    // ⏱️ Reset se inativo por 30 minutos
    if (state && userData[from]?.lastActivity && (now - userData[from].lastActivity > INACTIVITY_TIMEOUT)) {
        state = null;
        delete userStages[from];
        delete userData[from];
    }

    // Atualizar última atividade
    if (state !== 'SUPORTE') {
        userData[from] = userData[from] || {};
        userData[from].lastActivity = now;
    }

    // UX: simula digitação
    await msg.getChat().then(chat => chat.sendStateTyping());
    await delay(300);

    // Volta ao menu a partir de SUPORTE
    if (state === 'SUPORTE' && isInitialTrigger(body)) {
        await client.sendMessage(from, RESPONSES.BOAS_VINDAS);
        userStages[from] = 'MENU_PRINCIPAL';
        return;
    }

    // Inicia conversa
    if (!state && isInitialTrigger(body)) {
      await client.sendMessage(from, RESPONSES.BOAS_VINDAS);
      userStages[from] = 'MENU_PRINCIPAL';
      return;
    }

    // ═══════════════════════════════════════════════════════════════════
    // 📋 MENU PRINCIPAL
    // ═══════════════════════════════════════════════════════════════════
    if (state === 'MENU_PRINCIPAL') {
      if (body === '1') {
        await client.sendMessage(from, RESPONSES.PEDIDO_TUDO_JUNTO);
        userStages[from] = 'AGUARDANDO_DADOS_COMPLETOS';
        userData[from] = userData[from] || {};
        return;
      }
      if (body === '2') {
        const numeroCliente = from.replace('@c.us', '');
        await client.sendMessage(ownerNumber, RESPONSES.SUPORTE_AVISO_DONO(numeroCliente));
        await client.sendMessage(from, RESPONSES.SUPORTE_INICIO);
        
        // 🔇 MARCAR CLIENTE EM ATENDIMENTO - IGNORAR BOT POR 15 MIN
        userInAttendance[from] = { startTime: Date.now() };
        delete userStages[from];
        return;
      }
      await client.sendMessage(from, RESPONSES.RESPOSTA_PADRAO);
      return;
    }

    // ═══════════════════════════════════════════════════════════════════
    // 🛍️ FLUXO DE PEDIDO - TUDO DE UMA VEZ
    // ═══════════════════════════════════════════════════════════════════

    // ACEITAR PEDIDO COMPLETO EM UMA MENSAGEM
    if (state === 'AGUARDANDO_DADOS_COMPLETOS') {
      // Aceita a mensagem completa do pedido
      const pedidoCompleto = body.trim();
      
      // Armazenar o pedido para confirmação
      userData[from] = userData[from] || {};
      userData[from].pedidoCompleto = pedidoCompleto;
      
      // Pedir confirmação
      await client.sendMessage(from, RESPONSES.PEDIDO_CONFIRMACAO(pedidoCompleto));
      
      // Mudar para estado de confirmação
      userStages[from] = 'AGUARDANDO_CONFIRMACAO';
      return;
    }

    // ═══════════════════════════════════════════════════════════════════
    // ✅ CONFIRMAR PEDIDO
    // ═══════════════════════════════════════════════════════════════════

    if (state === 'AGUARDANDO_CONFIRMACAO') {
      if (/^sim$/i.test(body)) {
        // PEDIDO CONFIRMADO - ENVIAR AO DONO
        const pedidoCompleto = userData[from].pedidoCompleto;
        const numeroCliente = from.replace('@c.us', '');
        
        const ownerMessage = `🚨 *NOVO PEDIDO* 🚨\n\n📱 Cliente: https://wa.me/${numeroCliente}\n\n📝 *Mensagem do Cliente:*\n${pedidoCompleto}`;
        await client.sendMessage(ownerNumber, ownerMessage);

        // Confirmar ao cliente
        await client.sendMessage(from, RESPONSES.PEDIDO_EM_PROCESSO);
        
        // 🔇 MARCAR CLIENTE EM ATENDIMENTO - IGNORAR BOT POR 15 MIN
        userInAttendance[from] = { startTime: Date.now() };
        delete userStages[from];
        delete userData[from];
        return;
      } else if (/^não|nao$/i.test(body)) {
        // PEDIDO NÃO CONFIRMADO - PEDIR NOVAMENTE
        await client.sendMessage(from, RESPONSES.PEDIDO_TUDO_JUNTO);
        userStages[from] = 'AGUARDANDO_DADOS_COMPLETOS';
        delete userData[from].pedidoCompleto;
        return;
      } else {
        // RESPOSTA INVÁLIDA
        await client.sendMessage(from, '⚠️ Por favor, digite *SIM* ou *NÃO*');
        return;
      }
    }

    // Resposta padrão se não encaixar em nenhum estado
    if (state && state !== 'SUPORTE') {
        await client.sendMessage(from, RESPONSES.RESPOSTA_PADRAO);
    }
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
});
