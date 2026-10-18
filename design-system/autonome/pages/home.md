# Home — overrides do MASTER (v2)

> Estas regras substituem o `MASTER.md` na página `index.html`. O que não está aqui segue o MASTER.

## Direção

Site enxuto: quem somos, o que fazemos, como fazemos, por que nós, contato. Frases curtas,
sem jargão genérico e sem nada que soe como "estamos começando". Moderno, com peças
estruturais que respondem ao toque.

## Cores (substitui preto + #A16207)

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg` | #E7E6E3 | fundo cinza esfumaçado (com manchas suaves e granulação) |
| `--ink` | #0D0D0F | preto vivo: painéis escuros, títulos, botões |
| `--gold` | #D8AC2B | dourado vivo: marca-texto, preenchimentos, dentes, painel de contato |
| `--gold-hi` / `--gold-lo` | #F2D06B / #B0841A | brilho e sombra do dourado metálico |
| `--gold-ink` | #7A5A06 | dourado para texto sobre fundo claro (≥ 4.5:1) |
| `--text` / `--muted` | #1C1C1F / #55554F | texto (≥ 6:1 no fundo) |
| `--on-dark` / `--muted-dark` | #F3F2EF / #A3A29C | texto sobre preto |

A logo mantém o desenho original; só as cores ficaram mais vivas (preto #141416 e dourado
em gradiente #F2D06B → #D8AC2B → #B0841A).

## Tipografia (substitui Cormorant + Montserrat)

- **Syne** 700–800 nos títulos: geométrica e larga, conversa com o "ME" da logo.
- **Geist** no texto e **Geist Mono** em rótulos e números.

## Componentes próprios

- **Abertura**: engrenagens da logo entram pelos cantos opostos girando acopladas
  (12 × 9 dentes), "autono" sobe letra a letra, "ME" entra em dourado, um brilho passa
  pela logo e ela voa até o cabeçalho. Uma vez por sessão; qualquer gesto adianta.
- **Engrenagens do hero**: giráveis com dedo ou mouse, com inércia; a rolagem também
  dá impulso. Luz fixa sobre o metal (o reflexo não gira junto).
- **Mapa hexagonal da capital** (5 regiões): toque em um hexágono ou nos botões; a
  região acende em onda a partir do ponto tocado.
- **Cremalheira e pinhão** (como fazemos): o pinhão é a engrenagem pequena da logo; é
  um `role="slider"` arrastável, com mola, que encaixa na etapa mais próxima.
- **Cards com dentes de cremalheira** que deslizam no hover; luz que segue o cursor.

## Regras

- Engrenagens só giram por abertura, toque ou rolagem — nunca sozinhas em loop.
- Movimento reduzido: sem abertura, sem inércia nem molas, tudo no estado final.
- Toda interação tem alternativa por teclado (botões de região, slider do pinhão, etapas).
