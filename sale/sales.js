const PRODUCTS_KEY = "shopManagerProducts";
const SALES_KEY = "shopManagerSales";

let products = [];
let sales = [];
let saleItems = [];

/* =========================
   DOM ELEMENTS
========================= */

const newSaleBtn = document.getElementById("newSaleBtn");
const emptyNewSaleBtn = document.getElementById("emptyNewSaleBtn");

const saleModal = document.getElementById("saleModal");
const closeSaleModal = document.getElementById("closeSaleModal");
const cancelSaleBtn = document.getElementById("cancelSaleBtn");

const customerName = document.getElementById("customerName");
const saleProduct = document.getElementById("saleProduct");
const saleQuantity = document.getElementById("saleQuantity");
const addItemBtn = document.getElementById("addItemBtn");

const saleItemsList = document.getElementById("saleItemsList");
const saleTotal = document.getElementById("saleTotal");
const completeSaleBtn = document.getElementById("completeSaleBtn");

const salesTableBody = document.getElementById("salesTableBody");
const saleSearch = document.getElementById("saleSearch");

const todaySales = document.getElementById("todaySales");
const totalOrders = document.getElementById("totalOrders");
const itemsSold = document.getElementById("itemsSold");
const totalProfit = document.getElementById("totalProfit");


/* =========================
   HELPERS
========================= */

function loadProducts() {
  try {
    products = JSON.parse(
      localStorage.getItem(PRODUCTS_KEY) || "[]"
    );
  } catch {
    products = [];
  }
}

function loadSales() {
  try {
    sales = JSON.parse(
      localStorage.getItem(SALES_KEY) || "[]"
    );
  } catch {
    sales = [];
  }
}

function saveProducts() {
  localStorage.setItem(
    PRODUCTS_KEY,
    JSON.stringify(products)
  );
}

function saveSales() {
  localStorage.setItem(
    SALES_KEY,
    JSON.stringify(sales)
  );
}

