/* ==========================================================
   Briefing ADM – lógica do assistente por etapas
   ========================================================== */
(function () {
  'use strict';

  const ETAPAS = window.ADM_ETAPAS;
  const CONFIG = window.ADM_CONFIG || {};
  const CHAVE = 'adm_briefing_v2';
  const TOTAL = ETAPAS.length + 1; // + revisão
  const TIPOS_INPUT = { texto: 'text', email: 'email', tel: 'tel', url: 'url' };

  const $ = (id) => document.getElementById(id);
  const form = $('formBriefing');
  const todosCampos = ETAPAS.flatMap((e) => e.campos.map((c) => Object.assign({ etapa: e }, c)));

  let estado = { etapa: 0, maxVisitada: 0, respostas: {}, id: null };
  let ultimoEnvio = null;

  // ---------- Utilitário para criar elementos ----------
  function el(tag, attrs, ...filhos) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === false || v == null) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v === true ? '' : v);
    }
    filhos.flat().forEach((f) => f != null && n.append(f));
    return n;
  }

  // ---------- Construção das etapas a partir de perguntas.js ----------
  function tituloCampo(c, tag, attrs) {
    return el(tag, Object.assign({ class: 'campo__titulo' }, attrs), c.titulo,
      c.obrigatorio ? el('span', { class: 'obrigatorio', 'aria-hidden': 'true', text: '*' })
                    : el('span', { class: 'opcional', text: '(opcional)' }));
  }

  function criarCampo(c) {
    const idAjuda = c.ajuda ? 'ajuda-' + c.id : null;
    const idErro = 'erro-' + c.id;
    const descr = [idAjuda, idErro].filter(Boolean).join(' ');
    const ajuda = c.ajuda ? el('p', { class: 'campo__ajuda', id: idAjuda, text: c.ajuda }) : null;
    const erro = el('p', { class: 'erro', id: idErro, hidden: true });
    const classe = 'campo' + (c.meia ? ' campo--meia' : '');

    if (c.tipo === 'escolha' || c.tipo === 'multipla') {
      const tipo = c.tipo === 'escolha' ? 'radio' : 'checkbox';
      const opcoes = c.opcoes.map((o) =>
        el('label', { class: 'opcao' },
          el('input', { type: tipo, name: c.id, value: o }),
          el('span', { text: o })));
      return el('fieldset', { class: classe, 'data-campo': c.id, 'aria-describedby': descr, 'aria-required': c.obrigatorio ? 'true' : false },
        tituloCampo(c, 'legend'), ajuda, el('div', { class: 'opcoes' }, opcoes), erro);
    }

    let entrada;
    const comuns = { id: c.id, name: c.id, class: 'entrada', 'aria-describedby': descr, required: !!c.obrigatorio };
    if (c.tipo === 'area') {
      entrada = el('textarea', Object.assign({ rows: c.linhas || 3, placeholder: c.exemplo }, comuns));
    } else if (c.tipo === 'lista') {
      entrada = el('select', comuns,
        el('option', { value: '', text: 'Selecione…' }),
        c.opcoes.map((o) => el('option', { value: o, text: o })));
    } else {
      entrada = el('input', Object.assign({
        type: TIPOS_INPUT[c.tipo] || 'text', placeholder: c.exemplo, autocomplete: c.auto,
        inputmode: c.tipo === 'tel' ? 'tel' : c.tipo === 'email' ? 'email' : null
      }, comuns));
    }
    return el('div', { class: classe, 'data-campo': c.id }, tituloCampo(c, 'label', { for: c.id }), ajuda, entrada, erro);
  }

  function construirEtapas() {
    const corpo = $('corpoEtapas');
    ETAPAS.forEach((e, i) => {
      corpo.append(el('section', { class: 'etapa', 'data-etapa': i, hidden: true, 'aria-labelledby': 'titulo-' + e.id },
        el('header', { class: 'etapa__cabecalho' },
          el('span', { class: 'etapa__numero', 'aria-hidden': 'true', text: String(i + 1).padStart(2, '0') }),
          el('div', {}, el('h2', { id: 'titulo-' + e.id, tabindex: '-1', text: e.titulo }), el('p', { text: e.resumo }))),
        el('div', { class: 'grelha' }, e.campos.map(criarCampo))));
    });
    $('numeroRevisao').textContent = String(TOTAL).padStart(2, '0');
    $('numeroRevisao').setAttribute('aria-hidden', 'true');

    const lista = $('listaEtapas');
    const nomes = ETAPAS.map((e) => e.curto || e.titulo).concat('Revisão');
    nomes.forEach((nome, i) => {
      lista.append(el('li', { class: 'etapas__item' },
        el('button', { type: 'button', 'data-ir': i, onclick: () => irPara(i) },
          el('span', { class: 'etapas__bola', text: i + 1 }),
          el('span', { class: 'etapas__nome', text: nome }))));
    });
  }

  // ---------- Ler / escrever valores ----------
  function lerCampo(c) {
    if (c.tipo === 'multipla') {
      return Array.from(form.querySelectorAll(`input[name="${c.id}"]:checked`)).map((i) => i.value);
    }
    if (c.tipo === 'escolha') {
      const sel = form.querySelector(`input[name="${c.id}"]:checked`);
      return sel ? sel.value : '';
    }
    return form.elements[c.id].value.trim();
  }

  function escreverCampo(c, valor) {
    if (valor == null) return;
    if (c.tipo === 'multipla' || c.tipo === 'escolha') {
      const lista = Array.isArray(valor) ? valor : [valor];
      form.querySelectorAll(`input[name="${c.id}"]`).forEach((i) => { i.checked = lista.includes(i.value); });
    } else {
      form.elements[c.id].value = valor;
    }
  }

  const textoResposta = (v) => (Array.isArray(v) ? v.join(', ') : (v || ''));

  function lerTudo() {
    const r = {};
    todosCampos.forEach((c) => { r[c.id] = lerCampo(c); });
    return r;
  }

  // ---------- Rascunho automático ----------
  function guardar() {
    estado.respostas = lerTudo();
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (_) { /* navegação privada */ }
  }
  function carregar() {
    try {
      const s = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      if (!s || !s.respostas) return false;
      estado = Object.assign(estado, s);
      todosCampos.forEach((c) => escreverCampo(c, s.respostas[c.id]));
      return Object.values(s.respostas).some((v) => (Array.isArray(v) ? v.length : v));
    } catch (_) { return false; }
  }
  function limpar() {
    try { localStorage.removeItem(CHAVE); } catch (_) { /* ignora */ }
  }

  // ---------- Validação ----------
  function validarCampo(c) {
    const caixa = form.querySelector(`[data-campo="${c.id}"]`);
    const erro = $('erro-' + c.id);
    const v = lerCampo(c);
    const vazio = Array.isArray(v) ? v.length === 0 : v === '';
    let msg = '';

    if (c.obrigatorio && vazio) {
      msg = c.tipo === 'multipla' ? 'Escolha pelo menos uma opção.'
          : c.tipo === 'escolha' || c.tipo === 'lista' ? 'Escolha uma opção.'
          : 'Este campo é obrigatório.';
    } else if (!vazio && c.tipo === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      msg = 'Indique um e-mail válido (ex: nome@empresa.co.mz).';
    } else if (!vazio && c.tipo === 'tel' && v.replace(/\D/g, '').length < 9) {
      msg = 'Indique um número válido, com pelo menos 9 dígitos.';
    }

    caixa.classList.toggle('campo--invalido', !!msg);
    erro.textContent = msg;
    erro.hidden = !msg;
    const alvo = caixa.querySelector('.entrada');
    if (alvo) alvo.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }

  function validarEtapa(i) {
    let primeiro = null;
    ETAPAS[i].campos.forEach((c) => {
      if (!validarCampo(c) && !primeiro) primeiro = c;
    });
    if (primeiro) {
      const caixa = form.querySelector(`[data-campo="${primeiro.id}"]`);
      (caixa.querySelector('.entrada, input') || caixa).focus({ preventScroll: true });
      caixa.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return !primeiro;
  }

  // Revalida em tempo real só os campos que já mostraram erro
  form.addEventListener('input', (ev) => {
    const caixa = ev.target.closest('[data-campo]');
    if (caixa && caixa.classList.contains('campo--invalido')) {
      validarCampo(todosCampos.find((c) => c.id === caixa.dataset.campo));
    }
  });
  form.addEventListener('change', (ev) => {
    const caixa = ev.target.closest('[data-campo]');
    if (caixa && caixa.classList.contains('campo--invalido')) {
      validarCampo(todosCampos.find((c) => c.id === caixa.dataset.campo));
    }
  });
  form.addEventListener('focusout', (ev) => {
    const caixa = ev.target.closest('[data-campo]');
    if (!caixa || !ev.target.classList.contains('entrada')) return;
    const c = todosCampos.find((x) => x.id === caixa.dataset.campo);
    if (ev.target.value.trim() !== '' && (c.tipo === 'email' || c.tipo === 'tel')) validarCampo(c);
  });

  // ---------- Navegação ----------
  function mostrar(i, focar) {
    estado.etapa = i;
    estado.maxVisitada = Math.max(estado.maxVisitada, i);
    const revisao = i === ETAPAS.length;

    form.querySelectorAll('[data-etapa]').forEach((s) => {
      s.hidden = revisao ? s.dataset.etapa !== 'revisao' : s.dataset.etapa !== String(i);
    });
    if (revisao) construirRevisao();

    $('btnVoltar').style.visibility = i === 0 ? 'hidden' : 'visible';
    $('btnSeguinte').hidden = revisao;
    $('btnEnviar').hidden = !revisao;
    $('btnSeguinte').firstChild.textContent = i === ETAPAS.length - 1 ? 'Rever respostas ' : 'Continuar ';
    $('erroEnvio').hidden = true;

    document.querySelectorAll('.etapas__item').forEach((li, n) => {
      li.classList.toggle('etapas__item--atual', n === i);
      li.classList.toggle('etapas__item--feita', n < i || (n <= estado.maxVisitada && n !== i));
      const b = li.querySelector('button');
      b.disabled = n > estado.maxVisitada;
      if (n === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    const nome = i < ETAPAS.length ? ETAPAS[i].titulo : 'Revisão & envio';
    $('etapaMovel').textContent = `Etapa ${i + 1} de ${TOTAL} · ${nome}`;
    $('barraProgresso').style.width = Math.round(((i + 1) / TOTAL) * 100) + '%';

    guardar();
    if (focar) {
      const topo = document.querySelector('.etapas');
      window.scrollTo({ top: topo.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
      const titulo = revisao ? $('titulo-revisao') : $('titulo-' + ETAPAS[i].id);
      titulo.focus({ preventScroll: true });
    }
  }

  function irPara(i) {
    if (i > estado.maxVisitada) return;
    // Ao saltar para a frente, as etapas intermédias têm de estar válidas
    for (let n = estado.etapa; n < Math.min(i, ETAPAS.length); n++) {
      if (!validarEtapa(n)) { if (n !== estado.etapa) mostrar(n, false); return; }
    }
    mostrar(i, true);
  }

  $('btnSeguinte').addEventListener('click', () => {
    if (!validarEtapa(estado.etapa)) return;
    mostrar(estado.etapa + 1, true);
  });
  $('btnVoltar').addEventListener('click', () => mostrar(Math.max(0, estado.etapa - 1), true));

  // Enter num campo de texto curto avança em vez de submeter
  form.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && ev.target.tagName === 'INPUT' && ev.target.type !== 'checkbox' && estado.etapa < ETAPAS.length) {
      ev.preventDefault();
      $('btnSeguinte').click();
    }
  });

  let temporizador;
  form.addEventListener('input', () => { clearTimeout(temporizador); temporizador = setTimeout(guardar, 400); });
  form.addEventListener('change', guardar);

  // ---------- Revisão ----------
  function construirRevisao() {
    const r = lerTudo();
    const caixa = $('resumoRevisao');
    caixa.replaceChildren();
    ETAPAS.forEach((e, i) => {
      caixa.append(el('div', { class: 'revisao__bloco' },
        el('div', { class: 'revisao__topo' },
          el('h3', { text: `${i + 1}. ${e.titulo}` }),
          el('button', { type: 'button', class: 'ligacao', onclick: () => mostrar(i, true), 'aria-label': 'Editar ' + e.titulo, text: 'Editar' })),
        el('dl', {}, e.campos.map((c) => {
          const t = textoResposta(r[c.id]);
          return el('div', { class: 'revisao__linha' },
            el('dt', { text: c.titulo }),
            el('dd', { class: t ? '' : 'vazio', text: t || 'Não respondido' }));
        }))));
    });
  }

  // ---------- Envio ----------
  function gerarId() {
    const d = new Date();
    const data = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    const aleat = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `ADM-${data}-${aleat}`;
  }

  function montarPayload(respostas) {
    const agora = new Date();
    const plano = {};
    todosCampos.forEach((c) => { plano[c.id] = textoResposta(respostas[c.id]); });
    return {
      id: estado.id,
      enviadoEm: agora.toISOString(),
      enviadoEmLocal: agora.toLocaleString('pt-PT', { dateStyle: 'long', timeStyle: 'short' }),
      respostas: plano,
      colunas: todosCampos.map((c) => ({ chave: c.id, titulo: c.titulo, etapa: c.etapa.titulo })),
      website: $('website').value // armadilha anti-spam
    };
  }

  async function enviar(payload) {
    const url = (CONFIG.WEBHOOK_URL || '').trim();
    if (!url) {
      console.warn('[ADM] WEBHOOK_URL vazio em js/config.js: modo demonstração, nada foi enviado.');
      return { modo: 'demo' };
    }
    const corpo = JSON.stringify(payload);
    try {
      // Sem cabeçalhos personalizados = pedido "simples" (sem preflight CORS), aceite pelo Apps Script
      const resp = await fetch(url, { method: 'POST', body: corpo, redirect: 'follow' });
      const json = await resp.json();
      if (!json.ok) throw new Error(json.erro || 'O servidor recusou o envio.');
      return { modo: 'confirmado' };
    } catch (err) {
      if (err instanceof TypeError) {
        // Falha de rede ou CORS: tenta de novo sem ler a resposta.
        // O Apps Script ignora duplicados pelo ID, por isso é seguro repetir.
        await fetch(url, { method: 'POST', mode: 'no-cors', body: corpo });
        return { modo: 'enviado' };
      }
      throw err;
    }
  }

  function estadoBotao(botao, carregando, texto) {
    botao.disabled = carregando;
    botao.classList.toggle('a-carregar', carregando);
    botao.querySelector('.botao__texto').textContent = texto;
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    for (let i = 0; i < ETAPAS.length; i++) {
      if (!validarEtapa(i)) { mostrar(i, false); validarEtapa(i); return; }
    }
    const consent = $('consentimento');
    $('erro-consentimento').hidden = consent.checked;
    if (!consent.checked) { consent.focus(); return; }

    const botao = $('btnEnviar');
    estadoBotao(botao, true, 'A enviar');
    $('erroEnvio').hidden = true;

    if (!estado.id) estado.id = gerarId();
    guardar();
    const respostas = lerTudo();
    const payload = montarPayload(respostas);

    try {
      const resultado = payload.website ? { modo: 'confirmado' } : await enviar(payload);
      ultimoEnvio = payload;
      if (resultado.modo !== 'demo') limpar();
      mostrarSucesso(resultado.modo, payload);
    } catch (err) {
      console.error('[ADM] Erro no envio:', err);
      $('erroEnvio').textContent = 'Não foi possível enviar o briefing. Verifique a ligação à internet e tente novamente. As suas respostas continuam guardadas.';
      $('erroEnvio').hidden = false;
    } finally {
      estadoBotao(botao, false, 'Enviar briefing');
    }
  });

  function mostrarSucesso(modo, payload) {
    const nome = (payload.respostas.nome || '').split(' ')[0];
    const msg = {
      confirmado: `Obrigado${nome ? ', ' + nome : ''}! A equipa da ADM já recebeu o seu briefing e entrará em contacto em breve. Guarde o PDF com as suas respostas.`,
      enviado: `Obrigado${nome ? ', ' + nome : ''}! O seu briefing foi enviado para a equipa da ADM. Guarde o PDF com as suas respostas.`,
      demo: 'Modo demonstração: o briefing NÃO foi enviado (falta configurar o WEBHOOK_URL). Pode descarregar o PDF na mesma.'
    }[modo];
    $('tituloSucesso').textContent = modo === 'demo' ? 'Briefing concluído' : 'Briefing enviado!';
    $('mensagemSucesso').textContent = msg;
    $('referencia').textContent = payload.id;

    form.hidden = true;
    document.querySelector('.etapas').hidden = true;
    $('intro').hidden = true;
    $('avisoRascunho').hidden = true;
    $('sucesso').hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    $('sucesso').focus({ preventScroll: true });
  }

  // ---------- PDF ----------
  $('btnPdf').addEventListener('click', async () => {
    const botao = $('btnPdf');
    if (!window.jspdf) {
      alert('O gerador de PDF ainda está a carregar. Tente novamente dentro de alguns segundos.');
      return;
    }
    estadoBotao(botao, true, 'A gerar PDF');
    try {
      await window.ADM_gerarPdf(ultimoEnvio, ETAPAS);
    } catch (err) {
      console.error('[ADM] Erro ao gerar PDF:', err);
      alert('Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      estadoBotao(botao, false, 'Descarregar PDF');
    }
  });

  // ---------- Recomeçar ----------
  function recomecar() {
    limpar();
    form.reset();
    form.querySelectorAll('.campo--invalido').forEach((c) => c.classList.remove('campo--invalido'));
    form.querySelectorAll('.erro').forEach((e) => { e.hidden = true; });
    estado = { etapa: 0, maxVisitada: 0, respostas: {}, id: null };
    ultimoEnvio = null;
    form.hidden = false;
    document.querySelector('.etapas').hidden = false;
    $('intro').hidden = false;
    $('sucesso').hidden = true;
    $('avisoRascunho').hidden = true;
    mostrar(0, false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  $('btnNovo').addEventListener('click', recomecar);
  $('btnRecomecar').addEventListener('click', () => {
    if (confirm('Apagar todas as respostas e começar do zero?')) recomecar();
  });

  // ---------- Arranque ----------
  $('ano').textContent = new Date().getFullYear();
  construirEtapas();
  if (carregar()) $('avisoRascunho').hidden = false;
  mostrar(Math.min(estado.etapa, ETAPAS.length), false);
})();
