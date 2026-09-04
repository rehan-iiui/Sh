/* ==========================================
   SHOP MANAGER - MAIN SCRIPT
   Smart Notifications Included
   ========================================== */

const pageInfo = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Welcome to your shop"
  },

  products: {
    title: "Products",
    subtitle: "Manage your inventory"
  },

  sales: {
    title: "Sales",
    subtitle: "Track your sales and orders"
  },

  customers: {
    title: "Customers",
    subtitle: "Manage your customers"
  },

  expenses: {
    title: "Expenses",
    subtitle: "Track your business expenses"
  },

  invoices: {
    title: "Invoices",
    subtitle: "Create and manage invoices"
  },

  reports: {
    title: "Reports",
    subtitle: "Analyze your business"
  },

  settings: {
    title: "Settings",
    subtitle: "Manage your shop settings"
  }
};


/* ==========================================
   ELEMENTS
   ========================================== */

const pageTitle = document.getElementById("pageTitle");
const pageSubtitle = document.getElementById("pageSubtitle");

const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".nav-item");

const notificationButton =
  document.getElementById("notificationButton");

const notificationPanel =
  document.getElementById("notificationPanel");

const notificationClose =
  document.getElementById("notificationClose");

const notificationList =
  document.getElementById("notificationList");

const notificationCount =
  document.getElementById("notificationCount");


/* ==========================================
   STORAGE HELPERS
   ========================================== */

function getArray(key) {
  try {
    const data = JSON.parse(
      localStorage.getItem(key) || "[]"
    );

    return Array.isArray(data) ? data : [];

  } catch (error) {
    return [];
  }
}


function getSettings() {
  try {

    const data = JSON.parse(
      localStorage.getItem("shopManagerSettings") || "{}"
    );

    return data && typeof data === "object"
      ? data
      : {};

  } catch (error) {

    return {};

  }
}


/* ==========================================
   CURRENCY
   ========================================== */

function getCurrency() {

  const settings = getSettings();

  return settings.currency || "Rs";

}


function formatMoney(amount) {

  const value = Number(amount) || 0;

  const currency = getCurrency();

  return `${currency} ${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;

}


function formatCompactMoney(amount) {

  const value = Number(amount) || 0;

  if (value >= 1000000) {
    return `${getCurrency()} ${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `${getCurrency()} ${(value / 1000).toFixed(1)}K`;
  }

  return formatMoney(value);

}


/* ==========================================
   DATE HELPERS
   ========================================== */

function getDateOnly(value) {

  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");

}


function isToday(value) {

  return getDateOnly(value) === getDateOnly(new Date());

}


function formatDate(value) {

  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

}


/* ==========================================
   HTML SAFETY
   ========================================== */

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* ==========================================
   NAVIGATION
   ========================================== */

function showPage(pageName) {

  if (!pageInfo[pageName]) {
    pageName = "dashboard";
  }

  pages.forEach(page => {

    page.classList.remove("active-page");

    if (page.id === pageName) {
      page.classList.add("active-page");
    }

  });


  navItems.forEach(item => {

    item.classList.toggle(
      "active",
      item.dataset.page === pageName
    );

  });


  pageTitle.textContent =
    pageInfo[pageName].title;

  pageSubtitle.textContent =
    pageInfo[pageName].subtitle;


  if (pageName === "dashboard") {

    setTimeout(() => {
      updateDashboard();
    }, 50);

  }

}


navItems.forEach(item => {

  item.addEventListener("click", () => {

    showPage(item.dataset.page);

  });

});


document.querySelectorAll("[data-page-target]").forEach(button => {

  button.addEventListener("click", () => {

    showPage(button.dataset.pageTarget);

  });

});


/* ==========================================
   DASHBOARD STATS
   ========================================== */

