import { fetchBooksByCategory, getBookCoverURL, getAuthors } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM carregado na página de promoções');
  carregarPromocoes();
  inicializarTooltip();
});

async function carregarPromocoes() {
  const grid = document.getElementById('promocoes-grid');
  if (!grid) {
    console.error('Elemento #promocoes-grid não encontrado');
    return;
  }

  grid.innerHTML = '<p>Carregando promoções...</p>';

  try {
    const data = await fetchBooksByCategory('bargain_books', 20);
    console.log('Dados recebidos da API (Promoções):', JSON.stringify(data, null, 2));
    if (data && data.works && data.works.length > 0) {
      const livrosHTML = data.works.map(livro => gerarHTMLLivroPromocao(livro)).join('');
      grid.innerHTML = livrosHTML;
    } else {
      grid.innerHTML = '<p>Nenhuma promoção encontrada.</p>';
    }
  } catch (erro) {
    console.error('Erro ao carregar promoções:', erro);
    grid.innerHTML = '<p>Ocorreu um erro ao carregar as promoções. Por favor, tente novamente mais tarde.</p>';
  }
}

function gerarHTMLLivroPromocao(livro) {
  const capaURL = getBookCoverURL(livro);
  const titulo = livro.title || 'Título desconhecido';
  const autores = getAuthors(livro);
  const precoFicticio = (Math.random() * 50 + 10).toFixed(2);

  return `
    <div class="promocao-item">
      <img src="${capaURL}" alt="Capa de ${titulo}" class="capa-livro" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300?text=Sem+Capa'">
      <h3>${titulo}</h3>
      <p>Autor: ${autores}</p>
      <p>Editora: ${livro.publishers ? livro.publishers[0] : 'Desconhecida'}</p>
      <p class="preco">Preço: R$ ${precoFicticio}</p>
      <button class="mais-info-btn" data-key="${livro.key}">Mais informações</button>
    </div>
  `;
}

// Adicione este evento para lidar com os cliques nos botões "Mais informações"
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('mais-info-btn')) {
    const key = e.target.dataset.key;
    window.open(`https://openlibrary.org${key}`, '_blank');
  }
});

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