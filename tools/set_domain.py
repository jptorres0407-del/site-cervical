#!/usr/bin/env python3
"""Aplica o domínio definitivo do site.

Uso:
    python3 tools/set_domain.py https://www.seudominio.com.br

Troca o endereço provisório (https://autonome.example) em index.html, robots.txt e
sitemap.xml, atualiza a data do sitemap e cria o arquivo CNAME usado pelo GitHub Pages.
Pode ser rodado de novo para trocar um domínio já aplicado.
"""

import re
import sys
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
FILES = ['index.html', 'robots.txt', 'sitemap.xml']


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 1
    url = sys.argv[1].rstrip('/')
    parsed = urlparse(url)
    if parsed.scheme != 'https' or not parsed.netloc or parsed.path:
        print('Informe só o domínio com https://, por exemplo: https://www.seudominio.com.br')
        return 1

    canonical = re.search(r'<link rel="canonical" href="(https://[^/"]+)/">', (ROOT / 'index.html').read_text(encoding='utf-8'))
    old = canonical.group(1) if canonical else 'https://autonome.example'
    for name in FILES:
        path = ROOT / name
        text = path.read_text(encoding='utf-8').replace(old, url)
        if name == 'sitemap.xml':
            text = re.sub(r'<lastmod>[^<]*</lastmod>', f'<lastmod>{date.today().isoformat()}</lastmod>', text)
        path.write_text(text, encoding='utf-8')
        print(f'atualizado: {name}')
    (ROOT / 'CNAME').write_text(parsed.netloc + '\n', encoding='utf-8')
    print(f'CNAME: {parsed.netloc}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
