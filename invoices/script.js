id="q7m3v1"
const SALES_KEY = "shopManagerSales";
const INVOICES_KEY = "shopManagerInvoices";

let sales = [];
let invoices = [];
let selectedSale = null;
let currentInvoice = null;


/* =========================
   Storage
========================= */

function loadData() {
  try {
    sales = JSON.parse(localStorage.getItem(SALES_KEY)) || [];
  } catch {
    sales = [];
  }

  try {
    invoices = JSON.parse(localStorage.getItem(INVOICES_KEY)) || [];
  } catch {
    invoices = [];
  }
}

function saveInvoices() {
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}


/* =========================
   Helpers
========================= */

function formatMoney(amount) {
  return "Rs " + Number(amount || 0).toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

function formatDate(dateString) {
  if (!dateString) return "—";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function getDateOnly(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return String(dateString).slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function generateInvoiceNumber() {
  const timestamp = Date.now().toString().slice(-8);
  return "INV-" + timestamp;
}


/* =========================
   Elements
========================= */

const createInvoiceBtn = document.getElementById("createInvoiceBtn");
const emptyCreateBtn = document.getElementById("emptyCreateBtn");

const createInvoiceModal = document.getElementById("createInvoiceModal");
const viewInvoiceModal = document.getElementById("viewInvoiceModal");

const closeCreateModal = document.getElementById("closeCreateModal");
const closeViewModal = document.getElementById("closeViewModal");

const cancelCreateInvoice = document.getElementById("cancelCreateInvoice");
const closeInvoiceBtn = document.getElementById("closeInvoiceBtn");

const saveInvoiceBtn = document.getElementById("saveInvoiceBtn");
const printInvoiceBtn = document.getElementById("printInvoiceBtn");

const saleSelect = document.getElementById("saleSelect");
const saleInfo = document.getElementById("saleInfo");

const selectedSaleId = document.getElementById("selectedSaleId");
const selectedCustomer = document.getElementById("selectedCustomer");
const selectedSaleDate = document.getElementById("selectedSaleDate");
const selectedSaleTotal = document.getElementById("selectedSaleTotal");
const selectedSaleItems = document.getElementById("selectedSaleItems");

const invoiceSearch = document.getElementById("invoiceSearch");
const invoiceTableBody = document.getElementById("invoiceTableBody");
const emptyState = document.getElementById("emptyState");

const totalInvoices = document.getElementById("totalInvoices");
const todayInvoices = document.getElementById("todayInvoices");
const totalBilled = document.getElementById("totalBilled");
const monthBilled = document.getElementById("monthBilled");

const previewInvoiceNumber = document.getElementById("previewInvoiceNumber");
const previewCustomer = document.getElementById("previewCustomer");
const previewDate = document.getElementById("previewDate");
const previewSaleId = document.getElementById("previewSaleId");
const previewItemsBody = document.getElementById("previewItemsBody");
const previewTotal = document.getElementById("previewTotal");


/* =========================
   Modal Controls
========================= */

function openCreateModal() {
  loadData();

  selectedSale = null;

  saleSelect.value = "";

  resetSalePreview();

  populateSales();

  createInvoiceModal.classList.add("show");
}

function closeCreateInvoiceModal() {
  createInvoiceModal.classList.remove("show");
  selectedSale = null;
}

function openViewModal(invoice) {
  currentInvoice = invoice;

  renderInvoicePreview(invoice);

  viewInvoiceModal.classList.add("show");
}

function closeViewInvoiceModal() {
  viewInvoiceModal.classList.remove("show");
  currentInvoice = null;
}

function resetSalePreview() {
  saleInfo.classList.remove("show");

  selectedSaleId.textContent = "—";
  selectedCustomer.textContent = "—";
  selectedSaleDate.textContent = "—";
  selectedSaleTotal.textContent = "Rs 0";

  selectedSaleItems.innerHTML = `
    <p class="muted-text">
      Select a sale to see its items.
    </p>
  `;
}


/* =========================
   Sales Dropdown
========================= */

function populateSales() {
  saleSelect.innerHTML = `
    <option value="">Choose a sale...</option>
  `;

  if (!sales.length) {
    saleSelect.innerHTML = `
      <option value="">No completed sales available</option>
    `;

    return;
  }

  const availableSales = sales.filter(sale => {
    return !invoices.some(invoice => invoice.saleId === sale.id);
  });

  if (!availableSales.length) {
    saleSelect.innerHTML = `
      <option value="">All sales already have invoices</option>
    `;

    return;
  }

  availableSales
    .slice()
    .reverse()
    .forEach(sale => {
      const option = document.createElement("option");

      option.value = sale.id;

      const customer = sale.customer || "Walk-in Customer";

      option.textContent =
        `${sale.id} • ${customer} • ${formatMoney(sale.total)}`;

      saleSelect.appendChild(option);
    });
}


/* =========================
   Selected Sale
========================= */

function showSelectedSale(sale) {
  selectedSale = sale;

  if (!sale) {
    resetSalePreview();
    return;
  }

  saleInfo.classList.add("show");

  selectedSaleId.textContent = sale.id || "—";

  selectedCustomer.textContent =
    sale.customer || "Walk-in Customer";

  selectedSaleDate.textContent =
    formatDate(sale.date);

  selectedSaleTotal.textContent =
    formatMoney(sale.total);

  renderSelectedSaleItems(sale);
}

function renderSelectedSaleItems(sale) {
  if (!sale.items || !sale.items.length) {
    selectedSaleItems.innerHTML = `
      <p class="muted-text">
        No items found for this sale.
      </p>
    `;

    return;
  }

  selectedSaleItems.innerHTML = sale.items.map(item => {

    const quantity = Number(item.quantity || item.qty || 0);
    const price = Number(item.price || 0);
    const total = Number(
      item.total || (price * quantity)
    );

    return `
      <div class="selected-item">
        <div>
          <div class="selected-item-name">
            ${escapeHTML(item.name || "Product")}
          </div>

          <div class="selected-item-details">
            ${quantity} × ${formatMoney(price)}
          </div>
        </div>

        <strong>
          ${formatMoney(total)}
        </strong>
      </div>
    `;

  }).join("");
}


/* =========================
   Create Invoice
========================= */

function createInvoice() {
  if (!selectedSale) {
    alert("Please select a completed sale first.");
    return;
  }

  const alreadyExists = invoices.some(
    invoice => invoice.saleId === selectedSale.id
  );

  if (alreadyExists) {
    alert("An invoice already exists for this sale.");
    return;
  }

  const invoice = {
    id: generateInvoiceNumber(),
    saleId: selectedSale.id,
    customer: selectedSale.customer || "Walk-in Customer",
    items: Array.isArray(selectedSale.items)
      ? selectedSale.items.map(item => ({
          name: item.name || "Product",
          quantity: Number(item.quantity || item.qty || 0),
          price: Number(item.price || 0),
          total: Number(
            item.total ||
            (Number(item.price || 0) *
             Number(item.quantity || item.qty || 0))
          )
        }))
      : [],
    total: Number(selectedSale.total || 0),
    date: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  invoices.push(invoice);

  saveInvoices();

  closeCreateInvoiceModal();

  renderInvoices();
  updateStats();

  alert(`Invoice ${invoice.id} created successfully.`);
}


/* =========================
   Render Invoice Table
========================= */

function renderInvoices() {
  const searchTerm =
    invoiceSearch.value.trim().toLowerCase();

  let filtered = invoices.slice();

  if (searchTerm) {
    filtered = filtered.filter(invoice => {

      const invoiceNumber =
        String(invoice.id || "").toLowerCase();

      const customer =
        String(invoice.customer || "").toLowerCase();

      const saleId =
        String(invoice.saleId || "").toLowerCase();

      return (
        invoiceNumber.includes(searchTerm) ||
        customer.includes(searchTerm) ||
        saleId.includes(searchTerm)
      );
    });
  }

  filtered.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  invoiceTableBody.innerHTML = "";

  if (!filtered.length) {
    emptyState.style.display = "block";

    if (invoices.length > 0 && searchTerm) {
      emptyState.querySelector("h3").textContent =
        "No matching invoices";

      emptyState.querySelector("p").textContent =
        "Try a different search term.";

      emptyState.querySelector("button").style.display =
        "none";
    } else {
      emptyState.querySelector("h3").textContent =
        "No invoices yet";

      emptyState.querySelector("p").textContent =
        "Create an invoice from a completed sale to see it here.";

      emptyState.querySelector("button").style.display =
        "inline-flex";
    }

    return;
  }

  emptyState.style.display = "none";

  filtered.forEach(invoice => {

    const row = document.createElement("tr");

    const itemCount = Array.isArray(invoice.items)
      ? invoice.items.reduce(
          (sum, item) =>
            sum + Number(item.quantity || item.qty || 0),
          0
        )
      : 0;

    row.innerHTML = `
      <td>
        <span class="invoice-id">
          ${escapeHTML(invoice.id)}
        </span>
      </td>

      <td>
        ${formatDate(invoice.date)}
      </td>

      <td>
        <span class="customer-name">
          ${escapeHTML(
            invoice.customer || "Walk-in Customer"
          )}
        </span>
      </td>

      <td>
        ${itemCount}
      </td>

      <td>
        <span class="amount">
          ${formatMoney(invoice.total)}
        </span>
      </td>

      <td>
        <div class="actions">

          <button
            class="action-btn view"
            onclick="viewInvoice('${invoice.id}')"
          >
            👁️ View
          </button>

          <button
            class="action-btn print"
            onclick="printInvoice('${invoice.id}')"
          >
            🖨️ Print
          </button>

          <button
            class="action-btn delete"
            onclick="deleteInvoice('${invoice.id}')"
          >
            🗑️ Delete
          </button>

        </div>
      </td>
    `;

    invoiceTableBody.appendChild(row);
  });
}


/* =========================
   Statistics
========================= */

function updateStats() {
  const today = getToday();
  const month = getCurrentMonth();

  const todayList = invoices.filter(invoice => {
    return getDateOnly(invoice.date) === today;
  });

  const monthList = invoices.filter(invoice => {
    return getDateOnly(invoice.date).slice(0, 7) === month;
  });

  const billed = invoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.total || 0),
    0
  );

  const monthAmount = monthList.reduce(
    (sum, invoice) =>
      sum + Number(invoice.total || 0),
    0
  );

  totalInvoices.textContent = invoices.length;

  todayInvoices.textContent = todayList.length;

  totalBilled.textContent =
    formatMoney(billed);

  monthBilled.textContent =
    formatMoney(monthAmount);
}


/* =========================
   View Invoice
========================= */

function viewInvoice(invoiceId) {
  const invoice = invoices.find(
    item => item.id === invoiceId
  );

  if (!invoice) {
    alert("Invoice not found.");
    return;
  }

  openViewModal(invoice);
}

function renderInvoicePreview(invoice) {
  previewInvoiceNumber.textContent =
    invoice.id || "—";

  previewCustomer.textContent =
    invoice.customer || "Walk-in Customer";

  previewDate.textContent =
    formatDate(invoice.date);

  previewSaleId.textContent =
    invoice.saleId || "—";

  previewTotal.textContent =
    formatMoney(invoice.total);

  previewItemsBody.innerHTML = "";

  if (!invoice.items || !invoice.items.length) {
    previewItemsBody.innerHTML = `
      <tr>
        <td colspan="4">
          No items
        </td>
      </tr>
    `;

    return;
  }

  invoice.items.forEach(item => {

    const quantity =
      Number(item.quantity || item.qty || 0);

    const price =
      Number(item.price || 0);

    const total =
      Number(
        item.total ||
        price * quantity
      );

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        ${escapeHTML(item.name || "Product")}
      </td>

      <td>
        ${quantity}
      </td>

      <td>
        ${formatMoney(price)}
      </td>

      <td>
        ${formatMoney(total)}
      </td>
    `;

    previewItemsBody.appendChild(row);
  });
}


/* =========================
   Print Invoice
========================= */

function printInvoice(invoiceId) {
  const invoice = invoices.find(
    item => item.id === invoiceId
  );

  if (!invoice) {
    alert("Invoice not found.");
    return;
  }

  const itemsHTML = (invoice.items || [])
    .map(item => {

      const quantity =
        Number(item.quantity || item.qty || 0);

      const price =
        Number(item.price || 0);

      const total =
        Number(
          item.total ||
          price * quantity
        );

      return `
        <tr>
          <td>${escapeHTML(item.name || "Product")}</td>
          <td>${quantity}</td>
          <td>${formatMoney(price)}</td>
          <td>${formatMoney(total)}</td>
        </tr>
      `;

    })
    .join("");

  const printWindow = window.open(
    "",
    "_blank",
    "width=900,height=700"
  );

  if (!printWindow) {
    alert("Please allow pop-ups to print the invoice.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${escapeHTML(invoice.id)}</title>

      <style>

        * {
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 40px;
          color: #111827;
          background: white;
        }

        .invoice {
          max-width: 850px;
          margin: auto;
        }

        .top {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #111827;
          padding-bottom: 25px;
        }

        h1 {
          margin: 0;
          font-size: 25px;
        }

        .subtitle {
          color: #6b7280;
          margin-top: 6px;
          font-size: 13px;
        }

        .number {
          text-align: right;
        }

        .number span {
          display: block;
          color: #6b7280;
          font-size: 12px;
          margin-bottom: 5px;
        }

        .number strong {
          font-size: 18px;
        }

        .details {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 20px;
          padding: 25px 0;
        }

        .details span {
          display: block;
          color: #6b7280;
          font-size: 11px;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .details strong {
          font-size: 14px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          background: #f3f4f6;
          padding: 12px;
          font-size: 12px;
          text-transform: uppercase;
        }

        td {
          padding: 13px 12px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }

        .total {
          display: flex;
          justify-content: flex-end;
          margin-top: 25px;
        }

        .total-box {
          width: 230px;
          border-top: 2px solid #111827;
          padding-top: 15px;
          display: flex;
          justify-content: space-between;
          font-weight: bold;
        }

        .thanks {
          text-align: center;
          border-top: 1px solid #e5e7eb;
          margin-top: 35px;
          padding-top: 25px;
          color: #6b7280;
          font-size: 13px;
        }

        @media print {
          body {
            padding: 20px;
          }
        }

      </style>
    </head>

    <body>

      <div class="invoice">

        <div class="top">

          <div>
            <h1>SHOP MANAGER</h1>
            <div class="subtitle">
              Customer Invoice
            </div>
          </div>

          <div class="number">
            <span>Invoice</span>
            <strong>
              ${escapeHTML(invoice.id)}
            </strong>
          </div>

        </div>


        <div class="details">

          <div>
            <span>Bill To</span>
            <strong>
              ${escapeHTML(
                invoice.customer || "Walk-in Customer"
              )}
            </strong>
          </div>

          <div>
            <span>Invoice Date</span>
            <strong>
              ${formatDate(invoice.date)}
            </strong>
          </div>

          <div>
            <span>Sale ID</span>
            <strong>
              ${escapeHTML(invoice.saleId || "—")}
            </strong>
          </div>

        </div>


        <table>

          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            ${itemsHTML}
          </tbody>

        </table>


        <div class="total">

          <div class="total-box">
            <span>Total</span>
            <strong>
              ${formatMoney(invoice.total)}
            </strong>
          </div>

        </div>


        <div class="thanks">
          Thank you for your business!
        </div>

      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      <\/script>

    </body>
    </html>
  `);

  printWindow.document.close();
}


/* =========================
   Delete Invoice
========================= */

function deleteInvoice(invoiceId) {
  const invoice = invoices.find(
    item => item.id === invoiceId
  );

  if (!invoice) {
    alert("Invoice not found.");
    return;
  }

  const confirmed = confirm(
    `Delete invoice ${invoice.id}?`
  );

  if (!confirmed) {
    return;
  }

  invoices = invoices.filter(
    item => item.id !== invoiceId
  );

  saveInvoices();

  renderInvoices();
  updateStats();
}


/* =========================
   Events
========================= */

createInvoiceBtn.addEventListener(
  "click",
  openCreateModal
);

emptyCreateBtn.addEventListener(
  "click",
  openCreateModal
);

closeCreateModal.addEventListener(
  "click",
  closeCreateInvoiceModal
);

cancelCreateInvoice.addEventListener(
  "click",
  closeCreateInvoiceModal
);

closeViewModal.addEventListener(
  "click",
  closeViewInvoiceModal
);

closeInvoiceBtn.addEventListener(
  "click",
  closeViewInvoiceModal
);

saveInvoiceBtn.addEventListener(
  "click",
  createInvoice
);

printInvoiceBtn.addEventListener(
  "click",
  function() {

    if (!currentInvoice) {
      alert("No invoice selected.");
      return;
    }

    printInvoice(currentInvoice.id);
  }
);

saleSelect.addEventListener(
  "change",
  function() {

    const sale = sales.find(
      item => item.id === saleSelect.value
    );

    showSelectedSale(sale || null);
  }
);

invoiceSearch.addEventListener(
  "input",
  renderInvoices
);


/* =========================
   Modal Outside Click
========================= */

createInvoiceModal.addEventListener(
  "click",
  function(event) {

    if (event.target === createInvoiceModal) {
      closeCreateInvoiceModal();
    }
  }
);

viewInvoiceModal.addEventListener(
  "click",
  function(event) {

    if (event.target === viewInvoiceModal) {
      closeViewInvoiceModal();
    }
  }
);


/* =========================
   Escape Key
========================= */

document.addEventListener(
  "keydown",
  function(event) {

    if (event.key !== "Escape") {
      return;
    }

    if (createInvoiceModal.classList.contains("show")) {
      closeCreateInvoiceModal();
    }

    if (viewInvoiceModal.classList.contains("show")) {
      closeViewInvoiceModal();
    }
  }
);


/* =========================
   Initialize
========================= */

loadData();
renderInvoices();
updateStats();


/* =========================
   Global Functions
========================= */

window.viewInvoice = viewInvoice;
window.printInvoice = printInvoice;
window.deleteInvoice = deleteInvoice;

window.ShopManagerInvoices = {
  loadData,
  renderInvoices,
  updateStats,
  createInvoice,
  viewInvoice,
  printInvoice,
  deleteInvoice
};
```
