const PRODUCTS_KEY = "shopManagerProducts";
const SALES_KEY = "shopManagerSales";

let products = [];
let sales = [];
let currentItems = [];

/* =========================
   DOM ELEMENTS
   ========================= */

const newSaleButton = document.getElementById("newSaleButton");
const emptyNewSaleButton = document.getElementById("emptyNewSaleButton");

const saleModal = document.getElementById("saleModal");
const viewSaleModal = document.getElementById("viewSaleModal");

const closeSaleModal = document.getElementById("closeSaleModal");
const closeViewSaleModal = document.getElementById("closeViewSaleModal");
const closeViewButton = document.getElementById("closeViewButton");

const cancelSaleButton = document.getElementById("cancelSaleButton");
const completeSaleButton = document.getElementById("completeSaleButton");

const customerName = document.getElementById("customerName");
const productSelect = document.getElementById("productSelect");
const quantityInput = document.getElementById("quantityInput");
const addItemButton = document.getElementById("addItemButton");

const saleItems = document.getElementById("saleItems");
const saleTotal = document.getElementById("saleTotal");

const paymentStatus = document.getElementById("paymentStatus");
const amountPaidGroup = document.getElementById("amountPaidGroup");
const amountPaid = document.getElementById("amountPaid");

const previewPaid = document.getElementById("previewPaid");
const previewBalance = document.getElementById("previewBalance");

const salesTableBody = document.getElementById("salesTableBody");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");

const viewSaleContent = document.getElementById("viewSaleContent");

const todaySalesElement = document.getElementById("todaySales");
const totalOrdersElement = document.getElementById("totalOrders");
const itemsSoldElement = document.getElementById("itemsSold");
const totalProfitElement = document.getElementById("totalProfit");

const paidAmountElement = document.getElementById("paidAmount");
const partialAmountElement = document.getElementById("partialAmount");
const unpaidAmountElement = document.getElementById("unpaidAmount");


/* =========================
   STORAGE
   ========================= */