function updateDashboard() {

  const products =
    getArray("shopManagerProducts");

  const sales =
    getArray("shopManagerSales");

  const customers =
    getArray("shopManagerCustomers");

  const settings =
    getSettings();


  /* TODAY'S SALES */

  const todaySales = sales
    .filter(sale => isToday(sale.date))
    .reduce(
      (sum, sale) => sum + Number(sale.total || 0),
      0
    );


  /* PROFIT */

  const totalProfit = sales
    .reduce(
      (sum, sale) => sum + Number(sale.profit || 0),
      0
    );


  const todaySalesElement =
    document.getElementById("todaySales");

  const totalProductsElement =
    document.getElementById("totalProducts");

  const totalCustomersElement =
    document.getElementById("totalCustomers");

  const totalProfitElement =
    document.getElementById("totalProfit");


  if (todaySalesElement) {
    todaySalesElement.textContent =
      formatMoney(todaySales);
  }


  if (totalProductsElement) {
    totalProductsElement.textContent =
      products.length;
  }


  if (totalCustomersElement) {
    totalCustomersElement.textContent =
      customers.length;
  }


  if (totalProfitElement) {
    totalProfitElement.textContent =
      formatMoney(totalProfit);
  }


  /* INVENTORY */

  const threshold =
    Number(settings.lowStockThreshold ?? 5);


  let inStock = 0;
  let lowStock = 0;
  let outOfStock = 0;


  products.forEach(product => {

    const stock =
      Number(product.stock || 0);

    if (stock <= 0) {

      outOfStock++;

    } else if (stock <= threshold) {

      lowStock++;

    } else {

      inStock++;

    }

  });


  const stockProducts =
    document.getElementById("stockProducts");

  const lowStockProducts =
    document.getElementById("lowStockProducts");

  const outStockProducts =
    document.getElementById("outStockProducts");


  if (stockProducts) {
    stockProducts.textContent = inStock;
  }

  if (lowStockProducts) {
    lowStockProducts.textContent = lowStock;
  }

  if (outStockProducts) {
    outStockProducts.textContent = outOfStock;
  }


  renderRecentSales(sales);

  drawSalesChart(sales);

  drawComparisonChart(
    sales,
    getArray("shopManagerExpenses")
  );

  updateNotifications();

}


/* ==========================================
   RECENT SALES
   ========================================== */

function renderRecentSales(sales) {

  const panel =
    document.querySelector(
      "#dashboard .dashboard-grid .panel:first-child"
    );

  if (!panel) {
    return;
  }


  const recentSales =
    [...sales]
      .sort(
        (a, b) =>
          new Date(b.date || 0) -
          new Date(a.date || 0)
      )
      .slice(0, 5);


  if (!recentSales.length) {

    panel.innerHTML = `

      <div class="panel-header">

        <div>
          <h3>Recent Sales</h3>
          <p>Your latest transactions</p>
        </div>

        <button
          class="text-button"
          data-page-target="sales"
        >
          View All
        </button>

      </div>

      <div class="empty-state">

        <div class="empty-icon">🧾</div>

        <h3>No sales yet</h3>

        <p>
          Your recent sales will appear here.
        </p>

        <button
          class="primary-button"
          id="emptySaleButton"
        >
          Create First Sale
        </button>

      </div>
    `;

    attachDashboardButtons();

    return;
  }


  let rows = "";


  recentSales.forEach(sale => {

    const customer =
      sale.customer ||
      "Walk-in Customer";

    const items =
      Array.isArray(sale.items)
        ? sale.items
        : [];


    const itemCount =
      items.reduce(
        (sum, item) =>
          sum + Number(item.quantity || 0),
        0
      );


    rows += `

      <div
        style="
          display:flex;
          align-items:center;
          justify-content:space-between;
          padding:13px 19px;
          border-bottom:1px solid #f1f2f4;
          gap:12px;
        "
      >

        <div style="min-width:0;">

          <strong
            style="
              display:block;
              color:#374151;
              font-size:11px;
              white-space:nowrap;
              overflow:hidden;
              text-overflow:ellipsis;
            "
          >
            ${escapeHTML(customer)}
          </strong>

          <span
            style="
              display:block;
              margin-top:3px;
              color:#9ca3af;
              font-size:9px;
            "
          >
            ${itemCount} item${itemCount === 1 ? "" : "s"}
            • ${formatDate(sale.date)}
          </span>

        </div>


        <strong
          style="
            color:#111827;
            font-size:11px;
            white-space:nowrap;
          "
        >
          ${formatMoney(sale.total)}
        </strong>

      </div>

    `;

  });


  panel.innerHTML = `

    <div class="panel-header">

      <div>
        <h3>Recent Sales</h3>
        <p>Your latest transactions</p>
      </div>

      <button
        class="text-button"
        data-page-target="sales"
      >
        View All
      </button>

    </div>

    ${rows}

  `;


  attachDashboardButtons();

}


