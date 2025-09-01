// ===================== DADOS DE CONTEÚDO =====================
const conteudos = {
  abelhas: [
    { titulo: "O Mundo das Abelhas", imagem: "https://images.unsplash.com/photo-1572083279623-45e0f84d8f87?crop=entropy&cs=tinysrgb&fit=max&h=300&w=400", resumo: "Descubra curiosidades sobre as abelhas e sua importância na produção de mel." },
    { titulo: "Tipos de Abelhas", imagem: "https://images.unsplash.com/photo-1571781920724-109a6f0f8463?crop=entropy&cs=tinysrgb&fit=max&h=300&w=400", resumo: "Conheça diferentes espécies de abelhas e suas características." },
    { titulo: "Ciclo de Vida", imagem: "https://images.unsplash.com/photo-1594646188495-3b6b3f94d0e1?crop=entropy&cs=tinysrgb&fit=max&h=300&w=400", resumo: "Aprenda sobre o ciclo de vida de uma colônia de abelhas." }
  ],
  mudas: [
    { titulo: "Mudas e Conservação", imagem: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?crop=entropy&cs=tinysrgb&fit=max&h=300&w=400", resumo: "Mudas ajudam na conservação da biodiversidade e no equilíbrio ambiental." },
    { titulo: "Como Plantar Mudas", imagem: "https://images.unsplash.com/photo-1589903612610-4b86f0e7b71a?crop=entropy&cs=tinysrgb&fit=max&h=300&w=400", resumo: "Aprenda técnicas de plantio para aumentar a taxa de sobrevivência das mudas." },
    { titulo: "Cuidados com as Mudas", imagem: "https://images.unsplash.com/photo-1600508774215-1c7a887b4d62?crop=entropy&cs=tinysrgb&fit=max&h=300&w=400", resumo: "Saiba como regar, adubar e proteger suas mudas." }
  ],
  culturatecidos: [
    { titulo: "Cultura de Tecidos", imagem: "https://images.unsplash.com/photo-1581090700227-87788fa6c3a6?crop=entropy&cs=tinysrgb&fit=max&h=300&w=400", resumo: "Técnica de propagação de plantas em ambiente controlado para conservação." },
    { titulo: "Laboratório de Cultura", imagem: "https://images.unsplash.com/photo-1581092795368-2b1d6e7a78d8?crop=entropy&cs=tinysrgb&fit=max&h=300&w=400", resumo: "Conheça o ambiente controlado onde as plantas são cultivadas." },
    { titulo: "Benefícios da Técnica", imagem: "https://images.unsplash.com/photo-1581092331493-0c2bc39f1d9f?crop=entropy&cs=tinysrgb&fit=max&h=300&w=400", resumo: "Entenda como a cultura de tecidos contribui para a biodiversidade." }
  ]
};

// ===================== ELEMENTOS DA PÁGINA =====================
const introEl = document.getElementById("intro"); // Bloco introdutório
const conteudoEl = document.getElementById("conteudo"); // Grid de cards
const titHeader = document.getElementById("titulo"); // Título do cabeçalho

// ===================== FUNÇÃO PARA OBTER TÓPICO DA URL =====================
function getTopicoURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("topico") || "abelhas"; // Padrão: abelhas
}

// ===================== FUNÇÃO PARA ATUALIZAR CONTEÚDO =====================
function atualizarConteudo(topico) {
  const itens = conteudos[topico];

  // Se o tópico não existe
  if (!itens) {
    introEl.innerHTML = "<p>Tópico não encontrado.</p>";
    conteudoEl.innerHTML = "";
    titHeader.textContent = "Conheça Mais";
    return;
  }

  // Atualiza o título do cabeçalho
  titHeader.textContent = `Conheça Mais - ${topico.charAt(0).toUpperCase() + topico.slice(1)}`;

  // Primeiro item como bloco introdutório
  const introItem = itens[0];
  introEl.innerHTML = `
    <img src="${introItem.imagem}" alt="${introItem.titulo}">
    <h2>${introItem.titulo}</h2>
    <p>${introItem.resumo}</p>
  `;

  // Cria os cards restantes
  conteudoEl.innerHTML = "";
  for (let i = 1; i < itens.length; i++) {
    const item = itens[i];
    conteudoEl.innerHTML += `
      <div class="card">
        <img src="${item.imagem}" alt="${item.titulo}">
        <div class="card-content">
          <h2>${item.titulo}</h2>
          <p>${item.resumo}</p>
        </div>
      </div>
    `;
  }
}

// ===================== INICIALIZAÇÃO =====================
const topicoAtual = getTopicoURL();
atualizarConteudo(topicoAtual);