function loadData() {
  try {
    const storedProducts = localStorage.getItem(PRODUCTS_KEY);
    const storedSales = localStorage.getItem(SALES_KEY);

    products = storedProducts ? JSON.parse(storedProducts) : [];
    sales = storedSales ? JSON.parse(storedSales) : [];

    if (!Array.isArray(products)) {
      products = [];
    }

    if (!Array.isArray(sales)) {
      sales = [];
    }

  } catch (error) {
    console.error("Could not load sales data:", error);
    products = [];
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


/* =========================
   CURRENCY
   ========================= */

function getCurrency() {
  try {
    const settings = JSON.parse(
      localStorage.getItem("shopManagerSettings") || "{}"
    );

    return settings.currency || "Rs";

  } catch (error) {
    return "Rs";
  }
}


function formatMoney(value) {
  const number = Number(value) || 0;

  return `${getCurrency()} ${number.toLocaleString(
    undefined,
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }
  )}`;
}


/* =========================
   HELPERS
   ========================= */

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function isToday(dateValue) {
  if (!dateValue) {
    return false;
  }

  const date = new Date(dateValue);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}


function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}


/* =========================
   BACKWARD COMPATIBILITY
   ========================= */

function normalizeSale(sale) {
  const total = Number(sale.total) || 0;

  let status = sale.paymentStatus;

  /*
    Older sales were automatically considered paid.
  */

  if (
    status !== "paid" &&
    status !== "partial" &&
    status !== "unpaid"
  ) {
    status = "paid";
  }

  let paid;

  if (status === "paid") {
    paid = total;
  } else if (status === "unpaid") {
    paid = 0;
  } else {
    paid = Number(sale.amountPaid) || 0;

    paid = Math.max(
      0,
      Math.min(paid, total)
    );
  }

  const balance = Math.max(
    0,
    total - paid
  );

  return {
    ...sale,
    paymentStatus: status,
    amountPaid: paid,
    balance: balance
  };
}


function normalizeAllSales() {
  sales = sales.map(normalizeSale);
}


/* =========================
   PRODUCT DROPDOWN
   ========================= */

function populateProducts() {
  productSelect.innerHTML = `
    <option value="">
      Select a product
    </option>
  `;

  products.forEach(product => {

    const stock = Number(product.stock) || 0;

    if (stock <= 0) {
      return;
    }

    const option = document.createElement("option");

    option.value = product.id;

    option.textContent =
      `${product.name} — ${formatMoney(product.sellingPrice)} (${stock} in stock)`;

    productSelect.appendChild(option);
  });
}


/* =========================
   SALE ITEMS
   ========================= */

function calculateSaleTotal() {
  return currentItems.reduce(
    (sum, item) =>
      sum + (
        Number(item.price) *
        Number(item.quantity)
      ),
    0
  );
}


function renderSaleItems() {

  if (!currentItems.length) {

    saleItems.innerHTML = `
      <div class="sale-items-empty">
        No products added yet.
      </div>
    `;

    saleTotal.textContent = formatMoney(0);

    updatePaymentPreview();

    return;
  }


  saleItems.innerHTML = currentItems.map(
    (item, index) => {

      const lineTotal =
        Number(item.price) *
        Number(item.quantity);

      return `
        <div class="sale-item">

          <div class="sale-item-info">

            <div class="sale-item-name">
              ${escapeHTML(item.name)}
            </div>

            <div class="sale-item-meta">
              ${item.quantity} × ${formatMoney(item.price)}
              = ${formatMoney(lineTotal)}
            </div>

          </div>

          <button
            type="button"
            class="remove-item-button"
            data-index="${index}"
          >
            ×
          </button>

        </div>
      `;
    }
  ).join("");


  saleTotal.textContent =
    formatMoney(calculateSaleTotal());

  updatePaymentPreview();
}


/* =========================
   ADD PRODUCT
   ========================= */

function addProductToSale() {

  const productId = productSelect.value;
  const quantity = Number(quantityInput.value);

  if (!productId) {
    alert("Please select a product.");
    return;
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    alert("Please enter a valid quantity.");
    return;
  }


  const product = products.find(
    item => String(item.id) === String(productId)
  );

  if (!product) {
    alert("Product not found.");
    return;
  }


  const stock = Number(product.stock) || 0;


  const existingItem = currentItems.find(
    item => String(item.productId) === String(productId)
  );


  const existingQuantity =
    existingItem
      ? Number(existingItem.quantity)
      : 0;


  if (
    existingQuantity + quantity >
    stock
  ) {

    alert(
      `Only ${stock} ${product.name} available in stock.`
    );

    return;
  }


  if (existingItem) {

    existingItem.quantity =
      existingQuantity + quantity;

  } else {

    currentItems.push({
      productId: product.id,
      name: product.name,
      price: Number(product.sellingPrice) || 0,
      buyingPrice: Number(product.buyingPrice) || 0,
      quantity: quantity
    });

  }


  productSelect.value = "";
  quantityInput.value = "1";

  renderSaleItems();
}


/* =========================
   REMOVE SALE ITEM
   ========================= */

function removeSaleItem(index) {

  if (
    index < 0 ||
    index >= currentItems.length
  ) {
    return;
  }

  currentItems.splice(index, 1);

  renderSaleItems();
}


/* =========================
   PAYMENT
   ========================= */

function updatePaymentFields() {

  const status =
    paymentStatus.value;

  const total =
    calculateSaleTotal();


  if (status === "paid") {

    amountPaid.value =
      total.toFixed(2);

    amountPaid.disabled = true;

  } else if (status === "unpaid") {

    amountPaid.value = "0";

    amountPaid.disabled = true;

  } else {

    amountPaid.disabled = false;

    /*
      Don't automatically replace a user's
      partially-paid amount.
    */

    if (
      Number(amountPaid.value) > total
    ) {
      amountPaid.value =
        total.toFixed(2);
    }
  }


  amountPaidGroup.style.opacity =
    amountPaid.disabled ? "0.65" : "1";

  updatePaymentPreview();
}


function updatePaymentPreview() {

  const total =
    calculateSaleTotal();

  const status =
    paymentStatus.value;


  let paid = Number(amountPaid.value) || 0;


  if (status === "paid") {
    paid = total;
  }

  if (status === "unpaid") {
    paid = 0;
  }


  paid = Math.max(
    0,
    Math.min(paid, total)
  );


  const balance =
    Math.max(
      0,
      total - paid
    );


  previewPaid.textContent =
    formatMoney(paid);

  previewBalance.textContent =
    formatMoney(balance);


  previewBalance.classList.remove(
    "balance-positive",
    "balance-zero"
  );


  if (balance > 0) {

    previewBalance.classList.add(
      "balance-positive"
    );

  } else {

    previewBalance.classList.add(
      "balance-zero"
    );
  }
}


/* =========================
   OPEN NEW SALE
   ========================= */

function openSaleModal() {

  currentItems = [];

  customerName.value = "";
  quantityInput.value = "1";

  paymentStatus.value = "paid";
  amountPaid.value = "0";

  populateProducts();
  renderSaleItems();
  updatePaymentFields();

  saleModal.classList.add("show");

  setTimeout(() => {
    customerName.focus();
  }, 50);
}


/* =========================
   CLOSE SALE MODAL
   ========================= */

function closeSaleModalFunction() {

  saleModal.classList.remove("show");

  currentItems = [];

  renderSaleItems();
}


/* =========================
   COMPLETE SALE
   ========================= */

function completeSale() {

  if (!currentItems.length) {
    alert("Please add at least one product.");
    return;
  }


  const total =
    calculateSaleTotal();


  if (total <= 0) {
    alert("Sale total must be greater than zero.");
    return;
  }


  const status =
    paymentStatus.value;


  let paid =
    Number(amountPaid.value) || 0;


  if (status === "paid") {
    paid = total;
  }


  if (status === "unpaid") {
    paid = 0;
  }


  if (status === "partial") {

    if (paid <= 0) {
      alert(
        "For a partially paid sale, enter an amount greater than 0."
      );
      return;
    }

    if (paid >= total) {
      alert(
        "For a partially paid sale, the amount paid must be less than the sale total."
      );
      return;
    }
  }


  const balance =
    Math.max(
      0,
      total - paid
    );


  /*
    Final inventory check before saving.
  */

  for (const item of currentItems) {

    const product =
      products.find(
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

    const stock =
      Number(product.stock) || 0;

    if (stock < Number(item.quantity)) {

      alert(
        `Not enough stock for "${item.name}". Available: ${stock}.`
      );

      return;
    }
  }


  /*
    Calculate profit using buying price.
  */

  const profit =
    currentItems.reduce(
      (sum, item) => {

        const selling =
          Number(item.price) || 0;

        const buying =
          Number(item.buyingPrice) || 0;

        const quantity =
          Number(item.quantity) || 0;

        return sum +
          (
            (selling - buying) *
            quantity
          );

      },
      0
    );


  /*
    Reduce stock.
  */

  currentItems.forEach(item => {

    const product =
      products.find(
        product =>
          String(product.id) ===
          String(item.productId)
      );

    if (product) {

      product.stock =
        Math.max(
          0,
          (Number(product.stock) || 0) -
          Number(item.quantity)
        );
    }
  });


  const sale = {

    id:
      Date.now().toString(),

    date:
      new Date().toISOString(),

    customer:
      customerName.value.trim() ||
      "Walk-in Customer",

    items:
      currentItems.map(item => ({
        ...item
      })),

    total:
      Number(total.toFixed(2)),

    profit:
      Number(profit.toFixed(2)),

    paymentStatus:
      status,

    amountPaid:
      Number(paid.toFixed(2)),

    balance:
      Number(balance.toFixed(2))
  };


  sales.unshift(sale);


  saveProducts();
  saveSales();


  closeSaleModalFunction();

  renderAll();

  alert("Sale completed successfully.");
}


/* =========================
   PAYMENT STATUS LABEL
   ========================= */

function getPaymentLabel(status) {

  if (status === "partial") {
    return "Partially Paid";
  }

  if (status === "unpaid") {
    return "Unpaid";
  }

  return "Paid";
}


/* =========================
   RENDER SALES TABLE
   ========================= */

function renderSalesTable() {

  const search =
    searchInput.value
      .trim()
      .toLowerCase();


  const filteredSales =
    sales.filter(sale => {

      const customer =
        String(
          sale.customer ||
          "Walk-in Customer"
        ).toLowerCase();

      const id =
        String(
          sale.id || ""
        ).toLowerCase();

      const itemNames =
        (sale.items || [])
          .map(item => item.name)
          .join(" ")
          .toLowerCase();


      return (
        !search ||
        customer.includes(search) ||
        id.includes(search) ||
        itemNames.includes(search)
      );
    });


  if (!filteredSales.length) {

    salesTableBody.innerHTML = "";

    emptyState.style.display = "block";

    return;
  }


  emptyState.style.display = "none";


  salesTableBody.innerHTML =
    filteredSales.map(sale => {

      const normalized =
        normalizeSale(sale);


      const itemCount =
        (normalized.items || [])
          .reduce(
            (sum, item) =>
              sum + (
                Number(item.quantity) || 0
              ),
            0
          );


      const status =
        normalized.paymentStatus;


      return `
        <tr>

          <td>
            ${formatDate(normalized.date)}
          </td>

          <td>
            ${escapeHTML(
              normalized.customer ||
              "Walk-in Customer"
            )}
          </td>

          <td>
            ${itemCount}
          </td>

          <td>
            <strong>
              ${formatMoney(normalized.total)}
            </strong>
          </td>

          <td>
            <span class="payment-badge ${status}">
              ${getPaymentLabel(status)}
            </span>
          </td>

          <td>
            <span class="${
              normalized.balance > 0
                ? "balance-positive"
                : "balance-zero"
            }">
              ${formatMoney(normalized.balance)}
            </span>
          </td>

          <td>
            <button
              type="button"
              class="view-sale-button"
              data-id="${escapeHTML(normalized.id)}"
            >
              View
            </button>
          </td>

        </tr>
      `;
    }).join("");
}


/* =========================
   UPDATE STATS
   ========================= */

function updateStats() {

  const todaySales =
    sales
      .filter(sale => isToday(sale.date))
      .reduce(
        (sum, sale) =>
          sum + (
            Number(sale.total) || 0
          ),
        0
      );


  const totalOrders =
    sales.length;


  const itemsSold =
    sales.reduce(
      (sum, sale) =>
        sum +
        (sale.items || []).reduce(
          (itemSum, item) =>
            itemSum +
            (Number(item.quantity) || 0),
          0
        ),
      0
    );


  const totalProfit =
    sales.reduce(
      (sum, sale) =>
        sum + (
          Number(sale.profit) || 0
        ),
      0
    );


  todaySalesElement.textContent =
    formatMoney(todaySales);

  totalOrdersElement.textContent =
    totalOrders.toLocaleString();

  itemsSoldElement.textContent =
    itemsSold.toLocaleString();

  totalProfitElement.textContent =
    formatMoney(totalProfit);
}


/* =========================
   PAYMENT SUMMARY
   ========================= */

function updatePaymentSummary() {

  let paid = 0;
  let partial = 0;
  let unpaid = 0;


  sales.forEach(sale => {

    const normalized =
      normalizeSale(sale);


    /*
      Summary is based on money
      actually paid / still due.
    */

    if (
      normalized.paymentStatus ===
      "paid"
    ) {

      paid += normalized.amountPaid;

    } else if (
      normalized.paymentStatus ===
      "partial"
    ) {

      partial += normalized.amountPaid;

    } else {

      unpaid += normalized.balance;
    }
  });


  paidAmountElement.textContent =
    formatMoney(paid);

  partialAmountElement.textContent =
    formatMoney(partial);

  unpaidAmountElement.textContent =
    formatMoney(unpaid);
}


/* =========================
   VIEW SALE
   ========================= */

function openViewSale(saleId) {

  const sale =
    sales.find(
      item =>
        String(item.id) ===
        String(saleId)
    );


  if (!sale) {
    return;
  }


  const normalized =
    normalizeSale(sale);


  const itemsHTML =
    (normalized.items || [])
      .map(item => {

        const lineTotal =
          (
            Number(item.price) || 0
          ) *
          (
            Number(item.quantity) || 0
          );


        return `
          <div class="sale-details-item">

            <div>

              <div class="sale-details-item-name">
                ${escapeHTML(item.name)}
              </div>

              <div class="sale-details-item-meta">
                ${item.quantity} × ${formatMoney(item.price)}
              </div>

            </div>

            <strong>
              ${formatMoney(lineTotal)}
            </strong>

          </div>
        `;
      })
      .join("");


  viewSaleContent.innerHTML = `

    <div class="sale-details">

      <div class="sale-details-grid">

        <div class="sale-detail-box">

          <span>
            Customer
          </span>

          <strong>
            ${escapeHTML(
              normalized.customer ||
              "Walk-in Customer"
            )}
          </strong>

        </div>


        <div class="sale-detail-box">

          <span>
            Date
          </span>

          <strong>
            ${formatDate(normalized.date)}
          </strong>

        </div>


        <div class="sale-detail-box">

          <span>
            Payment Status
          </span>

          <strong>

            <span class="payment-badge ${
              normalized.paymentStatus
            }">

              ${getPaymentLabel(
                normalized.paymentStatus
              )}

            </span>

          </strong>

        </div>


        <div class="sale-detail-box">

          <span>
            Amount Paid
          </span>

          <strong>
            ${formatMoney(
              normalized.amountPaid
            )}
          </strong>

        </div>


        <div class="sale-detail-box">

          <span>
            Remaining Balance
          </span>

          <strong class="${
            normalized.balance > 0
              ? "balance-positive"
              : "balance-zero"
          }">

            ${formatMoney(
              normalized.balance
            )}

          </strong>

        </div>


        <div class="sale-detail-box">

          <span>
            Sale Total
          </span>

          <strong>
            ${formatMoney(
              normalized.total
            )}
          </strong>

        </div>

      </div>


      <div class="section-label">
        Sale Items
      </div>


      <div class="sale-details-items">

        ${
          itemsHTML ||
          `
            <div class="sale-items-empty">
              No items found.
            </div>
          `
        }

      </div>

    </div>
  `;


  viewSaleModal.classList.add("show");
}


/* =========================
   RENDER EVERYTHING
   ========================= */

function renderAll() {

  normalizeAllSales();

  renderSalesTable();

  updateStats();

  updatePaymentSummary();
}


/* =========================
   EVENT LISTENERS
   ========================= */

newSaleButton.addEventListener(
  "click",
  openSaleModal
);


emptyNewSaleButton.addEventListener(
  "click",
  openSaleModal
);


closeSaleModal.addEventListener(
  "click",
  closeSaleModalFunction
);


cancelSaleButton.addEventListener(
  "click",
  closeSaleModalFunction
);


closeViewSaleModal.addEventListener(
  "click",
  () => {
    viewSaleModal.classList.remove("show");
  }
);


closeViewButton.addEventListener(
  "click",
  () => {
    viewSaleModal.classList.remove("show");
  }
);


addItemButton.addEventListener(
  "click",
  addProductToSale
);


paymentStatus.addEventListener(
  "change",
  updatePaymentFields
);


amountPaid.addEventListener(
  "input",
  updatePaymentPreview
);


quantityInput.addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {
      addProductToSale();
    }

  }
);