function attachDashboardButtons() {

  document
    .querySelectorAll("[data-page-target]")
    .forEach(button => {

      button.onclick = () => {

        showPage(
          button.dataset.pageTarget
        );

      };

    });


  const quickSaleButton =
    document.getElementById("quickSaleButton");

  const emptySaleButton =
    document.getElementById("emptySaleButton");


  if (quickSaleButton) {

    quickSaleButton.onclick = () => {
      showPage("sales");
    };

  }


  if (emptySaleButton) {

    emptySaleButton.onclick = () => {
      showPage("sales");
    };

  }

}


/* ==========================================
   SMART NOTIFICATIONS
   ========================================== */

function getNotifications() {

  const products =
    getArray("shopManagerProducts");

  const sales =
    getArray("shopManagerSales");

  const expenses =
    getArray("shopManagerExpenses");

  const settings =
    getSettings();


  const notifications = [];


  const threshold =
    Number(settings.lowStockThreshold ?? 5);


  /* OUT OF STOCK */

  const outOfStock =
    products.filter(product =>
      Number(product.stock || 0) <= 0
    );


  outOfStock.forEach(product => {

    notifications.push({

      type: "danger",

      icon: "🚨",

      title: "Product out of stock",

      message:
        `${product.name || "Unnamed product"} needs restocking.`,

      priority: 1

    });

  });


  /* LOW STOCK */

  const lowStock =
    products.filter(product => {

      const stock =
        Number(product.stock || 0);

      return stock > 0 && stock <= threshold;

    });


  lowStock.forEach(product => {

    notifications.push({

      type: "warning",

      icon: "⚠️",

      title: "Low stock alert",

      message:
        `${product.name || "Unnamed product"} has only ${Number(product.stock || 0)} left.`,

      priority: 2

    });

  });


  /* TODAY'S SALES */

  const todaySales =
    sales.filter(sale =>
      isToday(sale.date)
    );


  const todayRevenue =
    todaySales.reduce(
      (sum, sale) =>
        sum + Number(sale.total || 0),
      0
    );


  if (todaySales.length > 0) {

    notifications.push({

      type: "success",

      icon: "💰",

      title: "Today's sales",

      message:
        `${todaySales.length} order${todaySales.length === 1 ? "" : "s"} generated ${formatMoney(todayRevenue)} today.`,

      priority: 3

    });

  }


  /* TODAY'S EXPENSES */

  const todayExpenses =
    expenses.filter(expense =>
      isToday(expense.date)
    );


  const todayExpenseTotal =
    todayExpenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    );


  if (todayExpenses.length > 0) {

    notifications.push({

      type: "info",

      icon: "💳",

      title: "Today's expenses",

      message:
        `${todayExpenses.length} expense${todayExpenses.length === 1 ? "" : "s"} recorded totaling ${formatMoney(todayExpenseTotal)}.`,

      priority: 4

    });

  }


  /* NO DATA */

  if (
    products.length === 0 &&
    sales.length === 0 &&
    expenses.length === 0
  ) {

    notifications.push({

      type: "info",

      icon: "👋",

      title: "Welcome to Shop Manager",

      message:
        "Add products and start recording sales to see smart alerts here.",

      priority: 5

    });

  }


  notifications.sort(
    (a, b) =>
      Number(a.priority) -
      Number(b.priority)
  );


  return notifications;

}


