// =====================================================================
//  ✏️  EDITE AQUI! Todo o conteúdo pessoal do site fica neste arquivo.
//  Não precisa mexer em index.html, style.css ou script.js.
//
//  Fotos: coloque os arquivos na pasta "fotos/" e escreva o caminho,
//  ex.: foto: "fotos/ela.jpg". Se deixar "", aparecem as iniciais.
// =====================================================================

window.SITE = {
  ela: {
    nome: "Karine",
    apelido: "Amor",          // ✏️ como você chama ela
    foto: "",                 // ✏️ ex.: "fotos/ela.jpg"
    cor: "#ff7eb6",
    // ✏️ Aparência no lote 3D (cores em hexadecimal)
    aparencia: { pele: "#f1c7a5", cabelo: "#9a6d42", camisa: "#ff7eb6", calca: "#5b4b8a", cabeloLongo: true },
  },
  ele: {
    nome: "Pedro",
    foto: "",                 // ✏️ ex.: "fotos/eu.jpg"
    cor: "#2f86f0",
    aparencia: { pele: "#e8b48f", cabelo: "#2a1a10", camisa: "#2f86f0", calca: "#2e3a4f", cabeloLongo: false },
  },

  // Cenário do lote 3D: "casa" = planta da casa da Karine · "original" = casinha genérica (versão antiga)
  lote: "casa",

  // ✏️ Música do ARMY Bomb (e do cheat "borahae"): cole o link de um vídeo ou playlist do YouTube.
  // Deixe "" para desligar o rádio.
  musicaArmy: "https://www.youtube.com/watch?v=_gyultVTesk&list=RDEMI0V0e34vA6znf4KLMCIbbQ&start_radio=1",

  // ✏️ A cachorrinha (cores do pelo em hexadecimal)
  pet: { nome: "Meg", pelo: "#c8894f", orelha: "#7a4a26", barriga: "#f6e6cc", coleira: "#ff5fa2" },

  // ✏️ Senha para entrar no site (aparece como "código de registro", igual na instalação do The Sims).
  // Não diferencia maiúsculas/minúsculas. Deixe "" para tirar a senha.
  senha: "Kp18/10/2026",
  // Dicas que aparecem a cada erro (a última se repete)
  dicasSenha: [
    "Código de registro inválido. Confira e tente de novo.",
    "Hmm, ainda não. Dica: começa com as nossas iniciais.",
    "Dica: nossas iniciais (K e p) + uma data muito especial, no formato dd/mm/aaaa. 😉",
  ],

  // ✏️ Mensagem que aparece logo depois que ela acerta a senha
  mensagemInicial: [
    "Oi meu amor! 10 anos juntos... Sou tão feliz por ter você comigo por todo esse tempo. Espero que tenhamos muitos mais 10 anos pela frente 🥰",
    "Sabe que não sou bom em escrever coisas bonitinhas, mas você sempre faz presentinhos incríveis para mim, então tentei fazer um pra você com o que sei fazer, espero que goste. Te amo demais ❤️",
  ],

  // ✏️ Data em que começaram a namorar (ano-mês-dia)
  inicio: "2016-10-01T00:00:00",

  vizinhanca: "Vila Cafuné",                          // ✏️ cidade/bairro (ou algo engraçado)
  extraCasa: "a Meg 🐶",                               // ✏️ pets, plantas...

  // Frases da tela de carregamento (tem que ter "Reticulando splines")
  dicasLoading: [
    "Reticulando splines...",
    "Carregando 10 anos de paciência...",
    "Procurando o controle remoto...",
    "Pesquisando se o dorama tem final feliz...",
    "Lembrando ela de tomar água...",
    "Trocando de família no The Sims (de novo)...",
    "Aguardando ela escolher onde vamos comer...",
    "Ensinando Simlish para os vizinhos...",
    "Regando as plantações de Stardew (de novo)...",
    "Convencendo o Chapéu Seletor...",
    "Decorando o nome dos 7 membros do BTS...",
    "Recolocando a escada da piscina. Juro.",
  ],

  // Painel de necessidades dela (valor de 0 a 100)
  necessidades: [
    { icone: "🍔", nome: "Fome",      valor: 12,  texto: "Sempre. Literalmente sempre." },
    { icone: "⚡", nome: "Energia",   valor: 45,  texto: "A bateria acaba às 21h em ponto. Às 21h05, já era." },
    { icone: "🎉", nome: "Diversão",  valor: 100, texto: "Máxima quando está comigo (obviamente)." },
    { icone: "💬", nome: "Social",    valor: 88,  texto: "Fofocar sobre dorama conta como social." },
    { icone: "💧", nome: "Hidratação", valor: 8,  texto: "Só bebe água quando eu lembro. Eu lembro umas 15 vezes por dia." },
    { icone: "🚽", nome: "Bexiga",    valor: 30,  texto: "Precisa ir exatamente quando o filme começa." },
    { icone: "🛋️", nome: "Conforto",  valor: 70,  texto: "Aumenta 300% com a coberta que ela me roubou." },
    { icone: "💖", nome: "Amor",      valor: 100, texto: "Barra travada no máximo há 10 anos.", especial: true },
  ],

  // Tela "Criar um Sim"
  perfil: {
    idade: "Jovem Adulta (pra sempre)",
    aspiracao: "Amor Eterno + Zerar todos os doramas",
    voz: "Doce (até ficar com fome)",
    andar: "Apressada, rumo à comida",
    signo: "Capricórnio ♑",
    casa: "Lufa-Lufa 🦡 (o salão comunal fica do lado da cozinha, faz sentido)",
    bias: "V (Kim Taehyung) 💜, o inventor do \"Borahae\"",
  },

  tracos: [
    { icone: "📺", nome: "Caçadora de Spoilers",  texto: "Pesquisa o final do dorama antes de começar. Só assiste se for feliz." },
    { icone: "😴", nome: "Dorminhoca Pontual",    texto: "21h e já está dormindo. Não importa onde, nem com quem." },
    { icone: "🐷", nome: "Porquinho Noturno",     texto: "De vez em quando faz porquinho dormindo. Nega até a morte." },
    { icone: "👨‍👩‍👧", nome: "Criadora de Famílias", texto: "Passa horas no Criar um Sim, joga 20 minutos e troca de família." },
    { icone: "💧", nome: "Camelo",                texto: "Consegue passar o dia inteiro sem beber água. Eu não deixo." },
    { icone: "♑", nome: "Capricorniana Raiz",    texto: "Organizada, decidida e sempre certa. (Ela pediu pra escrever isso.)" },
    { icone: "🌱", nome: "Fazendeira do Vale",    texto: "Nunca esquece de regar as plantas. Água pra ela mesma, já é outra história." },
    { icone: "💜", nome: "ARMY",                  texto: "Sabe o aniversário dos 7. E o meu também (quase sempre)." },
  ],
  // Humores (moodlets)
  humores: [
    { emoji: "😍", cor: "#ff5fa2", nome: "Apaixonada",   texto: "Está há 10 anos com o Sim mais bonito da vizinhança.",    efeito: "+∞", dura: "Permanente" },
    { emoji: "😤", cor: "#ff7a45", nome: "Irritada",     texto: "Ele viu o próximo episódio sem ela.",                     efeito: "+3", dura: "4 dias" },
    { emoji: "😴", cor: "#8a94a6", nome: "Sonolenta",    texto: "São 20h47. Ou seja: madrugada.",                          efeito: "+2", dura: "Até amanhã cedo" },
    { emoji: "🤩", cor: "#f5b400", nome: "Inspirada",    texto: "O namorado lavou a louça sem ninguém pedir (evento raro).", efeito: "+2", dura: "1 dia" },
    { emoji: "😌", cor: "#4a8cff", nome: "Aliviada",     texto: "Leu o spoiler: o dorama tem final feliz. Pode começar.",   efeito: "+3", dura: "16 episódios" },
    { emoji: "🐷", cor: "#ff9aa2", nome: "Descansada",   texto: "Dormiu 10 horas e fez porquinho só duas vezes.",          efeito: "+2", dura: "Até as 21h" },
    { emoji: "🥰", cor: "#46c93a", nome: "Feliz",        texto: "Recebeu um site de presente com barra de Bexiga.",       efeito: "+3", dura: "Hoje" },
  ],

  // Painel de relacionamento
  statusRelacionamento: ["Almas Gêmeas", "Parceiros de Maratona", "Disputam o Controle Remoto", "Fazendeiros do Vale"],

  // Estatísticas engraçadas. "porDia" multiplica pelos dias juntos; "valor" é fixo.
  estatisticas: [
    { icone: "📺", rotulo: "Episódios de dorama assistidos (estimativa conservadora)", porDia: 0.9 },
    { icone: "🛏️", rotulo: "Cobertas roubadas por ela",                                 porDia: 1 },
    { icone: "🍽️", rotulo: "Vezes que ouvi \"escolhe você o restaurante\"",             porDia: 1.4 },
    { icone: "❄️", rotulo: "Discussões sobre a temperatura do ar-condicionado",       valor: "Incontáveis" },
    { icone: "💚", rotulo: "Vezes que eu escolheria você de novo",                     valor: "Todas" },
  ],

  // Conquistas: cada uma desbloqueia quando ela descobre um segredo do site.
  // "dica" aparece enquanto está trancada; "texto" depois de desbloquear.
  // ⚠️ Não mude o "id" (é ele que liga a conquista ao segredo no código).
  conquistas: [
    { id: "quimica",   icone: "💚", titulo: "Química Instantânea",   dica: "Interaja com a Karine (clique nela).",                     texto: "Dois Sims se esbarraram e o jogo decidiu: compatibilidade máxima." },
    { id: "pedro",     icone: "🕵️", titulo: "Ele Também É Clicável", dica: "O Pedro também tem menu de interação.",                     texto: "Descobriu que dá pra mandar no Pedro. (Sempre deu.)" },
    { id: "spoiler",   icone: "📺", titulo: "Spoiler Confirmado",    dica: "Ligue a TV do lote 3D.",                                    texto: "Leu o final antes do episódio 1. Final feliz: aprovado para maratona." },
    { id: "agua",      icone: "💧", titulo: "Hidratação Assistida",  dica: "Faça ela beber água. Pelo menos uma vez.",                  texto: "\"Amor, bebe água.\" Dito pela 10.000ª vez. Ela bebeu dois goles." },
    { id: "boanoite",  icone: "😴", titulo: "Boa Noite às 21h",      dica: "Acelere o relógio do lote até a hora de dormir.",          texto: "Desbloqueada todas as noites, sem falhar uma." },
    { id: "porquinho", icone: "🐷", titulo: "Porquinho Registrado",  dica: "Tente falar com ela enquanto ela dorme.",                   texto: "Fez porquinho dormindo. Ela nega. Agora existe testemunha." },
    { id: "familias",  icone: "👨‍👩‍👧", titulo: "Mãe de Mil Famílias", dica: "Tente trocar de família. Insista.",                       texto: "Criou dezenas de famílias no The Sims. Jogou com quase nenhuma." },
    { id: "colheita",  icone: "🌱", titulo: "Colheita Perfeita",     dica: "A horta do quintal está pronta pra colher.",                texto: "Ela cuidou da fazenda inteira. Eu pesquei um peixe e comemorei." },
    { id: "meg",       icone: "🎾", titulo: "Melhor Amiga da Meg",   dica: "A Meg quer brincar de bolinha.",                            texto: "Jogou a bolinha. A Meg trouxe de volta. Repetir 400 vezes." },
    { id: "maroto",    icone: "🦉", titulo: "Mapa do Maroto",        dica: "Tem correspondência chegando no correio.",                  texto: "Juro solenemente que só tenho boas intenções (e fome)." },
    { id: "borahae",   icone: "💜", titulo: "Borahae Desbloqueado",  dica: "Acenda o ARMY Bomb.",                                       texto: "Aprendi o nome dos sete. Ainda erro todos, kkk. Ela sabe até o aniversário de cada um." },
    { id: "alohomora", icone: "🗝️", titulo: "Curiosa Nível Hogwarts", dica: "Existe um feitiço que abre tudo. Use-o no console de cheats.", texto: "Achou a mensagem secreta. Claro que achou." },
    { id: "eterno",    icone: "🏆", titulo: "Amor Eterno",           dica: "Responda à pergunta do evento final.",                      texto: "10 anos. Zero cheats. Tudo conquistado no modo normal." },
  ],

  // Menu de interação (clique no Sim dela)
  interacoes: [
    { icone: "🤗", nome: "Abraço apertado",       anim: "abraco", titulo: "+15 Romance",  resposta: "Ela ganhou o humor \"Aconchegada\". Você ganhou o direito de ficar mais 5 minutos.", humor: { emoji: "🥰", nome: "Aconchegada" } },
    { icone: "💬", nome: "Elogiar",               anim: "coracao", titulo: "+10 Amizade",  resposta: "\"Você é a pessoa mais linda de todos os mundos, do Vale do Orvalho até Hogwarts.\" Crítico!", humor: { emoji: "😊", nome: "Lisonjeada" } },
    { icone: "📺", nome: "Chamar pra ver dorama", anim: "tv", titulo: "Sucesso!",     resposta: "Ela aceitou... depois de pesquisar no Google se o final é feliz. É. Pode dar play.", humor: { emoji: "🤩", nome: "Empolgada" } },
    { icone: "🛏️", nome: "Pegar a coberta de volta", anim: "bravo", titulo: "Falhou!",   resposta: "Ação impossível. A coberta pertence a ela desde sempre.", humor: { emoji: "😤", nome: "Irritada" } },
    { icone: "💃", nome: "Dançar ao som de BTS",  anim: "danca", titulo: "+20 Diversão", resposta: "Você errou toda a coreografia de Dynamite. Ela achou fofo. Missão cumprida.", humor: { emoji: "😂", nome: "Rindo muito" } },
    { icone: "💧", nome: "Lembrar de tomar água", anim: "agua", titulo: "+5 Hidratação", resposta: "Ela bebeu dois goles e disse \"já bebi bastante hoje\". Não bebeu.", humor: { emoji: "💧", nome: "Hidratada (por 5 min)" } },
    { icone: "🍕", nome: "Perguntar o que ela quer comer", anim: "pensar", titulo: "Erro 404", resposta: "\"Qualquer coisa.\" (Não é qualquer coisa. Nunca é qualquer coisa.)", humor: { emoji: "🤔", nome: "Indecisa" } },
    { icone: "💍", nome: "Pedir mais 10 anos",    titulo: "Evento de vida", resposta: "Iniciando evento especial...", final: true },
  ],

  // Menu de interação do Pedro (clique nele). "balao" é o emoji do balão de pensamento.
  interacoesPedro: [
    { icone: "😘", nome: "Dar um beijo",            anim: "abraco",  titulo: "+20 Romance",  resposta: "Crítico! Pedro esqueceu completamente o que estava fazendo.", humor: { emoji: "😍", nome: "Apaixonada" } },
    { icone: "🍽️", nome: "Pedir pra lavar a louça", anim: "suar",    titulo: "Falha crítica", resposta: "\"Já vou.\" (Registro oficial: isso foi há 3 dias.)", humor: { emoji: "😒", nome: "Desconfiada" } },
    { icone: "📺", nome: "Perguntar se viu o episódio sem ela", anim: "suar", titulo: "Suspeito...", resposta: "Pedro começou a suar e mudou de assunto. Culpado.", humor: { emoji: "🤨", nome: "Investigando" } },
    { icone: "💧", nome: "Mandar ele beber água",   anim: "agua",    titulo: "Vingança!",    resposta: "Agora ele sabe como é. Bebeu o copo inteiro, o exibido.", humor: { emoji: "😏", nome: "Vingada" } },
    { icone: "🛏️", nome: "Roubar a coberta dele",   anim: "pensar",  balao: "🥶", titulo: "Sucesso!", resposta: "Ele nem resistiu. Aprendeu faz tempo.", humor: { emoji: "🥰", nome: "Quentinha" } },
    { icone: "🕺", nome: "Pedir pra dançar Dynamite", anim: "danca", titulo: "+30 Diversão", resposta: "Ele dançou com tudo. A Meg saiu da sala.", humor: { emoji: "😂", nome: "Rindo muito" } },
    { icone: "🥰", nome: "Elogiar",                 anim: "coracao", titulo: "+10 Ego",      resposta: "Ele vai lembrar desse elogio por 3 semanas.", humor: { emoji: "😊", nome: "Fofa" } },
  ],

  // Botão "Trocar de família" (ela vive trocando de família no The Sims...)
  familias: [
    { emoji: "🧙", nome: "Família Weasley",     info: "9 Sims · 1 casa torta · 0 simoleons" },
    { emoji: "💜", nome: "República BTS",       info: "7 Sims · 1 banheiro · muito barulho" },
    { emoji: "🌾", nome: "Fazendeiro do Vale",  info: "1 Sim · 40 galinhas · dorme às 2h" },
    { emoji: "🦇", nome: "Família Caixão",      info: "Clássica · piscina sem escada" },
    { emoji: "🎬", nome: "Casal de Dorama",     info: "2 Sims · 1 amnésia · 16 episódios" },
  ],
  errosFamilia: [
    "Não foi possível trocar. Você já está jogando com a melhor família. 💚",
    "Erro 404: família melhor que a sua não encontrada.",
    "Troca cancelada. A Meg não autorizou.",
    "Karine, já é a quarta tentativa. A resposta continua sendo não. 😄",
  ],

  // Carta de Hogwarts (clique na coruja do lote 3D)
  cartaHogwarts: [
    "HOGWARTS · ESCOLA DE MAGIA E BRUXARIA",
    "Prezada Srta. Karine,",
    "Temos o prazer de informar que V.Sa. tem uma vaga garantida no coração do Sr. Pedro, válida por mais 10 anos, renováveis automaticamente para sempre.",
    "Segue a lista de materiais: 1 coberta (que você vai roubar), 1 garrafinha de água (que você vai esquecer) e 1 pijama pra dormir às 21h.",
    "O ano letivo começa todo dia de manhã, com café.",
    "Atenciosamente,",
    "Pedro, Diretor da Casa Karine",
  ],

  // ✏️ Easter egg: digite "alohomora" no console de cheats (troque pela sua mensagem secreta)
  segredo: "Se você achou isso, é porque é a pessoa mais curiosa que eu conheço. E eu amo isso em você. 💚",

  // ✏️ A CARTA FINAL. Aqui é sem piada: escreva do coração.
  carta: [
    "Dez anos atrás eu não fazia ideia de que estava começando o melhor jogo da minha vida.",
    "Com você eu aprendi que a vida é feita de coisas pequenas: um episódio a mais. Você transforma dias comuns em memórias que eu quero guardar pra sempre.",
    "Obrigado por cada abraço, por cada paciência, por cada vez que você escolheu ficar. Obrigado por ser minha parceira de fazenda, de maratona, de aventura e de vida.",
    "Se eu pudesse criar um Sim perfeito, não mudaria nada. Porque ele já existe, e é você.",
    "E como eu sei que você gosta de saber o final antes de começar, aqui vai o spoiler da nossa história: é um final feliz. 💚",
  ],
  assinatura: "Com todo o meu amor, Pedro",   // ✏️
};
