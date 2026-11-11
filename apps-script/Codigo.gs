/**
 * Briefing ADM – recetor no Google Apps Script
 * ------------------------------------------------------------
 * 1. Guarda cada briefing numa linha da folha "Briefings".
 * 2. Envia um e-mail de notificação para a equipa da ADM.
 * 3. (Opcional) Envia um e-mail de confirmação ao cliente.
 *
 * Instalação: veja LEIA-ME.md (passo 2).
 * Este script deve ser criado DENTRO da Google Sheet
 * (Extensões > Apps Script), para saber onde guardar os dados.
 */

const CONFIG = {
  // E-mail(s) da equipa que recebem a notificação (separe vários por vírgula)
  EMAIL_EQUIPA: 'agenciadigitalmountain@gmail.com',
  NOME_REMETENTE: 'Briefing ADM',
  NOME_FOLHA: 'Briefings',
  // true = o cliente também recebe um e-mail a confirmar que o briefing chegou
  CONFIRMAR_AO_CLIENTE: false,
  // Limite de segurança para o tamanho de cada resposta
  MAX_CARACTERES: 5000
};

const COLUNAS_FIXAS = ['ID', 'Data de envio', 'Estado'];

/** Recebe o briefing enviado pelo site. */
function doPost(e) {
  try {
    const dados = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const resultado = processarBriefing(dados);
    return responder(resultado);
  } catch (err) {
    console.error(err);
    return responder({ ok: false, erro: String(err && err.message || err) });
  }
}

/** Abrir o URL /exec no navegador mostra se o serviço está ativo. */
function doGet() {
  return responder({ ok: true, servico: 'Briefing ADM', estado: 'ativo' });
}

function processarBriefing(dados) {
  // Armadilha anti-spam: o campo "website" é invisível para pessoas.
  if (dados.website) return { ok: true };

  if (!dados.id || !/^ADM-\d{8}-[A-Z0-9]{3,8}$/.test(dados.id)) throw new Error('ID inválido.');
  if (!dados.respostas || !Array.isArray(dados.colunas)) throw new Error('Dados incompletos.');

  const r = dados.respostas;
  ['nome', 'email', 'whatsapp', 'empresa'].forEach(function (k) {
    if (!r[k] || !String(r[k]).trim()) throw new Error('Falta o campo obrigatório: ' + k);
  });

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const folha = obterFolha();

    // Se o site reenviar o mesmo briefing (ex: falha de rede), não duplica.
    if (folha.getLastRow() > 1) {
      const existente = folha.getRange(2, 1, folha.getLastRow() - 1, 1)
        .createTextFinder(dados.id).matchEntireCell(true).findNext();
      if (existente) return { ok: true, id: dados.id, duplicado: true };
    }

    const cabecalhos = garantirCabecalhos(folha, dados.colunas);
    const porTitulo = {};
    dados.colunas.forEach(function (c) { porTitulo[c.titulo] = r[c.chave]; });

    const dataEnvio = new Date();
    const linha = cabecalhos.map(function (h) {
      if (h === 'ID') return dados.id;
      if (h === 'Data de envio') return dataEnvio;
      if (h === 'Estado') return 'Novo';
      return seguroParaFolha(porTitulo[h]);
    });
    folha.appendRow(linha);
    folha.getRange(folha.getLastRow(), 2).setNumberFormat('dd/mm/yyyy hh:mm');
  } finally {
    lock.releaseLock();
  }

  // Os e-mails não devem impedir o registo: se falharem, o briefing já está guardado.
  try { enviarEmailEquipa(dados); } catch (err) { console.error('Falha no e-mail à equipa:', err); }
  if (CONFIG.CONFIRMAR_AO_CLIENTE) {
    try { enviarConfirmacaoCliente(dados); } catch (err) { console.error('Falha no e-mail ao cliente:', err); }
  }
  return { ok: true, id: dados.id };
}

// ---------------- Folha ----------------

