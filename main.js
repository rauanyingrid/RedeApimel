// ================= NOTÍCIAS + RSS CORRIGIDO =================

const UNSPLASH_ACCESS_KEY = "kRlxFUuqs5GjPR_aCo9I_SYQ8Xzx2V8T0nGSGWwPRD8";

const KEYWORDS = [
    "abelhas", "criação de abelhas", "hidromel", "apicultura", "meliponicultura", "colmeias racionais", "fauna polinizadora", "cera de abelha", "derivados do mel",
    "polinização", "abelhas nativas", "produção de mel", "vespa africana", "controle de pragas", "apitoxina", "mel puro", "própolis", "veneno de abelha",
    "meio ambiente", "abelhas solitárias", "polinizadores", "inovação na apicultura", "tecnologia apícola", "sanidade apícola",  "apicultura sustentável", "Apis mellifera"
];

// Função auxiliar para resetar conteúdos
function resetConteudosAbertos(conteudoId) {
    document.querySelectorAll('.conteudo-expansivel').forEach(item => {
        if (item.id !== conteudoId && item.classList.contains('aberto')) {
            item.classList.remove('aberto');
        }
    });
    
    document.querySelectorAll('.btn-conheca').forEach(btn => {
        btn.textContent = 'Conheça mais';
    });
}

// Função unificada para fetch
async function fetchWithRetry(urls, options = {}) {
    for (let url of urls) {
        try {
            console.log(`🔄 Tentando: ${url.substring(0, 100)}...`);
            const response = await fetch(url, options);
            if (response.ok) {
                const text = await response.text();
                console.log("✅ Fetch bem-sucedido");
                return text;
            }
        } catch (error) {
            console.warn(`❌ Fetch falhou: ${error.message}`);
            continue;
        }
    }
    return null;
}

// Buscar notícias do Google News
async function fetchNews() {
    const query = KEYWORDS.join(" OR ");
    console.log(`🔍 Buscando notícias: ${query}`);
    
    const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://news.google.com/rss/search?q=${query}&hl=pt-BR&gl=BR&ceid=BR:pt-419`)}`,
        `https://corsproxy.io/?${encodeURIComponent(`https://news.google.com/rss/search?q=${query}&hl=pt-BR&gl=BR&ceid=BR:pt-419`)}`
    ];

    const text = await fetchWithRetry(proxies, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });
    
    if (text) {
        console.log("📰 RSS obtido com sucesso");
        const news = parseRSS(text);
        const sortedNews = sortNewsByDate(news);
        console.log(`📊 ${sortedNews.length} notícias encontradas no Google News`);
        return sortedNews;
    }
    
    throw new Error("Todos os proxies falharam");
}

