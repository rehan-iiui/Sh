// ==========================================
// SHOP MANAGER - PRODUCTS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  // ------------------------------------------
  // ELEMENTS
  // ------------------------------------------

  const addProductBtn = document.getElementById("addProductBtn");
  const emptyAddProductBtn = document.getElementById("emptyAddProductBtn");

  const modal = document.getElementById("productModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  const productForm = document.getElementById("productForm");

  const productName = document.getElementById("productName");
  const productCategory = document.getElementById("productCategory");
  const productStock = document.getElementById("productStock");
  const buyingPrice = document.getElementById("buyingPrice");
  const sellingPrice = document.getElementById("sellingPrice");

  const productsTableBody =
    document.getElementById("productsTableBody");

  const searchInput =
    document.getElementById("searchInput");

  const categoryFilter =
    document.getElementById("categoryFilter");

  const productCount =
    document.getElementById("productCount");

  const stockCount =
    document.getElementById("stockCount");

  const lowStockCount =
    document.getElementById("lowStockCount");

  const inventoryValue =
    document.getElementById("inventoryValue");


  // ------------------------------------------
  // DATA
  // ------------------------------------------

  let products =
    JSON.parse(localStorage.getItem("shopManagerProducts")) || [];

  let editingProductId = null;


  // ------------------------------------------
  // SAVE DATA
  // ------------------------------------------

  function saveProducts() {

    localStorage.setItem(
      "shopManagerProducts",
      JSON.stringify(products)
    );

  }


  // ------------------------------------------
  // OPEN MODAL
  // ------------------------------------------

  function openModal(product = null) {

    modal.classList.add("show");

    if (product) {

      editingProductId = product.id;

      document.getElementById("modalTitle").textContent =
        "Edit Product";

      productName.value = product.name;
      productCategory.value = product.category;
      productStock.value = product.stock;
      buyingPrice.value = product.buyingPrice;
      sellingPrice.value = product.sellingPrice;

    } else {

      editingProductId = null;

      document.getElementById("modalTitle").textContent =
        "Add Product";

      productForm.reset();

    }

    setTimeout(() => {
      productName.focus();
    }, 100);

  }


  // ------------------------------------------
  // CLOSE MODAL
  // ------------------------------------------

  function closeModal() {

    modal.classList.remove("show");

    productForm.reset();

    editingProductId = null;

    document.getElementById("modalTitle").textContent =
      "Add Product";

  }


  // ------------------------------------------
  // ADD PRODUCT BUTTONS
  // ------------------------------------------

  addProductBtn.addEventListener("click", () => {
    openModal();
  });


  emptyAddProductBtn.addEventListener("click", () => {
    openModal();
  });


  closeModalBtn.addEventListener("click", closeModal);

  cancelBtn.addEventListener("click", closeModal);


  // ------------------------------------------
  // CLOSE WHEN CLICKING OUTSIDE
  // ------------------------------------------

  modal.addEventListener("click", (event) => {

    if (event.target === modal) {
      closeModal();
    }

  });


  // ------------------------------------------
  // SAVE PRODUCT
  // ------------------------------------------

  productForm.addEventListener("submit", (event) => {

    event.preventDefault();


    const name =
      productName.value.trim();

    const category =
      productCategory.value;

    const stock =
      Number(productStock.value);

    const buying =
      Number(buyingPrice.value);

    const selling =
      Number(sellingPrice.value);


    if (!name) {
      alert("Please enter a product name.");
      return;
    }


    if (!category) {
      alert("Please select a category.");
      return;
    }


    if (stock < 0 || buying < 0 || selling < 0) {
      alert("Prices and stock cannot be negative.");
      return;
    }


    // EDIT PRODUCT

    if (editingProductId !== null) {

      const product =
        products.find(
          item => item.id === editingProductId
        );

      if (product) {

        product.name = name;
        product.category = category;
        product.stock = stock;
        product.buyingPrice = buying;
        product.sellingPrice = selling;

      }

    }


    // ADD PRODUCT

    else {

      const newProduct = {

        id: Date.now(),

        name: name,

        category: category,

        stock: stock,

        buyingPrice: buying,

        sellingPrice: selling

      };

      products.push(newProduct);

    }


    saveProducts();

    renderProducts();

    closeModal();

  });


  // ------------------------------------------
  // DELETE PRODUCT
  // ------------------------------------------

  function deleteProduct(id) {

    const product =
      products.find(item => item.id === id);

    if (!product) return;


    const confirmed =
      confirm(
        `Delete "${product.name}" from your products?`
      );


    if (!confirmed) return;


    products =
      products.filter(item => item.id !== id);


    saveProducts();

    renderProducts();

  }


  // ------------------------------------------
  // EDIT PRODUCT
  // ------------------------------------------

  function editProduct(id) {

    const product =
      products.find(item => item.id === id);

    if (!product) return;

    openModal(product);

  }


  // ------------------------------------------
  // CATEGORY NAME
  // ------------------------------------------

  function categoryName(category) {

    const names = {

      electronics: "Electronics",

      clothing: "Clothing",

      food: "Food",

      other: "Other"

    };

    return names[category] || "Other";

  }


  // ------------------------------------------
  // PRODUCT STATUS
  // ------------------------------------------

  function productStatus(stock) {

    if (stock === 0) {

      return `
        <span class="status out">
          Out of Stock
        </span>
      `;

    }


    if (stock <= 5) {

      return `
        <span class="status low">
          Low Stock
        </span>
      `;

    }


    return `
      <span class="status available">
        In Stock
      </span>
    `;

  }


  // ------------------------------------------
  // DISPLAY PRODUCTS
  // ------------------------------------------

  function renderProducts() {

    const search =
      searchInput.value
        .trim()
        .toLowerCase();

    const selectedCategory =
      categoryFilter.value;


    let filteredProducts =
      products.filter(product => {

        const matchesSearch =
          product.name
            .toLowerCase()
            .includes(search);

        const matchesCategory =
          selectedCategory === "all" ||
          product.category === selectedCategory;

        return matchesSearch && matchesCategory;

      });


    productsTableBody.innerHTML = "";


    // EMPTY RESULT

    if (filteredProducts.length === 0) {

      const row =
        document.createElement("tr");

      row.innerHTML = `
        <td colspan="7">

          <div class="empty-products">

            <div class="empty-products-icon">
              📦
            </div>

            <h2>
              ${products.length === 0
                ? "No products yet"
                : "No products found"}
            </h2>

            <p>
              ${products.length === 0
                ? "Add your first product to start managing inventory."
                : "Try changing your search or category filter."}
            </p>

            ${
              products.length === 0
                ? `
                  <button
                    class="add-product-btn"
                    id="emptyAddProductBtnNew"
                  >
                    + Add First Product
                  </button>
                `
                : ""
            }

          </div>

        </td>
      `;


      productsTableBody.appendChild(row);


      const newButton =
        document.getElementById("emptyAddProductBtnNew");


      if (newButton) {

        newButton.addEventListener("click", () => {
          openModal();
        });

      }


      updateStats();

      return;

    }


    // CREATE PRODUCT ROWS

    filteredProducts.forEach(product => {

      const row =
        document.createElement("tr");


      row.innerHTML = `

        <td>
          <strong>${escapeHTML(product.name)}</strong>
        </td>

        <td>
          ${categoryName(product.category)}
        </td>

        <td>
          Rs. ${product.buyingPrice.toLocaleString()}
        </td>

        <td>
          Rs. ${product.sellingPrice.toLocaleString()}
        </td>

        <td>
          <strong>${product.stock}</strong>
        </td>

        <td>
          ${productStatus(product.stock)}
        </td>

        <td>

          <button
            class="action-btn edit-btn"
            data-action="edit"
            data-id="${product.id}"
          >
            ✏️
          </button>

          <button
            class="action-btn delete-btn"
            data-action="delete"
            data-id="${product.id}"
          >
            🗑️
          </button>

        </td>

      `;


      productsTableBody.appendChild(row);

    });


    // ACTION BUTTONS

    productsTableBody
      .querySelectorAll("[data-action]")
      .forEach(button => {

        button.addEventListener("click", () => {

          const id =
            Number(button.dataset.id);

          const action =
            button.dataset.action;


          if (action === "edit") {
            editProduct(id);
          }


          if (action === "delete") {
            deleteProduct(id);
          }

        });

      });


    updateStats();

  }


  // ------------------------------------------
  // UPDATE STATISTICS
  // ------------------------------------------

  function updateStats() {

    const totalProducts =
      products.length;


    const totalStock =
      products.reduce(
        (total, product) =>
          total + product.stock,
        0
      );


    const lowStock =
      products.filter(
        product =>
          product.stock > 0 &&
          product.stock <= 5
      ).length;


    const totalInventoryValue =
      products.reduce(
        (total, product) =>
          total +
          (product.buyingPrice * product.stock),
        0
      );


    productCount.textContent =
      totalProducts;


    stockCount.textContent =
      totalStock;


    lowStockCount.textContent =
      lowStock;


    inventoryValue.textContent =
      "Rs. " +
      totalInventoryValue.toLocaleString();

  }


  // ------------------------------------------
  // SEARCH
  // ------------------------------------------

  searchInput.addEventListener(
    "input",
    renderProducts
  );


  // ------------------------------------------
  // CATEGORY FILTER
  // ------------------------------------------

  categoryFilter.addEventListener(
    "change",
    renderProducts
  );


  // ------------------------------------------
  // ESCAPE HTML
  // ------------------------------------------

  function escapeHTML(value) {

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  // ------------------------------------------
  // INITIAL RENDER
  // ------------------------------------------

  renderProducts();

});
```
