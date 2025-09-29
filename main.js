// ================= NOTÍCIAS + RSS CORRIGIDO =================

const UNSPLASH_ACCESS_KEY = "kRlxFUuqs5GjPR_aCo9I_SYQ8Xzx2V8T0nGSGWwPRD8";

const KEYWORDS = [
    "abelhas", "criação de abelhas", "hidromel", "apicultura", "meliponicultura", "colmeias racionais", "fauna polinizadora", "cera de abelha", "derivados do mel",
    "polinização", "abelhas nativas", "produção de mel", "vespa africana", "controle de pragas", "apitoxina", "mel puro", "própolis", "veneno de abelha",
    "meio ambiente", "abelhas solitárias", "polinizadores", "inovação na apicultura", "tecnologia apícola", "sanidade apícola",  "apicultura sustentável", "Apis mellifera"
];

// Alternativa 1: Usando CORS Proxy alternativo
async function fetchNews() {
    const query = KEYWORDS.join(" OR ");
    
    // Tentar diferentes proxies
    const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://news.google.com/rss/search?q=${query}&hl=pt-BR&gl=BR&ceid=BR:pt-419`)}`,
        `https://corsproxy.io/?${encodeURIComponent(`https://news.google.com/rss/search?q=${query}&hl=pt-BR&gl=BR&ceid=BR:pt-419`)}`,
        `https://thingproxy.freeboard.io/fetch/https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`
    ];

    for (let proxyUrl of proxies) {
        try {
            console.log(`Tentando proxy: ${proxyUrl}`);
            const response = await fetch(proxyUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (!response.ok) continue;
            
            const text = await response.text();
            console.log("Resposta recebida:", text.substring(0, 500)); // Debug

            return parseRSS(text);
            
        } catch (error) {
            console.warn(`Proxy falhou: ${error.message}`);
            continue;
        }
    }
    
    throw new Error("Todos os proxies falharam");
}

// Alternativa 2: RSS Brasileiro específico para meio ambiente
async function fetchBrazilianNews() {
    const rssFeeds = [
        'https://g1.globo.com/rss/g1/ciencia-e-meio-ambiente/',
        'https://www.embrapa.br/rss/noticias/meio-ambiente',
        'https://agenciabrasil.ebc.com.br/rss/geral/feed.xml',
        'https://www.mma.gov.br/index.php/rss-noticias'
    ];

    for (let feed of rssFeeds) {
        try {
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(feed)}`;
            const response = await fetch(proxyUrl);
            
            if (response.ok) {
                const text = await response.text();
                const news = parseRSS(text);
                
                // Filtrar notícias relevantes
                const filteredNews = news.filter(item => 
                    KEYWORDS.some(keyword => 
                        item.title.toLowerCase().includes(keyword.toLowerCase()) ||
                        item.description.toLowerCase().includes(keyword.toLowerCase())
                    )
                );
                
                if (filteredNews.length > 0) {
                    return filteredNews.slice(0, 3);
                }
            }
        } catch (error) {
            console.warn(`Feed ${feed} falhou:`, error);
        }
    }
    
    return [];
}

// Parse do RSS
function parseRSS(xmlText) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        // Verificar se é XML válido
        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
            throw new Error("XML inválido");
        }

        const items = xmlDoc.querySelectorAll("item");
        const newsList = [];

        items.forEach(item => {
            const title = item.querySelector("title")?.textContent?.trim() || "Título não disponível";
            const link = item.querySelector("link")?.textContent?.trim() || "#";
            const description = extractCleanDescription(item.querySelector("description")?.textContent || "");
            const pubDate = item.querySelector("pubDate")?.textContent || "";
            
            newsList.push({
                title,
                link,
                description,
                pubDate,
                source: "Google News"
            });
        });

        return newsList.slice(0, 6); // Retorna mais para ter backup
    } catch (error) {
        console.error("Erro ao parsear RSS:", error);
        return [];
    }
}

// Limpar descrição HTML
function extractCleanDescription(htmlDesc) {
    if (!htmlDesc) return "Descrição não disponível";
    
    try {
        // Remove tags HTML
        const cleanText = htmlDesc
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .trim();
            
        return cleanText.substring(0, 200) + (cleanText.length > 200 ? '...' : '');
    } catch {
        return htmlDesc.substring(0, 200) + '...';
    }
}

// Buscar imagem com fallback melhor
async function getUnsplashImage(query) {
    const fallbackImages = {
        'abelhas': 'bee',
        'mel': 'honey',
        'apicultura': 'beekeeping',
        'meio ambiente': 'nature',
        'polinização': 'pollination',
        'flores': 'flowers'
    };

    let searchQuery = 'bee honey'; // default
    
    for (const [key, value] of Object.entries(fallbackImages)) {
        if (query.toLowerCase().includes(key)) {
            searchQuery = value;
            break;
        }
    }

    try {
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=3&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`
        );
        
        if (!response.ok) throw new Error('Unsplash API error');
        
        const data = await response.json();
        
        if (data.results?.length > 0) {
            return data.results[0].urls.small;
        }
    } catch (error) {
        console.warn("Erro Unsplash:", error);
    }

    // Fallback para imagem local
    return "img/default-news.jpg";
}

