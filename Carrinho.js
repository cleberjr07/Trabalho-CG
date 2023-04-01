const cart = [];

// Adiciona um produto ao carrinho
function addToCart(imagem, produto, preco) {
  const itemIndex = cart.findIndex(item => item.nome === produto);
  if (itemIndex >= 0) {
    cart[itemIndex].quantidade += 1;
  } else {
    cart.push({ imagem, nome: produto, preco, quantidade: 1 });
  }
  updateCart(); // atualiza o carrinho na página
  addRemoveBtnEventListeners(); // adiciona eventos aos botões de remoção
  updateTotal(); // atualiza o total da compra
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCart() {
    // seleciona o elemento do carrinho
    const cartEl = document.querySelector('#cart-items');
    // limpa o conteúdo do carrinho
    cartEl.innerHTML = '';
    // adiciona cada item do carrinho ao elemento do carrinho
    cart.forEach((item, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><img src="${item.imagem}" alt="${item.nome}" width="50"></td>
        <td>${item.nome}</td>
        <td>R$ ${item.preco.toFixed(2)}</td>
        <td>${item.quantidade}</td>
        <td><button class="remove-btn" data-index="${index}">Remover</button></td>
      `;
      cartEl.appendChild(row);
    });
    // adiciona eventos aos botões de remoção
    addRemoveBtnEventListeners();
    // atualiza o total da compra
    updateTotal();
  }
  
  function addRemoveBtnEventListeners() {
    // seleciona todos os botões de remoção
    const removeBtns = document.querySelectorAll('.remove-btn');
    // adiciona um evento de clique a cada botão de remoção
    removeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // obtém o índice do item a ser removido
        const index = btn.dataset.index;
        // remove o item correspondente do carrinho
        cart.splice(index, 1);
        // atualiza a exibição do carrinho e o cálculo total da compra
        updateCart();
      });
    });
  }
  
  function updateTotal() {
    // seleciona o elemento do total da compra
    const totalEl = document.querySelector('.total');
    // calcula o total da compra
    const total = cart.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
    // exibe o total da compra
    totalEl.textContent = `Total: R$ ${total.toFixed(2)}`;
  }
  