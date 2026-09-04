```javascript
// ==========================================
// SHOP MANAGER - MAIN JAVASCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // PAGE INFORMATION
  // ==========================================

  const pageInfo = {
    dashboard: {
      title: "Dashboard",
      subtitle: "Welcome to your shop"
    },
    products: {
      title: "Products",
      subtitle: "Manage your shop products"
    },
    sales: {
      title: "Sales",
      subtitle: "Track your sales and transactions"
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
      subtitle: "View your business performance"
    },
    settings: {
      title: "Settings",
      subtitle: "Manage your shop settings"
    }
  };


  // ==========================================
  // ELEMENTS
  // ==========================================

  const navItems =
    document.querySelectorAll(".nav-item[data-page]");

  const pages =
    document.querySelectorAll(".page");

  const pageTitle =
    document.getElementById("pageTitle");

  const pageSubtitle =
    document.getElementById("pageSubtitle");


  // ==========================================
  // STORAGE
  // ==========================================

  function getArray(key) {

    try {

      const data =
        JSON.parse(localStorage.getItem(key));

      return Array.isArray(data) ? data : [];

    } catch (error) {

      return [];

    }

  }


  // ==========================================
  // SETTINGS
  // ==========================================

  function getSettings() {

    try {

      const settings =
        JSON.parse(
          localStorage.getItem("shopManagerSettings")
        );

      return settings || {};

    } catch (error) {

      return {};

    }

  }


  function getCurrency() {

    const settings = getSettings();

    return settings.currency || "Rs";

  }


  function formatMoney(amount) {

    const number =
      Number(amount) || 0;

    return (
      getCurrency() +
      ". " +
      number.toLocaleString()
    );

  }


  // ==========================================
  // DATE HELPERS
  // ==========================================

  function getToday() {

    const now = new Date();

    const year =
      now.getFullYear();

    const month =
      String(now.getMonth() + 1).padStart(2, "0");

    const day =
      String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

  }


  function getDateOnly(value) {

    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year =
      date.getFullYear();

    const month =
      String(date.getMonth() + 1).padStart(2, "0");

    const day =
      String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

  }


  function formatDate(value) {

    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    );

  }


  // ==========================================
  // HTML ESCAPE
  // ==========================================

  function escapeHTML(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  // ==========================================
  // SHOW PAGE
  // ==========================================

  function showPage(pageId) {

    pages.forEach(page => {
      page.classList.remove("active-page");
    });


    const selectedPage =
      document.getElementById(pageId);


    if (selectedPage) {
      selectedPage.classList.add("active-page");
    }


    navItems.forEach(button => {

      button.classList.remove("active");

      if (button.dataset.page === pageId) {
        button.classList.add("active");
      }

    });


    if (pageInfo[pageId]) {

      pageTitle.textContent =
        pageInfo[pageId].title;

      pageSubtitle.textContent =
        pageInfo[pageId].subtitle;

    }


    const main =
      document.querySelector(".main");

    if (main) {
      main.scrollTop = 0;
    }


    if (pageId === "dashboard") {
      updateDashboard();
    }

  }


  // ==========================================
  // SIDEBAR NAVIGATION
  // ==========================================

  navItems.forEach(button => {

    button.addEventListener("click", () => {

      showPage(button.dataset.page);

    });

  });


  // ==========================================
  // INTERNAL PAGE BUTTONS
  // ==========================================

  document
    .querySelectorAll("[data-page-target]")
    .forEach(button => {

      button.addEventListener("click", () => {

        showPage(
          button.dataset.pageTarget
        );

      });

    });


  // ==========================================
  // QUICK SALE
  // ==========================================

  const quickSaleButton =
    document.getElementById("quickSaleButton");

  const emptySaleButton =
    document.getElementById("emptySaleButton");


  function openSalesPage() {
    showPage("sales");
  }


  if (quickSaleButton) {

    quickSaleButton.addEventListener(
      "click",
      openSalesPage
    );

  }


  if (emptySaleButton) {

    emptySaleButton.addEventListener(
      "click",
      openSalesPage
    );

  }


  // ==========================================
  // UPDATE DASHBOARD
  // ==========================================

  function updateDashboard() {

    const products =
      getArray("shopManagerProducts");

    const sales =
      getArray("shopManagerSales");

    const customers =
      getArray("shopManagerCustomers");


    // ------------------------------------------
    // STOCK
    // ------------------------------------------

    const totalProducts =
      products.length;

    let stockProducts = 0;
    let lowStockProducts = 0;
    let outStockProducts = 0;


    const settings =
      getSettings();


    const lowStockThreshold =
      Math.max(
        1,
        Number(settings.lowStockThreshold) || 5
      );


    products.forEach(product => {

      const stock =
        Number(product.stock) || 0;


      if (stock <= 0) {

        outStockProducts++;

      } else {

        stockProducts++;

        if (stock <= lowStockThreshold) {
          lowStockProducts++;
        }

      }

    });


    // ------------------------------------------
    // SALES
    // ------------------------------------------

    const today =
      getToday();

    let todaySalesAmount = 0;
    let totalProfit = 0;


    sales.forEach(sale => {

      const total =
        Number(sale.total) || 0;

      const profit =
        Number(sale.profit) || 0;


      if (getDateOnly(sale.date) === today) {
        todaySalesAmount += total;
      }


      totalProfit += profit;

    });


    // ------------------------------------------
    // UPDATE STAT CARDS
    // ------------------------------------------

    const todaySales =
      document.getElementById("todaySales");

    const totalProductsElement =
      document.getElementById("totalProducts");

    const totalCustomers =
      document.getElementById("totalCustomers");

    const totalProfitElement =
      document.getElementById("totalProfit");

    const stockProductsElement =
      document.getElementById("stockProducts");

    const lowStockProductsElement =
      document.getElementById("lowStockProducts");

    const outStockProductsElement =
      document.getElementById("outStockProducts");


    if (todaySales) {
      todaySales.textContent =
        formatMoney(todaySalesAmount);
    }


    if (totalProductsElement) {
      totalProductsElement.textContent =
        totalProducts;
    }


    if (totalCustomers) {
      totalCustomers.textContent =
        customers.length;
    }


    if (totalProfitElement) {
      totalProfitElement.textContent =
        formatMoney(totalProfit);
    }


    if (stockProductsElement) {
      stockProductsElement.textContent =
        stockProducts;
    }


    if (lowStockProductsElement) {
      lowStockProductsElement.textContent =
        lowStockProducts;
    }


    if (outStockProductsElement) {
      outStockProductsElement.textContent =
        outStockProducts;
    }


    // ------------------------------------------
    // RECENT SALES
    // ------------------------------------------

    updateRecentSales(sales);


    // ------------------------------------------
    // CHARTS
    // ------------------------------------------

    drawSalesChart(sales);

    drawComparisonChart(
      sales,
      getArray("shopManagerExpenses")
    );

  }


  // ==========================================
  // RECENT SALES
  // ==========================================

  function updateRecentSales(sales) {

    const panel =
      document.querySelector(
        "#dashboard .dashboard-grid .panel:first-child"
      );


    if (!panel) {
      return;
    }


    const oldEmpty =
      panel.querySelector(".empty-state");

    if (oldEmpty) {
      oldEmpty.remove();
    }


    const oldTable =
      panel.querySelector(".recent-sales-table");

    if (oldTable) {
      oldTable.remove();
    }


    if (sales.length === 0) {

      const empty =
        document.createElement("div");

      empty.className =
        "empty-state";


      empty.innerHTML = `
        <div class="empty-icon">🧾</div>
        <h3>No sales yet</h3>
        <p>Your recent sales will appear here.</p>
        <button class="primary-button" id="emptySaleButton">
          Create First Sale
        </button>
      `;


      panel.appendChild(empty);


      const button =
        document.getElementById("emptySaleButton");


      if (button) {
        button.addEventListener(
          "click",
          openSalesPage
        );
      }


      return;
    }


    const recentSales =
      [...sales]
        .sort((a, b) => {

          return (
            new Date(b.date || 0) -
            new Date(a.date || 0)
          );

        })
        .slice(0, 5);


    const table =
      document.createElement("div");

    table.className =
      "recent-sales-table";


    table.innerHTML = `
      <div class="recent-sales-head">
        <span>Customer</span>
        <span>Total</span>
      </div>
    `;


    recentSales.forEach(sale => {

      const row =
        document.createElement("div");

      row.className =
        "recent-sales-row";


      const customer =
        sale.customer ||
        "Walk-in Customer";


      const total =
        Number(sale.total) || 0;


      row.innerHTML = `
        <div>
          <strong>${escapeHTML(customer)}</strong>
          <small>${formatDate(sale.date)}</small>
        </div>

        <strong>${formatMoney(total)}</strong>
      `;


      table.appendChild(row);

    });


    panel.appendChild(table);

  }


  // ==========================================
  // GET LAST 7 DAYS
  // ==========================================

  function getLastSevenDays() {

    const days = [];

    const now =
      new Date();


    for (let i = 6; i >= 0; i--) {

      const date =
        new Date(now);

      date.setHours(0, 0, 0, 0);

      date.setDate(
        now.getDate() - i
      );


      const year =
        date.getFullYear();

      const month =
        String(date.getMonth() + 1)
          .padStart(2, "0");

      const day =
        String(date.getDate())
          .padStart(2, "0");


      days.push({
        key: `${year}-${month}-${day}`,
        label: date.toLocaleDateString(
          undefined,
          { weekday: "short" }
        ),
        shortDate: date.toLocaleDateString(
          undefined,
          {
            day: "numeric",
            month: "short"
          }
        )
      });

    }


    return days;

  }


  // ==========================================
  // CREATE CANVAS SIZE
  // ==========================================

  function prepareCanvas(canvas) {

    if (!canvas) {
      return null;
    }


    const rect =
      canvas.getBoundingClientRect();


    const width =
      Math.max(300, rect.width);

    const height =
      Math.max(200, rect.height);


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


  // ==========================================
  // DRAW SALES CHART
  // ==========================================

  function drawSalesChart(sales) {

    const canvas =
      document.getElementById("salesChart");

    const empty =
      document.getElementById("salesChartEmpty");


    if (!canvas) {
      return;
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


    const days =
      getLastSevenDays();


    const values =
      days.map(day => {

        return sales
          .filter(
            sale =>
              getDateOnly(sale.date) === day.key
          )
          .reduce(
            (sum, sale) =>
              sum + (Number(sale.total) || 0),
            0
          );

      });


    const hasData =
      values.some(value => value > 0);


    if (empty) {
      empty.style.display =
        hasData ? "none" : "flex";
    }


    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    if (!hasData) {
      return;
    }


    const padding = {
      top: 18,
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


    const maxValue =
      Math.max(...values, 1);


    const roundedMax =
      getNiceMax(maxValue);


    // ------------------------------------------
    // GRID
    // ------------------------------------------

    ctx.font =
      "10px Arial";

    ctx.textAlign =
      "right";

    ctx.textBaseline =
      "middle";

    ctx.strokeStyle =
      "#e5e7eb";

    ctx.fillStyle =
      "#9ca3af";


    const gridLines = 4;


    for (let i = 0; i <= gridLines; i++) {

      const value =
        roundedMax *
        (i / gridLines);


      const y =
        padding.top +
        chartHeight -
        (chartHeight * i / gridLines);


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


    // ------------------------------------------
    // LINE
    // ------------------------------------------

    const points = [];


    values.forEach((value, index) => {

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
          value /
          roundedMax *
          chartHeight
        );


      points.push({ x, y });

    });


    // Area
    ctx.beginPath();

    points.forEach((point, index) => {

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

    });


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
      "rgba(239, 68, 68, 0.10)";

    ctx.fill();


    // Line
    ctx.beginPath();


    points.forEach((point, index) => {

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

    });


    ctx.strokeStyle =
      "#ef4444";

    ctx.lineWidth = 3;

    ctx.lineJoin =
      "round";

    ctx.lineCap =
      "round";

    ctx.stroke();


    // Points
    points.forEach((point, index) => {

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


      // Value above point
      if (values[index] > 0) {

        ctx.fillStyle =
          "#374151";

        ctx.font =
          "10px Arial";

        ctx.textAlign =
          "center";

        ctx.textBaseline =
          "bottom";


        ctx.fillText(
          formatCompactMoney(values[index]),
          point.x,
          point.y - 8
        );

      }

    });


    // ------------------------------------------
    // X AXIS LABELS
    // ------------------------------------------

    ctx.fillStyle =
      "#9ca3af";

    ctx.font =
      "10px Arial";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "top";


    days.forEach((day, index) => {

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
        padding.top + chartHeight + 10
      );

    });

  }


  // ==========================================
  // DRAW SALES VS EXPENSES
  // ==========================================

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


    const days =
      getLastSevenDays();


    const salesValues =
      days.map(day => {

        return sales
          .filter(
            sale =>
              getDateOnly(sale.date) === day.key
          )
          .reduce(
            (sum, sale) =>
              sum + (Number(sale.total) || 0),
            0
          );

      });


    const expenseValues =
      days.map(day => {

        return expenses
          .filter(
            expense =>
              getDateOnly(expense.date) === day.key
          )
          .reduce(
            (sum, expense) =>
              sum + (Number(expense.amount) || 0),
            0
          );

      });


    const hasData =
      salesValues.some(value => value > 0) ||
      expenseValues.some(value => value > 0);


    if (empty) {
      empty.style.display =
        hasData ? "none" : "flex";
    }


    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    if (!hasData) {
      return;
    }


    const padding = {
      top: 25,
      right: 15,
      bottom: 40,
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


    const maxValue =
      Math.max(
        ...salesValues,
        ...expenseValues,
        1
      );


    const roundedMax =
      getNiceMax(maxValue);


    // ------------------------------------------
    // GRID
    // ------------------------------------------

    ctx.font =
      "10px Arial";

    ctx.textAlign =
      "right";

    ctx.textBaseline =
      "middle";

    ctx.strokeStyle =
      "#e5e7eb";

    ctx.fillStyle =
      "#9ca3af";


    const gridLines = 4;


    for (let i = 0; i <= gridLines; i++) {

      const value =
        roundedMax *
        (i / gridLines);


      const y =
        padding.top +
        chartHeight -
        (
          chartHeight *
          i /
          gridLines
        );


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


    // ------------------------------------------
    // BAR WIDTH
    // ------------------------------------------

    const groupWidth =
      chartWidth /
      days.length;

    const barWidth =
      Math.min(
        18,
        groupWidth * 0.28
      );


    // ------------------------------------------
    // BARS
    // ------------------------------------------

    days.forEach((day, index) => {

      const centerX =
        padding.left +
        groupWidth * index +
        groupWidth / 2;


      const salesHeight =
        (
          salesValues[index] /
          roundedMax
        ) *
        chartHeight;


      const expenseHeight =
        (
          expenseValues[index] /
          roundedMax
        ) *
        chartHeight;


      const salesX =
        centerX -
        barWidth -
        2;


      const expenseX =
        centerX +
        2;


      // Sales
      ctx.fillStyle =
        "#ef4444";


      ctx.fillRect(
        salesX,
        padding.top +
          chartHeight -
          salesHeight,
        barWidth,
        salesHeight
      );


      // Expenses
      ctx.fillStyle =
        "#6b7280";


      ctx.fillRect(
        expenseX,
        padding.top +
          chartHeight -
          expenseHeight,
        barWidth,
        expenseHeight
      );


      // Day
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

    });


    // ------------------------------------------
    // LEGEND
    // ------------------------------------------

    const legendY = 10;


    ctx.fillStyle =
      "#ef4444";

    ctx.fillRect(
      width - 125,
      legendY,
      10,
      10
    );


    ctx.fillStyle =
      "#374151";

    ctx.font =
      "10px Arial";

    ctx.textAlign =
      "left";

    ctx.textBaseline =
      "top";


    ctx.fillText(
      "Sales",
      width - 110,
      legendY - 1
    );


    ctx.fillStyle =
      "#6b7280";

    ctx.fillRect(
      width - 65,
      legendY,
      10,
      10
    );


    ctx.fillStyle =
      "#374151";

    ctx.fillText(
      "Expenses",
      width - 50,
      legendY - 1
    );

  }


  // ==========================================
  // NICE MAXIMUM FOR CHART
  // ==========================================

  function getNiceMax(value) {

    if (value <= 10) {
      return 10;
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


    let niceNumber;


    if (normalized <= 1) {
      niceNumber = 1;
    } else if (normalized <= 2) {
      niceNumber = 2;
    } else if (normalized <= 5) {
      niceNumber = 5;
    } else {
      niceNumber = 10;
    }


    return niceNumber * magnitude;

  }


  // ==========================================
  // COMPACT MONEY
  // ==========================================

  function formatCompactMoney(amount) {

    const number =
      Number(amount) || 0;


    if (number >= 1000000) {

      return (
        getCurrency() +
        ". " +
        (number / 1000000)
          .toFixed(1) +
        "M"
      );

    }


    if (number >= 1000) {

      return (
        getCurrency() +
        ". " +
        (number / 1000)
          .toFixed(1) +
        "K"
      );

    }


    return (
      getCurrency() +
      ". " +
      Math.round(number)
    );

  }


  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  const notificationButton =
    document.querySelector(".icon-button");


  if (notificationButton) {

    notificationButton.addEventListener(
      "click",
      () => {

        const products =
          getArray(
            "shopManagerProducts"
          );


        const settings =
          getSettings();


        const threshold =
          Math.max(
            1,
            Number(
              settings.lowStockThreshold
            ) || 5
          );


        const lowStock =
          products.filter(product => {

            const stock =
              Number(product.stock) || 0;

            return stock <= threshold;

          });


        if (lowStock.length > 0) {

          alert(
            `You have ${lowStock.length} low-stock or out-of-stock product(s).`
          );

        } else {

          alert(
            "No new notifications."
          );

        }

      }
    );

  }


  // ==========================================
  // AUTO REFRESH
  // ==========================================

  window.addEventListener(
    "storage",
    () => {

      updateDashboard();

    }
  );


  // Refresh periodically
  setInterval(
    updateDashboard,
    3000
  );


  // Redraw charts when window changes size
  window.addEventListener(
    "resize",
    () => {

      updateDashboard();

    }
  );


  // ==========================================
  // GLOBAL SHOP MANAGER
  // ==========================================

  window.ShopManager = {

    showPage,
    updateDashboard,
    getArray,
    formatMoney

  };


  // ==========================================
  // START
  // ==========================================

  showPage("dashboard");

  updateDashboard();

});
```
