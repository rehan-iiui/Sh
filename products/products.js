/* =========================================================
   SHOP MANAGER - PRODUCTS + INVENTORY MANAGEMENT
========================================================= */

const PRODUCTS_KEY = "shopManagerProducts";
const INVENTORY_HISTORY_KEY = "shopManagerInventoryHistory";

let products = [];
let inventoryHistory = [];
let editingProductId = null;


/* =========================================================
   BASIC HELPERS
========================================================= */

function loadProducts() {
  try {
    const data = JSON.parse(localStorage.getItem(PRODUCTS_KEY));
    products = Array.isArray(data) ? data : [];
  } catch (error) {
    products = [];
  }
}

function saveProducts() {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function loadInventoryHistory() {
  try {
    const data = JSON.parse(
      localStorage.getItem(INVENTORY_HISTORY_KEY)
    );

    inventoryHistory = Array.isArray(data) ? data : [];
  } catch (error) {
    inventoryHistory = [];
  }
}

function saveInventoryHistory() {
  localStorage.setItem(
    INVENTORY_HISTORY_KEY,
    JSON.stringify(inventoryHistory)
  );
}

function createId(prefix = "ID") {
  return (
    prefix +
    "-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 7)
  ).toUpperCase();
}

function formatMoney(amount) {
  const settings = getSettings();
  const currency = settings.currency || "Rs";

  const value = Number(amount) || 0;

  return `${currency} ${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
}

function getSettings() {
  try {
    const data = JSON.parse(
      localStorage.getItem("shopManagerSettings")
    );

    return data && typeof data === "object" ? data : {};
  } catch (error) {
    return {};
  }
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function getLowStockThreshold() {
  const settings = getSettings();

  const threshold = Number(
    settings.lowStockThreshold ?? 5
  );

  return Number.isFinite(threshold) && threshold >= 0
    ? threshold
    : 5;
}


/* =========================================================
   DOM ELEMENTS
========================================================= */

const totalProductsEl =
  document.getElementById("totalProducts");

const totalStockEl =
  document.getElementById("totalStock");

const lowStockEl =
  document.getElementById("lowStock");

const inventoryValueEl =
  document.getElementById("inventoryValue");

const productsTableBody =
  document.getElementById("productsTableBody");

const emptyState =
  document.getElementById("emptyState");

const searchInput =
  document.getElementById("searchInput");

const categoryFilter =
  document.getElementById("categoryFilter");

const addProductBtn =
  document.getElementById("addProductBtn");

const emptyAddProductBtn =
  document.getElementById("emptyAddProductBtn");

const productModal =
  document.getElementById("productModal");

const productForm =
  document.getElementById("productForm");

const closeProductModal =
  document.getElementById("closeProductModal");

const cancelProductBtn =
  document.getElementById("cancelProductBtn");

const modalTitle =
  document.getElementById("modalTitle");

const productIdInput =
  document.getElementById("productId");

const productNameInput =
  document.getElementById("productName");

const productCategoryInput =
  document.getElementById("productCategory");

const productStockInput =
  document.getElementById("productStock");

const buyingPriceInput =
  document.getElementById("buyingPrice");

const sellingPriceInput =
  document.getElementById("sellingPrice");


/* =========================================================
   INVENTORY ELEMENTS
========================================================= */

const restockBtn =
  document.getElementById("restockBtn");

const removeStockBtn =
  document.getElementById("removeStockBtn");

const damagedStockBtn =
  document.getElementById("damagedStockBtn");

const lostStockBtn =
  document.getElementById("lostStockBtn");

const viewHistoryBtn =
  document.getElementById("viewHistoryBtn");

const viewAllHistoryBtn =
  document.getElementById("viewAllHistoryBtn");

const recentMovementsBody =
  document.getElementById("recentMovementsBody");

const noMovements =
  document.getElementById("noMovements");

const stockModal =
  document.getElementById("stockModal");

const stockForm =
  document.getElementById("stockForm");

const closeStockModal =
  document.getElementById("closeStockModal");

const cancelStockBtn =
  document.getElementById("cancelStockBtn");

const stockModalTitle =
  document.getElementById("stockModalTitle");

const stockProductIdInput =
  document.getElementById("stockProductId");

const stockProduct =
  document.getElementById("stockProduct");

const currentStockDisplay =
  document.getElementById("currentStockDisplay");

const stockReason =
  document.getElementById("stockReason");

const stockQuantity =
  document.getElementById("stockQuantity");

const stockNote =
  document.getElementById("stockNote");

const stockBeforePreview =
  document.getElementById("stockBeforePreview");

const stockAfterPreview =
  document.getElementById("stockAfterPreview");

const historyModal =
  document.getElementById("historyModal");

const closeHistoryModal =
  document.getElementById("closeHistoryModal");

const historySearch =
  document.getElementById("historySearch");

const historyTypeFilter =
  document.getElementById("historyTypeFilter");

const historyReasonFilter =
  document.getElementById("historyReasonFilter");

const historyTableBody =
  document.getElementById("historyTableBody");

const historyEmpty =
  document.getElementById("historyEmpty");


/* =========================================================
   PRODUCT STATS
========================================================= */

function updateStats() {
  const totalProducts = products.length;

  const totalStock = products.reduce(
    (sum, product) =>
      sum + Math.max(0, Number(product.stock) || 0),
    0
  );

  const threshold = getLowStockThreshold();

  const lowStock = products.filter(product => {
    const stock = Number(product.stock) || 0;

    return stock > 0 && stock <= threshold;
  }).length;

  const inventoryValue = products.reduce(
    (sum, product) => {
      const stock = Number(product.stock) || 0;
      const buyingPrice =
        Number(product.buyingPrice) || 0;

      return sum + stock * buyingPrice;
    },
    0
  );

  if (totalProductsEl) {
    totalProductsEl.textContent = totalProducts;
  }

  if (totalStockEl) {
    totalStockEl.textContent =
      totalStock.toLocaleString();
  }

  if (lowStockEl) {
    lowStockEl.textContent = lowStock;
  }

  if (inventoryValueEl) {
    inventoryValueEl.textContent =
      formatMoney(inventoryValue);
  }
}


/* =========================================================
   CATEGORY FILTER
========================================================= */

function updateCategoryFilter() {
  if (!categoryFilter) return;

  const currentValue =
    categoryFilter.value || "all";

  const categories = [
    ...new Set(
      products
        .map(product =>
          String(product.category || "").trim()
        )
        .filter(Boolean)
    )
  ].sort((a, b) =>
    a.localeCompare(b)
  );

  categoryFilter.innerHTML =
    `<option value="all">All Categories</option>`;

  categories.forEach(category => {
    const option =
      document.createElement("option");

    option.value = category;
    option.textContent = category;

    categoryFilter.appendChild(option);
  });

  if (
    categories.includes(currentValue)
  ) {
    categoryFilter.value = currentValue;
  } else {
    categoryFilter.value = "all";
  }
}


/* =========================================================
   PRODUCT TABLE
========================================================= */

function getFilteredProducts() {
  const search =
    String(searchInput?.value || "")
      .trim()
      .toLowerCase();

  const category =
    categoryFilter?.value || "all";

  return products.filter(product => {
    const name =
      String(product.name || "")
        .toLowerCase();

    const productCategory =
      String(product.category || "")
        .toLowerCase();

    const matchesSearch =
      !search ||
      name.includes(search) ||
      productCategory.includes(search);

    const matchesCategory =
      category === "all" ||
      String(product.category || "") === category;

    return matchesSearch && matchesCategory;
  });
}

function getStockStatus(stock) {
  const value = Number(stock) || 0;
  const threshold = getLowStockThreshold();

  if (value <= 0) {
    return {
      text: "Out of Stock",
      className: "status-out"
    };
  }

  if (value <= threshold) {
    return {
      text: "Low Stock",
      className: "status-low"
    };
  }

  return {
    text: "In Stock",
    className: "status-in"
  };
}

function renderProducts() {
  if (!productsTableBody) return;

  const filtered =
    getFilteredProducts();

  productsTableBody.innerHTML = "";

  if (filtered.length === 0) {
    if (emptyState) {
      emptyState.style.display = "block";
    }

    return;
  }

  if (emptyState) {
    emptyState.style.display = "none";
  }

  filtered.forEach(product => {
    const stock =
      Math.max(0, Number(product.stock) || 0);

    const buyingPrice =
      Number(product.buyingPrice) || 0;

    const sellingPrice =
      Number(product.sellingPrice) || 0;

    const inventoryValue =
      stock * buyingPrice;

    const status =
      getStockStatus(stock);

    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td>
        <div class="product-name">
          ${escapeHTML(product.name)}
        </div>
      </td>

      <td>
        <div class="product-category">
          ${escapeHTML(product.category)}
        </div>
      </td>

      <td>
        <span class="stock-number">
          ${stock.toLocaleString()}
        </span>
      </td>

      <td class="price-cell">
        ${formatMoney(buyingPrice)}
      </td>

      <td class="price-cell">
        ${formatMoney(sellingPrice)}
      </td>

      <td class="price-cell">
        ${formatMoney(inventoryValue)}
      </td>

      <td>
        <span class="status-badge ${status.className}">
          ${status.text}
        </span>
      </td>

      <td>
        <div class="action-buttons">

          <button
            class="action-btn adjust"
            data-action="adjust"
            data-id="${escapeHTML(product.id)}"
          >
            Adjust
          </button>

          <button
            class="action-btn edit"
            data-action="edit"
            data-id="${escapeHTML(product.id)}"
          >
            Edit
          </button>

          <button
            class="action-btn delete"
            data-action="delete"
            data-id="${escapeHTML(product.id)}"
          >
            Delete
          </button>

        </div>
      </td>
    `;

    productsTableBody.appendChild(row);
  });
}