function formatMoney(value) {
  return `Rs. ${Number(value || 0).toLocaleString()}`;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getTodayString() {
  const now = new Date();

  return (
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0")
  );
}

function getSaleProfit(items) {
  return items.reduce((total, item) => {
    const profitPerItem =
      Number(item.sellingPrice) -
      Number(item.buyingPrice);

    return total + profitPerItem * Number(item.quantity);
  }, 0);
}


/* =========================
   MODAL
========================= */

function openSaleModal() {
  loadProducts();

  saleItems = [];

  customerName.value = "";
  saleQuantity.value = 1;

  populateProductSelect();
  renderSaleItems();

  saleModal.classList.add("show");
}

function closeSaleModalWindow() {
  saleModal.classList.remove("show");
}

newSaleBtn.addEventListener("click", openSaleModal);
emptyNewSaleBtn.addEventListener("click", openSaleModal);

closeSaleModal.addEventListener(
  "click",
  closeSaleModalWindow
);

cancelSaleBtn.addEventListener(
  "click",
  closeSaleModalWindow
);


/* =========================
   PRODUCT SELECT
========================= */

function populateProductSelect() {
  saleProduct.innerHTML = `
    <option value="">
      Select a product
    </option>
  `;

  const availableProducts = products.filter(
    product => Number(product.stock) > 0
  );

  availableProducts.forEach(product => {
    const option = document.createElement("option");

    option.value = product.id;

    option.textContent =
      `${product.name} — ${formatMoney(product.sellingPrice)} ` +
      `(Stock: ${product.stock})`;

    saleProduct.appendChild(option);
  });

  if (availableProducts.length === 0) {
    saleProduct.innerHTML = `
      <option value="">
        No products in stock
      </option>
    `;
  }
}


/* =========================
   ADD ITEM
========================= */

addItemBtn.addEventListener("click", () => {

  const productId = saleProduct.value;
  const quantity = Number(saleQuantity.value);

  if (!productId) {
    alert("Please select a product.");
    return;
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    alert("Please enter a valid quantity.");
    return;
  }

  loadProducts();

  const product = products.find(
    item => String(item.id) === String(productId)
  );

  if (!product) {
    alert("Product not found.");
    return;
  }

  const stock = Number(product.stock);

  if (quantity > stock) {
    alert(`Only ${stock} item(s) are available.`);
    return;
  }

  const existingItem = saleItems.find(
    item => String(item.productId) === String(productId)
  );

  if (existingItem) {

    const newQuantity =
      Number(existingItem.quantity) + quantity;

    if (newQuantity > stock) {
      alert(
        `Only ${stock} item(s) are available in total.`
      );
      return;
    }

    existingItem.quantity = newQuantity;

  } else {

    saleItems.push({
      productId: product.id,
      name: product.name,
      quantity: quantity,
      sellingPrice: Number(product.sellingPrice),
      buyingPrice: Number(product.buyingPrice)
    });

  }

  renderSaleItems();

  saleProduct.value = "";
  saleQuantity.value = 1;
});


/* =========================
   RENDER SALE ITEMS
========================= */

function renderSaleItems() {

  if (saleItems.length === 0) {

    saleItemsList.innerHTML = `
      <div class="no-items">
        No products added yet.
      </div>
    `;

    saleTotal.textContent = "Rs. 0";

    return;
  }

  saleItemsList.innerHTML = saleItems
    .map((item, index) => {

      const itemTotal =
        Number(item.sellingPrice) *
        Number(item.quantity);

      return `
        <div class="sale-item">

          <div class="sale-item-info">

            <strong>
              ${escapeHTML(item.name)}
            </strong>

            <span>
              ${item.quantity} ×
              ${formatMoney(item.sellingPrice)}
            </span>

          </div>

          <div class="sale-item-total">
            ${formatMoney(itemTotal)}
          </div>

          <button
            class="remove-item-btn"
            onclick="removeSaleItem(${index})"
            title="Remove"
          >
            ×
          </button>

        </div>
      `;
    })
    .join("");

  const total = saleItems.reduce(
    (sum, item) =>
      sum +
      Number(item.sellingPrice) *
      Number(item.quantity),
    0
  );

  saleTotal.textContent = formatMoney(total);
}


/* =========================
   REMOVE SALE ITEM
========================= */

function removeSaleItem(index) {

  if (
    index < 0 ||
    index >= saleItems.length
  ) {
    return;
  }

  saleItems.splice(index, 1);

  renderSaleItems();
}


/* =========================
   COMPLETE SALE
========================= */

completeSaleBtn.addEventListener(
  "click",
  completeSale
);

function completeSale() {

  if (saleItems.length === 0) {
    alert("Please add at least one product.");
    return;
  }

  loadProducts();

  /* Check stock again before completing */

  for (const item of saleItems) {

    const product = products.find(
      product =>
        String(product.id) ===
        String(item.productId)
    );

    if (!product) {
      alert(
        `Product "${item.name}" no longer exists.`
      );
      return;
    }

    if (
      Number(product.stock) <
      Number(item.quantity)
    ) {
      alert(
        `Not enough stock for "${item.name}".`
      );
      return;
    }
  }


  /* Reduce stock */

  saleItems.forEach(item => {

    const product = products.find(
      product =>
        String(product.id) ===
        String(item.productId)
    );

    product.stock =
      Number(product.stock) -
      Number(item.quantity);

  });

  saveProducts();


  /* Calculate sale */

  const total = saleItems.reduce(
    (sum, item) =>
      sum +
      Number(item.sellingPrice) *
      Number(item.quantity),
    0
  );

  const profit = getSaleProfit(saleItems);


  /* Create sale */

  const sale = {
    id:
      "S-" +
      Date.now()
        .toString()
        .slice(-6),

    date: new Date().toISOString(),

    customer:
      customerName.value.trim() ||
      "Walk-in Customer",

    items: saleItems.map(item => ({
      ...item
    })),

    total: total,

    profit: profit
  };


  sales.unshift(sale);

  saveSales();

  closeSaleModalWindow();

  saleItems = [];

  renderSales();
  updateStatistics();

  alert(
    `Sale completed successfully!\n\nTotal: ${formatMoney(total)}`
  );
}


/* =========================
   RENDER SALES TABLE
========================= */

function renderSales(searchTerm = "") {

  const search =
    searchTerm.trim().toLowerCase();

  let filteredSales = sales;

  if (search) {

    filteredSales = sales.filter(sale => {

      const saleItemsText =
        sale.items
          .map(item => item.name)
          .join(" ");

      return (
        String(sale.id)
          .toLowerCase()
          .includes(search) ||

        String(sale.customer)
          .toLowerCase()
          .includes(search) ||

        saleItemsText
          .toLowerCase()
          .includes(search)
      );
    });
  }


  if (filteredSales.length === 0) {

    salesTableBody.innerHTML = `
      <tr>

        <td colspan="6">

          <div class="empty-sales">

            <div class="empty-sales-icon">
              💰
            </div>

            <h2>
              ${
                search
                  ? "No sales found"
                  : "No sales yet"
              }
            </h2>

            <p>
              ${
                search
                  ? "Try another search."
                  : "Your completed sales will appear here."
              }
            </p>

            ${
              search
                ? ""
                : `
                  <button
                    class="new-sale-btn"
                    onclick="openSaleModal()"
                  >
                    + Create First Sale
                  </button>
                `
            }

          </div>

        </td>

      </tr>
    `;

    return;
  }


  salesTableBody.innerHTML =
    filteredSales
      .map(sale => {

        const date = new Date(sale.date);

        const formattedDate =
          date.toLocaleDateString() +
          " " +
          date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          });

        const itemCount =
          sale.items.reduce(
            (sum, item) =>
              sum + Number(item.quantity),
            0
          );

        return `
          <tr>

            <td>
              <strong>
                ${escapeHTML(sale.id)}
              </strong>

              <br>

              <small style="color:#999;">
                ${escapeHTML(sale.customer)}
              </small>
            </td>

            <td>
              ${escapeHTML(formattedDate)}
            </td>

            <td>
              ${itemCount}
            </td>

            <td>
              <strong>
                ${formatMoney(sale.total)}
              </strong>
            </td>

            <td>
              ${formatMoney(sale.profit)}
            </td>

            <td>

              <button
                class="delete-sale-btn"
                onclick="deleteSale('${escapeHTML(sale.id)}')"
                title="Delete sale"
              >
                🗑️
              </button>

            </td>

          </tr>
        `;
      })
      .join("");
}