function updateNotifications() {

  if (!notificationList) {
    return;
  }


  const notifications =
    getNotifications();


  if (!notifications.length) {

    notificationList.innerHTML = `

      <div class="notification-empty">

        <div>🔔</div>

        <strong>No notifications</strong>

        <span>
          Everything looks good.
        </span>

      </div>

    `;

    if (notificationCount) {
      notificationCount.style.display = "none";
    }

    return;
  }


  if (notificationCount) {

    notificationCount.textContent =
      notifications.length > 99
        ? "99+"
        : notifications.length;

    notificationCount.style.display =
      "flex";

  }


  notificationList.innerHTML =
    notifications.map(notification => `

      <div class="notification-item">

        <div class="notification-icon ${notification.type}">
          ${notification.icon}
        </div>

        <div class="notification-content">

          <strong>
            ${escapeHTML(notification.title)}
          </strong>

          <p>
            ${escapeHTML(notification.message)}
          </p>

          <span class="notification-time">
            Smart notification
          </span>

        </div>

      </div>

    `).join("");

}


/* ==========================================
   NOTIFICATION BUTTON
   ========================================== */

if (notificationButton) {

  notificationButton.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      updateNotifications();

      notificationPanel.classList.toggle(
        "show"
      );

    }
  );

}


if (notificationClose) {

  notificationClose.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      notificationPanel.classList.remove(
        "show"
      );

    }
  );

}


document.addEventListener(
  "click",
  event => {

    if (
      notificationPanel &&
      notificationPanel.classList.contains("show") &&
      !event.target.closest(".notification-wrapper")
    ) {

      notificationPanel.classList.remove(
        "show"
      );

    }

  }
);


/* ==========================================
   LAST 7 DAYS
   ========================================== */

function getLastSevenDays() {

  const days = [];


  for (let i = 6; i >= 0; i--) {

    const date = new Date();

    date.setHours(0, 0, 0, 0);

    date.setDate(
      date.getDate() - i
    );


    days.push({

      key: getDateOnly(date),

      label:
        date.toLocaleDateString(
          undefined,
          {
            weekday: "short"
          }
        ),

      date

    });

  }


  return days;

}


/* ==========================================
   CANVAS PREPARATION
   ========================================== */

function prepareCanvas(canvas) {

  if (!canvas) {
    return null;
  }


  const rect =
    canvas.getBoundingClientRect();


  const width =
    Math.max(
      300,
      Math.floor(rect.width)
    );


  const height =
    Math.max(
      180,
      Math.floor(rect.height)
    );


  const ratio =
    window.devicePixelRatio || 1;


  canvas.width =
    width * ratio;

  canvas.height =
    height * ratio;


  const ctx =
    canvas.getContext("2d");


  ctx.setTransform(
    ratio,
    0,
    0,
    ratio,
    0,
    0
  );


  return {
    ctx,
    width,
    height
  };

}


/* ==========================================
   SALES CHART
   ========================================== */