/* =========================================================
   PRODUCT MODAL
========================================================= */

function openProductModal(product = null) {
  if (!productModal) return;

  editingProductId =
    product ? product.id : null;

  if (product) {
    modalTitle.textContent =
      "Edit Product";

    productIdInput.value =
      product.id || "";

    productNameInput.value =
      product.name || "";

    productCategoryInput.value =
      product.category || "";

    productStockInput.value =
      Number(product.stock) || 0;

    buyingPriceInput.value =
      Number(product.buyingPrice) || 0;

    sellingPriceInput.value =
      Number(product.sellingPrice) || 0;
  } else {
    modalTitle.textContent =
      "Add Product";

    productForm.reset();

    productIdInput.value = "";
    productStockInput.value = "0";
  }

  productModal.classList.add("show");

  setTimeout(() => {
    productNameInput?.focus();
  }, 100);
}

function closeProductModalFn() {
  productModal?.classList.remove("show");
  editingProductId = null;
}

function saveProduct(event) {
  event.preventDefault();

  const name =
    productNameInput.value.trim();

  const category =
    productCategoryInput.value.trim();

  const stock =
    Math.max(
      0,
      parseInt(productStockInput.value, 10) || 0
    );

  const buyingPrice =
    Math.max(
      0,
      Number(buyingPriceInput.value) || 0
    );

  const sellingPrice =
    Math.max(
      0,
      Number(sellingPriceInput.value) || 0
    );

  if (!name) {
    alert("Please enter a product name.");
    return;
  }

  if (!category) {
    alert("Please enter a category.");
    return;
  }

  const duplicate =
    products.find(product =>
      String(product.name || "")
        .trim()
        .toLowerCase() === name.toLowerCase() &&
      product.id !== editingProductId
    );

  if (duplicate) {
    alert("A product with this name already exists.");
    return;
  }

  if (editingProductId) {
    const product =
      products.find(
        item => item.id === editingProductId
      );

    if (!product) {
      alert("Product not found.");
      return;
    }

    product.name = name;
    product.category = category;
    product.stock = stock;
    product.buyingPrice = buyingPrice;
    product.sellingPrice = sellingPrice;
    product.updatedAt =
      new Date().toISOString();

  } else {
    const product = {
      id: createId("PROD"),
      name,
      category,
      stock,
      buyingPrice,
      sellingPrice,
      createdAt:
        new Date().toISOString(),
      updatedAt:
        new Date().toISOString()
    };

    products.push(product);
  }

  saveProducts();

  closeProductModalFn();
  refreshProducts();
}


