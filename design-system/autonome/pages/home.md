# Home — overrides do MASTER

> Estas regras substituem o `MASTER.md` na página `index.html`. O que não está aqui segue o MASTER.

## Estilo (substitui "Liquid Glass")

O MASTER sugeriu *Liquid Glass*, pensado para interfaces da Apple e fora do contexto de um
estúdio de sites. Adotamos **editorial minimalista (Minimalism & Swiss)** com direção de arte
própria: composição assimétrica, hairlines no lugar de caixas, placas grafite como "pranchas"
de figura (cantos de corte, legenda "Fig. 0X") e geometria derivada das engrenagens da logo.

## Cores (substitui preto + #A16207)

Extraídas da logo vetorizada (grafite #3D4144 e champagne #C1AB7C) e da direção do briefing.

| Token | Valor | Uso |
|-------|-------|-----|
| `--ink` | #292C30 | fundos escuros, títulos, botão principal |
| `--ink-deep` | #1F2226 | rodapé |
| `--graphite` | #3D4144 | texto corrido (9.5:1 no marfim), grafite da logo |
| `--champagne` | #C1AB7C | assinatura: detalhes, ícones, linhas, botão do CTA final (6.3:1 com `--ink`) |
| `--champagne-soft` | #D9CBA6 | hover sobre escuro |
| `--champagne-ink` | #725E32 | champagne para texto sobre fundo claro (≥ 4.5:1) |
| `--ivory` | #F7F5F0 | fundo principal |
| `--stone` | #E7E3DA | seções alternadas (serviços, projetos) |
| `--muted` / `--muted-on-dark` | #5F605A / #A9A79F | texto secundário (≥ 4.9:1) |
| `--support` | #777771 | só linhas e elementos decorativos (não passa 4.5:1 como texto) |

Ritmo de fundos: marfim → marfim → pedra → **grafite** → marfim → pedra → **grafite** → marfim → grafite profundo.

## Tipografia (substitui Cormorant)

- **Sorts Mill Goudy** (títulos, 400 e itálico): é a serifa do Google Fonts mais próxima do
  "autono" da logo. Nunca usar negrito (a família não tem; `font-synthesis: none`).
- **Montserrat** (texto, navegação, rótulos): ecoa o "ME" geométrico da logo.
- Palavra de destaque dos títulos em itálico champagne (`--champagne-ink` no claro).

## Componentes próprios da página

- **Fig. 01 — Anatomia de um site** (hero): SVG isométrico com 4 camadas (domínio, estrutura,
  identidade, conteúdo). Monta ao carregar, se separa com o cursor e se comprime ao rolar.
- **Fig. 02 — Funcionamento integrado** (quem somos): três engrenagens com engrenamento correto
  (12, 9 e 15 dentes) que giram acopladas à rolagem.
- **Placa de serviços**: lista à direita e placa fixa à esquerda que troca a ilustração (traços
  desenhados com `pathLength`). No celular, cada serviço mostra a própria ilustração.
- **Cremalheira e pinhão** (processo): o pinhão é a engrenagem pequena da logo, sem alterações,
  rolando sem deslizar (rotação = distância ÷ raio primitivo).
- **Painéis escuros** expandem (clip-path) ao entrar na tela.

## Regras

- Engrenagens nunca giram sozinhas: só acompanham a rolagem.
- Com `prefers-reduced-motion`, tudo aparece no estado final (camadas abertas, etapas concluídas).
- Projetos de exemplo são sempre rotulados "Conceito demonstrativo".
