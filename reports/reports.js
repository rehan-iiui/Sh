const SALES_KEY = "shopManagerSales";
const EXPENSES_KEY = "shopManagerExpenses";

let sales = [];
let expenses = [];

let filteredSales = [];
let filteredExpenses = [];

let currentPeriod = "month";
let customStart = "";
let customEnd = "";


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
    expenses = JSON.parse(localStorage.getItem(EXPENSES_KEY)) || [];
  } catch {
    expenses = [];
  }
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

function getDateOnly(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getToday() {
  return getDateOnly(new Date());
}

function getMonthStart() {
  const date = new Date();

  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );
}

function getWeekStart() {
  const date = new Date();

  const day = date.getDay();

  const difference = day === 0 ? 6 : day - 1;

  date.setDate(date.getDate() - difference);
  date.setHours(0, 0, 0, 0);

  return date;
}

function getYearStart() {
  const date = new Date();

  return new Date(
    date.getFullYear(),
    0,
    1
  );
}


/* =========================
   Elements
========================= */

const periodSelect =
  document.getElementById("periodSelect");

const customDates =
  document.getElementById("customDates");

const startDate =
  document.getElementById("startDate");

const endDate =
  document.getElementById("endDate");

const applyFilterBtn =
  document.getElementById("applyFilterBtn");

const printReportBtn =
  document.getElementById("printReportBtn");

const totalSales =
  document.getElementById("totalSales");

const totalExpenses =
  document.getElementById("totalExpenses");

const netProfit =
  document.getElementById("netProfit");

const totalOrders =
  document.getElementById("totalOrders");

const itemsSold =
  document.getElementById("itemsSold");

const customersCount =
  document.getElementById("customersCount");

const averageOrder =
  document.getElementById("averageOrder");

const profitMargin =
  document.getElementById("profitMargin");

const grossSales =
  document.getElementById("grossSales");

const salesOrders =
  document.getElementById("salesOrders");

const salesItems =
  document.getElementById("salesItems");

const salesAverage =
  document.getElementById("salesAverage");

const expenseTotal =
  document.getElementById("expenseTotal");

const expenseRecords =
  document.getElementById("expenseRecords");

const averageExpense =
  document.getElementById("averageExpense");

const largestExpense =
  document.getElementById("largestExpense");

const summarySales =
  document.getElementById("summarySales");

const summaryExpenses =
  document.getElementById("summaryExpenses");

const summaryProfit =
  document.getElementById("summaryProfit");

const topProductsBody =
  document.getElementById("topProductsBody");

const topProductsEmpty =
  document.getElementById("topProductsEmpty");

const expenseCategories =
  document.getElementById("expenseCategories");

const expenseCategoriesEmpty =
  document.getElementById("expenseCategoriesEmpty");

const salesReportBody =
  document.getElementById("salesReportBody");

const salesReportEmpty =
  document.getElementById("salesReportEmpty");


/* =========================
   Date Range
========================= */

function getDateRange() {

  const today = new Date();

  today.setHours(23, 59, 59, 999);

  let start = null;
  let end = today;

  if (currentPeriod === "today") {

    start = new Date();
    start.setHours(0, 0, 0, 0);

  } else if (currentPeriod === "week") {

    start = getWeekStart();

  } else if (currentPeriod === "month") {

    start = getMonthStart();

  } else if (currentPeriod === "year") {

    start = getYearStart();

  } else if (currentPeriod === "custom") {

    if (customStart) {
      start = new Date(customStart);
      start.setHours(0, 0, 0, 0);
    }

    if (customEnd) {
      end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
    }

  } else if (currentPeriod === "all") {

    start = null;
    end = null;
  }

  return {
    start,
    end
  };
}

function isInRange(value, range) {

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  if (range.start && date < range.start) {
    return false;
  }

  if (range.end && date > range.end) {
    return false;
  }

  return true;
}


/* =========================
   Filter Data
========================= */

function filterData() {

  const range = getDateRange();

  filteredSales = sales.filter(sale =>
    isInRange(sale.date, range)
  );

  filteredExpenses = expenses.filter(expense =>
    isInRange(expense.date, range)
  );
}


/* =========================
   Calculate Sales
========================= */

