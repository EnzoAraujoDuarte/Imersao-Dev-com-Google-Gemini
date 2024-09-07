import {
  fetchTrendingBooks,
  fetchBooksByCategory,
  fetchBooksBySearch,
  getBookCoverURL,
  getAuthors
} from './api.js';

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM carregado');
  inicializarEventListeners();
  inicializarMenuHamburguer();
  
  if (document.body.classList.contains('index-page')) {
    carregarBestsellers();
  } else if (document.body.classList.contains('bestsellers-page')) {
    inicializarPaginaBestsellers();
  }
});

function inicializarEventListeners() {
  const searchInput = document.getElementById('termo-pesquisa');
  const searchButton = document.querySelector('.searchButton');
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const resultadosSection = document.getElementById('resultados-pesquisa');
  const carouselSection = document.getElementById('bestsellers');
  const categoriaGrid = document.getElementById('categoria-grid');

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      if (this.value === '') {
        resultadosSection.style.display = 'none';
        carouselSection.style.display = 'block';
        categoriaGrid.style.display = 'none';
      }
    });

    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        realizarPesquisa();
      }
    });
  }

  if (searchButton) {
    searchButton.addEventListener('click', realizarPesquisa);
  }

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      menuToggle.classList.toggle('active');
    });
  }

  const categoryLinks = document.querySelectorAll('.dropdown-content a');
  categoryLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const categoria = e.target.dataset.categoria;
      carregarLivrosPorCategoria(categoria);
    });
  });
}

async function realizarPesquisa() {
  const termo = document.getElementById('termo-pesquisa').value;
  if (termo.length < 3) return;

  const resultadosSection = document.getElementById('resultados-pesquisa');
  const carouselSection = document.getElementById('bestsellers');
  const categoriaGrid = document.getElementById('categoria-grid');

  resultadosSection.innerHTML = '<p>Pesquisando...</p>';
  resultadosSection.style.display = 'block';
  carouselSection.style.display = 'none';
  categoriaGrid.style.display = 'none';

  try {
    const data = await fetchBooksBySearch(termo);
    if (data && data.docs && data.docs.length > 0) {
      const livrosHTML = data.docs.map(livro => gerarHTMLLivroPesquisa(livro)).join('');
      resultadosSection.innerHTML = `<div class="resultados-grid">${livrosHTML}</div>`;
    } else {
      resultadosSection.innerHTML = '<p>Nenhum resultado encontrado.</p>';
    }
  } catch (erro) {
    console.error('Erro na pesquisa:', erro);
    resultadosSection.innerHTML = '<p>Ocorreu um erro na pesquisa. Por favor, tente novamente.</p>';
  }
}

function gerarHTMLLivroPesquisa(livro) {
  const capaURL = getBookCoverURL(livro);
  const titulo = livro.title || 'Título desconhecido';
  const autores = getAuthors(livro);
  const ano = livro.first_publish_year || 'Desconhecido';
  const descricao = livro.description ? livro.description.substring(0, 200) + '...' : 'Descrição não disponível';

  return `
    <div class="resultado-pesquisa-card">
      <img src="${capaURL}" alt="Capa de ${titulo}" class="capa-livro" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300?text=Sem+Capa'">
      <div class="info-basica">
        <h3>${titulo}</h3>
        <p>Autor: ${autores}</p>
      </div>
      <div class="info-detalhada">
        <p>Ano: ${ano}</p>
        <p>Descrição: ${descricao}</p>
      </div>
    </div>
  `;
}

function inicializarMenuHamburguer() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      mainNav.classList.toggle('active');
    });
  } else {
    console.error('Elementos do menu hambúrguer não encontrados');
  }
}

let offset = 0;
const livrosPorCarregamento = 40;