function drawSalesChart(sales) {

  const canvas =
    document.getElementById(
      "salesChart"
    );

  const empty =
    document.getElementById(
      "salesChartEmpty"
    );


  if (!canvas) {
    return;
  }


  const days =
    getLastSevenDays();


  const values =
    days.map(day => {

      return sales
        .filter(
          sale =>
            getDateOnly(sale.date) ===
            day.key
        )
        .reduce(
          (sum, sale) =>
            sum + Number(sale.total || 0),
          0
        );

    });


  const total =
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    );


  if (empty) {

    empty.style.display =
      total > 0
        ? "none"
        : "flex";

  }


  const chart =
    prepareCanvas(canvas);


  if (!chart) {
    return;
  }


  const {
    ctx,
    width,
    height
  } = chart;


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  if (total <= 0) {
    return;
  }


  const padding = {
    top: 20,
    right: 15,
    bottom: 35,
    left: 55
  };


  const chartWidth =
    width -
    padding.left -
    padding.right;


  const chartHeight =
    height -
    padding.top -
    padding.bottom;


  const max =
    getNiceMax(
      Math.max(...values)
    );


  /* GRID */

  ctx.font = "10px Arial";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#9ca3af";


  for (let i = 0; i <= 4; i++) {

    const value =
      (max / 4) * i;

    const y =
      padding.top +
      chartHeight -
      (value / max) *
        chartHeight;


    ctx.strokeStyle =
      "#eef0f3";

    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
      padding.left,
      y
    );

    ctx.lineTo(
      width - padding.right,
      y
    );

    ctx.stroke();


    ctx.fillText(
      formatCompactMoney(value),
      padding.left - 8,
      y
    );

  }


  /* POINTS */

  const points =
    values.map(
      (value, index) => {

        const x =
          padding.left +
          (
            chartWidth *
            index /
            (values.length - 1)
          );


        const y =
          padding.top +
          chartHeight -
          (
            value / max
          ) *
          chartHeight;


        return {
          x,
          y
        };

      }
    );


  /* AREA */

  ctx.beginPath();

  points.forEach(
    (point, index) => {

      if (index === 0) {

        ctx.moveTo(
          point.x,
          point.y
        );

      } else {

        ctx.lineTo(
          point.x,
          point.y
        );

      }

    }
  );


  ctx.lineTo(
    points[points.length - 1].x,
    padding.top + chartHeight
  );


  ctx.lineTo(
    points[0].x,
    padding.top + chartHeight
  );


  ctx.closePath();

  ctx.fillStyle =
    "rgba(239, 68, 68, 0.08)";

  ctx.fill();


  /* LINE */

  ctx.beginPath();

  points.forEach(
    (point, index) => {

      if (index === 0) {

        ctx.moveTo(
          point.x,
          point.y
        );

      } else {

        ctx.lineTo(
          point.x,
          point.y
        );

      }

    }
  );


  ctx.strokeStyle =
    "#ef4444";

  ctx.lineWidth = 2.5;

  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  ctx.stroke();


  /* POINTS */

  points.forEach(point => {

    ctx.beginPath();

    ctx.arc(
      point.x,
      point.y,
      4,
      0,
      Math.PI * 2
    );

    ctx.fillStyle =
      "#ffffff";

    ctx.fill();

    ctx.strokeStyle =
      "#ef4444";

    ctx.lineWidth = 2;

    ctx.stroke();

  });


  /* LABELS */

  ctx.fillStyle =
    "#9ca3af";

  ctx.font =
    "10px Arial";

  ctx.textAlign =
    "center";

  ctx.textBaseline =
    "top";


  days.forEach(
    (day, index) => {

      const x =
        padding.left +
        (
          chartWidth *
          index /
          (days.length - 1)
        );


      ctx.fillText(
        day.label,
        x,
        padding.top +
        chartHeight +
        10
      );

    }
  );

}


/* ==========================================
   COMPARISON CHART
   ========================================== */

