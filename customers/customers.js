const CUSTOMERS_KEY = "shopManagerCustomers";
const SALES_KEY = "shopManagerSales";

let customers = [];
let sales = [];
let editingCustomerId = null;


/* =========================
   DOM ELEMENTS
   ========================= */

const addCustomerButton =
  document.getElementById("addCustomerButton");

const emptyAddCustomerButton =
  document.getElementById("emptyAddCustomerButton");

const customerModal =
  document.getElementById("customerModal");

const customerDetailsModal =
  document.getElementById("customerDetailsModal");

const closeCustomerModal =
  document.getElementById("closeCustomerModal");

const closeCustomerDetailsModal =
  document.getElementById("closeCustomerDetailsModal");

const closeCustomerDetailsButton =
  document.getElementById("closeCustomerDetailsButton");

const cancelCustomerButton =
  document.getElementById("cancelCustomerButton");

const saveCustomerButton =
  document.getElementById("saveCustomerButton");

const customerModalTitle =
  document.getElementById("customerModalTitle");

const customerName =
  document.getElementById("customerName");

const customerPhone =
  document.getElementById("customerPhone");

const customerEmail =
  document.getElementById("customerEmail");

const customerAddress =
  document.getElementById("customerAddress");

const customerNotes =
  document.getElementById("customerNotes");

const searchInput =
  document.getElementById("searchInput");

const customersTableBody =
  document.getElementById("customersTableBody");

const emptyState =
  document.getElementById("emptyState");

const customerDetailsContent =
  document.getElementById("customerDetailsContent");

const totalCustomersElement =
  document.getElementById("totalCustomers");

const activeCustomersElement =
  document.getElementById("activeCustomers");

const totalOrdersElement =
  document.getElementById("totalOrders");

const totalPurchasesElement =
  document.getElementById("totalPurchases");


/* =========================
   STORAGE
   ========================= */

function loadData() {

  try {

    const storedCustomers =
      localStorage.getItem(CUSTOMERS_KEY);

    const storedSales =
      localStorage.getItem(SALES_KEY);

    customers =
      storedCustomers
        ? JSON.parse(storedCustomers)
        : [];

    sales =
      storedSales
        ? JSON.parse(storedSales)
        : [];


    if (!Array.isArray(customers)) {
      customers = [];
    }

    if (!Array.isArray(sales)) {
      sales = [];
    }

  } catch (error) {

    console.error(
      "Could not load customer data:",
      error
    );

    customers = [];
    sales = [];
  }
}


function saveCustomers() {

  localStorage.setItem(
    CUSTOMERS_KEY,
    JSON.stringify(customers)
  );
}


/* =========================
   CURRENCY
   ========================= */

function getCurrency() {

  try {

    const settings =
      JSON.parse(
        localStorage.getItem(
          "shopManagerSettings"
        ) || "{}"
      );

    return settings.currency || "Rs";

  } catch (error) {

    return "Rs";
  }
}


