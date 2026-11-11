# Briefing Estratégico ADM

Aplicação web do briefing da **Agência Digital Mountain (ADM)**:

- Assistente em 6 etapas (negócio, oferta, cliente ideal, conteúdo, objetivos, revisão)
- Rascunho guardado automaticamente no navegador do cliente
- PDF profissional com o logotipo da ADM, descarregado pelo cliente no fim
- Cada briefing é guardado numa **Google Sheet**
- A equipa recebe um **e-mail** com todas as respostas e botões para responder por e-mail ou WhatsApp

## Ficheiros

| Ficheiro | Para que serve |
|---|---|
| `index.html` | A página |
| `css/estilo.css` | O visual (cores da ADM, layout, telemóvel) |
| `js/perguntas.js` | **As perguntas.** Edite aqui para acrescentar, mudar ou remover perguntas |
| `js/config.js` | **O URL do webhook** (passo 3) |
| `js/app.js` | Lógica do assistente, validação, rascunho e envio |
| `js/pdf.js` | Geração do PDF |
| `js/logo-data.js` | Logotipo embutido para o PDF |
| `apps-script/Codigo.gs` | Código para o Google Apps Script (Sheets + e-mail) |
| `assets/` | Logotipo, ícone e favicon |

---

## Passo 1 – Criar a Google Sheet

1. Entre em <https://sheets.google.com> com a conta Google da ADM.
2. Crie uma folha em branco com o nome **Briefings ADM**.

## Passo 2 – Instalar o script (Sheets + e-mail)

1. Na folha, abra **Extensões → Apps Script**.
2. Apague o código que lá está e cole todo o conteúdo de `apps-script/Codigo.gs`.
3. No topo do código, confirme o e-mail da equipa:
   ```js
   EMAIL_EQUIPA: 'agenciadigitalmountain@gmail.com',
   ```
   Pode pôr vários e-mails separados por vírgula.
4. Clique em **Guardar** (ícone de disquete).
5. Na lista de funções, escolha **`testarEnvio`** e clique em **Executar**.
   - O Google vai pedir autorização. Clique em *Rever permissões*, escolha a conta, depois *Avançadas → Aceder a … (não seguro)* → *Permitir*. Isto é normal para scripts próprios.
   - Deve aparecer uma folha **Briefings** com uma linha de teste e chegar um e-mail de teste. Pode apagar essa linha depois.

## Passo 3 – Publicar o script como "Aplicação Web"

1. No Apps Script, clique em **Implementar → Nova implementação**.
2. Em *Tipo*, escolha **Aplicação Web**.
3. Configure:
   - **Executar como:** Eu (a conta da ADM)
   - **Quem tem acesso:** Qualquer pessoa
4. Clique em **Implementar** e copie o **URL da aplicação Web** (termina em `/exec`).
5. Abra `js/config.js` e cole o URL:
   ```js
   WEBHOOK_URL: 'https://script.google.com/macros/s/XXXXXXXX/exec'
   ```

> ⚠️ Se mais tarde alterar o `Codigo.gs`, use **Implementar → Gerir implementações → ✏️ Editar → Versão: Nova versão**. Assim o URL continua o mesmo. Se criar uma *nova* implementação, o URL muda e tem de o atualizar em `config.js`.

## Passo 4 – Pôr o site online

A pasta inteira é um site estático. Pode publicá-la em qualquer alojamento, por exemplo:

- **Netlify**: arraste a pasta para <https://app.netlify.com/drop>
- **Vercel** ou **GitHub Pages**
- O alojamento (cPanel) do site da ADM, por exemplo em `briefing.seudominio.co.mz`

Depois de publicar, faça um briefing de teste do princípio ao fim e confirme que:
- aparece uma nova linha na Google Sheet;
- o e-mail chega à equipa (veja também a pasta de *Spam* no primeiro envio);
- o PDF descarrega corretamente.

---

## Perguntas frequentes

**Como mudo as perguntas?**
Edite `js/perguntas.js`. O formulário, a revisão, o PDF, a Google Sheet e o e-mail atualizam-se sozinhos. Perguntas novas ganham uma coluna nova no fim da folha.
Não mude o `id` de uma pergunta que já tem respostas. Se mudar o `titulo`, a folha cria uma coluna nova com o novo título.

**O cliente pode receber um e-mail de confirmação?**
Sim. Em `Codigo.gs`, mude `CONFIRMAR_AO_CLIENTE: false` para `true` e atualize a implementação (ver aviso do passo 3).

**Há limites?**
Uma conta Gmail gratuita envia até cerca de **100 e-mails por dia** através de scripts. Com Google Workspace, são 1500.

**E o spam?**
Existe uma armadilha invisível para robôs e o script ignora envios repetidos. Se um dia receber muito spam, é possível acrescentar um reCAPTCHA.

**O que acontece se o `WEBHOOK_URL` estiver vazio?**
O site funciona em *modo demonstração*: o cliente vê "Briefing concluído" e pode descarregar o PDF, mas nada é guardado nem enviado. A consola do navegador mostra um aviso.