function obterFolha() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(CONFIG.NOME_FOLHA) || ss.insertSheet(CONFIG.NOME_FOLHA);
}

/** Cria a linha de cabeçalhos e acrescenta colunas para perguntas novas. */
function garantirCabecalhos(folha, colunas) {
  const titulos = COLUNAS_FIXAS.concat(colunas.map(function (c) { return String(c.titulo).slice(0, 200); }));
  let atuais = [];
  if (folha.getLastColumn() > 0) {
    atuais = folha.getRange(1, 1, 1, folha.getLastColumn()).getValues()[0].filter(String);
  }
  const novos = titulos.filter(function (t) { return atuais.indexOf(t) === -1; });
  if (novos.length) {
    folha.getRange(1, atuais.length + 1, 1, novos.length).setValues([novos]);
    atuais = atuais.concat(novos);
    const cab = folha.getRange(1, 1, 1, atuais.length);
    cab.setFontWeight('bold').setBackground('#04F412').setFontColor('#0E1A11').setWrap(true).setVerticalAlignment('middle');
    folha.setFrozenRows(1);
    folha.setFrozenColumns(1);
  }
  return atuais;
}

/** Impede que respostas começadas por = + - @ sejam lidas como fórmulas. */
function seguroParaFolha(valor) {
  let t = valor == null ? '' : String(valor).slice(0, CONFIG.MAX_CARACTERES);
  if (/^[=+\-@]/.test(t)) t = "'" + t;
  return t;
}

// ---------------- E-mails ----------------

function enviarEmailEquipa(dados) {
  const r = dados.respostas;
  const porEtapa = {};
  const ordem = [];
  dados.colunas.forEach(function (c) {
    if (!porEtapa[c.etapa]) { porEtapa[c.etapa] = []; ordem.push(c.etapa); }
    porEtapa[c.etapa].push(c);
  });

  let blocos = '';
  ordem.forEach(function (etapa) {
    blocos += '<h3 style="margin:28px 0 8px;font-size:15px;color:#067A12;border-bottom:2px solid #04F412;padding-bottom:6px">' + esc(etapa) + '</h3>' +
      '<table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">';
    porEtapa[etapa].forEach(function (c) {
      const v = r[c.chave];
      blocos += '<tr><td style="padding:8px 12px 8px 0;vertical-align:top;color:#5A665E;width:38%;border-bottom:1px solid #EEF2EE">' + esc(c.titulo) + '</td>' +
        '<td style="padding:8px 0;vertical-align:top;color:#0E1A11;border-bottom:1px solid #EEF2EE;white-space:pre-line">' +
        (v ? esc(v) : '<span style="color:#A3ACA6">—</span>') + '</td></tr>';
    });
    blocos += '</table>';
  });

  const urlFolha = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  const whats = String(r.whatsapp || '').replace(/\D/g, '');
  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;max-width:680px;margin:0 auto;color:#0E1A11">' +
      '<div style="background:#04F412;padding:18px 24px;border-radius:12px 12px 0 0">' +
        '<div style="font-size:12px;font-weight:bold;letter-spacing:1px">ADM • AGÊNCIA DIGITAL MOUNTAIN</div>' +
        '<div style="font-size:22px;font-weight:bold;margin-top:4px">Novo briefing recebido</div>' +
      '</div>' +
      '<div style="border:1px solid #E2E8E3;border-top:0;padding:24px;border-radius:0 0 12px 12px">' +
        '<p style="margin:0 0 4px;font-size:18px;font-weight:bold">' + esc(r.empresa) + '</p>' +
        '<p style="margin:0;color:#5A665E">' + esc(r.nome) + (r.cargo ? ' – ' + esc(r.cargo) : '') + '</p>' +
        '<p style="margin:16px 0 0">' +
          '<a href="mailto:' + esc(r.email) + '" style="display:inline-block;background:#0E1A11;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:bold;margin:0 8px 8px 0">Responder por e-mail</a>' +
          (whats ? '<a href="https://wa.me/' + whats + '" style="display:inline-block;background:#04F412;color:#0E1A11;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:bold;margin:0 8px 8px 0">Abrir WhatsApp</a>' : '') +
          '<a href="' + urlFolha + '" style="display:inline-block;border:1px solid #E2E8E3;color:#0E1A11;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:bold;margin:0 0 8px">Ver na Google Sheet</a>' +
        '</p>' +
        '<p style="margin:8px 0 0;font-size:12px;color:#8A948D">Referência ' + esc(dados.id) + ' • ' + esc(dados.enviadoEmLocal || '') + '</p>' +
        blocos +
      '</div>' +
    '</div>';

  const opcoes = {
    to: CONFIG.EMAIL_EQUIPA,
    subject: 'Novo briefing: ' + limitar(r.empresa, 60) + ' (' + limitar(r.nome, 40) + ')',
    htmlBody: html,
    name: CONFIG.NOME_REMETENTE
  };
  if (emailValido(r.email)) opcoes.replyTo = r.email;
  MailApp.sendEmail(opcoes);
}