async function carregarBestsellers() {
  const carouselTrack = document.querySelector('.carousel-track');
  if (!carouselTrack) {
    console.error('Elemento .carousel-track não encontrado');
    return;
  }

  if (offset === 0) {
    carouselTrack.innerHTML = '<p>Carregando bestsellers...</p>';
  }

  try {
    const data = await fetchTrendingBooks(livrosPorCarregamento, offset);
    console.log('Dados recebidos da API:', JSON.stringify(data, null, 2));
    if (data && data.works && data.works.length > 0) {
      const livrosHTML = data.works.map(livro => gerarHTMLLivro(livro)).join('');
      if (offset === 0) {
        carouselTrack.innerHTML = livrosHTML;
      } else {
        carouselTrack.insertAdjacentHTML('beforeend', livrosHTML);
      }
      inicializarCarrossel();
      offset += livrosPorCarregamento;
    } else {
      if (offset === 0) {
        carouselTrack.innerHTML = '<p>Nenhum bestseller encontrado.</p>';
      }
    }
  } catch (erro) {
    console.error('Erro ao carregar bestsellers:', erro);
    if (offset === 0) {
      carouselTrack.innerHTML = '<p>Ocorreu um erro ao carregar os bestsellers. Por favor, tente novamente mais tarde.</p>';
    }
  }
}

function gerarHTMLLivro(livro) {
  console.log('Gerando HTML para livro:', JSON.stringify(livro, null, 2)); // Melhor formatação do log
  const capaURL = getBookCoverURL(livro);
  const titulo = livro.title || 'Título desconhecido';
  const autores = getAuthors(livro);
  const ano = livro.first_publish_year || 'Ano desconhecido';

  return `
    <div class="carousel-item" data-key="${livro.key}">
      <img src="${capaURL}" alt="Capa de ${titulo}" class="capa-livro" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300?text=Sem+Capa'">
      <div class="info-livro">
        <h3>${titulo}</h3>
        <p class="descricao-meta">Autor(es): ${autores}</p>
        <p class="ano-publicacao">Ano: ${ano}</p>
        <button class="mais-info-btn" data-key="${livro.key}">Mais informações</button>
      </div>
    </div>
  `;
}

function inicializarCarrossel() {
  const track = document.querySelector('.carousel-track');
  const prevButton = document.querySelector('.carousel-button-prev');
  const nextButton = document.querySelector('.carousel-button-next');
  
  if (!track || !prevButton || !nextButton) {
    console.error('Elementos do carrossel não encontrados');
    return;
  }

  let currentIndex = 0;
  const items = track.children;
  const itemWidth = items[0].getBoundingClientRect().width;

  nextButton.addEventListener('click', () => {
    if (currentIndex < items.length - 1) {
      currentIndex++;
      track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;

      // Carregar mais livros quando estiver próximo do final
      if (currentIndex >= items.length - 5) {
        carregarBestsellers();
      }
    }
  });

  prevButton.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
    }
  });

  // Adicionar evento de clique para os botões "Mais informações"
  track.addEventListener('click', (e) => {
    if (e.target.classList.contains('mais-info-btn')) {
      const key = e.target.dataset.key;
      window.open(`https://openlibrary.org${key}`, '_blank');
    }
  });
}

// Implementar outras funções necessárias

// Exemplo de função de pesquisa (se necessário)
async function carregarLivrosPorCategoria(categoria) {
  const grid = document.getElementById('categoria-grid');
  const resultadosSection = document.getElementById('resultados-pesquisa');
  const carouselSection = document.getElementById('bestsellers');

  if (!grid) {
    console.error('Elemento #categoria-grid não encontrado');
    return;
  }

  grid.style.display = 'block';
  resultadosSection.style.display = 'none';
  carouselSection.style.display = 'none';
  grid.innerHTML = '<p>Carregando livros...</p>';

  try {
    const data = await fetchBooksByCategory(categoria, 20);
    console.log('Dados recebidos da categoria:', JSON.stringify(data, null, 2));
    if (data && data.works && data.works.length > 0) {
      const livrosHTML = data.works.map(livro => gerarHTMLLivroCategoria(livro)).join('');
      grid.innerHTML = `<h2>${categoria}</h2><div class="livros-grid">${livrosHTML}</div>`;
    } else {
      grid.innerHTML = `<p>Nenhum livro encontrado na categoria ${categoria}.</p>`;
    }
  } catch (erro) {
    console.error(`Erro ao carregar livros da categoria ${categoria}:`, erro);
    grid.innerHTML = '<p>Ocorreu um erro ao carregar os livros. Por favor, tente novamente mais tarde.</p>';
  }
}

