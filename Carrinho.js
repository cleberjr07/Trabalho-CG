const addcart = (imagem, nome, produto, preco) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

  
  };

  cart.push(obj);
  localStorage.setItem("cart", JSON.stringify(cart));
};

const totalPrice = () => {
  // Calcula o preço total dos produtos no carrinho.
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  let total = 0;
  cart.forEach((item) => {
    total += Number(item.price);
  });

  document.getElementById("totalPrice").innerHTML = `${total}`;
};