/* =========================================================
   DELETE PRODUCT
========================================================= */

function deleteProduct(id) {
  const product =
    products.find(item => item.id === id);

  if (!product) return;

  const confirmed =
    confirm(
      `Delete "${product.name}"?\n\nThis will remove the product from your product list. Existing stock movement history will remain.`
    );

  if (!confirmed) return;

  products =
    products.filter(
      item => item.id !== id
    );

  saveProducts();

  refreshProducts();
}


/* =========================================================
   STOCK PRODUCT SELECT
========================================================= */

function populateStockProducts(selectedId = "") {
  if (!stockProduct) return;

  stockProduct.innerHTML =
    `<option value="">Select Product</option>`;

  products
    .slice()
    .sort((a, b) =>
      String(a.name || "")
        .localeCompare(
          String(b.name || "")
        )
    )
    .forEach(product => {
      const option =
        document.createElement("option");

      option.value = product.id;

      option.textContent =
        `${product.name} — Stock: ${
          Number(product.stock) || 0
        }`;

      stockProduct.appendChild(option);
    });

  if (selectedId) {
    stockProduct.value = selectedId;
  }

  updateStockPreview();
}


/* =========================================================
   STOCK ADJUSTMENT MODAL
========================================================= */

function openStockModal(
  mode = "adjust",
  productId = ""
) {
  if (!stockModal) return;

  stockForm.reset();

  stockProductIdInput.value = "";

  stockModal.classList.add("show");

  populateStockProducts(productId);

  const modeSettings = {
    restock: {
      title: "Restock Product",
      reason: "restock"
    },

    remove: {
      title: "Remove Stock",
      reason: "removed"
    },

    damaged: {
      title: "Record Damaged Stock",
      reason: "damaged"
    },

    lost: {
      title: "Record Lost Stock",
      reason: "lost"
    },

    adjust: {
      title: "Adjust Stock",
      reason: "correction"
    }
  };

  const config =
    modeSettings[mode] ||
    modeSettings.adjust;

  stockModalTitle.textContent =
    config.title;

  stockReason.value =
    config.reason;

  if (productId) {
    stockProduct.value = productId;
  }

  updateStockPreview();

  setTimeout(() => {
    if (productId) {
      stockQuantity?.focus();
    } else {
      stockProduct?.focus();
    }
  }, 100);
}

