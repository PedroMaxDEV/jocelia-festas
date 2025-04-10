let products = [];
let cart = [];
let currentImages = [];
let currentImageIndex = 0;

fetch('dados/produtos.json')
  .then(response => response.json())
  .then(data => {
    products = data;
    displayProducts(products);
  });

function displayProducts(prodList) {
  const list = document.getElementById('product-list');
  list.innerHTML = '';
  prodList.forEach(product => {
    const item = document.createElement('div');
    item.className = 'product';
    item.innerHTML = `
      <img src="${product.imagens[0]}" onclick="openModal(${product.id})">
      <h3>${product.nome}</h3>
      <p>R$ ${product.preco.toFixed(2)}</p>
      <p>${product.descricao}</p>
      <button onclick="addToCart(${product.id})">Adicionar ao Carrinho</button>
    `;
    list.appendChild(item);
  });
}

function filterProducts(category) {
  if (category === 'destaques') {
    displayProducts(products.filter(p => p.destaque));
  } else {
    displayProducts(products.filter(p => p.categoria === category));
  }
}

function searchProducts() {
  const term = document.getElementById('search').value.toLowerCase();
  const results = products.filter(p => p.nome.toLowerCase().includes(term) || p.id.toString() === term);
  const suggestionBox = document.getElementById('search-suggestions');
  suggestionBox.innerHTML = '';
  results.forEach(r => {
    const div = document.createElement('div');
    div.textContent = r.nome;
    div.onclick = () => {
      displayProducts([r]);
      suggestionBox.style.display = 'none';
    };
    suggestionBox.appendChild(div);
  });
  suggestionBox.style.display = results.length ? 'block' : 'none';
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('#search')) {
    document.getElementById('search-suggestions').style.display = 'none';
  }
});

function addToCart(id) {
  const prod = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...prod, qty: 1 });
  }
  showNotification(`${prod.nome} foi adicionado ao carrinho.`);
  updateCart();
}

function updateCart() {
  const items = document.getElementById('cart-items');
  items.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    total += item.preco * item.qty;
    const div = document.createElement('div');
    div.innerHTML = `
      <strong>${item.nome}</strong><br>
      ID: ${item.id} | Qtd: ${item.qty} | Valor: R$${item.preco.toFixed(2)}<br>
      ${item.categoria === 'kits' ? `<em>${item.descricao}</em><br>` : ''}
      <button onclick="removeFromCart(${item.id})">Remover</button>
      <hr>
    `;
    items.appendChild(div);
  });
  const discount = getDiscount();
  document.getElementById('cart-total').textContent = `Total: R$ ${(total - discount).toFixed(2)}`;
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  updateCart();
}

function getDiscount() {
  const coupon = document.getElementById('coupon').value;
  if (coupon === 'DESCONTO10') {
    return cart.reduce((sum, item) => sum + item.preco * item.qty, 0) * 0.1;
  }
  return 0;
}

function checkout() {
  if (!cart.length) return;
  let msg = '*Pedido Jocelia Festa*\n\n';
  cart.forEach(item => {
    msg += `ID: ${item.id} | Qtd: ${item.qty} - ${item.nome}\n`;
    if (item.categoria === 'kits') msg += `Descrição: ${item.descricao}\n`;
    msg += '\n';
  });
  const total = cart.reduce((sum, item) => sum + item.preco * item.qty, 0);
  const discount = getDiscount();
  msg += `Total com desconto: R$ ${(total - discount).toFixed(2)}\n`;
  msg += '\n*Envie esta mensagem para nossa atendente agendar e explicar como funciona!*';
  const whatsappURL = `https://wa.me/5581999999999?text=${encodeURIComponent(msg)}`;
  window.open(whatsappURL, '_blank');
}

function showNotification(message) {
  const box = document.getElementById('notification');
  box.textContent = message;
  box.classList.remove('hidden');
  setTimeout(() => box.classList.add('hidden'), 3000);
}

function openModal(productId) {
  const product = products.find(p => p.id === productId);
  currentImages = product.imagens;
  currentImageIndex = 0;
  document.getElementById('modal-img').src = currentImages[0];
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

function prevImage() {
  if (currentImages.length > 0) {
    currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    document.getElementById('modal-img').src = currentImages[currentImageIndex];
  }
}

function nextImage() {
  if (currentImages.length > 0) {
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    document.getElementById('modal-img').src = currentImages[currentImageIndex];
  }
}
