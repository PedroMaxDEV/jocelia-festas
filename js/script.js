let produtos = [];
let carrinho = [];
let imagemAtual = 0;
let imagensProduto = [];

async function carregarProdutos() {
  const res = await fetch('dados/produtos.json');
  produtos = await res.json();
  exibirProdutos(produtos);
}

function exibirProdutos(lista) {
  const container = document.getElementById('productList');
  container.innerHTML = '';

  lista.forEach(prod => {
    const card = document.createElement('div');
    card.classList.add('produto');

    const img = document.createElement('img');
    img.src = prod.imagens[0];
    img.alt = prod.nome;
    img.addEventListener('click', () => abrirModalImagem(prod));

    const nome = document.createElement('h3');
    nome.textContent = prod.nome;

    const preco = document.createElement('p');
    preco.textContent = `R$ ${prod.preco.toFixed(2)}`;

    const desc = document.createElement('p');
    desc.textContent = prod.descricao;

    const btn = document.createElement('button');
    btn.textContent = 'Adicionar ao Carrinho';
    btn.addEventListener('click', () => adicionarAoCarrinho(prod));

    card.append(img, nome, preco, desc, btn);
    container.appendChild(card);
  });
}

function abrirModalImagem(prod) {
  imagensProduto = prod.imagens;
  imagemAtual = 0;
  document.getElementById('modalImage').src = imagensProduto[imagemAtual];
  document.getElementById('imageModal').style.display = 'flex';
}

document.getElementById('prevImage').onclick = () => {
  if (imagemAtual > 0) imagemAtual--;
  atualizarImagemModal();
};
document.getElementById('nextImage').onclick = () => {
  if (imagemAtual < imagensProduto.length - 1) imagemAtual++;
  atualizarImagemModal();
};
document.getElementById('closeImageModal').onclick = () => {
  document.getElementById('imageModal').style.display = 'none';
};

function atualizarImagemModal() {
  document.getElementById('modalImage').src = imagensProduto[imagemAtual];
}

function adicionarAoCarrinho(prod) {
  const itemExistente = carrinho.find(p => p.id === prod.id);
  if (itemExistente) {
    itemExistente.quantidade++;
  } else {
    carrinho.push({ ...prod, quantidade: 1 });
  }

  mostrarNotificacao();
}

function mostrarNotificacao() {
  const aviso = document.getElementById('notification');
  aviso.classList.remove('hidden');
  setTimeout(() => aviso.classList.add('hidden'), 2000);
}

function atualizarCarrinho() {
  const lista = document.getElementById('cartItems');
  const total = document.getElementById('cartTotal');
  lista.innerHTML = '';

  let precoTotal = 0;

  carrinho.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${item.nome}</strong> - ID: ${item.id} - Qtd: ${item.quantidade} - Unit: R$${item.preco.toFixed(2)}
      ${item.categoria === 'kits' ? `<br><em>${item.descricao}</em>` : ''}
      <button onclick="removerDoCarrinho(${item.id})">Remover</button>
    `;
    precoTotal += item.preco * item.quantidade;
    lista.appendChild(li);
  });

  total.textContent = `Total: R$ ${precoTotal.toFixed(2)}`;
}

function removerDoCarrinho(id) {
  carrinho = carrinho.filter(p => p.id !== id);
  atualizarCarrinho();
}

document.getElementById('openCart').onclick = () => {
  atualizarCarrinho();
  document.getElementById('cartModal').style.display = 'flex';
};
document.getElementById('closeCart').onclick = () => {
  document.getElementById('cartModal').style.display = 'none';
};

document.getElementById('applyCupom').onclick = () => {
  const cupom = document.getElementById('cupomInput').value.trim().toUpperCase();
  if (cupom === 'DESCONTO10') {
    carrinho = carrinho.map(p => ({ ...p, preco: p.preco * 0.9 }));
    atualizarCarrinho();
    alert('Cupom aplicado com sucesso!');
  } else {
    alert('Cupom inválido.');
  }
};

document.getElementById('finalizarCompra').onclick = () => {
  let mensagem = 'Olá! Quero agendar minha festa com os seguintes produtos:\n\n';
  carrinho.forEach(p => {
    mensagem += `➥ ${p.nome} | ID: ${p.id} | Qtd: ${p.quantidade}`;
    if (p.categoria === 'kits') mensagem += ` | ${p.descricao}`;
    mensagem += '\n';
  });
  mensagem += '\nPor favor, me explique como funciona o agendamento.';

  const url = `https://wa.me/+558189025672?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
};

document.querySelectorAll('.category-btn').forEach(btn => {
  btn.onclick = () => {
    const cat = btn.getAttribute('data-category');
    if (cat === 'destaques') {
      const destaques = produtos.filter(p => p.destaque);
      exibirProdutos(destaques);
    } else {
      const filtrados = produtos.filter(p => p.categoria === cat);
      exibirProdutos(filtrados);
    }
  };
});

document.getElementById('searchBar').addEventListener('input', e => {
  const texto = e.target.value.toLowerCase();
  const sugestoes = produtos.filter(p =>
    p.nome.toLowerCase().includes(texto) || String(p.id).includes(texto)
  );
  const lista = document.getElementById('suggestions');
  lista.innerHTML = '';
  sugestoes.slice(0, 5).forEach(p => {
    const li = document.createElement('li');
    li.textContent = p.nome;
    li.onclick = () => exibirProdutos([p]);
    lista.appendChild(li);
  });
});

carregarProdutos();

const searchInput = document.getElementById('searchBar');
const suggestions = document.getElementById('suggestions');

// Esconde sugestões se o campo estiver vazio
searchInput.addEventListener('input', () => {
  if (searchInput.value.trim() === '') {
    suggestions.style.display = 'none';
  } else {
    suggestions.style.display = 'block';
  }
});

// Esconde sugestões ao clicar em um item
suggestions.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    searchInput.value = e.target.textContent;
    suggestions.style.display = 'none';
  }
});

// Esconde ao clicar fora
document.addEventListener('click', (e) => {
  if (!searchInput.contains(e.target) && !suggestions.contains(e.target)) {
    suggestions.style.display = 'none';
  }
});



