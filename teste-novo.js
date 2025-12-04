// ═══════════════════════════════════════════════════════════════════
//  🧪 TESTE LOCAL DO BOT - FLUXO UNIFICADO
// ═══════════════════════════════════════════════════════════════════

const readline = require('readline');

const userStages = {};
const userData = {};

const RESPONSES = {
    BOAS_VINDAS: 'Olá! Bem-vindo(a) ao Restaurante e Lanchonete PAPALEGUAS 🍽️\n\n📋 *CARDÁPIO:* https://drive.google.com/file/d/1-exemplo-cardapio/view?usp=drive_link\n⏰ *HORÁRIO:* Todos os dias 5:30 - 23:30\n💰 *Taxa de Entrega:* R$ 3,00\n\nEscolha uma opção:\n\n1️⃣ Fazer um Pedido\n2️⃣ Falar com Atendente',
    
    CARDAPIO_LINK: 'https://drive.google.com/file/d/1-exemplo-cardapio/view?usp=drive_link',
    CARDAPIO_MSG: (link) => `📋 *CARDÁPIO COMPLETO*\n\n👉 ${link}\n\nDeseja fazer um pedido? Digite *2*`,
    HORARIO_FUNCIONAMENTO: '⏰ *HORÁRIO DE FUNCIONAMENTO*\n• Todos os dias: 5:30 - 23:30\n\n💰 Taxa de Entrega: R$ 3,00',
    
    PEDIDO_TUDO_JUNTO: 'Por favor, envie seu pedido com os seguintes dados:\n\n*📝 Formato:*\nNome: Seu Nome Completo\nPedido: O que você quer comer\nEndereço: Rua, número, bairro\nPagamento: 1 (Pix) / 2 (Dinheiro) / 3 (Cartão)',
    
    PEDIDO_CONFIRMACAO: (nome, pedido, endereco) => 
        `✅ *RESUMO DO PEDIDO*\n\n👤 Nome: ${nome}\n🍽️ Pedido: ${pedido}\n📍 Endereço: ${endereco}\n💰 Taxa: R$ 3,00\n\nTudo certo? Digite *SIM* ou *NÃO*`,
    
    PEDIDO_CONFIRMADO: (nome, pedido, endereco, pagamento) => 
        `✅ *Pedido Confirmado!*\n\n👤 ${nome}\n🍽️ ${pedido}\n📍 ${endereco}\n💳 Pagamento: ${pagamento}\n\n⏳ *Um atendente entrará em contato em breve para:*\n• Confirmar seu pedido\n• Informar o valor total\n• Informar o tempo de entrega\n\nObrigado por escolher PAPALEGUAS! 🍽️`,
    
    SUPORTE_INICIO: 'Um atendente vai responder em breve! 🎯\nDigite *Menu* para voltar.',
    
    INATIVIDADE: 'Ficamos inativos por um tempo. Digite *Menu* para recomeçar.',
    RESPOSTA_PADRAO: 'Não entendi. Digite *Menu* para ver as opções.',
};

const isInitialTrigger = text => /(oi|ola|olá|menu|boa tarde|boa noite|bom dia)/i.test(text);