/* =========================
   DELETE SALE
========================= */

function deleteSale(saleId) {

  const sale = sales.find(
    sale =>
      String(sale.id) ===
      String(saleId)
  );

  if (!sale) {
    return;
  }

  const confirmed = confirm(
    `Delete sale ${sale.id}?\n\n` +
    `The sold quantities will be returned to inventory.`
  );

  if (!confirmed) {
    return;
  }

  loadProducts();


  /* Restore inventory */

  sale.items.forEach(item => {

    const product = products.find(
      product =>
        String(product.id) ===
        String(item.productId)
    );

    if (product) {

      product.stock =
        Number(product.stock) +
        Number(item.quantity);

    }

  });

  saveProducts();


  /* Remove sale */

  sales = sales.filter(
    sale =>
      String(sale.id) !==
      String(saleId)
  );

  saveSales();

  renderSales();

  updateStatistics();
}


/* =========================
   SEARCH
========================= */

saleSearch.addEventListener(
  "input",
  () => {
    renderSales(saleSearch.value);
  }
);


/* =========================
   STATISTICS
========================= */

function updateStatistics() {

  const today =
    getTodayString();

  let todayTotal = 0;
  let totalItemCount = 0;
  let profit = 0;

  sales.forEach(sale => {

    const saleDate =
      new Date(sale.date);

    const saleDay =
      saleDate.getFullYear() +
      "-" +
      String(
        saleDate.getMonth() + 1
      ).padStart(2, "0") +
      "-" +
      String(
        saleDate.getDate()
      ).padStart(2, "0");


    if (saleDay === today) {
      todayTotal += Number(sale.total);
    }


    sale.items.forEach(item => {

      totalItemCount +=
        Number(item.quantity);

    });


    profit += Number(sale.profit || 0);

  });


  todaySales.textContent =
    formatMoney(todayTotal);

  totalOrders.textContent =
    sales.length;

  itemsSold.textContent =
    totalItemCount;

  totalProfit.textContent =
    formatMoney(profit);
}


/* =========================
   CLOSE MODAL WITH ESC
========================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      saleModal.classList.contains("show")
    ) {
      closeSaleModalWindow();
    }

  }
);


/* =========================
   CLOSE MODAL OUTSIDE
========================= */

saleModal.addEventListener(
  "click",
  event => {

    if (event.target === saleModal) {
      closeSaleModalWindow();
    }

  }
);


/* =========================
   INITIALIZE
========================= */

loadProducts();
loadSales();

renderSales();
updateStatistics();


/* =========================
   GLOBAL FUNCTIONS
========================= */

window.openSaleModal = openSaleModal;
window.removeSaleItem = removeSaleItem;
window.deleteSale = deleteSale;


/* =========================
   SHOP MANAGER SALES API
========================= */

window.ShopManagerSales = {

  getSales: () => sales,

  getProducts: () => products,

  refresh: () => {
    loadProducts();
    loadSales();
    renderSales();
    updateStatistics();
  }

};
```
