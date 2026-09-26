/**
 * Client Application Logic for Listicle Part 2
 */

document.addEventListener('DOMContentLoaded', () => {
  const itemsContainer = document.getElementById('items-container');
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const categoryFilter = document.getElementById('category-filter');
  const resultsCount = document.getElementById('results-count');
  const detailModal = document.getElementById('detail-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalBody = document.getElementById('modal-body');

  let allItems = [];
  let debounceTimer = null;

  // Initialize data fetch
  fetchItems();

  // Event Listeners
  searchInput.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    if (value !== '') {
      clearSearchBtn.classList.add('visible');
    } else {
      clearSearchBtn.classList.remove('visible');
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchItems();
    }, 300);
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.classList.remove('visible');
    fetchItems();
  });

  categoryFilter.addEventListener('change', () => {
    filterAndRenderItems();
  });

  closeModalBtn.addEventListener('click', () => {
    closeModal();
  });

  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      closeModal();
    }
  });

  /**
   * Fetch items from PostgreSQL backend via API endpoint
   */
  async function fetchItems() {
    try {
      itemsContainer.innerHTML = '<div class="loading-spinner">Loading innovations from database...</div>';
      const query = searchInput.value.trim();
      const url = query ? `/api/items?q=${encodeURIComponent(query)}` : '/api/items';

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.statusText}`);
      }

      allItems = await response.json();
      filterAndRenderItems();
    } catch (error) {
      console.error('Error loading items:', error);
      itemsContainer.innerHTML = `
        <div class="no-results">
          <h3>⚠️ Unable to load database items</h3>
          <p>${error.message}</p>
        </div>
      `;
    }
  }

  /**
   * Filter items by selected category and render cards
   */
  function filterAndRenderItems() {
    const selectedCategory = categoryFilter.value;

    let filtered = allItems;
    if (selectedCategory !== 'ALL') {
      filtered = allItems.filter(
        (item) => item.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    resultsCount.textContent = `Showing ${filtered.length} Innovation${filtered.length === 1 ? '' : 's'}`;

    if (filtered.length === 0) {
      itemsContainer.innerHTML = `
        <div class="no-results">
          <h3>No matching innovations found</h3>
          <p>Try searching with a different keyword or selecting another category.</p>
        </div>
      `;
      return;
    }

    itemsContainer.innerHTML = filtered
      .map(
        (item, index) => `
      <article class="item-card" data-id="${item.id}">
        <div class="card-image-wrapper">
          <img class="card-image" src="${item.image_url}" alt="${item.title}" loading="lazy" />
          <span class="card-rank">#${item.id}</span>
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span class="category-badge">${item.category}</span>
            <span class="rating-badge">★ ${item.rating}</span>
          </div>
          <h3 class="card-title">${item.title}</h3>
          <p class="card-description">${item.description}</p>
          <button class="view-btn" data-id="${item.id}">Explore Innovation →</button>
        </div>
      </article>
    `
      )
      .join('');

    // Attach click listeners to "Explore Innovation" buttons
    document.querySelectorAll('.view-btn').forEach((button) => {
      button.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        openModal(id);
      });
    });
  }

  /**
   * Open details modal for a selected item ID
   */
  async function openModal(id) {
    try {
      const response = await fetch(`/api/items/${id}`);
      if (!response.ok) throw new Error('Item details not found');
      const item = await response.json();

      modalBody.innerHTML = `
        <img class="modal-hero-img" src="${item.image_url}" alt="${item.title}" />
        <div class="modal-details-body">
          <div class="modal-meta-row">
            <span class="category-badge">${item.category}</span>
            <span class="rating-badge">★ ${item.rating} / 5.0</span>
          </div>
          <h2 class="modal-details-title">#${item.id}. ${item.title}</h2>
          <p class="modal-description">${item.description}</p>
        </div>
      `;

      detailModal.classList.remove('hidden');
    } catch (err) {
      console.error('Error fetching item detail:', err);
    }
  }

  function closeModal() {
    detailModal.classList.add('hidden');
  }
});
