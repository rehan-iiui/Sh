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

  const navItems = document.querySelectorAll(".nav-item[data-page]");
  const pages = document.querySelectorAll(".page");
  const pageTitle = document.getElementById("pageTitle");
  const pageSubtitle = document.getElementById("pageSubtitle");


  // ------------------------------------------
  // SHOW PAGE FUNCTION
  // ------------------------------------------

  function showPage(pageId) {

    // Hide every page
    pages.forEach(page => {
      page.classList.remove("active-page");
    });

    // Show selected page
    const selectedPage = document.getElementById(pageId);

    if (selectedPage) {
      selectedPage.classList.add("active-page");
    }


    // Update active navigation button
    navItems.forEach(button => {
      button.classList.remove("active");

      if (button.dataset.page === pageId) {
        button.classList.add("active");
      }
    });


    // Update title and subtitle
    if (pageInfo[pageId]) {
      pageTitle.textContent = pageInfo[pageId].title;
      pageSubtitle.textContent = pageInfo[pageId].subtitle;
    }


    // Scroll to top
    document.querySelector(".main").scrollTop = 0;
  }


  // ------------------------------------------
  // SIDEBAR NAVIGATION
  // ------------------------------------------

  navItems.forEach(button => {

    button.addEventListener("click", () => {

      const pageId = button.dataset.page;

      showPage(pageId);

    });

  });


  // ------------------------------------------
  // "VIEW ALL" / OTHER PAGE BUTTONS
  // ------------------------------------------

  const pageTargetButtons =
    document.querySelectorAll("[data-page-target]");

  pageTargetButtons.forEach(button => {

    button.addEventListener("click", () => {

      const pageId = button.dataset.pageTarget;

      showPage(pageId);

    });

  });


  // ------------------------------------------
  // QUICK SALE BUTTONS
  // ------------------------------------------

  const quickSaleButton =
    document.getElementById("quickSaleButton");

  const emptySaleButton =
    document.getElementById("emptySaleButton");


  function openSalesPage() {

    showPage("sales");

  }


  if (quickSaleButton) {
    quickSaleButton.addEventListener("click", openSalesPage);
  }


  if (emptySaleButton) {
    emptySaleButton.addEventListener("click", openSalesPage);
  }


  // ------------------------------------------
  // START ON DASHBOARD
  // ------------------------------------------

  showPage("dashboard");


  // ------------------------------------------
  // TEMPORARY DASHBOARD DATA
  // ------------------------------------------
  // These values will later be connected
  // to our Products, Sales and Customer systems.

  const shopData = {
    todaySales: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalProfit: 0,
    stockProducts: 0,
    lowStockProducts: 0,
    outStockProducts: 0
  };


  // ------------------------------------------
  // UPDATE DASHBOARD
  // ------------------------------------------

  function updateDashboard() {

    const todaySales =
      document.getElementById("todaySales");

    const totalProducts =
      document.getElementById("totalProducts");

    const totalCustomers =
      document.getElementById("totalCustomers");

    const totalProfit =
      document.getElementById("totalProfit");

    const stockProducts =
      document.getElementById("stockProducts");

    const lowStockProducts =
      document.getElementById("lowStockProducts");

    const outStockProducts =
      document.getElementById("outStockProducts");


    if (todaySales) {
      todaySales.textContent =
        "Rs. " + shopData.todaySales.toLocaleString();
    }

    if (totalProducts) {
      totalProducts.textContent =
        shopData.totalProducts;
    }

    if (totalCustomers) {
      totalCustomers.textContent =
        shopData.totalCustomers;
    }

    if (totalProfit) {
      totalProfit.textContent =
        "Rs. " + shopData.totalProfit.toLocaleString();
    }

    if (stockProducts) {
      stockProducts.textContent =
        shopData.stockProducts;
    }

    if (lowStockProducts) {
      lowStockProducts.textContent =
        shopData.lowStockProducts;
    }

    if (outStockProducts) {
      outStockProducts.textContent =
        shopData.outStockProducts;
    }

  }


  updateDashboard();


  // ------------------------------------------
  // NOTIFICATION BUTTON
  // ------------------------------------------

  const notificationButton =
    document.querySelector(".icon-button");

  if (notificationButton) {

    notificationButton.addEventListener("click", () => {

      alert("No new notifications.");

    });

  }


  // ------------------------------------------
  // GLOBAL SHOP MANAGER OBJECT
  // ------------------------------------------
  // Later our feature folders can use this.

  window.ShopManager = {

    data: shopData,

    showPage: showPage,

    updateDashboard: updateDashboard

  };


});
```