function closeStockModalFn() {
  stockModal?.classList.remove("show");
}


/* =========================================================
   STOCK PREVIEW
========================================================= */

function getSelectedStockProduct() {
  const id =
    stockProduct?.value || "";

  return products.find(
    product => product.id === id
  );
}

function isStockAddition(reason) {
  return reason === "restock" ||
    reason === "return";
}

function updateStockPreview() {
  const product =
    getSelectedStockProduct();

  const before =
    product
      ? Math.max(0, Number(product.stock) || 0)
      : 0;

  const quantity =
    Math.max(
      0,
      parseInt(stockQuantity?.value, 10) || 0
    );

  const reason =
    stockReason?.value || "restock";

  let after = before;

  if (quantity > 0) {
    if (isStockAddition(reason)) {
      after = before + quantity;
    } else if (reason === "correction") {
      /*
        Correction means the entered quantity is
        the amount to adjust upward/downward.
        The direction is selected using the
        special prefix in the note:
        "ADD" or "REMOVE".

        Default correction behavior:
        add stock.
      */

      after = before + quantity;
    } else {
      after = before - quantity;
    }
  }

  if (after < 0) {
    after = 0;
  }

  if (currentStockDisplay) {
    currentStockDisplay.textContent =
      before.toLocaleString();
  }

  if (stockBeforePreview) {
    stockBeforePreview.textContent =
      before.toLocaleString();
  }

  if (stockAfterPreview) {
    stockAfterPreview.textContent =
      after.toLocaleString();
  }
}