function processarMensagem(mensagem) {
    const body = mensagem.trim();
    const from = 'usuario_teste';
    
    let state = userStages[from] || null;
    
    // Volta ao menu
    if (state === 'SUPORTE' && isInitialTrigger(body)) {
        userStages[from] = 'MENU_PRINCIPAL';
        return RESPONSES.BOAS_VINDAS;
    }
    
    // Inicia conversa
    if (!state && isInitialTrigger(body)) {
        userStages[from] = 'MENU_PRINCIPAL';
        return RESPONSES.BOAS_VINDAS;
    }
    
    // MENU PRINCIPAL
    if (state === 'MENU_PRINCIPAL') {
        if (body === '1') {
            userStages[from] = 'AGUARDANDO_DADOS_COMPLETOS';
            userData[from] = userData[from] || {};
            return RESPONSES.PEDIDO_TUDO_JUNTO;
        }
        if (body === '2') {
            userStages[from] = 'SUPORTE';
            return RESPONSES.SUPORTE_INICIO;
        }
        return RESPONSES.RESPOSTA_PADRAO;
    }
    
    // FLUXO DE PEDIDO - TUDO DE UMA VEZ
    if (state === 'AGUARDANDO_DADOS_COMPLETOS') {
        const linhas = body.split('\n').map(l => l.trim());
        let nome = '', pedido = '', endereco = '', pagamento = '';
        
        linhas.forEach(linha => {
            if (linha.toLowerCase().startsWith('nome:')) {
                nome = linha.replace(/^nome:\s*/i, '').trim();
            } else if (linha.toLowerCase().startsWith('pedido:')) {
                pedido = linha.replace(/^pedido:\s*/i, '').trim();
            } else if (linha.toLowerCase().startsWith('endereço:') || linha.toLowerCase().startsWith('endereco:')) {
                endereco = linha.replace(/^endere[çc]o:\s*/i, '').trim();
            } else if (linha.toLowerCase().startsWith('pagamento:')) {
                pagamento = linha.replace(/^pagamento:\s*/i, '').trim();
            }
        });
        
        // Validar
        if (!nome || !pedido || !endereco || !pagamento) {
            return '⚠️ Por favor, preencha todos os campos corretamente.\n\n' + RESPONSES.PEDIDO_TUDO_JUNTO;
        }
        
        const pagamentoMap = {
            '1': 'Pix',
            '2': 'Dinheiro',
            '3': 'Cartão na entrega'
        };
        
        if (!pagamentoMap[pagamento]) {
            return '⚠️ Pagamento inválido. Use 1 (Pix), 2 (Dinheiro) ou 3 (Cartão).';
        }
        
        userData[from].nome = nome;
        userData[from].pedido = pedido;
        userData[from].endereco = endereco;
        userData[from].pagamento = pagamentoMap[pagamento];
        
        userStages[from] = 'PEDIDO_AGUARDANDO_CONFIRMACAO';
        return RESPONSES.PEDIDO_CONFIRMACAO(nome, pedido, endereco);
    }
    
    if (state === 'PEDIDO_AGUARDANDO_CONFIRMACAO') {
        const confirmacao = body.toUpperCase().trim();
        if (confirmacao === 'SIM' || confirmacao === 'S') {
            const { nome, pedido, endereco, pagamento } = userData[from];
            userStages[from] = 'PEDIDO_CONFIRMADO';
            return RESPONSES.PEDIDO_CONFIRMADO(nome, pedido, endereco, pagamento) + '\n\n🚨 [AVISO ENVIADO PARA O DONO]';
        }
        if (confirmacao === 'NÃO' || confirmacao === 'NAO' || confirmacao === 'N') {
            userStages[from] = 'MENU_PRINCIPAL';
            delete userData[from];
            return `Pedido cancelado.\n\n${RESPONSES.BOAS_VINDAS}`;
        }
        return '⚠️ Digite *SIM* ou *NÃO*';
    }
    
    if (state === 'PEDIDO_CONFIRMADO') {
        if (isInitialTrigger(body)) {
            userStages[from] = 'MENU_PRINCIPAL';
            delete userData[from];
            return RESPONSES.BOAS_VINDAS;
        }
    }
    
    if (state !== 'SUPORTE' && !isInitialTrigger(body)) {
        return RESPONSES.RESPOSTA_PADRAO;
    }
    
    return RESPONSES.RESPOSTA_PADRAO;
}

// ─── INTERFACE INTERATIVA ───

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n' + '='.repeat(70));
console.log('🧪 TESTE LOCAL DO BOT PAPALEGUAS');
console.log('='.repeat(70));
console.log('\nDigite suas mensagens e veja as respostas do bot!');
console.log('Digite "sair" para encerrar.\n');

function fazerPergunta() {
    rl.question('👤 Você: ', (mensagem) => {
        if (mensagem.toLowerCase() === 'sair') {
            console.log('\n👋 Teste encerrado!');
            rl.close();
            return;
        }
        
        const resposta = processarMensagem(mensagem);
        console.log('\n🤖 Bot:', resposta, '\n');
        fazerPergunta();
    });
}

fazerPergunta();
