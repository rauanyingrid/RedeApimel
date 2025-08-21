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

// Substitua pela sua Access Key do Unsplash
const UNSPLASH_ACCESS_KEY = "SUA_ACCESS_KEY_AQUI";

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

  const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
  const data = await response.json();

  const parser = new DOMParser();
  const xml = parser.parseFromString(data.contents, "text/xml");

  const items = xml.querySelectorAll("item");
  const newsList = [];

  items.forEach(item => {
    newsList.push({
      title: item.querySelector("title").textContent,
      link: item.querySelector("link").textContent,
      description: item.querySelector("description")?.textContent || ""
    });
  });

  return newsList.slice(0, 6); // pega as 9 mais recentes
}

// Buscar imagem no Unsplash com base no título
async function getUnsplashImage(query) {
  const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${UNSPLASH_ACCESS_KEY}&orientation=landscape`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.urls?.regular || "img/default.jpg"; // fallback
  } catch (error) {
    console.error("Erro ao buscar imagem no Unsplash:", error);
    return "img/default.jpg";
  }
}

// Montar notícia no HTML
async function renderNewsItem(news) {
  const imageUrl = await getUnsplashImage(news.title);

  return `
    <div class="news-item">
      <img src="${imageUrl}" alt="${news.title}" style="width:100%; border-radius:10px; margin-bottom:10px;" />
      <h3>${news.title}</h3>
      <p>${news.description}</p>
      <a href="${news.link}" target="_blank">Ler mais</a>
    </div>
  `;
}

// Renderizar as notícias, garantindo máximo de 6
async function renderNews() {
  const container = document.querySelector(".news-container");
  if (!container) return;

  container.innerHTML = "<p>Carregando notícias...</p>";

  let news = [];
  try {
    news = await fetchNews();
  } catch (error) {
    console.error("Erro ao buscar notícias:", error);
    container.innerHTML = "<p>Não foi possível carregar as notícias.</p>";
    return;
  }

  if (!news.length) {
    container.innerHTML = "<p>Nenhuma notícia disponível.</p>";
    return;
  }

  // Limita a 6 notícias de forma segura
  const maxNews = 6;
  const newsToRender = news.slice(0, maxNews);

  // Renderiza cada notícia e evita duplicações
  const newsHTML = [];
  for (let i = 0; i < newsToRender.length; i++) {
    const itemHTML = await renderNewsItem(newsToRender[i]);
    // Garante que apenas strings válidas sejam adicionadas
    if (typeof itemHTML === "string" && itemHTML.trim() !== "") {
      newsHTML.push(itemHTML);
    }
  }

  container.innerHTML = newsHTML.join("");
}

// Executar depois que a página carrega
document.addEventListener("DOMContentLoaded", () => {
  renderNews();
});



