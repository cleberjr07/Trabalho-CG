// função para adicionar um item ao carrinho
const addcart = (item) => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push(item);
  localStorage.setItem("cart", JSON.stringify(cart));
};

const displayCart = () => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const cartItems = document.getElementById("cart-items");
  if (cartItems) {
  cartItems.innerHTML = "";
  

  let total = 0;

  cart.forEach((item, index) => {
    const cartItem = document.createElement("tr");

    cartItem.innerHTML = `
      <td><img src="${item.imagem}" alt="${item.nome}" width="100"></td>
      <td>${item.nome}</td>
      <td>R$ ${item.preco.toFixed(2)}</td>
      <td><button onclick="removeFromCart(${index})">Remover do carrinho</button></td>
    `;

    cartItems.appendChild(cartItem);

    total += item.preco;
  });

  const totalPrice = document.getElementById("totalPrice");
  totalPrice.textContent = `R$ ${total.toFixed(2)}`;
}};

// função para remover um item do carrinho
const removeFromCart = (index) => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart.splice(index, 1);

  localStorage.setItem("cart", JSON.stringify(cart));

  displayCart();
};

// função para limpar o carrinho
const clearButton = document.getElementById("clearButton");
if (clearButton) {
  clearButton.addEventListener("click", () => {
    localStorage.removeItem("cart");
    displayCart();
  });
}


const queryString = window.location.search;
if (queryString) {
  const urlParams = new URLSearchParams(queryString);
  const itemImage = urlParams.get("imagem");
  const itemName = urlParams.get("nome");
  const itemPrice = urlParams.get("preco");

  addcart({ imagem: itemImage, nome: itemName, preco: parseFloat(itemPrice) });
  displayCart();
}

const addToCartButtons = document.querySelectorAll(".add-to-cart");
addToCartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const itemImage = button.parentElement.querySelector(".item-image").getAttribute("src");
    const itemName = button.parentElement.querySelector(".item-name").textContent;
    const itemPrice = button.parentElement.querySelector(".item-price").textContent;
    addcart({ imagem: itemImage, nome: itemName, preco: parseFloat(itemPrice) });
    displayCart();
  });
});

// exibir os itens do carrinho
displayCart();
