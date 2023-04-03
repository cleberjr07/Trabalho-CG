  const addcart = (imagem, nome, preco) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({ imagem, nome, preco });
    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const displayCart = () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const cartItems = document.getElementById("cart-items");

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
  };

  const removeFromCart = (index) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));

    displayCart();
  };

  const clearButton = document.getElementById("clearButton");

  clearButton.addEventListener("click", () => {
    localStorage.removeItem("cart");
    displayCart();
  });

  const addToCartButtons = document.querySelectorAll(".add-to-cart");

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const itemImage = button.parentElement.querySelector(".item-image").getAttribute("src");
      const itemName = button.parentElement.querySelector(".item-name").textContent;
      const itemPrice = button.parentElement.querySelector(".item-price").textContent;
      addcart(itemImage, itemName, itemPrice);
      displayCart();
    });
  });

  displayCart();