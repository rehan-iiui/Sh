const CUSTOMERS_KEY = "shopManagerCustomers";
const SALES_KEY = "shopManagerSales";

let customers = [];
let sales = [];
let editingCustomerId = null;

/* =========================
   DOM ELEMENTS
========================= */

const addCustomerBtn =
  document.getElementById("addCustomerBtn");

const emptyAddCustomerBtn =
  document.getElementById("emptyAddCustomerBtn");

const customerModal =
  document.getElementById("customerModal");

const closeCustomerModal =
  document.getElementById("closeCustomerModal");

const cancelCustomerBtn =
  document.getElementById("cancelCustomerBtn");

const customerForm =
  document.getElementById("customerForm");

const customerModalTitle =
  document.getElementById("customerModalTitle");

const customerFullName =
  document.getElementById("customerFullName");

const customerPhone =
  document.getElementById("customerPhone");

const customerEmail =
  document.getElementById("customerEmail");

const customerAddress =
  document.getElementById("customerAddress");

const customerNotes =
  document.getElementById("customerNotes");

const customerSearch =
  document.getElementById("customerSearch");

const customersTableBody =
  document.getElementById("customersTableBody");

const totalCustomers =
  document.getElementById("totalCustomers");

const activeCustomers =
  document.getElementById("activeCustomers");

const customerOrders =
  document.getElementById("customerOrders");

const customerPurchases =
  document.getElementById("customerPurchases");


/* =========================
   LOAD / SAVE DATA
========================= */

function loadCustomers() {
  try {
    customers = JSON.parse(
      localStorage.getItem(CUSTOMERS_KEY) || "[]"
    );
  } catch {
    customers = [];
  }
}

function saveCustomers() {
  localStorage.setItem(
    CUSTOMERS_KEY,
    JSON.stringify(customers)
  );
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


/* =========================
   HELPERS
========================= */

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

function getInitials(name) {
  const words = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[words.length - 1].charAt(0)
  ).toUpperCase();
}


/* =========================
   CUSTOMER SALES DATA
========================= */

function getCustomerStats(customer) {

  let orders = 0;
  let purchases = 0;

  sales.forEach(sale => {

    const saleCustomer =
      String(sale.customer || "")
        .trim()
        .toLowerCase();

    const customerName =
      String(customer.name || "")
        .trim()
        .toLowerCase();

    if (
      saleCustomer === customerName
    ) {
      orders += 1;
      purchases += Number(sale.total || 0);
    }

  });

  return {
    orders,
    purchases
  };
}


/* =========================
   MODAL
========================= */

function openAddCustomerModal() {

  editingCustomerId = null;

  customerModalTitle.textContent =
    "Add Customer";

  customerForm.reset();

  customerModal.classList.add("show");

  setTimeout(() => {
    customerFullName.focus();
  }, 100);
}

function openEditCustomerModal(id) {

  const customer = customers.find(
    item => String(item.id) === String(id)
  );

  if (!customer) {
    return;
  }

  editingCustomerId = customer.id;

  customerModalTitle.textContent =
    "Edit Customer";

  customerFullName.value =
    customer.name || "";

  customerPhone.value =
    customer.phone || "";

  customerEmail.value =
    customer.email || "";

  customerAddress.value =
    customer.address || "";

  customerNotes.value =
    customer.notes || "";

  customerModal.classList.add("show");

  setTimeout(() => {
    customerFullName.focus();
  }, 100);
}

function closeCustomerModalWindow() {

  customerModal.classList.remove("show");

  editingCustomerId = null;

  customerForm.reset();
}

addCustomerBtn.addEventListener(
  "click",
  openAddCustomerModal
);

emptyAddCustomerBtn.addEventListener(
  "click",
  openAddCustomerModal
);

closeCustomerModal.addEventListener(
  "click",
  closeCustomerModalWindow
);

cancelCustomerBtn.addEventListener(
  "click",
  closeCustomerModalWindow
);


/* =========================
   SAVE CUSTOMER
========================= */

customerForm.addEventListener(
  "submit",
  event => {

    event.preventDefault();

    const name =
      customerFullName.value.trim();

    const phone =
      customerPhone.value.trim();

    const email =
      customerEmail.value.trim();

    const address =
      customerAddress.value.trim();

    const notes =
      customerNotes.value.trim();


    if (!name) {
      alert("Please enter the customer's name.");
      customerFullName.focus();
      return;
    }


    /* EDIT CUSTOMER */

    if (editingCustomerId !== null) {

      const customer =
        customers.find(
          item =>
            String(item.id) ===
            String(editingCustomerId)
        );

      if (!customer) {
        alert("Customer not found.");
        return;
      }

      customer.name = name;
      customer.phone = phone;
      customer.email = email;
      customer.address = address;
      customer.notes = notes;

    }

    /* ADD CUSTOMER */

    else {

      const newCustomer = {

        id:
          "C-" +
          Date.now()
            .toString()
            .slice(-8),

        name: name,

        phone: phone,

        email: email,

        address: address,

        notes: notes,

        createdAt:
          new Date().toISOString()

      };

      customers.unshift(newCustomer);
    }


    saveCustomers();

    closeCustomerModalWindow();

    renderCustomers();

    updateStatistics();

    alert(
      editingCustomerId !== null
        ? "Customer updated successfully!"
        : "Customer added successfully!"
    );
  }
);


/* =========================
   RENDER CUSTOMERS
========================= */

