const API_BASE_URL = 'https://openlibrary.org';

async function fetchTrendingBooks(limit = 20, offset = 0) {
    const url = `${API_BASE_URL}/trending/daily.json?limit=${limit}&offset=${offset}`;
    return await fetchData(url);
}

async function fetchBooksByCategory(category, limit = 10, offset = 0) {
    const url = `${API_BASE_URL}/subjects/${encodeURIComponent(category)}.json?limit=${limit}&offset=${offset}`;
    return await fetchData(url);
}

async function fetchBookDetails(key) {
    const url = `${API_BASE_URL}${key}.json`;
    return await fetchData(url);
}

async function fetchBooksBySearch(query, limit = 10) {
    const url = `${API_BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=${limit}`;
    return await fetchData(url);
}

async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Dados recebidos da API:', data); // Adicionado para debug
        return data;
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        throw error;
    }
}

function getBookCoverURL(book) {
    if (book.cover_id) {
        return `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`;
    } else if (book.cover_i) {
        return `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`;
    } else {
        return 'https://via.placeholder.com/200x300.png?text=Capa+não+disponível';
    }
}

function getAuthors(book) {
    if (book.author_name && book.author_name.length > 0) {
        return book.author_name.join(', ');
    } else if (book.authors && book.authors.length > 0) {
        return book.authors.map(author => author.name).join(', ');
    } else {
        return 'Autor desconhecido';
    }
}

export {
    fetchTrendingBooks,
    fetchBooksByCategory,
    fetchBookDetails,
    fetchBooksBySearch,
    getBookCoverURL,
    getAuthors
};