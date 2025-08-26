const CONTENT = {
  apicultura: {
    title: "Apicultura",
    text: `
      A apicultura é a prática da criação de abelhas com ferrão para a produção de mel,
      própolis, cera e outros produtos. Ela desempenha um papel essencial para a polinização
      e sustentabilidade ambiental, além de ter grande importância econômica.
    `
  },
  polinizacao: {
    title: "Polinização",
    text: `
      A polinização é o processo pelo qual o pólen é transferido de uma flor para outra,
      permitindo a reprodução das plantas. As abelhas são os principais agentes desse processo,
      garantindo a biodiversidade e a produção de alimentos.
    `
  },
  meliponicultura: {
    title: "Meliponicultura",
    text: `
      A meliponicultura é a criação de abelhas nativas sem ferrão. Essa prática vem crescendo no Brasil,
      pois além de preservar espécies nativas, gera produtos como o mel de abelha sem ferrão,
      muito valorizado pela sua qualidade.
    `
  }
};

// Função para pegar parâmetros da URL

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param); // retorna o valor do parâmetro
}

// Função que carrega o conteúdo
function loadContent() {
  // Pega o parâmetro "topic" da URL
  const topic = getQueryParam("topic");

  // Se o tópico existe dentro do objeto CONTENT, exibe o conteúdo
  if (topic && CONTENT[topic]) {
    document.getElementById("page-title").textContent = CONTENT[topic].title;
    document.getElementById("content").innerHTML = `<p>${CONTENT[topic].text}</p>`;
  } else {
    // Caso o usuário acesse um tópico que não existe
    document.getElementById("page-title").textContent = "Assunto não encontrado";
    document.getElementById("content").innerHTML = `<p>O conteúdo solicitado não está disponível.</p>`;
  }
}

// Executa a função quando a página carregar
document.addEventListener("DOMContentLoaded", loadContent);
