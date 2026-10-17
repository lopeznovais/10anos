# 💚 Sul Sul! 10 Anos

Site de aniversário de 10 anos de namoro, no estilo The Sims.
No ar em **https://karine-e-pedro.com.br**.

## Como personalizar
Edite **só o arquivo `data.js`** (os pontos marcados com ✏️): nomes, apelido, data de início, aparência dos Sims no 3D, necessidades, traços, humores, conquistas, interações, carta de Hogwarts, mensagem secreta e carta final.

- **Fotos:** coloque os arquivos na pasta `fotos/` e use o caminho (ex.: `foto: "fotos/ela.jpg"`). Se deixar `""`, aparecem as iniciais.
- **Lote 3D:** `lote: "casa"` (planta da casa dela, `lot3d.js`) ou `lote: "original"` (casinha genérica, `lot3d-original.js`).

## Como ver
Abra o `index.html` no navegador. Ou rode um servidor local:

```bash
python -m http.server 8765
```

e acesse `http://localhost:8765`.

## Senha e mensagem de boas-vindas
No fim do carregamento, o site pede um **código de registro** (como na instalação do The Sims). A senha fica em `senha` no `data.js` (não diferencia maiúsculas/minúsculas), e cada erro mostra uma dica de `dicasSenha`. Ao acertar, aparece a mensagem de `mensagemInicial` e depois o botão **Jogar**. O navegador lembra que ela já entrou e não pede de novo. É só uma senha simples, não proteção de verdade: quem abrir o código do site consegue ver.

Para testar sem estragar a surpresa no aparelho dela, use uma aba anônima.

## Segredos
- **Conquistas (🏆 no HUD):** cada uma destrava quando ela descobre um segredo da lista abaixo, com uma dica 💡 enquanto está trancada. Pegando todas, vem a **Platina** 💎. O progresso fica salvo no navegador: se for testar no aparelho *dela*, use uma aba anônima para não estragar a surpresa.
- **Lote 3D** (three.js, precisa de internet): arraste para girar e clique em tudo: Karine, TV, coruja (carta de Hogwarts), horta, Meg 🐶, ARMY Bomb, piscina...
- Relógio com ⏸ ▶ ▶▶ ▶▶▶, botão 🌙 para dia/noite, 🧱 para paredes e ➕/➖ para zoom.
- Clique no chão para a Karine andar (o Pedro vai atrás). Sofá, TV e cama funcionam. Às 21h ela vai dormir sozinha.
- Som: música e efeitos gerados em código (`sound.js`). Botão 🔊/🔇 no topo.
- **Rádio ARMY 📻:** clicar no ARMY Bomb (ou o cheat `borahae`) liga o tema roxo e abre um mini player que toca a playlist do YouTube definida em `musicaArmy` no `data.js`. Tem ⏮ ⏯ ⏭, modo aleatório 🔀, volume, barra de progresso clicável e contador de músicas; no computador dá para arrastar o rádio pelo topo. Na primeira música, a Karine e o Pedro dançam no lote. ✕ desliga. A música do site abaixa enquanto o rádio toca, e o player segue o botão 🔊/🔇. Vídeos que não podem tocar fora do YouTube são pulados sozinhos.
- Clique no Sim dela (ou no dele) na seção **Relacionamento** para abrir o menu de interações.
- **🔄 Trocar de família**: tente trocar. Boa sorte.
- **Ctrl+Shift+C** (ou tocar 5x no plumbob do HUD, no celular) abre o console de cheats. Tente `help`. Aceita os cheats de verdade do The Sims (`motherlode`, `kaching`, `rosebud`, `klapaucius`, `money 9999`, `testingcheats true`, `sims.fill_all_commodities`, `fillmotive motive_hunger`, `sims.add_buff flirty`, `resetsim karine`, `headlineeffects off`, `clock.advance_game_time 3 0 0`, `fps on`, `bb.moveobjects on`, `cas.fulleditmode`...), com efeitos adaptados ao site. Como no jogo, alguns só funcionam depois de `testingcheats true`. ↑/↓ navegam pelo histórico.

## Prévia do link
Ao compartilhar o link (WhatsApp, Instagram etc.), aparece a imagem `og.png` com título e descrição definidos nas tags `og:` do `index.html`. Se mudar o domínio, atualize `og:url` e `og:image` lá. Ícones: `favicon.svg` e `apple-touch-icon.png`.

## Publicação (GitHub Pages)
O site é publicado pelo GitHub Pages a partir da branch `main` (pasta `/ (root)`). O domínio próprio fica no arquivo `CNAME`; o DNS do domínio deve apontar para o GitHub Pages (Settings → Pages → Custom domain, com “Enforce HTTPS” marcado).