function gerarHTMLLivroCategoria(livro) {
  const capaURL = getBookCoverURL(livro);
  const titulo = livro.title || 'Título desconhecido';
  const autores = getAuthors(livro);

  return `
    <div class="categoria-item">
      <img src="${capaURL}" alt="Capa de ${titulo}" class="capa-livro" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300?text=Sem+Capa'">
      <h3>${titulo}</h3>
      <p>Autor: ${autores}</p>
    </div>
  `;
}

// Implementar outras funções necessárias

let offsetBestsellers = 0;
const livrosPorCarregamentoBestsellers = 20;

async function carregarBestsellersCompleto() {
  const grid = document.getElementById('bestsellers-grid');
  const loadMoreButton = document.getElementById('load-more');
  if (!grid || !loadMoreButton) return;

  if (offsetBestsellers === 0) {
    grid.innerHTML = '<p>Carregando bestsellers...</p>';
  }

  try {
    const data = await fetchTrendingBooks(livrosPorCarregamentoBestsellers, offsetBestsellers);
    console.log('Dados recebidos da API (Bestsellers):', JSON.stringify(data, null, 2));
    if (data && data.works && data.works.length > 0) {
      const livrosHTML = data.works.map(livro => gerarHTMLLivroCompleto(livro)).join('');
      if (offsetBestsellers === 0) {
        grid.innerHTML = livrosHTML;
      } else {
        grid.insertAdjacentHTML('beforeend', livrosHTML);
      }
      offsetBestsellers += livrosPorCarregamentoBestsellers;
      
      // Mostrar o botão "Ver mais" se houver mais livros para carregar
      loadMoreButton.style.display = data.works.length === livrosPorCarregamentoBestsellers ? 'block' : 'none';
    } else {
      if (offsetBestsellers === 0) {
        grid.innerHTML = '<p>Nenhum bestseller encontrado.</p>';
      }
      loadMoreButton.style.display = 'none';
    }
  } catch (erro) {
    console.error('Erro ao carregar bestsellers:', erro);
    if (offsetBestsellers === 0) {
      grid.innerHTML = '<p>Ocorreu um erro ao carregar os bestsellers. Por favor, tente novamente mais tarde.</p>';
    }
    loadMoreButton.style.display = 'none';
  }
}

function gerarHTMLLivroCompleto(livro) {
  const capaURL = getBookCoverURL(livro);
  const titulo = livro.title || 'Título desconhecido';
  const autores = getAuthors(livro);
  const ano = livro.first_publish_year || 'Ano desconhecido';

  return `
    <div class="bestseller-item">
      <img src="${capaURL}" alt="Capa de ${titulo}" class="capa-livro" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300?text=Sem+Capa'">
      <h3>${titulo}</h3>
      <p>Autor: ${autores}</p>
      <p>Ano de publicação: ${ano}</p>
      <button class="mais-info-btn" data-key="${livro.key}">Mais informações</button>
    </div>
  `;
}

// Adicione esta função no final do arquivo
function inicializarPaginaBestsellers() {
  carregarBestsellersCompleto();
  const loadMoreButton = document.getElementById('load-more');
  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', carregarBestsellersCompleto);
  }
  inicializarTooltip();
}

function inicializarTooltip() {
  const infoIcon = document.getElementById('infoIcon');
  const infoTooltip = document.getElementById('infoTooltip');

  if (infoIcon && infoTooltip) {
    infoIcon.addEventListener('mouseenter', () => {
      infoTooltip.style.display = 'block';
    });

    infoIcon.addEventListener('mouseleave', () => {
      infoTooltip.style.display = 'none';
    });

    // Adiciona suporte para dispositivos móveis
    infoIcon.addEventListener('click', () => {
      if (infoTooltip.style.display === 'block') {
        infoTooltip.style.display = 'none';
      } else {
        infoTooltip.style.display = 'block';
      }
    });
  } else {
    console.error('Elementos do tooltip não encontrados');
  }
}