/* =========================================================
   SAVE STOCK MOVEMENT
========================================================= */

function saveStockAdjustment(event) {
  event.preventDefault();

  const product =
    getSelectedStockProduct();

  if (!product) {
    alert("Please select a product.");
    return;
  }

  const quantity =
    parseInt(stockQuantity.value, 10);

  if (!Number.isInteger(quantity) ||
      quantity <= 0) {
    alert("Please enter a valid quantity.");
    return;
  }

  const reason =
    stockReason.value;

  const note =
    stockNote.value.trim();

  const before =
    Math.max(
      0,
      Number(product.stock) || 0
    );

  let change = 0;

  if (isStockAddition(reason)) {
    change = quantity;
  } else if (reason === "correction") {
    /*
      For correction:
      Positive quantity = add stock.
      If the note starts with REMOVE,
      the quantity is subtracted.

      Example:
      REMOVE 5 damaged counting correction.
    */

    if (
      note.toUpperCase().startsWith("REMOVE")
    ) {
      change = -quantity;
    } else {
      change = quantity;
    }
  } else {
    change = -quantity;
  }

  const after =
    before + change;

  if (after < 0) {
    alert(
      `Not enough stock.\n\nCurrent stock: ${before}\nRequested removal: ${quantity}`
    );

    return;
  }

  product.stock = after;
  product.updatedAt =
    new Date().toISOString();

  const movement = {
    id: createId("MOV"),
    productId: product.id,
    productName: product.name,

    type:
      change >= 0
        ? "in"
        : "out",

    reason,

    quantity,

    change,

    beforeStock: before,
    afterStock: after,

    note,

    date:
      new Date().toISOString()
  };

  inventoryHistory.unshift(
    movement
  );

  saveProducts();
  saveInventoryHistory();

  closeStockModalFn();

  refreshProducts();
  renderRecentMovements();

  /*
    Tell the main dashboard to refresh
    if its global API is available.
  */
  try {
    if (
      window.parent &&
      window.parent.ShopManager &&
      typeof window.parent.ShopManager
        .updateDashboard === "function"
    ) {
      window.parent.ShopManager
        .updateDashboard();
    }
  } catch (error) {
    // Ignore iframe communication errors.
  }
}


/* =========================================================
   REASON LABELS
========================================================= */

function getReasonLabel(reason) {
  const labels = {
    restock: "Restock",
    damaged: "Damaged",
    lost: "Lost",
    removed: "Removed",
    correction: "Correction",
    return: "Customer Return"
  };

  return labels[reason] || reason;
}


/* =========================================================
   RECENT MOVEMENTS
========================================================= */

function renderRecentMovements() {
  if (!recentMovementsBody) return;

  const movements =
    inventoryHistory
      .slice()
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .slice(0, 8);

  recentMovementsBody.innerHTML = "";

  if (movements.length === 0) {
    if (noMovements) {
      noMovements.style.display =
        "block";
    }

    return;
  }

  if (noMovements) {
    noMovements.style.display =
      "none";
  }

  movements.forEach(movement => {
    const row =
      document.createElement("tr");

    const isIn =
      movement.type === "in";

    row.innerHTML = `
      <td>
        ${formatDate(movement.date)}
      </td>

      <td>
        <strong>
          ${escapeHTML(movement.productName)}
        </strong>
      </td>

      <td>
        <span class="movement-badge ${
          isIn ? "in" : "out"
        }">
          ${isIn ? "Added" : "Removed"}
        </span>
      </td>

      <td>
        ${escapeHTML(
          getReasonLabel(movement.reason)
        )}
      </td>

      <td>
        <span class="${
          isIn
            ? "quantity-in"
            : "quantity-out"
        }">
          ${isIn ? "+" : "-"}${
            Number(movement.quantity) || 0
          }
        </span>
      </td>

      <td>
        ${Number(
          movement.afterStock
        ).toLocaleString()}
      </td>
    `;

    recentMovementsBody.appendChild(row);
  });
}


