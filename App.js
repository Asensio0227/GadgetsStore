// variables
const cartBtn = document.querySelectorAll('.cart-btn');
const closeCart = document.querySelector('.close-cart');
const clearCart = document.querySelector('.clear-cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartDom = document.querySelector('.cart');
const cartItems = document.querySelector('.cart-items ');
const cartContent = document.querySelector('.cart-content');
const cartTotal = document.querySelector('.cart-total');
const productsDom = document.querySelector('.products-center');
const date = document.querySelector('.date');

// date
let year=new Date().getFullYear();
date.innerHTML = year;

// cart
let cart = [];
// buttons
let buttonDom = [];

// get the products 
class Products{
  async getProducts() {
    try {
      let result = await fetch('products.json');
      let data = await result.json();
      console.log(data);
      let products = data.items;
      products = products.map((item) => {
        console.log(products);
        const { id } = item.sys;
        const { title, price } = item.fields;
        const image = item.fields.image.fields.file.url;
        return {title, price, id,image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}
// display Products
class UI{
  displayProducts(products) {
    let result = '';
    products = products.forEach((product) => {
      result += `
        <article class="product">
        <div class="img-container">
          <img src=${product.image} alt=${product.title} class="product-img"/>
          <button class="bag-btn" data-id=${product.id}>
            <i class="fas fa-shopping-cart"></i>
            add to cart
          </button>
        </div>
        <h3>${product.title}</h3>
        <h4>$${product.price}</h4>
      </article>
      `
    });
    productsDom.innerHTML = result;
  }
  getBagButtons() {
    const buttons = [...document.querySelectorAll('.bag-btn')];
    buttonDom = buttons;
    buttons.forEach(button => {
      let id = button.dataset.id;
      let InCart = cart.find(item => item.id === id);
      if (InCart) {
        button.innerText = 'In Cart';
        button.disabled = true;
      }
      button.addEventListener('click', (e) => {
        e.target.innerText = 'In Cart';
        e.target.disabled = true;
        let cartItems = { ...Storage.getProducts(id), amount: 1 };
        cart = [...cart, cartItems];
        Storage.saveCart(cart);
        this.setCartValues(cart);
        this.addCartItems(cartItems);
        this.showCart();
      })
    })
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }
  addCartItems(items) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <img src=${items.image} alt=${items.title}>
          <div>
            <h4>${items.title}</h4>
            <h5>$${items.price}</h5>
            <span class="remove-item" data-id=${items.id}>
              remove
            </span>
          </div>
          <div>
            <i class="fas fa-chevron-up" data-id=${items.id}></i>
            <p class="item-amount">${items.amount}</p>
            <i class="fas fa-chevron-down" data-id=${items.id}></i>
          </div>
    `
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDom.classList.add('showCart');
  }
  setupApp() {
    cart = Storage.getCart();
    Storage.saveCart(cart);
    this.setCartValues(cart);
    this.populateCart(cart)
    cartBtn.forEach(button => {
      button.addEventListener('click', () => {
        this.showCart();
      })
    });
    closeCart.addEventListener('click', () => {
      this.hideCart()
    })
  }
  populateCart(cart) {
    cart.forEach(item => this.addCartItems(item));
  }
  hideCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDom.classList.remove('showCart');
  }
  cartLogic() {
    clearCart.addEventListener('click', () => {
      this.clearCart();
    });
    cartContent.addEventListener('click', (event) => {
      if (event.target.classList.contains('remove-item')) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        console.log(removeItem.parentElement.parentElement);
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeitem(id);
      } else  if (event.target.classList.contains('fa-chevron-up')) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        console.log(id);
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains('fa-chevron-down')) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        console.log(id);
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeitem(id);
        }
      }
    })
  }
  clearCart() { 
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach(id => this.removeitem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }
  removeitem(id) {
    cart = cart.filter(item => item.id !== id);
    Storage.saveCart(cart);
    this.setCartValues(cart);
    let button = this.getSingleButtons(id);
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
    button.disabled = false;
  }
  getSingleButtons(id) {
    return buttonDom.find(button => button.dataset.id === id);
  }
}
// Storage 
class Storage{
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const products = new Products();
  const ui = new UI();
  ui.setupApp();
  products
    .getProducts()
    .then((products )=> {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    }).then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    })
});