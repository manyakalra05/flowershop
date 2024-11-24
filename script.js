document.addEventListener('DOMContentLoaded', function() {
  // Shopping Cart
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

  // Initialize icons
  updateCartIcon();
  updateFavoritesIcon();

  // Add to cart functionality
  document.querySelectorAll('.cart-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const productBox = this.closest('.box');
      const productName = productBox.querySelector('h3').textContent;
      const productPrice = parseFloat(productBox.querySelector('.price').textContent.replace('$', ''));
      const productImage = productBox.querySelector('img').src;
      const productCategory = 'flower'; // Default category
      
      addToCart(productName, productPrice, productImage, productCategory);
      updateCartIcon();
      showAlert(`${productName} added to cart!`, 'success');
    });
  });

  // Add to favorites functionality
  document.querySelectorAll('.fa-heart').forEach(heart => {
    // Check if this item is already favorited
    const productBox = heart.closest('.box');
    if (productBox) {
      const productName = productBox.querySelector('h3').textContent;
      if (favorites.some(item => item.name === productName)) {
        heart.classList.add('active');
      }
    }
    
    heart.addEventListener('click', function(e) {
      e.preventDefault();
      const productBox = this.closest('.box');
      if (productBox) {
        const productName = productBox.querySelector('h3').textContent;
        const productPrice = parseFloat(productBox.querySelector('.price').textContent.replace('$', ''));
        const productImage = productBox.querySelector('img').src;
        const productCategory = 'flower'; // Default category
        
        toggleFavorite(productName, productPrice, productImage, productCategory);
        this.classList.toggle('active');
        updateFavoritesIcon();
      }
    });
  });

  // Create and append modal elements
  const cartModal = createCartModal();
  const favModal = createFavoritesModal();
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  
  document.body.appendChild(cartModal);
  document.body.appendChild(favModal);
  document.body.appendChild(overlay);

// Replace the cart icon click handler with this:
document.querySelector('.fa-shopping-cart').addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation(); // Add this line
  
  cartModal.classList.add('active');
  favModal.classList.remove('active');
  overlay.classList.add('active');
  renderCartItems();
});