function renderCustomers(searchTerm = "") {

  loadCustomers();
  loadSales();

  const search =
    searchTerm.trim().toLowerCase();

  let filteredCustomers = customers;


  if (search) {

    filteredCustomers =
      customers.filter(customer => {

        return (
          String(customer.name || "")
            .toLowerCase()
            .includes(search) ||

          String(customer.phone || "")
            .toLowerCase()
            .includes(search) ||

          String(customer.email || "")
            .toLowerCase()
            .includes(search) ||

          String(customer.address || "")
            .toLowerCase()
            .includes(search)
        );

      });

  }


  if (filteredCustomers.length === 0) {

    customersTableBody.innerHTML = `
      <tr>

        <td colspan="6">

          <div class="empty-customers">

            <div class="empty-customers-icon">
              👥
            </div>

            <h2>
              ${
                search
                  ? "No customers found"
                  : "No customers yet"
              }
            </h2>

            <p>
              ${
                search
                  ? "Try another search."
                  : "Add your first customer to get started."
              }
            </p>

            ${
              search
                ? ""
                : `
                  <button
                    class="add-customer-btn"
                    onclick="openAddCustomerModal()"
                  >
                    + Add First Customer
                  </button>
                `
            }

          </div>

        </td>

      </tr>
    `;

    return;
  }


  customersTableBody.innerHTML =
    filteredCustomers
      .map(customer => {

        const stats =
          getCustomerStats(customer);

        const initials =
          getInitials(customer.name);

        return `
          <tr>

            <td>

              <div class="customer-name">

                <div class="customer-avatar">
                  ${escapeHTML(initials)}
                </div>

                <div>

                  <strong>
                    ${escapeHTML(customer.name)}
                  </strong>

                  <small>
                    ${escapeHTML(customer.notes || "Customer")}
                  </small>

                </div>

              </div>

            </td>


            <td>

              <span class="customer-phone">
                ${
                  escapeHTML(
                    customer.phone ||
                    "—"
                  )
                }
              </span>

            </td>


            <td>

              <span class="customer-email">
                ${
                  escapeHTML(
                    customer.email ||
                    "—"
                  )
                }
              </span>

            </td>


            <td>
              ${stats.orders}
            </td>


            <td>

              <strong>
                ${formatMoney(stats.purchases)}
              </strong>

            </td>


            <td>

              <div class="customer-actions-cell">

                <button
                  class="action-btn edit-btn"
                  onclick="openEditCustomerModal('${escapeHTML(customer.id)}')"
                  title="Edit customer"
                >
                  ✏️
                </button>

                <button
                  class="action-btn delete-btn"
                  onclick="deleteCustomer('${escapeHTML(customer.id)}')"
                  title="Delete customer"
                >
                  🗑️
                </button>

              </div>

            </td>

          </tr>
        `;

      })
      .join("");
}


/* =========================
   DELETE CUSTOMER
========================= */

function deleteCustomer(id) {

  const customer =
    customers.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (!customer) {
    return;
  }


  const stats =
    getCustomerStats(customer);


  const message =
    stats.orders > 0
      ? `Delete "${customer.name}"?\n\nThis customer has ${stats.orders} recorded order(s). The sales records will NOT be deleted.`
      : `Delete "${customer.name}"?`;


  const confirmed =
    confirm(message);


  if (!confirmed) {
    return;
  }


  customers =
    customers.filter(
      item =>
        String(item.id) !==
        String(id)
    );


  saveCustomers();

  renderCustomers(
    customerSearch.value
  );

  updateStatistics();
}


/* =========================
   SEARCH
========================= */

customerSearch.addEventListener(
  "input",
  () => {

    renderCustomers(
      customerSearch.value
    );

  }
);


/* =========================
   STATISTICS
========================= */

function updateStatistics() {

  loadCustomers();
  loadSales();


  let totalOrderCount = 0;
  let totalPurchaseAmount = 0;


  customers.forEach(customer => {

    const stats =
      getCustomerStats(customer);

    totalOrderCount +=
      stats.orders;

    totalPurchaseAmount +=
      stats.purchases;

  });


  /*
    Active customer means a customer
    who has at least one recorded order.
  */

  const activeCount =
    customers.filter(customer => {

      return getCustomerStats(customer)
        .orders > 0;

    }).length;


  totalCustomers.textContent =
    customers.length;

  activeCustomers.textContent =
    activeCount;

  customerOrders.textContent =
    totalOrderCount;

  customerPurchases.textContent =
    formatMoney(totalPurchaseAmount);
}


/* =========================
   MODAL CONTROLS
========================= */

customerModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      customerModal
    ) {
      closeCustomerModalWindow();
    }

  }
);


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      customerModal.classList.contains("show")
    ) {
      closeCustomerModalWindow();
    }

  }
);


/* =========================
   INITIALIZE
========================= */

loadCustomers();
loadSales();

renderCustomers();
updateStatistics();


/* =========================
   GLOBAL FUNCTIONS
========================= */

window.openAddCustomerModal =
  openAddCustomerModal;

window.openEditCustomerModal =
  openEditCustomerModal;

window.deleteCustomer =
  deleteCustomer;


/* =========================
   SHOP MANAGER CUSTOMERS API
========================= */

window.ShopManagerCustomers = {

  getCustomers: () => customers,

  getCustomerById: id =>
    customers.find(
      customer =>
        String(customer.id) ===
        String(id)
    ),

  refresh: () => {

    loadCustomers();
    loadSales();

    renderCustomers();
    updateStatistics();

  }

};
```