function formatMoney(value) {

  const number =
    Number(value) || 0;

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


function formatDate(dateValue) {

  if (!dateValue) {
    return "-";
  }

  const date =
    new Date(dateValue);

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


function normalizeName(name) {

  return String(name || "")
    .trim()
    .toLowerCase();
}


function getInitials(name) {

  const words =
    String(name || "Customer")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (!words.length) {
    return "C";
  }

  if (words.length === 1) {
    return words[0]
      .charAt(0)
      .toUpperCase();
  }

  return (
    words[0].charAt(0) +
    words[words.length - 1].charAt(0)
  ).toUpperCase();
}


/* =========================
   SALE PAYMENT NORMALIZER
   ========================= */

function normalizeSale(sale) {

  const total =
    Number(sale.total) || 0;

  let status =
    sale.paymentStatus;


  /*
    Older sales were created before
    payment tracking existed.
    Treat them as fully paid.
  */

  if (
    status !== "paid" &&
    status !== "partial" &&
    status !== "unpaid"
  ) {

    status = "paid";
  }


  let amountPaid;


  if (status === "paid") {

    amountPaid = total;

  } else if (status === "unpaid") {

    amountPaid = 0;

  } else {

    amountPaid =
      Number(sale.amountPaid) || 0;

    amountPaid =
      Math.max(
        0,
        Math.min(
          amountPaid,
          total
        )
      );
  }


  const balance =
    Math.max(
      0,
      total - amountPaid
    );


  return {
    ...sale,
    paymentStatus: status,
    amountPaid,
    balance
  };
}


/* =========================
   CUSTOMER SALES
   ========================= */

function getCustomerSales(customer) {

  const customerNameValue =
    normalizeName(customer.name);


  return sales
    .filter(sale => {

      return (
        normalizeName(
          sale.customer
        ) === customerNameValue
      );

    })
    .map(normalizeSale)
    .sort(
      (a, b) =>
        new Date(b.date) -
        new Date(a.date)
    );
}


/* =========================
   CUSTOMER STATISTICS
   ========================= */

function getCustomerStats(customer) {

  const customerSales =
    getCustomerSales(customer);


  const totalPurchases =
    customerSales.reduce(
      (sum, sale) =>
        sum +
        (Number(sale.total) || 0),
      0
    );


  const totalPaid =
    customerSales.reduce(
      (sum, sale) =>
        sum +
        (Number(sale.amountPaid) || 0),
      0
    );


  const totalBalance =
    customerSales.reduce(
      (sum, sale) =>
        sum +
        (Number(sale.balance) || 0),
      0
    );


  const itemsPurchased =
    customerSales.reduce(
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


  return {
    orders: customerSales.length,
    totalPurchases,
    totalPaid,
    totalBalance,
    itemsPurchased,
    sales: customerSales
  };
}


/* =========================
   OPEN ADD CUSTOMER
   ========================= */

function openAddCustomer() {

  editingCustomerId = null;

  customerModalTitle.textContent =
    "Add Customer";

  saveCustomerButton.textContent =
    "Save Customer";

  customerName.value = "";
  customerPhone.value = "";
  customerEmail.value = "";
  customerAddress.value = "";
  customerNotes.value = "";

  customerModal.classList.add("show");

  setTimeout(() => {
    customerName.focus();
  }, 50);
}


/* =========================
   OPEN EDIT CUSTOMER
   ========================= */

function openEditCustomer(customerId) {

  const customer =
    customers.find(
      item =>
        String(item.id) ===
        String(customerId)
    );


  if (!customer) {
    return;
  }


  editingCustomerId =
    customer.id;


  customerModalTitle.textContent =
    "Edit Customer";

  saveCustomerButton.textContent =
    "Update Customer";


  customerName.value =
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
    customerName.focus();
  }, 50);
}


/* =========================
   CLOSE CUSTOMER MODAL
   ========================= */

function closeCustomerModalFunction() {

  customerModal.classList.remove("show");

  editingCustomerId = null;
}


/* =========================
   SAVE CUSTOMER
   ========================= */

function saveCustomer() {

  const name =
    customerName.value.trim();

  const phone =
    customerPhone.value.trim();

  const email =
    customerEmail.value.trim();

  const address =
    customerAddress.value.trim();

  const notes =
    customerNotes.value.trim();


  if (!name) {

    alert(
      "Please enter the customer's name."
    );

    customerName.focus();

    return;
  }


  /*
    Prevent duplicate names.
  */

  const duplicate =
    customers.find(customer => {

      if (
        editingCustomerId &&
        String(customer.id) ===
        String(editingCustomerId)
      ) {
        return false;
      }

      return (
        normalizeName(customer.name) ===
        normalizeName(name)
      );

    });


  if (duplicate) {

    alert(
      "A customer with this name already exists."
    );

    return;
  }


  if (editingCustomerId) {

    const customer =
      customers.find(
        item =>
          String(item.id) ===
          String(editingCustomerId)
      );


    if (!customer) {
      return;
    }


    /*
      Important:
      Sales are linked to customers by name.
      If the name changes, update old sales
      so the purchase history stays connected.
    */

    const oldName =
      customer.name;


    if (
      normalizeName(oldName) !==
      normalizeName(name)
    ) {

      sales =
        sales.map(sale => {

          if (
            normalizeName(
              sale.customer
            ) ===
            normalizeName(oldName)
          ) {

            return {
              ...sale,
              customer: name
            };
          }

          return sale;
        });


      localStorage.setItem(
        SALES_KEY,
        JSON.stringify(sales)
      );
    }


    customer.name =
      name;

    customer.phone =
      phone;

    customer.email =
      email;

    customer.address =
      address;

    customer.notes =
      notes;

    customer.updatedAt =
      new Date().toISOString();


    alert(
      "Customer updated successfully."
    );

  } else {

    const customer = {

      id:
        Date.now().toString(),

      name,

      phone,

      email,

      address,

      notes,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()
    };


    customers.unshift(customer);

    alert(
      "Customer added successfully."
    );
  }


  saveCustomers();

  closeCustomerModalFunction();

  renderAll();
}


/* =========================
   DELETE CUSTOMER
   ========================= */

function deleteCustomer(customerId) {

  const customer =
    customers.find(
      item =>
        String(item.id) ===
        String(customerId)
    );


  if (!customer) {
    return;
  }


  const customerSales =
    getCustomerSales(customer);


  let message =
    `Delete "${customer.name}"?`;


  if (customerSales.length) {

    message +=
      `\n\nThis customer has ${customerSales.length} recorded sale(s).`;

    message +=
      "\n\nThe sales will NOT be deleted.";
  }


  message +=
    "\n\nContinue?";


  if (!confirm(message)) {
    return;
  }


  customers =
    customers.filter(
      item =>
        String(item.id) !==
        String(customerId)
    );


  saveCustomers();

  renderAll();
}


/* =========================
   CUSTOMER TABLE
   ========================= */

function renderCustomersTable() {

  const search =
    searchInput.value
      .trim()
      .toLowerCase();


  const filteredCustomers =
    customers.filter(customer => {

      if (!search) {
        return true;
      }


      const name =
        String(
          customer.name || ""
        ).toLowerCase();

      const phone =
        String(
          customer.phone || ""
        ).toLowerCase();

      const email =
        String(
          customer.email || ""
        ).toLowerCase();

      const address =
        String(
          customer.address || ""
        ).toLowerCase();


      return (
        name.includes(search) ||
        phone.includes(search) ||
        email.includes(search) ||
        address.includes(search)
      );
    });


  if (!filteredCustomers.length) {

    customersTableBody.innerHTML = "";

    emptyState.style.display =
      "block";

    return;
  }


  emptyState.style.display =
    "none";


  customersTableBody.innerHTML =
    filteredCustomers
      .map(customer => {

        const stats =
          getCustomerStats(customer);


        return `
          <tr>

            <td>
              <div class="customer-name-cell">
                ${escapeHTML(customer.name)}
              </div>
            </td>

            <td>
              <div class="customer-phone-cell">
                ${escapeHTML(
                  customer.phone || "-"
                )}
              </div>
            </td>

            <td>
              <div class="customer-email-cell">
                ${escapeHTML(
                  customer.email || "-"
                )}
              </div>
            </td>

            <td>
              ${stats.orders}
            </td>

            <td>
              <span class="purchase-value">
                ${formatMoney(
                  stats.totalPurchases
                )}
              </span>
            </td>

            <td>

              <span class="${
                stats.totalBalance > 0
                  ? "balance-positive"
                  : "balance-zero"
              }">

                ${formatMoney(
                  stats.totalBalance
                )}

              </span>

            </td>

            <td>

              <div class="customer-actions">

                <button
                  type="button"
                  class="view-customer-button"
                  data-action="view"
                  data-id="${escapeHTML(customer.id)}"
                >
                  View
                </button>

                <button
                  type="button"
                  class="edit-customer-button"
                  data-action="edit"
                  data-id="${escapeHTML(customer.id)}"
                >
                  Edit
                </button>

                <button
                  type="button"
                  class="delete-customer-button"
                  data-action="delete"
                  data-id="${escapeHTML(customer.id)}"
                >
                  Delete
                </button>

              </div>

            </td>

          </tr>
        `;

      })
      .join("");
}


/* =========================
   DASHBOARD STATS
   ========================= */

function updateStats() {

  const totalCustomers =
    customers.length;


  /*
    Active = customers with
    at least one sale.
  */

  const activeCustomers =
    customers.filter(
      customer =>
        getCustomerSales(customer).length > 0
    ).length;


  const totalOrders =
    sales.length;


  const totalPurchases =
    sales.reduce(
      (sum, sale) =>
        sum +
        (Number(sale.total) || 0),
      0
    );


  totalCustomersElement.textContent =
    totalCustomers.toLocaleString();


  activeCustomersElement.textContent =
    activeCustomers.toLocaleString();


  totalOrdersElement.textContent =
    totalOrders.toLocaleString();


  totalPurchasesElement.textContent =
    formatMoney(totalPurchases);
}


/* =========================
   VIEW CUSTOMER DETAILS
   ========================= */

function openCustomerDetails(customerId) {

  const customer =
    customers.find(
      item =>
        String(item.id) ===
        String(customerId)
    );


  if (!customer) {
    return;
  }


  const stats =
    getCustomerStats(customer);


  const historyRows =
    stats.sales.map(sale => {

      const itemNames =
        (sale.items || [])
          .map(item => {

            const quantity =
              Number(item.quantity) || 0;

            return `${escapeHTML(
              item.name || "Product"
            )} × ${quantity}`;

          })
          .join(", ");


      const statusLabel =
        sale.paymentStatus === "partial"
          ? "Partially Paid"
          : sale.paymentStatus === "unpaid"
            ? "Unpaid"
            : "Paid";


      return `
        <div class="history-row">

          <div>
            ${formatDate(sale.date)}
          </div>

          <div class="history-customer-items">
            ${itemNames || "No items"}
          </div>

          <div class="history-total">
            ${formatMoney(sale.total)}
          </div>

          <div>
            ${formatMoney(sale.amountPaid)}
          </div>

          <div>

            <span class="history-status ${
              sale.paymentStatus
            }">

              ${statusLabel}

            </span>

          </div>

        </div>
      `;

    }).join("");


  customerDetailsContent.innerHTML = `

    <div class="customer-profile">

      <!-- PROFILE HEADER -->

      <div class="customer-profile-header">

        <div class="customer-avatar">
          ${escapeHTML(
            getInitials(customer.name)
          )}
        </div>

        <div>

          <div class="customer-profile-name">
            ${escapeHTML(customer.name)}
          </div>

          <div class="customer-profile-contact">

            ${
              customer.phone
                ? escapeHTML(customer.phone)
                : "No phone number"
            }

            ${
              customer.email
                ? ` • ${escapeHTML(customer.email)}`
                : ""
            }

          </div>

        </div>

      </div>


      <!-- SUMMARY -->

      <div class="customer-summary-grid">

        <div class="customer-summary-card">

          <span>
            Total Orders
          </span>

          <strong>
            ${stats.orders}
          </strong>

        </div>


        <div class="customer-summary-card">

          <span>
            Total Purchases
          </span>

          <strong>
            ${formatMoney(
              stats.totalPurchases
            )}
          </strong>

        </div>


        <div class="customer-summary-card">

          <span>
            Total Paid
          </span>

          <strong>
            ${formatMoney(
              stats.totalPaid
            )}
          </strong>

        </div>


        <div class="customer-summary-card">

          <span>
            Outstanding Balance
          </span>

          <strong class="${
            stats.totalBalance > 0
              ? "balance-positive"
              : "balance-zero"
          }">

            ${formatMoney(
              stats.totalBalance
            )}

          </strong>

        </div>

      </div>


      <!-- CUSTOMER INFORMATION -->

      <div class="customer-info-grid">

        <div class="customer-info-box">

          <span>
            Phone
          </span>

          <strong>
            ${
              customer.phone
                ? escapeHTML(customer.phone)
                : "Not provided"
            }
          </strong>

        </div>


        <div class="customer-info-box">

          <span>
            Email
          </span>

          <strong>
            ${
              customer.email
                ? escapeHTML(customer.email)
                : "Not provided"
            }
          </strong>

        </div>


        <div class="customer-info-box full-width">

          <span>
            Address
          </span>

          <p>
            ${
              customer.address
                ? escapeHTML(customer.address)
                : "Not provided"
            }
          </p>

        </div>


        <div class="customer-info-box full-width">

          <span>
            Notes
          </span>

          <p>
            ${
              customer.notes
                ? escapeHTML(customer.notes)
                : "No notes"
            }
          </p>

        </div>

      </div>


      <!-- PURCHASE HISTORY -->

      <div class="history-title">
        Purchase History
      </div>


      <div class="purchase-history">

        ${
          stats.sales.length

            ? `

              <div class="history-row header">

                <div>
                  Date
                </div>

                <div>
                  Items
                </div>

                <div>
                  Total
                </div>

                <div>
                  Paid
                </div>

                <div>
                  Status
                </div>

              </div>

              ${historyRows}

            `

            : `

              <div class="history-empty">
                No purchases recorded for this customer yet.
              </div>

            `
        }

      </div>

    </div>

  `;


  customerDetailsModal.classList.add(
    "show"
  );
}


/* =========================
   RENDER ALL
   ========================= */

function renderAll() {

  renderCustomersTable();

  updateStats();
}


/* =========================
   EVENT LISTENERS
   ========================= */

addCustomerButton.addEventListener(
  "click",
  openAddCustomer
);


emptyAddCustomerButton.addEventListener(
  "click",
  openAddCustomer
);


closeCustomerModal.addEventListener(
  "click",
  closeCustomerModalFunction
);


cancelCustomerButton.addEventListener(
  "click",
  closeCustomerModalFunction
);


saveCustomerButton.addEventListener(
  "click",
  saveCustomer
);


closeCustomerDetailsModal.addEventListener(
  "click",
  () => {
    customerDetailsModal.classList.remove(
      "show"
    );
  }
);


closeCustomerDetailsButton.addEventListener(
  "click",
  () => {
    customerDetailsModal.classList.remove(
      "show"
    );
  }
);


searchInput.addEventListener(
  "input",
  renderCustomersTable
);


/* =========================
   TABLE ACTIONS
   ========================= */

customersTableBody.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest("button");

    if (!button) {
      return;
    }


    const action =
      button.dataset.action;

    const customerId =
      button.dataset.id;


    if (action === "view") {

      openCustomerDetails(
        customerId
      );

    } else if (action === "edit") {

      openEditCustomer(
        customerId
      );

    } else if (action === "delete") {

      deleteCustomer(
        customerId
      );

    }

  }
);