// RSS Brasileiro específico
async function fetchBrazilianNews() {
    const rssFeeds = [
        'https://g1.globo.com/rss/g1/ciencia-e-meio-ambiente/',
        'https://www.embrapa.br/rss/noticias/meio-ambiente',
        'https://agenciabrasil.ebc.com.br/rss/geral/feed.xml'
    ];

    let allNews = [];
    console.log("🇧🇷 Buscando em feeds brasileiros...");

    for (let feed of rssFeeds) {
        try {
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(feed)}`;
            const text = await fetchWithRetry([proxyUrl]);
            
            if (text) {
                const news = parseRSS(text);
                console.log(`📰 ${news.length} notícias de ${feed}`);
                
                // Filtrar notícias relevantes
                const filteredNews = news.filter(item => 
                    KEYWORDS.some(keyword => 
                        item.title.toLowerCase().includes(keyword.toLowerCase()) ||
                        (item.description && item.description.toLowerCase().includes(keyword.toLowerCase()))
                    ) && isRecentNews(item.pubDate)
                );

                console.log(`✅ ${filteredNews.length} notícias filtradas de ${feed}`);
                allNews = [...allNews, ...filteredNews];
                
                if (allNews.length >= 6) break;
            }
        } catch (error) {
            console.warn(`❌ Feed ${feed} falhou:`, error);
        }
    }
    
    const sortedNews = sortNewsByDate(allNews);
    console.log(`📊 Total de ${sortedNews.length} notícias brasileiras relevantes`);
    return sortedNews;
}

// Ordenar por data (mais recente primeiro)
function sortNewsByDate(news) {
    if (!news || news.length === 0) return [];
    
    return news.sort((a, b) => {
        const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
        const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
        return dateB - dateA; // Ordem decrescente
    });
}

// Filtrar notícias recentes (últimos 60 dias)
function isRecentNews(pubDate) {
    if (!pubDate) return false; // ❌ CORREÇÃO: Se não tem data, exclui
    
    try {
        const newsDate = new Date(pubDate);
        if (isNaN(newsDate.getTime())) return false; // ❌ CORREÇÃO: Data inválida
        
        const now = new Date();
        const diffTime = now - newsDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        return diffDays <= 60;
    } catch (error) {
        return false; // ❌ CORREÇÃO: Em caso de erro, exclui
    }
}

// Parse do RSS
function parseRSS(xmlText) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "text/xml");
        
        if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
            throw new Error("XML inválido");
        }

        const items = xmlDoc.querySelectorAll("item");
        const newsList = [];

        items.forEach(item => {
            const title = item.querySelector("title")?.textContent?.trim() || "Título não disponível";
            const link = item.querySelector("link")?.textContent?.trim() || "#";
            const description = extractCleanDescription(item.querySelector("description")?.textContent || "");
            const pubDate = item.querySelector("pubDate")?.textContent || 
                           item.querySelector("pubdate")?.textContent ||
                           item.querySelector("date")?.textContent ||
                           "";
            
            // ❌ CORREÇÃO: Só adiciona se tiver título válido
            if (title && title !== "Título não disponível") {
                newsList.push({
                    title,
                    link,
                    description,
                    pubDate,
                    source: "Google News",
                    timestamp: pubDate ? new Date(pubDate).getTime() : Date.now()
                });
            }
        });

        console.log(`📄 ${newsList.length} itens parseados do RSS`);
        return newsList;
    } catch (error) {
        console.error("❌ Erro ao parsear RSS:", error);
        return [];
    }
}

// Limpar descrição HTML
function extractCleanDescription(htmlDesc) {
    if (!htmlDesc) return "Descrição não disponível";
    
    try {
        const cleanText = htmlDesc
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .trim();
            
        return cleanText.substring(0, 150) + (cleanText.length > 150 ? '...' : '');
    } catch {
        return htmlDesc.substring(0, 150) + '...';
    }
}

// Buscar imagem
async function getUnsplashImage(query, index = 0) {
    const searchQueries = [
        'bee honey', 
        'beekeeping', 
        'pollination flowers',
        'honeycomb',
        'apiary',
        'beekeeper'
    ];
    
    const searchQuery = searchQueries[index % searchQueries.length];

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
        console.warn("❌ Erro Unsplash:", error);
    }

    // Fallback para imagens locais diferentes
    const localImages = [
        "img/default-news.jpg",
        "img/abelhas-detalhe.jpg", 
        "img/apicultores.webp"
    ];
    return localImages[index % localImages.length];
}

async function renderNewsItem(news, index) {
    const imageUrl = await getUnsplashImage(news.title, index);
    
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

// Formatar data
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    } catch {
        return "Data não disponível";
    }
}

// Função para mensagens
function getNewsMessage(isError = false) {
    if (isError) {
        return `
            <div style="text-align: center; padding: 40px;">
                <p>Erro ao carregar notícias.</p>
                <p>Por favor, tente atualizar a página.</p>
            </div>
        `;
    } else {
        return `
            <div style="text-align: center; padding: 40px;">
                <p>Nenhuma notícia encontrada no momento.</p>
            </div>
        `;
    }
}

// GARANTE 3 NOTÍCIAS
async function renderNews() {
    const container = document.getElementById("rss-feed");
    if (!container) {
        console.log;
        return;
    }

    console.log;
    container.innerHTML = `<div style="text-align: center; padding: 20px;"><p>Carregando notícias...</p></div>`;

    try {
        let news = [];
        
        // Tenta Google News primeiro
        try {
            news = await fetchNews();
            console.log(`✅ Google News: ${news.length} notícias`);
        } catch (error) {
            console.log("❌ Google News falhou");
            news = await fetchBrazilianNews();
        }

        // Se ainda não tem notícias, tenta feeds brasileiros
        if (!news || news.length === 0) {
            console.log("🔄 Tentando feeds brasileiros como fallback...");
            news = await fetchBrazilianNews();
        }

        // Aplica filtro de data
        if (news && news.length > 0) {
            const recentNews = news.filter(item => isRecentNews(item.pubDate));
            console.log(`📅 ${recentNews.length} notícias recentes após filtro`);
            news = recentNews.length > 0 ? recentNews : news.slice(0, 3);
        }

        // Garante que sempre tem 3 notícias
        let newsToShow = [];
        if (news && news.length > 0) {
            // Pega as 3 mais recentes
            newsToShow = news.slice(0, 3);
            console.log(`🎯 Mostrando ${newsToShow.length} notícias:`);
            newsToShow.forEach((item, i) => {
                console.log(`   ${i + 1}. ${item.title} (${item.pubDate ? formatDate(item.pubDate) : 'sem data'})`);
            });
        } else {
            console.log("📝 Usando notícias estáticas...");
            newsToShow = getStaticNews();
        }

        // Renderiza as notícias
        if (newsToShow.length > 0) {
            const newsHTML = await Promise.all(newsToShow.map(renderNewsItem));
            container.innerHTML = newsHTML.join('');
            console.log(`✅ ${newsToShow.length} notícias renderizadas com sucesso!`);
        } else {
            container.innerHTML = getNewsMessage(false);
            console.log("❌ Nenhuma notícia para mostrar");
        }

    } catch (error) {
        console.error("💥 Erro geral:", error);
        // Fallback para notícias estáticas
        const staticNews = getStaticNews();
        const newsHTML = await Promise.all(staticNews.map(renderNewsItem));
        container.innerHTML = newsHTML.join('');
        console.log("🔄 Usando notícias estáticas devido ao erro");
    }
}

// Notícias estáticas
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
    console.log("🏁 DOM carregado, iniciando...");
    renderNews();
    initSlideshow();
});

// ===== CONTROLE CONTEÚDO EXPANSÍVEL =====
function toggleConteudo(conteudoId) {
    const conteudo = document.getElementById(conteudoId);
    const botao = event.target;
    
    resetConteudosAbertos(conteudoId);
    
    const estaAberto = conteudo.classList.contains('aberto');
    
    if (estaAberto) {
        conteudo.classList.remove('aberto');
        botao.textContent = 'Conheça mais';
    } else {
        conteudo.classList.add('aberto');
        botao.textContent = 'Fechar';
        
        setTimeout(() => {
            conteudo.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 300);
    }
}

// Fechar ao clicar fora
document.addEventListener('click', function(e) {
    if (!e.target.closest('.conteudo-expansivel') && !e.target.classList.contains('btn-conheca')) {
        resetConteudosAbertos();
    }
});