/* =========================================================
   HISTORY MODAL
========================================================= */

function openHistoryModal() {
  if (!historyModal) return;

  historyModal.classList.add("show");

  renderHistory();
}

function closeHistoryModalFn() {
  historyModal?.classList.remove("show");
}

function renderHistory() {
  if (!historyTableBody) return;

  const search =
    String(historySearch?.value || "")
      .trim()
      .toLowerCase();

  const type =
    historyTypeFilter?.value || "all";

  const reason =
    historyReasonFilter?.value || "all";

  const filtered =
    inventoryHistory
      .slice()
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .filter(movement => {

        const matchesSearch =
          !search ||
          String(
            movement.productName || ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            movement.reason || ""
          )
            .toLowerCase()
            .includes(search) ||
          String(
            movement.note || ""
          )
            .toLowerCase()
            .includes(search);

        const matchesType =
          type === "all" ||
          movement.type === type;

        const matchesReason =
          reason === "all" ||
          movement.reason === reason;

        return (
          matchesSearch &&
          matchesType &&
          matchesReason
        );
      });

  historyTableBody.innerHTML = "";

  if (filtered.length === 0) {
    if (historyEmpty) {
      historyEmpty.style.display =
        "block";
    }

    return;
  }

  if (historyEmpty) {
    historyEmpty.style.display =
      "none";
  }

  filtered.forEach(movement => {
    const row =
      document.createElement("tr");

    const isIn =
      movement.type === "in";

    row.innerHTML = `
      <td>
        ${formatDate(movement.date)}
      </td>

      <td>
        <strong>
          ${escapeHTML(movement.productName)}
        </strong>
      </td>

      <td>
        <span class="movement-badge ${
          isIn ? "in" : "out"
        }">
          ${isIn ? "Added" : "Removed"}
        </span>
      </td>

      <td>
        ${escapeHTML(
          getReasonLabel(movement.reason)
        )}
      </td>

      <td>
        <span class="${
          isIn
            ? "quantity-in"
            : "quantity-out"
        }">
          ${isIn ? "+" : "-"}${
            Number(movement.quantity) || 0
          }
        </span>
      </td>

      <td>
        ${Number(
          movement.beforeStock
        ).toLocaleString()}
      </td>

      <td>
        ${Number(
          movement.afterStock
        ).toLocaleString()}
      </td>

      <td>
        <div class="history-note">
          ${escapeHTML(
            movement.note || "-"
          )}
        </div>
      </td>
    `;

    historyTableBody.appendChild(row);
  });
}


/* =========================================================
   PRODUCT ACTION HANDLING
========================================================= */

function handleProductTableClick(event) {
  const button =
    event.target.closest(
      "button[data-action]"
    );

  if (!button) return;

  const action =
    button.dataset.action;

  const id =
    button.dataset.id;

  const product =
    products.find(
      item => item.id === id
    );

  if (!product) return;

  if (action === "adjust") {
    openStockModal(
      "adjust",
      product.id
    );
  }

  if (action === "edit") {
    openProductModal(product);
  }

  if (action === "delete") {
    deleteProduct(product.id);
  }
}


/* =========================================================
   EVENT LISTENERS
========================================================= */

addProductBtn?.addEventListener(
  "click",
  () => openProductModal()
);

emptyAddProductBtn?.addEventListener(
  "click",
  () => openProductModal()
);

closeProductModal?.addEventListener(
  "click",
  closeProductModalFn
);

cancelProductBtn?.addEventListener(
  "click",
  closeProductModalFn
);

productForm?.addEventListener(
  "submit",
  saveProduct
);

productsTableBody?.addEventListener(
  "click",
  handleProductTableClick
);