/* =========================
   MODAL BACKDROPS
   ========================= */

customerModal.addEventListener(
  "click",
  event => {

    if (
      event.target === customerModal
    ) {

      closeCustomerModalFunction();
    }

  }
);


customerDetailsModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      customerDetailsModal
    ) {

      customerDetailsModal.classList.remove(
        "show"
      );
    }

  }
);


/* =========================
   KEYBOARD
   ========================= */

document.addEventListener(
  "keydown",
  event => {

    if (event.key !== "Escape") {
      return;
    }


    if (
      customerModal.classList.contains(
        "show"
      )
    ) {

      closeCustomerModalFunction();
    }


    if (
      customerDetailsModal.classList.contains(
        "show"
      )
    ) {

      customerDetailsModal.classList.remove(
        "show"
      );
    }

  }
);


/* =========================
   ENTER TO SAVE
   ========================= */

customerName.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {

      event.preventDefault();

      saveCustomer();
    }

  }
);


/* =========================
   STORAGE SYNC
   ========================= */

window.addEventListener(
  "storage",
  () => {

    loadData();

    renderAll();

  }
);


/* =========================
   INITIALIZE
   ========================= */

loadData();

renderAll();


/* =========================
   GLOBAL API
   ========================= */

window.ShopManagerCustomers = {

  refresh() {

    loadData();

    renderAll();

  },

  getCustomers() {

    return [...customers];

  },

  getCustomerStats(customerId) {

    const customer =
      customers.find(
        item =>
          String(item.id) ===
          String(customerId)
      );


    if (!customer) {
      return null;
    }


    return getCustomerStats(customer);

  }

};
```