// Replace the favorites icon click handler with this:
document.querySelector('.fa-heart').addEventListener('click', function(e) {
  e.preventDefault();
  e.stopPropagation(); // Add this line
  
  favModal.classList.add('active');
  cartModal.classList.remove('active');
  overlay.classList.add('active');
  renderFavoritesItems();
});

  // Overlay click handler
  overlay.addEventListener('click', function() {
    cartModal.classList.remove('active');
    favModal.classList.remove('active');
    this.classList.remove('active');
  });

  // Mobile menu functionality
  const toggler = document.getElementById('toggler');
  toggler.addEventListener('change', function() {
    document.body.style.overflow = this.checked ? 'hidden' : '';
  });

  // Close menu when clicking a link
  document.querySelectorAll('.navbar a').forEach(link => {
    link.addEventListener('click', () => {
      toggler.checked = false;
      document.body.style.overflow = '';
    });
  });

  // Helper functions
  function addToCart(name, price, image, category) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ name, price, image, quantity: 1, category });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  function toggleFavorite(name, price, image, category) {
    const existingIndex = favorites.findIndex(item => item.name === name);
    if (existingIndex >= 0) {
      favorites.splice(existingIndex, 1);
      showAlert(`${name} removed from favorites!`, 'info');
    } else {
      favorites.push({ name, price, image, category });
      showAlert(`${name} added to favorites!`, 'success');
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }

  function updateCartIcon() {
    const cartIcon = document.querySelector('.fa-shopping-cart');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Remove existing badge if any
    const existingBadge = cartIcon.querySelector('.cart-badge');
    if (existingBadge) existingBadge.remove();
    
    if (totalItems > 0) {
      const badge = document.createElement('span');
      badge.className = 'cart-badge';
      badge.textContent = totalItems;
      cartIcon.appendChild(badge);
    }
  }

  function updateFavoritesIcon() {
    const favIcon = document.querySelector('.fa-heart');
    const totalFavorites = favorites.length;
    
    // Remove existing badge if any
    const existingBadge = favIcon.querySelector('.favorites-badge');
    if (existingBadge) existingBadge.remove();
    
    if (totalFavorites > 0) {
      const badge = document.createElement('span');
      badge.className = 'favorites-badge';
      badge.textContent = totalFavorites;
      favIcon.appendChild(badge);
    }
  }

  function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
      alert.classList.add('fade-out');
      setTimeout(() => alert.remove(), 500);
    }, 2000);
  }

  function createCartModal() {
    const modal = document.createElement('div');
    modal.className = 'cart-modal';
    modal.innerHTML = `
      <div class="cart-header">
        <h3>Your Cart</h3>
        <span class="close-cart">&times;</span>
      </div>
      <div class="cart-items"></div>
      <div class="cart-total">Total: $0.00</div>
      <div class="cart-actions">
        <a href="#" class="btn">View Cart</a>
        <a href="#" class="btn">Checkout</a>
      </div>
    `;

    modal.querySelector('.close-cart').addEventListener('click', function() {
      modal.classList.remove('active');
      overlay.classList.remove('active');
    });

    return modal;
  }

  function createFavoritesModal() {
    const modal = document.createElement('div');
    modal.className = 'favorites-modal';
    modal.innerHTML = `
      <div class="favorites-header">
        <h3>Your Favorites</h3>
        <span class="close-favorites">&times;</span>
      </div>
      <div class="favorites-items"></div>
    `;

    modal.querySelector('.close-favorites').addEventListener('click', function() {
      modal.classList.remove('active');
      overlay.classList.remove('active');
    });

    return modal;
  }

  function renderCartItems() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotal = document.querySelector('.cart-total');
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
      cartTotal.textContent = 'Total: $0.00';
      return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
          <div class="cart-item-quantity">
            <button class="decrease">-</button>
            <span>${item.quantity}</span>
            <button class="increase">+</button>
            <button class="remove-item">×</button>
          </div>
        </div>
      `;
      
      cartItemsContainer.appendChild(cartItem);
      
      // Quantity controls
      cartItem.querySelector('.increase').addEventListener('click', () => {
        item.quantity++;
        updateCart();
      });
      
      cartItem.querySelector('.decrease').addEventListener('click', () => {
        if (item.quantity > 1) {
          item.quantity--;
        } else {
          cart = cart.filter(cartItem => cartItem.name !== item.name);
        }
        updateCart();
      });
      
      cartItem.querySelector('.remove-item').addEventListener('click', () => {
        cart = cart.filter(cartItem => cartItem.name !== item.name);
        updateCart();
      });
    });
    
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;
    document.querySelector('.cart-header h3').textContent = `Your Cart (${cart.reduce((total, item) => total + item.quantity, 0)})`;
  }

  function renderFavoritesItems() {
    const favItemsContainer = document.querySelector('.favorites-items');
    const favHeader = document.querySelector('.favorites-header h3');
    
    favItemsContainer.innerHTML = '';
    favHeader.textContent = `Your Favorites (${favorites.length})`;
    
    if (favorites.length === 0) {
      favItemsContainer.innerHTML = '<p>Your favorites list is empty</p>';
      return;
    }
    
    favorites.forEach(item => {
      const favItem = document.createElement('div');
      favItem.className = 'favorite-item';
      favItem.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="favorite-item-details">
          <div class="favorite-item-title">${item.name}</div>
          <div class="favorite-item-price">$${item.price.toFixed(2)}</div>
          <div class="favorite-item-actions">
            <button class="add-to-cart">Add to Cart</button>
            <button class="remove-favorite">Remove</button>
          </div>
        </div>
      `;
      
      favItemsContainer.appendChild(favItem);
      
      favItem.querySelector('.add-to-cart').addEventListener('click', () => {
        addToCart(item.name, item.price, item.image, item.category);
        updateCartIcon();
        showAlert(`${item.name} added to cart!`, 'success');
      });
      
      favItem.querySelector('.remove-favorite').addEventListener('click', () => {
        favorites = favorites.filter(favItem => favItem.name !== item.name);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderFavoritesItems();
        updateFavoritesIcon();
        
        // Update heart icon in products
        document.querySelectorAll('.box').forEach(box => {
          if (box.querySelector('h3').textContent === item.name) {
            box.querySelector('.fa-heart').classList.remove('active');
          }
        });
      });
    });
  }

  function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartIcon();
  }
});
<!-- 2025-02-17T23:17:42+05:30 -->
<!-- 2025-02-26T10:50:44+05:30 -->
<!-- 2025-03-09T11:05:44+05:30 -->
<!-- 2025-04-26T22:11:56+05:30 -->
<!-- 2025-05-01T03:12:59+05:30 -->
<!-- 2025-05-21T07:27:05+05:30 -->
<!-- 2025-05-29T21:23:06+05:30 -->
<!-- 2025-06-09T04:40:07+05:30 -->
<!-- 2025-08-24T23:55:20+05:30 -->
<!-- 2025-10-29T23:20:27+05:30 -->
<!-- Update 2024-11-16T08:53:10+05:30 -->
<!-- Update 2024-11-24T17:02:13+05:30 -->