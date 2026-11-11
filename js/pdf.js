/* ==========================================================
   Briefing ADM – geração do PDF (jsPDF, texto real e vetorial)
   O PDF fica leve (~50 KB), nítido em qualquer zoom e o texto
   pode ser copiado/pesquisado, ao contrário de uma "fotografia".
   ========================================================== */
(function () {
  'use strict';

  const COR = {
    verde: [4, 244, 18],
    verdeTexto: [6, 122, 18],
    verdeSuave: [235, 254, 237],
    tinta: [14, 26, 17],
    texto: [45, 56, 49],
    cinza: [90, 102, 94],
    cinzaClaro: [150, 160, 153],
    borda: [226, 232, 227]
  };

  // As fontes padrão do PDF só têm o alfabeto latino (WinAnsi).
  // Emojis e outros símbolos são removidos para não aparecerem como lixo.
  const PERMITIDOS = /[^\n\t\x20-\x7E\xA0-\xFF–—‘’“”…•€]/g;
  const limpar = (t) => String(t || '').replace(/\r\n?/g, '\n').replace(PERMITIDOS, '').replace(/[ \t]{2,}/g, ' ').trim();

  function nomeFicheiro(empresa, nome) {
    const base = (empresa || nome || 'Cliente').normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
    return `Briefing_ADM_${base || 'Cliente'}.pdf`;
  }

  window.ADM_gerarPdf = async function (envio, etapas) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    const r = envio.respostas;
    const L = 210, A = 297, M = 18, LARG = L - 2 * M;
    const LIMITE = A - 22; // espaço reservado ao rodapé
    let y = 0;

    doc.setProperties({
      title: `Briefing Estratégico – ${limpar(r.empresa)}`,
      subject: 'Briefing Estratégico ADM',
      author: 'Agência Digital Mountain (ADM)',
      creator: 'Briefing ADM'
    });

    const fonte = (estilo, tamanho, cor) => {
      doc.setFont('helvetica', estilo);
      doc.setFontSize(tamanho);
      doc.setTextColor(...cor);
    };
    const alturaLinha = (tamanho) => tamanho * 0.3528 * 1.4;

    function cabecalhoPequeno() {
      fonte('bold', 8.5, COR.verdeTexto);
      doc.text('ADM • Briefing Estratégico', M, 13);
      fonte('normal', 8.5, COR.cinza);
      doc.text(limpar(r.empresa), L - M, 13, { align: 'right' });
      doc.setDrawColor(...COR.borda);
      doc.setLineWidth(0.3);
      doc.line(M, 16, L - M, 16);
      y = 24;
    }

    function garantirEspaco(h) {
      if (y + h > LIMITE) { doc.addPage(); cabecalhoPequeno(); }
    }

    // ---------- Capa / cabeçalho da 1.ª página ----------
    const logo = window.ADM_LOGO;
    const logoL = 52, logoA = logoL * logo.altura / logo.largura;
    doc.addImage(logo.dados, 'PNG', M, 14, logoL, logoA, 'logo', 'FAST');

    fonte('bold', 17, COR.tinta);
    doc.text('Briefing Estratégico', L - M, 21, { align: 'right' });
    fonte('normal', 9, COR.cinza);
    doc.text(`Referência: ${envio.id}`, L - M, 27, { align: 'right' });
    doc.text(limpar(envio.enviadoEmLocal), L - M, 32, { align: 'right' });

    y = 14 + logoA + 6;
    doc.setFillColor(...COR.verde);
    doc.rect(M, y, LARG, 1.2, 'F');
    y += 9;

    // Caixa de identificação do cliente
    const linhasId = [
      ['Cliente', limpar(r.nome) + (r.cargo ? ` – ${limpar(r.cargo)}` : '')],
      ['E-mail', limpar(r.email)],
      ['WhatsApp', limpar(r.whatsapp)]
    ];
    const caixaA = 14 + linhasId.length * 6;
    doc.setFillColor(...COR.verdeSuave);
    doc.setDrawColor(...COR.borda);
    doc.roundedRect(M, y, LARG, caixaA, 3, 3, 'FD');
    fonte('bold', 15, COR.tinta);
    doc.text(doc.splitTextToSize(limpar(r.empresa) || 'Negócio', LARG - 12)[0], M + 6, y + 9);
    linhasId.forEach(([rotulo, valor], i) => {
      const ly = y + 16 + i * 6;
      fonte('bold', 9, COR.cinza);
      doc.text(rotulo, M + 6, ly);
      fonte('normal', 9.5, COR.texto);
      doc.text(doc.splitTextToSize(valor || '—', LARG - 40)[0], M + 30, ly);
    });
    y += caixaA + 10;

    // ---------- Secções ----------
    const jaMostrados = ['nome', 'cargo', 'email', 'whatsapp', 'empresa'];

    etapas.forEach((etapa, i) => {
      garantirEspaco(30);
      // Título da secção
      doc.setFillColor(...COR.verde);
      doc.roundedRect(M, y, 9, 9, 2, 2, 'F');
      fonte('bold', 9, COR.tinta);
      doc.text(String(i + 1).padStart(2, '0'), M + 4.5, y + 6.1, { align: 'center' });
      fonte('bold', 13, COR.tinta);
      doc.text(limpar(etapa.titulo), M + 13, y + 6.4);
      y += 13;
      doc.setDrawColor(...COR.borda);
      doc.setLineWidth(0.3);
      doc.line(M, y, L - M, y);
      y += 7;

      etapa.campos.forEach((campo) => {
        if (jaMostrados.includes(campo.id)) return;
        const valor = limpar(r[campo.id]);

        fonte('bold', 9.5, COR.tinta);
        const titulo = doc.splitTextToSize(limpar(campo.titulo), LARG);
        const lhT = alturaLinha(9.5);

        fonte('normal', 10, valor ? COR.texto : COR.cinzaClaro);
        const linhas = valor ? doc.splitTextToSize(valor, LARG) : ['Não respondido'];
        const lhR = alturaLinha(10);

        // Mantém o título junto com pelo menos 2 linhas da resposta
        garantirEspaco(titulo.length * lhT + Math.min(linhas.length, 2) * lhR + 2);

        fonte('bold', 9.5, COR.tinta);
        titulo.forEach((t) => { doc.text(t, M, y); y += lhT; });
        y += 0.8;

        fonte(valor ? 'normal' : 'italic', 10, valor ? COR.texto : COR.cinzaClaro);
        linhas.forEach((t) => {
          if (y + lhR > LIMITE) {
            doc.addPage(); cabecalhoPequeno();
            fonte(valor ? 'normal' : 'italic', 10, valor ? COR.texto : COR.cinzaClaro);
          }
          doc.text(t, M, y);
          y += lhR;
        });
        y += 5;
      });
      y += 4;
    });

    // ---------- Próximos passos ----------
    garantirEspaco(34);
    doc.setFillColor(...COR.tinta);
    doc.roundedRect(M, y, LARG, 28, 3, 3, 'F');
    doc.setFillColor(...COR.verde);
    doc.rect(M, y + 6, 1.4, 16, 'F');
    fonte('bold', 11.5, [255, 255, 255]);
    doc.text('Próximos passos', M + 8, y + 10);
    fonte('normal', 9.5, [210, 218, 212]);
    doc.text(doc.splitTextToSize('A equipa da ADM vai analisar este briefing e preparar uma proposta de estratégia de conteúdo, posicionamento e vendas para o seu negócio. Entraremos em contacto pelo WhatsApp ou e-mail indicados.', LARG - 16), M + 8, y + 16);

    // ---------- Rodapé em todas as páginas ----------
    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
      doc.setPage(p);
      doc.setDrawColor(...COR.borda);
      doc.setLineWidth(0.3);
      doc.line(M, A - 14, L - M, A - 14);
      fonte('normal', 8, COR.cinza);
      doc.text('Agência Digital Mountain (ADM) • Maputo, Moçambique • Documento confidencial', M, A - 9);
      doc.text(`Página ${p} de ${total}`, L - M, A - 9, { align: 'right' });
    }

    doc.save(nomeFicheiro(r.empresa, r.nome));
    return doc;
  };
})();
