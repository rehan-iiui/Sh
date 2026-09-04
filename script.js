// ==========================================
// SHOP MANAGER - MAIN JAVASCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  // ------------------------------------------
  // PAGE INFORMATION
  // ------------------------------------------

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


  // ------------------------------------------
  // ELEMENTS
  // ------------------------------------------

  const navItems =
    document.querySelectorAll(".nav-item[data-page]");

  const pages =
    document.querySelectorAll(".page");

  const pageTitle =
    document.getElementById("pageTitle");

  const pageSubtitle =
    document.getElementById("pageSubtitle");


  // ------------------------------------------
  // SHOW PAGE
  // ------------------------------------------

  function showPage(pageId) {

    pages.forEach(page => {
      page.classList.remove("active-page");
    });


    const selectedPage =
      document.getElementById(pageId);


    if (selectedPage) {
      selectedPage.classList.add("active-page");
    }


    // Update sidebar
    navItems.forEach(button => {

      button.classList.remove("active");

      if (button.dataset.page === pageId) {
        button.classList.add("active");
      }

    });


    // Update top title
    if (pageInfo[pageId]) {

      pageTitle.textContent =
        pageInfo[pageId].title;

      pageSubtitle.textContent =
        pageInfo[pageId].subtitle;

    }


    // Scroll main area to top
    const main =
      document.querySelector(".main");

    if (main) {
      main.scrollTop = 0;
    }

  }


  // ------------------------------------------
  // SIDEBAR NAVIGATION
  // ------------------------------------------

  navItems.forEach(button => {

    button.addEventListener("click", () => {

      const pageId =
        button.dataset.page;

      showPage(pageId);

    });

  });


  // ------------------------------------------
  // INTERNAL PAGE BUTTONS
  // ------------------------------------------

  const pageTargetButtons =
    document.querySelectorAll("[data-page-target]");


  pageTargetButtons.forEach(button => {

    button.addEventListener("click", () => {

      const pageId =
        button.dataset.pageTarget;

      showPage(pageId);

    });

  });


  // ------------------------------------------
  // QUICK SALE
  // ------------------------------------------

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


  // ------------------------------------------
  // DASHBOARD DATA
  // ------------------------------------------

  function getArray(key) {

    try {

      const data =
        JSON.parse(localStorage.getItem(key));

      return Array.isArray(data) ? data : [];

    } catch (error) {

      return [];

    }

  }


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


  function getSaleDate(sale) {

    if (!sale || !sale.date) {
      return "";
    }

    const date =
      new Date(sale.date);

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


  // ------------------------------------------
  // UPDATE DASHBOARD
  // ------------------------------------------

  function updateDashboard() {

    const products =
      getArray("shopManagerProducts");

    const sales =
      getArray("shopManagerSales");

    const customers =
      getArray("shopManagerCustomers");


    // ----------------------------------------
    // PRODUCTS
    // ----------------------------------------

    const totalProducts =
      products.length;


    let stockProducts = 0;
    let lowStockProducts = 0;
    let outStockProducts = 0;


    products.forEach(product => {

      const stock =
        Number(product.stock) || 0;

      if (stock <= 0) {

        outStockProducts++;

      } else {

        stockProducts++;

        if (stock <= 5) {
          lowStockProducts++;
        }

      }

    });


    // ----------------------------------------
    // SALES
    // ----------------------------------------

    const today =
      getToday();


    let todaySalesAmount = 0;
    let totalProfit = 0;


    sales.forEach(sale => {

      const total =
        Number(sale.total) || 0;

      const profit =
        Number(sale.profit) || 0;


      if (getSaleDate(sale) === today) {

        todaySalesAmount += total;

      }


      totalProfit += profit;

    });


    // ----------------------------------------
    // UPDATE HTML
    // ----------------------------------------

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
        "Rs. " +
        todaySalesAmount.toLocaleString();

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
        "Rs. " +
        totalProfit.toLocaleString();

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

  }


  // ------------------------------------------
  // REFRESH DASHBOARD
  // ------------------------------------------

  updateDashboard();


  // Refresh dashboard whenever the user
  // returns to the dashboard.

  navItems.forEach(button => {

    button.addEventListener("click", () => {

      if (button.dataset.page === "dashboard") {
        updateDashboard();
      }

    });

  });


  // ------------------------------------------
  // NOTIFICATIONS
  // ------------------------------------------

  const notificationButton =
    document.querySelector(".icon-button");


  if (notificationButton) {

    notificationButton.addEventListener("click", () => {

      const products =
        getArray("shopManagerProducts");


      const lowStock =
        products.filter(product => {

          const stock =
            Number(product.stock) || 0;

          return stock <= 5;

        });


      if (lowStock.length > 0) {

        alert(
          `You have ${lowStock.length} low-stock or out-of-stock product(s).`
        );

      } else {

        alert("No new notifications.");

      }

    });

  }


  // ------------------------------------------
  // GLOBAL SHOP MANAGER OBJECT
  // ------------------------------------------

  window.ShopManager = {

    showPage: showPage,

    updateDashboard: updateDashboard,

    getArray: getArray

  };


  // ------------------------------------------
  // START
  // ------------------------------------------

  showPage("dashboard");

});
```