function drawComparisonChart(
  sales,
  expenses
) {

  const canvas =
    document.getElementById(
      "comparisonChart"
    );

  const empty =
    document.getElementById(
      "comparisonChartEmpty"
    );


  if (!canvas) {
    return;
  }


  const days =
    getLastSevenDays();


  const saleValues =
    days.map(day => {

      return sales
        .filter(
          sale =>
            getDateOnly(sale.date) ===
            day.key
        )
        .reduce(
          (sum, sale) =>
            sum + Number(sale.total || 0),
          0
        );

    });


  const expenseValues =
    days.map(day => {

      return expenses
        .filter(
          expense =>
            getDateOnly(expense.date) ===
            day.key
        )
        .reduce(
          (sum, expense) =>
            sum + Number(expense.amount || 0),
          0
        );

    });


  const combinedTotal =
    saleValues.reduce(
      (a, b) => a + b,
      0
    ) +
    expenseValues.reduce(
      (a, b) => a + b,
      0
    );


  if (empty) {

    empty.style.display =
      combinedTotal > 0
        ? "none"
        : "flex";

  }


  const chart =
    prepareCanvas(canvas);


  if (!chart) {
    return;
  }


  const {
    ctx,
    width,
    height
  } = chart;


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  if (combinedTotal <= 0) {
    return;
  }


  const padding = {
    top: 20,
    right: 15,
    bottom: 38,
    left: 55
  };


  const chartWidth =
    width -
    padding.left -
    padding.right;


  const chartHeight =
    height -
    padding.top -
    padding.bottom;


  const max =
    getNiceMax(
      Math.max(
        ...saleValues,
        ...expenseValues
      )
    );


  /* GRID */

  ctx.font = "10px Arial";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#9ca3af";


  for (let i = 0; i <= 4; i++) {

    const value =
      (max / 4) * i;


    const y =
      padding.top +
      chartHeight -
      (value / max) *
        chartHeight;


    ctx.strokeStyle =
      "#eef0f3";

    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.moveTo(
      padding.left,
      y
    );

    ctx.lineTo(
      width - padding.right,
      y
    );

    ctx.stroke();


    ctx.fillText(
      formatCompactMoney(value),
      padding.left - 8,
      y
    );

  }


  /* BARS */

  const groupWidth =
    chartWidth /
    days.length;


  const barWidth =
    Math.min(
      14,
      groupWidth * 0.25
    );


  days.forEach(
    (day, index) => {

      const centerX =
        padding.left +
        groupWidth *
        index +
        groupWidth / 2;


      const saleHeight =
        (
          saleValues[index] /
          max
        ) *
        chartHeight;


      const expenseHeight =
        (
          expenseValues[index] /
          max
        ) *
        chartHeight;


      /* SALES BAR */

      const saleX =
        centerX -
        barWidth -
        2;


      const saleY =
        padding.top +
        chartHeight -
        saleHeight;


      ctx.fillStyle =
        "#ef4444";

      ctx.fillRect(
        saleX,
        saleY,
        barWidth,
        saleHeight
      );


      /* EXPENSE BAR */

      const expenseX =
        centerX + 2;


      const expenseY =
        padding.top +
        chartHeight -
        expenseHeight;


      ctx.fillStyle =
        "#9ca3af";

      ctx.fillRect(
        expenseX,
        expenseY,
        barWidth,
        expenseHeight
      );


      /* DAY */

      ctx.fillStyle =
        "#9ca3af";

      ctx.font =
        "10px Arial";

      ctx.textAlign =
        "center";

      ctx.textBaseline =
        "top";


      ctx.fillText(
        day.label,
        centerX,
        padding.top +
        chartHeight +
        10
      );

    }
  );


  /* LEGEND */

  ctx.textAlign =
    "left";

  ctx.textBaseline =
    "middle";

  ctx.font =
    "10px Arial";


  const legendY =
    height - 8;


  ctx.fillStyle =
    "#ef4444";

  ctx.fillRect(
    padding.left,
    legendY - 4,
    8,
    8
  );


  ctx.fillStyle =
    "#6b7280";

  ctx.fillText(
    "Sales",
    padding.left + 13,
    legendY
  );


  const expenseLegendX =
    padding.left + 60;


  ctx.fillStyle =
    "#9ca3af";

  ctx.fillRect(
    expenseLegendX,
    legendY - 4,
    8,
    8
  );


  ctx.fillStyle =
    "#6b7280";

  ctx.fillText(
    "Expenses",
    expenseLegendX + 13,
    legendY
  );

}


/* ==========================================
   NICE MAX
   ========================================== */

function getNiceMax(value) {

  value =
    Number(value) || 0;


  if (value <= 0) {
    return 100;
  }


  const magnitude =
    Math.pow(
      10,
      Math.floor(
        Math.log10(value)
      )
    );


  const normalized =
    value / magnitude;


  let nice;


  if (normalized <= 1) {
    nice = 1;

  } else if (normalized <= 2) {
    nice = 2;

  } else if (normalized <= 5) {
    nice = 5;

  } else {
    nice = 10;
  }


  return nice * magnitude;

}


/* ==========================================
   RESIZE
   ========================================== */

let resizeTimer;


window.addEventListener(
  "resize",
  () => {

    clearTimeout(resizeTimer);

    resizeTimer =
      setTimeout(() => {

        updateDashboard();

      }, 150);

  }
);


/* ==========================================
   STORAGE CHANGES
   ========================================== */

window.addEventListener(
  "storage",
  () => {

    updateDashboard();

  }
);


/* ==========================================
   AUTO REFRESH
   ========================================== */

setInterval(
  () => {

    if (
      document
        .getElementById("dashboard")
        ?.classList
        .contains("active-page")
    ) {

      updateDashboard();

    }

  },
  3000
);


/* ==========================================
   INITIALIZE
   ========================================== */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    showPage("dashboard");

    updateDashboard();

  }
);


/* ==========================================
   GLOBAL API
   ========================================== */

window.ShopManager = {

  showPage,

  updateDashboard,

  getArray,

  formatMoney,

  getNotifications,

  updateNotifications

};
```
