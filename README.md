# autonoME — site institucional

Site estático (HTML, CSS e JavaScript, sem dependências nem build), pronto para domínio próprio.

- `index.html` — abertura animada · início · quem somos · o que fazemos (mapa por região) ·
  como fazemos (cremalheira e pinhão) · por que nós · contato
- `intro.js` — decide antes da primeira pintura se a abertura roda (uma vez por sessão)
- `styles.css` / `script.js` — estilos e interações
- `motion.css` / `motion.js` — kit de movimento (skill premium-motion), sem alterações
- `assets/` — logo (fundo claro e escuro), favicon, ícones e imagem de compartilhamento
- `dist/autonome.html` — o site inteiro em um único arquivo
- `tools/set_domain.py` — aplica o domínio definitivo
- `tools/build_single.py` — gera `dist/autonome.html`
- `design-system/autonome/` — `MASTER.md` e `pages/home.md` (decisões desta página)

## Ver localmente

```bash
npx http-server -c-1 .
# ou
python3 -m http.server 8080
```

Para rever a abertura na mesma aba, abra `index.html?intro`.

## Pendências: dados que ainda faltam

| O que | Onde |
|-------|------|
| **Número do WhatsApp** | `script.js` → `CONFIG.whatsapp` (só números, com DDI e DDD: `5511999999999`). Vazio, os botões abrem um e-mail para getyourautonome@gmail.com com a mensagem pronta; preenchido, abrem o WhatsApp e o link aparece no contato. |
| **Instagram** | `script.js` → `CONFIG.instagram` (URL completa). Só aparece depois de preenchido. |
| **Domínio** | `python3 tools/set_domain.py https://www.seudominio.com.br` |
| Política de privacidade | `script.js` → `CONFIG.privacyPolicy`. O link do rodapé só aparece quando houver URL. |
| Logo vetorial original | `assets/logo.svg` e `assets/logo-on-dark.svg` foram vetorizadas da imagem enviada (desenho intacto, cores mais vivas). Se houver o arquivo original, substitua mantendo os nomes. |

Depois de mudar qualquer arquivo, rode `python3 tools/build_single.py` para atualizar a versão em arquivo único.

## Publicação

Qualquer hospedagem estática (GitHub Pages, Netlify, Vercel, Cloudflare Pages). No GitHub
Pages: *Settings → Pages → Deploy from a branch* (raiz), aponte o DNS e rode `tools/set_domain.py`.

## Qualidade

- Auditoria de movimento (premium-motion): 0 erros, 0 avisos.
- axe-core (WCAG 2.1 AA + boas práticas): 0 violações em 1440 e 375px.
- Sem rolagem horizontal de 320 a 1440px.
- Teclado: foco visível; regiões por botões; pinhão como slider (setas, Home, End); menu móvel com `Esc`.
- `prefers-reduced-motion`: sem abertura, sem inércia, tudo no estado final.
- Content-Security-Policy restritiva e nenhum formulário: o contato é por links reais.