function calculateSales() {

  let revenue = 0;
  let itemCount = 0;

  const customers = new Set();

  filteredSales.forEach(sale => {

    revenue += Number(sale.total || 0);

    if (sale.customer) {
      customers.add(
        String(sale.customer).trim().toLowerCase()
      );
    }

    if (Array.isArray(sale.items)) {

      sale.items.forEach(item => {

        itemCount += Number(
          item.quantity ||
          item.qty ||
          0
        );

      });
    }
  });

  return {
    revenue,
    orders: filteredSales.length,
    items: itemCount,
    customers: customers.size
  };
}


/* =========================
   Calculate Expenses
========================= */

function calculateExpenses() {

  let total = 0;
  let largest = 0;

  filteredExpenses.forEach(expense => {

    const amount =
      Number(expense.amount || 0);

    total += amount;

    if (amount > largest) {
      largest = amount;
    }
  });

  return {
    total,
    records: filteredExpenses.length,
    largest
  };
}


/* =========================
   Update Main Statistics
========================= */

function updateStatistics() {

  const saleData = calculateSales();
  const expenseData = calculateExpenses();

  const profit =
    saleData.revenue - expenseData.total;

  const avgOrder =
    saleData.orders > 0
      ? saleData.revenue / saleData.orders
      : 0;

  const margin =
    saleData.revenue > 0
      ? (profit / saleData.revenue) * 100
      : 0;

  totalSales.textContent =
    formatMoney(saleData.revenue);

  totalExpenses.textContent =
    formatMoney(expenseData.total);

  netProfit.textContent =
    formatMoney(profit);

  totalOrders.textContent =
    saleData.orders;

  itemsSold.textContent =
    saleData.items;

  customersCount.textContent =
    saleData.customers;

  averageOrder.textContent =
    formatMoney(avgOrder);

  profitMargin.textContent =
    margin.toFixed(1) + "%";

  grossSales.textContent =
    formatMoney(saleData.revenue);

  salesOrders.textContent =
    saleData.orders;

  salesItems.textContent =
    saleData.items;

  salesAverage.textContent =
    formatMoney(avgOrder);

  expenseTotal.textContent =
    formatMoney(expenseData.total);

  expenseRecords.textContent =
    expenseData.records;

  averageExpense.textContent =
    formatMoney(
      expenseData.records > 0
        ? expenseData.total / expenseData.records
        : 0
    );

  largestExpense.textContent =
    formatMoney(expenseData.largest);

  summarySales.textContent =
    formatMoney(saleData.revenue);

  summaryExpenses.textContent =
    formatMoney(expenseData.total);

  summaryProfit.textContent =
    formatMoney(profit);
}


/* =========================
   Top Products
========================= */

function renderTopProducts() {

  const products = {};

  filteredSales.forEach(sale => {

    if (!Array.isArray(sale.items)) {
      return;
    }

    sale.items.forEach(item => {

      const name =
        item.name || "Unknown Product";

      const quantity =
        Number(
          item.quantity ||
          item.qty ||
          0
        );

      const price =
        Number(item.price || 0);

      const revenue =
        Number(
          item.total ||
          price * quantity
        );

      if (!products[name]) {
        products[name] = {
          name,
          quantity: 0,
          revenue: 0
        };
      }

      products[name].quantity += quantity;
      products[name].revenue += revenue;
    });
  });

  const list =
    Object.values(products)
      .sort((a, b) => {
        return b.quantity - a.quantity;
      })
      .slice(0, 10);

  topProductsBody.innerHTML = "";

  if (!list.length) {

    topProductsEmpty.style.display = "block";

    return;
  }

  topProductsEmpty.style.display = "none";

  list.forEach((product, index) => {

    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td>
        <span class="rank-number">
          ${index + 1}
        </span>

        <span class="product-name">
          ${escapeHTML(product.name)}
        </span>
      </td>

      <td>
        ${product.quantity}
      </td>

      <td>
        <strong class="table-money">
          ${formatMoney(product.revenue)}
        </strong>
      </td>
    `;

    topProductsBody.appendChild(row);
  });
}


/* =========================
   Expense Categories
========================= */

function renderExpenseCategories() {

  const categories = {};

  filteredExpenses.forEach(expense => {

    const category =
      expense.category || "Other";

    const amount =
      Number(expense.amount || 0);

    if (!categories[category]) {
      categories[category] = 0;
    }

    categories[category] += amount;
  });

  const list =
    Object.entries(categories)
      .sort((a, b) => b[1] - a[1]);

  expenseCategories.innerHTML = "";

  if (!list.length) {

    expenseCategoriesEmpty.style.display =
      "block";

    return;
  }

  expenseCategoriesEmpty.style.display =
    "none";

  const total =
    list.reduce(
      (sum, item) => sum + item[1],
      0
    );

  list.forEach(([category, amount]) => {

    const percentage =
      total > 0
        ? (amount / total) * 100
        : 0;

    const row =
      document.createElement("div");

    row.className = "category-row";

    row.innerHTML = `
      <div class="category-top">

        <span class="category-name">
          ${escapeHTML(category)}
        </span>

        <span class="category-amount">
          ${formatMoney(amount)}
        </span>

      </div>

      <div class="progress-track">
        <div
          class="progress-bar"
          style="width: ${percentage}%;"
        ></div>
      </div>
    `;

    expenseCategories.appendChild(row);
  });
}


/* =========================
   Sales Table
========================= */

function renderSalesTable() {

  salesReportBody.innerHTML = "";

  const list =
    filteredSales
      .slice()
      .sort((a, b) => {
        return new Date(b.date) -
          new Date(a.date);
      });

  if (!list.length) {

    salesReportEmpty.style.display =
      "block";

    return;
  }

  salesReportEmpty.style.display =
    "none";

  list.forEach(sale => {

    const itemCount =
      Array.isArray(sale.items)
        ? sale.items.reduce(
            (sum, item) =>
              sum +
              Number(
                item.quantity ||
                item.qty ||
                0
              ),
            0
          )
        : 0;

    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td>
        <span class="sale-id">
          ${escapeHTML(sale.id || "SALE")}
        </span>
      </td>

      <td>
        ${formatDate(sale.date)}
      </td>

      <td>
        ${escapeHTML(
          sale.customer ||
          "Walk-in Customer"
        )}
      </td>

      <td>
        ${itemCount}
      </td>

      <td>
        <strong class="table-money">
          ${formatMoney(sale.total)}
        </strong>
      </td>
    `;

    salesReportBody.appendChild(row);
  });
}


