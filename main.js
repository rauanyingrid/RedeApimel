// Lista de imagens e descrições correspondentes
const galleryData = [
  {
    src: "img/Logo da Rede Apimel.png",
    description: "Descrição da imagem mostrando a identidade visual da Rede Apimel."
  },
  {
    src: "img/banana.jpg",
    description: "Imagem de uma abelha coletando néctar em uma banana."
  },
  {
    src: "img/flower.jpg",
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
