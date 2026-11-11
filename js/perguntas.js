/*
 * Perguntas do Briefing ADM.
 * Este ficheiro é a ÚNICA fonte das perguntas: o formulário, a revisão, o PDF,
 * o Google Sheets e o e-mail são todos gerados a partir daqui.
 *
 * Para acrescentar/alterar uma pergunta basta editar esta lista.
 * Tipos: texto, email, tel, url, area (texto longo), lista (select), escolha (radio), multipla (checkbox)
 * Opções: obrigatorio, ajuda, exemplo (placeholder), opcoes, meia (ocupa meia largura), linhas
 */
window.ADM_ETAPAS = [
  {
    id: 'negocio',
    titulo: 'O seu negócio',
    curto: 'Negócio',
    resumo: 'Quem é e o que faz.',
    campos: [
      { id: 'nome', tipo: 'texto', titulo: 'Nome completo', obrigatorio: true, meia: true, exemplo: 'Ex: Carlos Machel', auto: 'name' },
      { id: 'cargo', tipo: 'texto', titulo: 'Cargo / função', meia: true, exemplo: 'Ex: Fundador, Diretora Comercial', auto: 'organization-title' },
      { id: 'email', tipo: 'email', titulo: 'E-mail', obrigatorio: true, meia: true, exemplo: 'nome@empresa.co.mz', auto: 'email' },
      { id: 'whatsapp', tipo: 'tel', titulo: 'WhatsApp', obrigatorio: true, meia: true, exemplo: '+258 84 000 0000', auto: 'tel' },
      { id: 'empresa', tipo: 'texto', titulo: 'Nome do negócio / marca', obrigatorio: true, meia: true, exemplo: 'Ex: Machel Consultores', auto: 'organization' },
      { id: 'sector', tipo: 'texto', titulo: 'Sector / nicho', obrigatorio: true, meia: true, exemplo: 'Ex: Consultoria financeira para PMEs' },
      { id: 'localizacao', tipo: 'texto', titulo: 'Onde atua', meia: true, exemplo: 'Ex: Maputo e Matola / todo o país / online' },
      { id: 'tempo_mercado', tipo: 'lista', titulo: 'Há quanto tempo existe o negócio?', meia: true,
        opcoes: ['Ainda não lancei', 'Menos de 1 ano', '1 a 3 anos', '3 a 5 anos', 'Mais de 5 anos'] },
      { id: 'equipa', tipo: 'lista', titulo: 'Tamanho da equipa', meia: true,
        opcoes: ['Só eu', '2 a 5 pessoas', '6 a 20 pessoas', 'Mais de 20 pessoas'] },
      { id: 'links', tipo: 'area', linhas: 2, titulo: 'Site e redes sociais', ajuda: 'Cole os links ou @ das suas páginas (um por linha).', exemplo: 'instagram.com/suamarca\nwww.suamarca.co.mz' }
    ]
  },
  {
    id: 'oferta',
    titulo: 'Oferta & vendas',
    curto: 'Oferta',
    resumo: 'O que vende e como vende.',
    campos: [
      { id: 'produto', tipo: 'area', titulo: 'Qual é o seu produto ou serviço principal?', obrigatorio: true,
        ajuda: 'O que vende, para quem, e que transformação ou resultado entrega.',
        exemplo: 'Ex: Mentoria de 8 semanas que ajuda donos de PMEs a organizar as finanças e aumentar a margem de lucro.' },
      { id: 'modelo', tipo: 'lista', titulo: 'Modelo de negócio', obrigatorio: true, meia: true,
        opcoes: ['Serviço / consultoria', 'Produto físico', 'Curso / infoproduto', 'Mentoria / programa', 'Software / assinatura', 'Outro'] },
      { id: 'preco', tipo: 'texto', titulo: 'Preço ou ticket médio', meia: true, exemplo: 'Ex: 15.000 MZN por cliente' },
      { id: 'canais_venda', tipo: 'multipla', titulo: 'Por onde vende hoje?', obrigatorio: true,
        opcoes: ['WhatsApp', 'Mensagens no Instagram/Facebook', 'Site / loja online', 'Loja física', 'Indicações (boca-a-boca)', 'Anúncios pagos', 'Marketplaces', 'Ainda não vendo'] },
      { id: 'faturacao', tipo: 'lista', titulo: 'Faturação média mensal', ajuda: 'Confidencial. Ajuda-nos a propor uma estratégia realista.',
        opcoes: ['Ainda sem faturação', 'Até 50.000 MZN', '50.000 – 250.000 MZN', '250.000 – 1.000.000 MZN', 'Mais de 1.000.000 MZN', 'Prefiro não dizer'] },
      { id: 'diferencial', tipo: 'area', titulo: 'O que o diferencia da concorrência?', obrigatorio: true,
        ajuda: 'Porque é que um cliente deve escolher-vos a si e não a outro?',
        exemplo: 'Ex: Somos os únicos em Maputo que garantem acompanhamento semanal presencial.' },
      { id: 'prova_social', tipo: 'area', titulo: 'Resultados e provas sociais',
        ajuda: 'Casos de sucesso, testemunhos, números, clientes conhecidos, prémios ou certificações.',
        exemplo: 'Ex: +120 clientes atendidos; caso da empresa X que duplicou vendas em 6 meses.' }
    ]
  },
  {
    id: 'persona',
    titulo: 'Cliente ideal',
    curto: 'Cliente',
    resumo: 'Para quem vamos comunicar.',
    campos: [
      { id: 'persona', tipo: 'area', linhas: 4, titulo: 'Descreva o seu cliente ideal', obrigatorio: true,
        ajuda: 'Idade, género, profissão, rendimento, localização, situação atual e hábitos digitais.',
        exemplo: 'Ex: Sofia, 32 anos, dona de um salão em Maputo. Fatura bem, mas trabalha 12h por dia. Passa as noites no Instagram e responde a clientes pelo WhatsApp.' },
      { id: 'dores', tipo: 'area', titulo: 'Quais são as principais dores e problemas dele(a)?', obrigatorio: true,
        ajuda: 'Os problemas do dia a dia ligados ao que vende. Use as palavras que o cliente usaria.',
        exemplo: 'Ex: "Publico todos os dias e ninguém compra." "Não tenho tempo para nada."' },
      { id: 'medos', tipo: 'area', titulo: 'Que medos o(a) impedem de avançar?',
        ajuda: 'Receios imediatos e de longo prazo.',
        exemplo: 'Ex: Gastar dinheiro em marketing sem retorno; ficar para trás da concorrência.' },
      { id: 'desejos', tipo: 'area', titulo: 'O que mais deseja? Qual seria o cenário ideal?', obrigatorio: true,
        ajuda: 'Objetivos, sonhos e motivações: liberdade, estabilidade, reconhecimento, família…',
        exemplo: 'Ex: Ter agenda cheia sem depender de indicações e tirar férias sem perder clientes.' },
      { id: 'objecoes', tipo: 'area', titulo: 'Quais são as principais objeções antes de comprar?', obrigatorio: true,
        ajuda: 'Liste 3 a 5. Ex: preço, falta de tempo, desconfiança, "já tentei e não resultou".',
        exemplo: 'Ex: 1. É caro; 2. Não tenho tempo; 3. Não sei se funciona no mercado moçambicano.' },
      { id: 'consciencia', tipo: 'lista', titulo: 'Nível de consciência do cliente', obrigatorio: true,
        ajuda: 'Em que fase está a maioria dos seus potenciais clientes?',
        opcoes: [
          'Inconsciente: ainda não percebe que tem um problema',
          'Consciente do problema: sente a dor, mas não conhece soluções',
          'Consciente da solução: sabe que existem soluções e está a comparar',
          'Consciente do produto: conhece a sua oferta, mas ainda não decidiu',
          'Totalmente consciente: só precisa da oferta certa para comprar'
        ] },
      { id: 'emocao', tipo: 'escolha', titulo: 'Emoção dominante do cliente', obrigatorio: true,
        opcoes: ['Frustração', 'Medo', 'Insegurança', 'Culpa', 'Esperança', 'Ambição / desejo', 'Orgulho'] },
      { id: 'onde_esta', tipo: 'multipla', titulo: 'Onde está o seu cliente online?', obrigatorio: true,
        opcoes: ['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'YouTube', 'WhatsApp / grupos', 'Pesquisa no Google', 'Não sei'] }
    ]
  },
  {
    id: 'conteudo',
    titulo: 'Conteúdo & presença digital',
    curto: 'Conteúdo',
    resumo: 'Como comunica hoje.',
    campos: [
      { id: 'redes_ativas', tipo: 'multipla', titulo: 'Em que canais publica atualmente?', obrigatorio: true,
        opcoes: ['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'YouTube', 'Blog / site', 'Newsletter / e-mail', 'Estado do WhatsApp', 'Nenhum'] },
      { id: 'frequencia', tipo: 'lista', titulo: 'Com que frequência publica?', obrigatorio: true, meia: true,
        opcoes: ['Não publico', 'Raramente', '1 a 2 vezes por semana', '3 a 5 vezes por semana', 'Todos os dias'] },
      { id: 'quem_produz', tipo: 'lista', titulo: 'Quem produz o conteúdo?', obrigatorio: true, meia: true,
        opcoes: ['Eu próprio(a)', 'Alguém da equipa', 'Freelancer / agência', 'Ninguém de forma regular'] },
      { id: 'formatos', tipo: 'multipla', titulo: 'Que formatos funcionaram melhor até agora?',
        opcoes: ['Vídeos curtos (Reels / TikTok)', 'Carrosséis', 'Stories', 'Lives', 'Vídeos longos', 'Artigos / blog', 'Fotografias de produto', 'Ainda não sei'] },
      { id: 'tom_voz', tipo: 'escolha', titulo: 'Que tom de voz representa a sua marca?', obrigatorio: true,
        opcoes: ['Profissional e técnico', 'Próximo e conversacional', 'Inspirador e motivacional', 'Divertido e descontraído', 'Ousado e provocador'] },
      { id: 'referencias', tipo: 'area', linhas: 2, titulo: 'Concorrentes ou marcas de referência',
        ajuda: 'Perfis que admira ou com quem compete (links ou @) e o que gosta neles.',
        exemplo: 'Ex: @marcaX: gosto dos vídeos com bastidores.' },
      { id: 'desafio_conteudo', tipo: 'area', titulo: 'Qual é o seu maior desafio com conteúdo hoje?', obrigatorio: true,
        exemplo: 'Ex: Não sei o que publicar, tenho poucas visualizações e o conteúdo não gera vendas.' }
    ]
  },
  {
    id: 'objetivos',
    titulo: 'Objetivos & investimento',
    curto: 'Objetivos',
    resumo: 'Onde quer chegar.',
    campos: [
      { id: 'objetivo', tipo: 'escolha', titulo: 'Objetivo principal para os próximos 90 dias', obrigatorio: true,
        opcoes: ['Gerar mais contactos (leads)', 'Aumentar as vendas', 'Construir autoridade de marca', 'Crescer seguidores e alcance', 'Lançar um produto novo', 'Organizar o marketing'] },
      { id: 'meta', tipo: 'texto', titulo: 'Qual é a meta concreta?', obrigatorio: true,
        ajuda: 'Um número e um prazo ajudam-nos a medir o sucesso.', exemplo: 'Ex: 30 novos clientes por mês até março' },
      { id: 'promessa', tipo: 'texto', titulo: 'Promessa de impacto',
        ajuda: 'Uma frase ousada, mas credível, que desperte desejo imediato.',
        exemplo: 'Ex: Agenda cheia em 90 dias sem gastar um metical em anúncios.' },
      { id: 'gatilho', tipo: 'area', linhas: 2, titulo: 'O que faria o seu cliente agir de imediato?',
        ajuda: 'Bónus, diagnóstico gratuito, vagas limitadas, garantia, prazo…',
        exemplo: 'Ex: Diagnóstico gratuito de 30 minutos e apenas 10 vagas por mês.' },
      { id: 'anuncios', tipo: 'escolha', titulo: 'Já investiu em anúncios pagos?', obrigatorio: true,
        opcoes: ['Sim, com bons resultados', 'Sim, mas sem resultados', 'Não, nunca'] },
      { id: 'orcamento', tipo: 'lista', titulo: 'Orçamento mensal para marketing', obrigatorio: true, meia: true,
        opcoes: ['Até 10.000 MZN', '10.000 – 30.000 MZN', '30.000 – 80.000 MZN', 'Mais de 80.000 MZN', 'Ainda não defini'] },
      { id: 'inicio', tipo: 'lista', titulo: 'Quando quer começar?', obrigatorio: true, meia: true,
        opcoes: ['Imediatamente', 'Nas próximas 2 semanas', 'Dentro de 1 mês', 'Ainda estou a avaliar'] },
      { id: 'observacoes', tipo: 'area', linhas: 3, titulo: 'Há mais alguma coisa que devamos saber?',
        exemplo: 'Ex: Vamos abrir uma segunda loja em junho.' }
    ]
  }
];
