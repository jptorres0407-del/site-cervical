#!/usr/bin/env python3
"""Gera dist/autonome.html: o site inteiro em um único arquivo HTML.

Uso:
    python3 tools/build_single.py

Embute CSS e JavaScript locais, troca imagens e ícones locais por data URIs e
acrescenta ao Content-Security-Policy o hash de cada script embutido, para que
a política continue bloqueando qualquer outro script. As fontes continuam vindo
do Google Fonts.
"""

import base64
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MIME = {'.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon'}


def data_uri(path: Path) -> str:
    return f'data:{MIME[path.suffix]};base64,' + base64.b64encode(path.read_bytes()).decode()


def main() -> None:
    html = (ROOT / 'index.html').read_text(encoding='utf-8')

    def css(match: re.Match) -> str:
        return '<style>\n' + (ROOT / match.group(1)).read_text(encoding='utf-8') + '\n</style>'

    def js(match: re.Match) -> str:
        return '<script>\n' + (ROOT / match.group(1)).read_text(encoding='utf-8') + '\n</script>'

    html = re.sub(r'<link rel="stylesheet" href="([\w.-]+\.css)">', css, html)
    html = re.sub(r'<script src="([\w.-]+\.js)"(?: defer)?></script>', js, html)
    html = re.sub(r'<link rel="manifest" href="[^"]+">\n\s*', '', html)

    def asset(match: re.Match) -> str:
        path = ROOT / match.group(2)
        return f'{match.group(1)}="{data_uri(path)}"' if path.suffix in MIME and path.exists() else match.group(0)

    html = re.sub(r'\b(src|href)="((?:assets/[\w.-]+)|favicon\.ico)"', asset, html)

    scripts = re.findall(r'<script>(.*?)</script>', html, flags=re.S)
    hashes = ' '.join("'sha256-" + base64.b64encode(hashlib.sha256(s.encode('utf-8')).digest()).decode() + "'" for s in scripts)
    html = html.replace("script-src 'self';", f"script-src 'self' {hashes};", 1)

    out = ROOT / 'dist' / 'autonome.html'
    out.parent.mkdir(exist_ok=True)
    out.write_text(html, encoding='utf-8')
    print(f'{out.relative_to(ROOT)}: {len(html.encode()) // 1024} KB, {len(scripts)} scripts embutidos')


if __name__ == '__main__':
    main()
