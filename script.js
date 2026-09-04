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
  // STORAGE HELPER
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


  // ==========================================
  // CURRENCY
  // ==========================================

  function getCurrency() {

    try {

      const settings =
        JSON.parse(
          localStorage.getItem("shopManagerSettings")
        );

      return settings?.currency || "Rs";

    } catch (error) {

      return "Rs";

    }
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


    // Refresh dashboard when opened
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
  // DASHBOARD PAGE BUTTONS
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
    // PRODUCT STATISTICS
    // ------------------------------------------

    const totalProducts =
      products.length;

    let stockProducts = 0;
    let lowStockProducts = 0;
    let outStockProducts = 0;


    let lowStockThreshold = 5;

    try {

      const settings =
        JSON.parse(
          localStorage.getItem("shopManagerSettings")
        );

      lowStockThreshold =
        Math.max(
          1,
          Number(settings?.lowStockThreshold) || 5
        );

    } catch (error) {
      lowStockThreshold = 5;
    }


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
    // SALES STATISTICS
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


    const oldEmptyState =
      panel.querySelector(".empty-state");

    if (oldEmptyState) {
      oldEmptyState.remove();
    }


    const existingTable =
      panel.querySelector(".recent-sales-table");

    if (existingTable) {
      existingTable.remove();
    }


    if (sales.length === 0) {

      const empty =
        document.createElement("div");

      empty.className = "empty-state";

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
  // DATE FORMAT
  // ==========================================

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
  // NOTIFICATIONS
  // ==========================================

  const notificationButton =
    document.querySelector(".icon-button");


  if (notificationButton) {

    notificationButton.addEventListener(
      "click",
      () => {

        const products =
          getArray("shopManagerProducts");


        let threshold = 5;

        try {

          const settings =
            JSON.parse(
              localStorage.getItem(
                "shopManagerSettings"
              )
            );

          threshold =
            Math.max(
              1,
              Number(settings?.lowStockThreshold) || 5
            );

        } catch (error) {
          threshold = 5;
        }


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

          alert("No new notifications.");

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


  // ==========================================
  // GLOBAL SHOP MANAGER OBJECT
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