searchInput?.addEventListener(
  "input",
  renderProducts
);

categoryFilter?.addEventListener(
  "change",
  renderProducts
);


/* INVENTORY BUTTONS */

restockBtn?.addEventListener(
  "click",
  () => openStockModal("restock")
);

removeStockBtn?.addEventListener(
  "click",
  () => openStockModal("remove")
);

damagedStockBtn?.addEventListener(
  "click",
  () => openStockModal("damaged")
);

lostStockBtn?.addEventListener(
  "click",
  () => openStockModal("lost")
);

viewHistoryBtn?.addEventListener(
  "click",
  openHistoryModal
);

viewAllHistoryBtn?.addEventListener(
  "click",
  openHistoryModal
);


/* STOCK MODAL */

closeStockModal?.addEventListener(
  "click",
  closeStockModalFn
);

cancelStockBtn?.addEventListener(
  "click",
  closeStockModalFn
);

stockForm?.addEventListener(
  "submit",
  saveStockAdjustment
);

stockProduct?.addEventListener(
  "change",
  updateStockPreview
);

stockReason?.addEventListener(
  "change",
  updateStockPreview
);

stockQuantity?.addEventListener(
  "input",
  updateStockPreview
);


/* HISTORY */

closeHistoryModal?.addEventListener(
  "click",
  closeHistoryModalFn
);

historySearch?.addEventListener(
  "input",
  renderHistory
);

historyTypeFilter?.addEventListener(
  "change",
  renderHistory
);

historyReasonFilter?.addEventListener(
  "change",
  renderHistory
);


/* =========================================================
   CLOSE MODALS WHEN CLICKING OUTSIDE
========================================================= */

productModal?.addEventListener(
  "click",
  event => {
    if (
      event.target === productModal
    ) {
      closeProductModalFn();
    }
  }
);

stockModal?.addEventListener(
  "click",
  event => {
    if (
      event.target === stockModal
    ) {
      closeStockModalFn();
    }
  }
);

historyModal?.addEventListener(
  "click",
  event => {
    if (
      event.target === historyModal
    ) {
      closeHistoryModalFn();
    }
  }
);


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
  "keydown",
  event => {
    if (event.key !== "Escape") return;

    closeProductModalFn();
    closeStockModalFn();
    closeHistoryModalFn();
  }
);


/* =========================================================
   REFRESH
========================================================= */

function refreshProducts() {
  loadProducts();
  loadInventoryHistory();

  updateStats();
  updateCategoryFilter();
  populateStockProducts();
  renderProducts();
  renderRecentMovements();
}


/* =========================================================
   INITIALIZE
========================================================= */

refreshProducts();


/* =========================================================
   PUBLIC API
========================================================= */

window.ShopManagerProducts = {
  refresh: refreshProducts,

  getProducts: () =>
    products.slice(),

  getInventoryHistory: () =>
    inventoryHistory.slice(),

  adjustStock: (
    productId,
    quantity,
    reason = "correction",
    note = ""
  ) => {

    const product =
      products.find(
        item => item.id === productId
      );

    if (!product) {
      return {
        success: false,
        message: "Product not found."
      };
    }

    const amount =
      Number(quantity);

    if (
      !Number.isFinite(amount) ||
      amount === 0
    ) {
      return {
        success: false,
        message: "Invalid quantity."
      };
    }

    const before =
      Number(product.stock) || 0;

    const after =
      before + amount;

    if (after < 0) {
      return {
        success: false,
        message: "Insufficient stock."
      };
    }

    product.stock = after;

    const movement = {
      id: createId("MOV"),
      productId: product.id,
      productName: product.name,
      type: amount > 0 ? "in" : "out",
      reason,
      quantity: Math.abs(amount),
      change: amount,
      beforeStock: before,
      afterStock: after,
      note,
      date: new Date().toISOString()
    };

    inventoryHistory.unshift(
      movement
    );

    saveProducts();
    saveInventoryHistory();

    refreshProducts();

    return {
      success: true,
      movement
    };
  }
};
```
