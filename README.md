# autonoME — site institucional

Site estático da autonoME (HTML, CSS e JavaScript, sem dependências nem etapa de build),
pronto para publicação em domínio próprio.

- `index.html` — página única: hero · quem somos · serviços · diferenciais · processo ·
  projetos (conceitos) · contato · perguntas frequentes · rodapé
- `styles.css` / `script.js` — estilos e interações do site
- `motion.css` / `motion.js` — kit de movimento (skill premium-motion), sem alterações
- `assets/` — logo vetorizada (fundo claro e escuro), favicon, ícones e imagem de compartilhamento
- `404.html`, `robots.txt`, `sitemap.xml`, `site.webmanifest`, `favicon.ico`
- `tools/set_domain.py` — aplica o domínio definitivo
- `design-system/autonome/` — `MASTER.md` (gerado pela skill ui-ux-pro-max) e
  `pages/home.md` (decisões que valem para esta página)

## Ver localmente

```bash
npx http-server -c-1 .
# ou
python3 -m http.server 8080
```

## Pendências: dados que ainda faltam

| O que | Onde |
|-------|------|
| **Número do WhatsApp** | `script.js` → `CONFIG.whatsapp` (só números, com DDI e DDD: `5511999999999`). Enquanto estiver vazio, todos os botões de contato abrem um e-mail para getyourautonome@gmail.com com a mesma mensagem. Ao preencher, os botões passam a abrir o WhatsApp com a mensagem pronta e o WhatsApp aparece no contato e no rodapé. |
| **Instagram** | `script.js` → `CONFIG.instagram` (URL completa). O link só aparece depois de preenchido. |
| **Domínio** | `python3 tools/set_domain.py https://www.seudominio.com.br` troca o endereço provisório (`https://autonome.example`) em canonical, Open Graph, dados estruturados, robots e sitemap, e cria o `CNAME`. |
| Política de privacidade / termos | `script.js` → `CONFIG.privacyPolicy` e `CONFIG.terms`. A coluna "Documentos" do rodapé só aparece quando houver um link. |
| Projetos reais | `index.html` → seção `#projetos`. Copie um `.work-item`, troque o `.mock` por `<img src="…" alt="…">` e o rótulo "Conceito demonstrativo" por "Projeto publicado". Os três estudos atuais são conceitos e estão identificados como tal. |
| Logo vetorial original | `assets/logo.svg` e `assets/logo-on-dark.svg` foram vetorizadas a partir da imagem enviada, sem redesenho. Se existir o arquivo vetorial original da marca, substitua os dois mantendo os nomes. |

## Publicação

Qualquer hospedagem estática serve (GitHub Pages, Netlify, Vercel, Cloudflare Pages).
No GitHub Pages: *Settings → Pages → Deploy from a branch* (raiz), depois aponte o DNS do
domínio e rode `tools/set_domain.py`. A página 404 usa caminhos absolutos (`/styles.css`),
pensados para o site servido na raiz do domínio.

## Qualidade

- Auditoria de movimento:
  `python3 <Claude-site>/.claude/skills/premium-motion/scripts/audit_motion.py index.html 404.html styles.css script.js motion.css motion.js`
  → 0 erros, 0 avisos.
- axe-core (WCAG 2.1 AA + boas práticas): 0 violações.
- Sem rolagem horizontal em 320, 375, 768, 1024 e 1440px. Navegação por teclado com foco
  visível, menu móvel com `Esc` e foco preso, `prefers-reduced-motion` respeitado.
- Content-Security-Policy restritiva (só scripts do próprio site, fontes do Google Fonts) e
  nenhum formulário: o contato é feito por links reais (WhatsApp ou e-mail).