saleItems.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        ".remove-item-button"
      );

    if (!button) {
      return;
    }

    removeSaleItem(
      Number(button.dataset.index)
    );
  }
);


salesTableBody.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        ".view-sale-button"
      );

    if (!button) {
      return;
    }

    openViewSale(
      button.dataset.id
    );
  }
);


searchInput.addEventListener(
  "input",
  renderSalesTable
);


/* =========================
   MODAL BACKDROP
   ========================= */

saleModal.addEventListener(
  "click",
  event => {

    if (
      event.target === saleModal
    ) {
      closeSaleModalFunction();
    }

  }
);


viewSaleModal.addEventListener(
  "click",
  event => {

    if (
      event.target === viewSaleModal
    ) {
      viewSaleModal.classList.remove("show");
    }

  }
);


/* =========================
   ESCAPE KEY
   ========================= */

document.addEventListener(
  "keydown",
  event => {

    if (event.key !== "Escape") {
      return;
    }

    if (
      saleModal.classList.contains("show")
    ) {
      closeSaleModalFunction();
    }

    if (
      viewSaleModal.classList.contains("show")
    ) {
      viewSaleModal.classList.remove("show");
    }

  }
);


/* =========================
   INITIALIZE
   ========================= */

loadData();

normalizeAllSales();

renderAll();

populateProducts();

renderSaleItems();

updatePaymentFields();


/* =========================
   GLOBAL API
   ========================= */

window.ShopManagerSales = {

  refresh() {
    loadData();
    normalizeAllSales();
    renderAll();
    populateProducts();
  },

  getSales() {
    return [...sales];
  },

  getPaymentSummary() {

    let paid = 0;
    let partial = 0;
    let unpaid = 0;

    sales.forEach(sale => {

      const normalized =
        normalizeSale(sale);

      if (
        normalized.paymentStatus ===
        "paid"
      ) {

        paid += normalized.amountPaid;

      } else if (
        normalized.paymentStatus ===
        "partial"
      ) {

        partial += normalized.amountPaid;

      } else {

        unpaid += normalized.balance;
      }
    });

    return {
      paid,
      partial,
      unpaid
    };
  }

};
```