// Renderizar notícia
async function renderNewsItem(news, index) {
    const imageUrl = await getUnsplashImage(news.title);
    
    return `
        <div class="news-item">
            <img src="${imageUrl}" alt="${news.title}" 
                 onerror="this.src='img/default-news.jpg'" />
            <h3>${news.title}</h3>
            <p>${news.description}</p>
            ${news.pubDate ? `<small>${new Date(news.pubDate).toLocaleDateString('pt-BR')}</small>` : ''}
            <a href="${news.link}" target="_blank" rel="noopener noreferrer" class="btn">Ler mais</a>
        </div>
    `;
}

// Renderizar notícias com fallback
async function renderNews() {
    const container = document.getElementById("rss-feed");
    if (!container) return;

    container.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <p>Carregando notícias...</p>
        </div>
    `;

    try {
        let news = await fetchNews();
        
        // Se não encontrar notícias, tenta feeds brasileiros
        if (!news || news.length === 0) {
            console.log("Tentando feeds brasileiros...");
            news = await fetchBrazilianNews();
        }

        // Fallback: notícias estáticas
        if (!news || news.length === 0) {
            console.log("Usando notícias estáticas...");
            news = getStaticNews();
        }

        if (news && news.length > 0) {
            const newsHTML = await Promise.all(
                news.slice(0, 3).map(renderNewsItem)
            );
            container.innerHTML = newsHTML.join('');
        } else {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <p>Nenhuma notícia encontrada no momento.</p>
                    <p>Visite nosso blog para as últimas atualizações.</p>
                </div>
            `;
        }

    } catch (error) {
        console.error("Erro geral:", error);
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <p>Erro ao carregar notícias.</p>
                <p>Por favor, tente atualizar a página.</p>
            </div>
        `;
    }
}

// Notícias estáticas como fallback final
function getStaticNews() {
    return [
        {
            title: "Rede Apimel: Inovação na Apicultura Sustentável",
            link: "#",
            description: "Conheça nosso trabalho com abelhas nativas e produção sustentável de mel na região Nordeste.",
            pubDate: new Date().toISOString(),
            source: "Rede Apimel"
        },
        {
            title: "Importância das Abelhas para o Ecossistema",
            link: "#",
            description: "As abelhas são responsáveis pela polinização de 70% das plantas cultivadas no Brasil.",
            pubDate: new Date().toISOString(),
            source: "Rede Apimel"
        },
        {
            title: "Técnicas Modernas de Meliponicultura",
            link: "#",
            description: "Novas tecnologias para criação sustentável de abelhas sem ferrão na caatinga.",
            pubDate: new Date().toISOString(),
            source: "Rede Apimel"
        }
    ];
}

// ================= SLIDESHOW =================
function initSlideshow() {
    const slides = document.querySelectorAll('.banner-galeria .slides .slide');
    if (slides.length === 0) return;
    
    let current = 0;

    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
    }

    function nextSlide() {
        current = (current + 1) % slides.length;
        showSlide(current);
    }

    showSlide(current);
    setInterval(nextSlide, 5000);
}

// ================= INICIALIZAÇÃO =================
document.addEventListener("DOMContentLoaded", () => {
    renderNews();
    initSlideshow();
});

// ===== CONTROLE CONTEÚDO EXPANSÍVEL =====
function toggleConteudo(conteudoId) {
    const conteudo = document.getElementById(conteudoId);
    const botao = event.target;
    
    // Fechar outros conteúdos abertos
    document.querySelectorAll('.conteudo-expansivel').forEach(item => {
        if (item.id !== conteudoId && item.classList.contains('aberto')) {
            item.classList.remove('aberto');
            // Resetar texto do botão de outros conteúdos
            const outrosBotoes = document.querySelectorAll(`.btn-conheca[onclick*="${item.id}"]`);
            outrosBotoes.forEach(btn => {
                btn.textContent = 'Conheça mais';
            });
        }
    });
    
    // Alternar conteúdo atual
    const estaAberto = conteudo.classList.contains('aberto');
    
    if (estaAberto) {
        conteudo.classList.remove('aberto');
        botao.textContent = 'Conheça mais';
    } else {
        conteudo.classList.add('aberto');
        botao.textContent = 'Fechar';
        
        // Scroll suave para o conteúdo
        setTimeout(() => {
            conteudo.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 300);
    }
}

// Fechar ao clicar fora (opcional)
document.addEventListener('click', function(e) {
    if (!e.target.closest('.conteudo-expansivel') && !e.target.classList.contains('btn-conheca')) {
        document.querySelectorAll('.conteudo-expansivel.aberto').forEach(conteudo => {
            conteudo.classList.remove('aberto');
            // Resetar todos os botões
            document.querySelectorAll('.btn-conheca').forEach(btn => {
                btn.textContent = 'Conheça mais';
            });
        });
    }
});