/* =========================
   Refresh Report
========================= */

function refreshReport() {

  filterData();

  updateStatistics();

  renderTopProducts();

  renderExpenseCategories();

  renderSalesTable();
}


/* =========================
   Period Selection
========================= */

function handlePeriodChange() {

  currentPeriod =
    periodSelect.value;

  if (currentPeriod === "custom") {

    customDates.classList.add("show");

  } else {

    customDates.classList.remove("show");

  }
}


/* =========================
   Apply Filter
========================= */

function applyFilter() {

  currentPeriod =
    periodSelect.value;

  if (currentPeriod === "custom") {

    customStart =
      startDate.value;

    customEnd =
      endDate.value;

    if (!customStart || !customEnd) {

      alert(
        "Please select both start and end dates."
      );

      return;
    }

    if (customStart > customEnd) {

      alert(
        "Start date cannot be after end date."
      );

      return;
    }
  }

  refreshReport();
}


/* =========================
   Print Report
========================= */

function printReport() {

  const printWindow =
    window.open(
      "",
      "_blank",
      "width=1000,height=800"
    );

  if (!printWindow) {

    alert(
      "Please allow pop-ups to print the report."
    );

    return;
  }

  const saleData =
    calculateSales();

  const expenseData =
    calculateExpenses();

  const profit =
    saleData.revenue -
    expenseData.total;

  const periodName =
    periodSelect.options[
      periodSelect.selectedIndex
    ].textContent;

  const products = {};

  filteredSales.forEach(sale => {

    if (!Array.isArray(sale.items)) {
      return;
    }

    sale.items.forEach(item => {

      const name =
        item.name || "Unknown Product";

      const quantity =
        Number(
          item.quantity ||
          item.qty ||
          0
        );

      const price =
        Number(item.price || 0);

      const amount =
        Number(
          item.total ||
          price * quantity
        );

      if (!products[name]) {
        products[name] = {
          quantity: 0,
          revenue: 0
        };
      }

      products[name].quantity += quantity;
      products[name].revenue += amount;
    });
  });

  const productRows =
    Object.entries(products)
      .sort((a, b) =>
        b[1].quantity -
        a[1].quantity
      )
      .slice(0, 10)
      .map(([name, data]) => `
        <tr>
          <td>${escapeHTML(name)}</td>
          <td>${data.quantity}</td>
          <td>${formatMoney(data.revenue)}</td>
        </tr>
      `)
      .join("");

  const salesRows =
    filteredSales
      .slice()
      .sort((a, b) =>
        new Date(b.date) -
        new Date(a.date)
      )
      .map(sale => {

        const count =
          Array.isArray(sale.items)
            ? sale.items.reduce(
                (sum, item) =>
                  sum +
                  Number(
                    item.quantity ||
                    item.qty ||
                    0
                  ),
                0
              )
            : 0;

        return `
          <tr>
            <td>${escapeHTML(sale.id || "SALE")}</td>
            <td>${formatDate(sale.date)}</td>
            <td>
              ${escapeHTML(
                sale.customer ||
                "Walk-in Customer"
              )}
            </td>
            <td>${count}</td>
            <td>${formatMoney(sale.total)}</td>
          </tr>
        `;
      })
      .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>

    <head>

      <title>Shop Manager Report</title>

      <style>

        * {
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          color: #111827;
          margin: 0;
          padding: 35px;
        }

        .report {
          max-width: 1000px;
          margin: auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #111827;
          padding-bottom: 20px;
          margin-bottom: 25px;
        }

        h1 {
          margin: 0;
          font-size: 26px;
        }

        .subtitle {
          color: #6b7280;
          margin-top: 5px;
          font-size: 13px;
        }

        .period {
          text-align: right;
          font-size: 13px;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 25px;
        }

        .stat {
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 8px;
        }

        .stat span {
          display: block;
          color: #6b7280;
          font-size: 11px;
          margin-bottom: 6px;
        }

        .stat strong {
          font-size: 18px;
        }

        h2 {
          font-size: 18px;
          margin-top: 28px;
          margin-bottom: 12px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }

        th {
          text-align: left;
          background: #f3f4f6;
          padding: 10px;
          font-size: 11px;
        }

        td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
          font-size: 13px;
        }

        .profit {
          font-size: 20px;
          font-weight: bold;
        }

        .footer {
          text-align: center;
          color: #6b7280;
          border-top: 1px solid #ddd;
          padding-top: 20px;
          margin-top: 30px;
          font-size: 12px;
        }

        @media print {
          body {
            padding: 15px;
          }
        }

      </style>

    </head>

    <body>

      <div class="report">

        <div class="header">

          <div>
            <h1>SHOP MANAGER</h1>
            <div class="subtitle">
              Business Performance Report
            </div>
          </div>

          <div class="period">
            <strong>${escapeHTML(periodName)}</strong>
            <br>
            Generated: ${formatDate(new Date())}
          </div>

        </div>


        <div class="stats">

          <div class="stat">
            <span>SALES</span>
            <strong>
              ${formatMoney(saleData.revenue)}
            </strong>
          </div>

          <div class="stat">
            <span>EXPENSES</span>
            <strong>
              ${formatMoney(expenseData.total)}
            </strong>
          </div>

          <div class="stat">
            <span>NET PROFIT</span>
            <strong>
              ${formatMoney(profit)}
            </strong>
          </div>

          <div class="stat">
            <span>ORDERS</span>
            <strong>
              ${saleData.orders}
            </strong>
          </div>

        </div>


        <h2>Profit Summary</h2>

        <table>

          <tr>
            <td>Sales Revenue</td>
            <td>${formatMoney(saleData.revenue)}</td>
          </tr>

          <tr>
            <td>Expenses</td>
            <td>${formatMoney(expenseData.total)}</td>
          </tr>

          <tr>
            <td><strong>Net Profit</strong></td>
            <td class="profit">
              ${formatMoney(profit)}
            </td>
          </tr>

        </table>


        <h2>Top Selling Products</h2>

        <table>

          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>

          <tbody>
            ${productRows || `
              <tr>
                <td colspan="3">
                  No product sales.
                </td>
              </tr>
            `}
          </tbody>

        </table>


        <h2>Sales Transactions</h2>

        <table>

          <thead>
            <tr>
              <th>Sale ID</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            ${salesRows || `
              <tr>
                <td colspan="5">
                  No sales found.
                </td>
              </tr>
            `}
          </tbody>

        </table>


        <div class="footer">
          Shop Manager — Business Report
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
   Events
========================= */

periodSelect.addEventListener(
  "change",
  handlePeriodChange
);

applyFilterBtn.addEventListener(
  "click",
  applyFilter
);

printReportBtn.addEventListener(
  "click",
  printReport
);


/* =========================
   Initialize
========================= */

loadData();

handlePeriodChange();

refreshReport();


/* =========================
   Global API
========================= */

window.ShopManagerReports = {
  loadData,
  refreshReport,
  applyFilter,
  printReport
};
```
