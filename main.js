// Lista de imagens e descrições correspondentes
const galleryData = [
  {
    src: "img/Logo da Rede Apimel.png",
    description: "Descrição da imagem mostrando a identidade visual da Rede Apimel."
  },
  {
    src: "img/sergipetec.png",
    description: "Imagem de uma abelha coletando néctar em uma banana."
  },
  {
    src: "img/img.logo.jpg",
    description: "Abelhas em flores, fundamentais para a polinização."
  }
];

let index = 0;
const imgElement = document.getElementById("welcome-img");
const descriptionElement = document.getElementById("img-description").querySelector("p");

// Função para mostrar imagem e descrição com fade
function showImage(i) {
  imgElement.style.opacity = 0; // fade out
  setTimeout(() => {
    imgElement.src = galleryData[i].src;
    descriptionElement.textContent = galleryData[i].description;
    imgElement.style.opacity = 1; // fade in
  }, 300);
}

// Alternância automática
let interval = setInterval(() => {
  index = (index + 1) % galleryData.length;
  showImage(index);
}, 3000);

// Botões de navegação
document.getElementById("prev-btn").addEventListener("click", () => {
  index = (index - 1 + galleryData.length) % galleryData.length;
  showImage(index);
  resetInterval();
});

document.getElementById("next-btn").addEventListener("click", () => {
  index = (index + 1) % galleryData.length;
  showImage(index);
  resetInterval();
});

// Reinicia o intervalo quando usuário clica nos botões
function resetInterval() {
  clearInterval(interval);
  interval = setInterval(() => {
    index = (index + 1) % galleryData.length;
    showImage(index);
  }, 3000);
}

// Mensagem de erro caso a imagem não carregue
imgElement.onerror = () => console.error("Erro ao carregar imagem: " + galleryData[index].src);



// ================= NOTÍCIAS + UNSPLASH =================

const UNSPLASH_ACCESS_KEY = "kRlxFUuqs5GjPR_aCo9I_SYQ8Xzx2V8T0nGSGWwPRD8";

// Palavras-chave para buscar notícias
const KEYWORDS = [
  "abelhas", "hidromel", "apitoquicina", "meliponicultura",
  "polinização", "palinologia", "fenologia", "apicultura",
  "cultura de tecidos", "conservação de abelhas"
];

// Buscar notícias via Google News RSS
async function fetchNews() {
  const query = KEYWORDS.join(" OR ");
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;

  try {
    const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    const data = await response.json();

    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, "text/xml");

    const items = xml.querySelectorAll("item");
    const newsList = [];

    items.forEach(item => {
      newsList.push({
        title: item.querySelector("title")?.textContent || "Título não disponível",
        link: item.querySelector("link")?.textContent || "#",
        description: item.querySelector("description")?.textContent || "",
        source: item.querySelector("source")?.textContent || "Fonte desconhecida",
        sourceUrl: item.querySelector("source")?.getAttribute("url") || "#"
      });
    });

    return newsList.slice(0, 3); // pega as 3 mais recentes
  } catch (error) {
    console.error("Erro ao buscar notícias:", error);
    return [];
  }
}

// Buscar imagem no Unsplash com fallback seguro

async function getUnsplashImage(query) {
  const accessKey = "kRlxFUuqs5GjPR_aCo9I_SYQ8Xzx2V8T0nGSGWwPRD8"; 

  const keywords = ["bee", "honey", "beekeeping", "flowers", "nature", "environment"];

  try {
    //tenta pelo título da notícia
    let response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${accessKey}`
    );
    let data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].urls.small;
    }

    //se não encontrou, sorteia uma palavra-chave da lista
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    response = await fetch(
      `https://api.unsplash.com/search/photos?query=${randomKeyword}&per_page=1&orientation=landscape&client_id=${accessKey}`
    );
    data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].urls.small;
    }

    //se não veio nada, cai no fallback
    return "img/default.jpg";

  } catch (error) {
    console.error("Erro ao buscar imagem do Unsplash:", error);
    return "img/default.jpg";
  }
}


// Montar notícia no HTML com fallback de imagem
async function renderNewsItem(news) {
  let imageUrl = "img/default.jpg"; // fallback inicial

  try {
    // tenta buscar imagem relacionada no Unsplash
    imageUrl = await getUnsplashImage(news.title);
  } catch (e) {
    console.warn("Usando imagem padrão para:", news.title);
  }

  return `
    <div class="news-item">
      <img src="${imageUrl}" 
           alt="${news.title}" 
           style="width:100%; border-radius:10px; margin-bottom:10px;" 
           onerror="this.src='img/default.jpg'" />
      <h3>${news.title}</h3>
      <p>${news.description}</p>
      <p><strong>Fonte:</strong> 
        <a href="${news.sourceUrl}" target="_blank">${news.source}</a>
      </p>
      <a href="${news.link}" target="_blank">Ler mais</a>
    </div>
  `;
}


// Renderizar todas as notícias em paralelo
async function renderNews() {
  const container = document.querySelector(".news-container");
  if (!container) return;

  container.innerHTML = "<p>Carregando notícias...</p>";

  const news = await fetchNews();

  if (!news.length) {
    container.innerHTML = "<p>Nenhuma notícia disponível.</p>";
    return;
  }

  const newsToRender = news.slice(0, 3); // garante máximo de 6 notícias
  const newsHTML = await Promise.all(newsToRender.map(newsItem => renderNewsItem(newsItem)));

  container.innerHTML = newsHTML.join("");
}

// Executar depois que a página carrega
document.addEventListener("DOMContentLoaded", () => {
  renderNews();
});