function enviarConfirmacaoCliente(dados) {
  const r = dados.respostas;
  if (!emailValido(r.email)) return;
  const nome = String(r.nome || '').split(' ')[0];
  MailApp.sendEmail({
    to: r.email,
    subject: 'Recebemos o seu briefing – ADM',
    name: 'Agência Digital Mountain (ADM)',
    replyTo: CONFIG.EMAIL_EQUIPA.split(',')[0].trim(),
    htmlBody:
      '<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;color:#0E1A11">' +
        '<p>Olá ' + esc(nome) + ',</p>' +
        '<p>Obrigado por preencher o Briefing Estratégico da <strong>Agência Digital Mountain</strong>. ' +
        'A nossa equipa vai analisar as suas respostas e entrará em contacto em breve.</p>' +
        '<p style="color:#5A665E;font-size:13px">Referência: ' + esc(dados.id) + '</p>' +
        '<p>Até já,<br>Equipa ADM</p>' +
      '</div>'
  });
}

// ---------------- Utilitários ----------------

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
function esc(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function limitar(t, n) { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n - 1) + '…' : t; }
function emailValido(t) { return /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]{2,}$/.test(String(t || '')); }

/**
 * TESTE: execute esta função no editor (botão "Executar") para:
 *  - autorizar o script a usar a Sheet e o Gmail;
 *  - criar a folha "Briefings" e enviar um e-mail de teste à equipa.
 * Depois pode apagar a linha de teste na folha.
 */
function testarEnvio() {
  const agora = new Date();
  const id = 'ADM-' + Utilities.formatDate(agora, 'GMT', 'yyyyMMdd') + '-TESTE';
  const res = processarBriefing({
    id: id,
    enviadoEmLocal: agora.toLocaleString(),
    respostas: {
      nome: 'Cliente de Teste', email: CONFIG.EMAIL_EQUIPA.split(',')[0].trim(), whatsapp: '+258 84 000 0000',
      empresa: 'Empresa Teste', sector: 'Teste', produto: 'Isto é um teste do Briefing ADM.'
    },
    colunas: [
      { chave: 'nome', titulo: 'Nome completo', etapa: 'O seu negócio' },
      { chave: 'email', titulo: 'E-mail', etapa: 'O seu negócio' },
      { chave: 'whatsapp', titulo: 'WhatsApp', etapa: 'O seu negócio' },
      { chave: 'empresa', titulo: 'Nome do negócio / marca', etapa: 'O seu negócio' },
      { chave: 'sector', titulo: 'Sector / nicho', etapa: 'O seu negócio' },
      { chave: 'produto', titulo: 'Qual é o seu produto ou serviço principal?', etapa: 'Oferta & vendas' }
    ]
  });
  console.log(res);
}
