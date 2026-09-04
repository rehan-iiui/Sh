```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Shop Manager</title>

  <link rel="stylesheet" href="style.css">
</head>

<body>

  <div class="app">

    <!-- Sidebar -->
    <aside class="sidebar">

      <div class="logo">
        <div class="logo-icon">S</div>

        <div>
          <h2>Shop Manager</h2>
          <p>Business Center</p>
        </div>
      </div>

      <nav class="navigation">

        <button class="nav-item active" data-page="dashboard">
          <span>📊</span>
          Dashboard
        </button>

        <button class="nav-item" data-page="products">
          <span>📦</span>
          Products
        </button>

        <button class="nav-item" data-page="sales">
          <span>💰</span>
          Sales
        </button>

        <button class="nav-item" data-page="customers">
          <span>👥</span>
          Customers
        </button>

        <button class="nav-item" data-page="expenses">
          <span>💳</span>
          Expenses
        </button>

        <button class="nav-item" data-page="invoices">
          <span>🧾</span>
          Invoices
        </button>

        <button class="nav-item" data-page="reports">
          <span>📈</span>
          Reports
        </button>

      </nav>

      <div class="sidebar-bottom">

        <button class="nav-item" data-page="settings">
          <span>⚙️</span>
          Settings
        </button>

      </div>

    </aside>


    <!-- Main Area -->
    <main class="main">

      <!-- Top Bar -->
      <header class="topbar">

        <div>
          <h1 id="pageTitle">Dashboard</h1>
          <p id="pageSubtitle">Welcome to your shop</p>
        </div>

        <div class="top-actions">

          <button class="icon-button" title="Notifications">
            🔔
          </button>

          <div class="profile">

            <div class="profile-avatar">SM</div>

            <div class="profile-info">
              <strong>Shop Owner</strong>
              <span>Administrator</span>
            </div>

          </div>

        </div>

      </header>


      <!-- Dashboard -->
      <section class="page active-page" id="dashboard">

        <div class="welcome-card">

          <div>
            <p class="small-label">SHOP OVERVIEW</p>

            <h2>Good day! 👋</h2>

            <p>Manage your shop from one place.</p>
          </div>

          <button class="primary-button" id="quickSaleButton">
            + New Sale
          </button>

        </div>


        <!-- Statistics -->
        <div class="stats-grid">

          <div class="stat-card">

            <div class="stat-icon">💰</div>

            <div>
              <span>Today's Sales</span>
              <strong id="todaySales">Rs. 0</strong>
            </div>

          </div>


          <div class="stat-card">

            <div class="stat-icon">📦</div>

            <div>
              <span>Total Products</span>
              <strong id="totalProducts">0</strong>
            </div>

          </div>


          <div class="stat-card">

            <div class="stat-icon">👥</div>

            <div>
              <span>Customers</span>
              <strong id="totalCustomers">0</strong>
            </div>

          </div>


          <div class="stat-card">

            <div class="stat-icon">📈</div>

            <div>
              <span>Profit</span>
              <strong id="totalProfit">Rs. 0</strong>
            </div>

          </div>

        </div>


        <!-- Dashboard Content -->
        <div class="dashboard-grid">

          <div class="panel">

            <div class="panel-header">

              <div>
                <h3>Recent Sales</h3>
                <p>Your latest transactions</p>
              </div>

              <button class="text-button" data-page-target="sales">
                View All
              </button>

            </div>


            <div class="empty-state">

              <div class="empty-icon">🧾</div>

              <h3>No sales yet</h3>

              <p>
                Your recent sales will appear here.
              </p>

              <button class="primary-button" id="emptySaleButton">
                Create First Sale
              </button>

            </div>

          </div>


          <div class="panel">

            <div class="panel-header">

              <div>
                <h3>Inventory Status</h3>
                <p>Quick stock overview</p>
              </div>

              <button class="text-button" data-page-target="products">
                Manage
              </button>

            </div>


            <div class="inventory-summary">

              <div class="inventory-row">
                <span>Products in Stock</span>
                <strong id="stockProducts">0</strong>
              </div>

              <div class="inventory-row">
                <span>Low Stock</span>
                <strong id="lowStockProducts">0</strong>
              </div>

              <div class="inventory-row">
                <span>Out of Stock</span>
                <strong id="outStockProducts">0</strong>
              </div>

            </div>

          </div>

        </div>

      </section>


      <!-- Products -->
      <section class="page feature-page" id="products">

        <iframe
          class="feature-frame"
          src="products/products.html"
          title="Products">
        </iframe>

      </section>


      <!-- Sales -->
      <section class="page feature-page" id="sales">

        <iframe
          class="feature-frame"
          src="sales/sales.html"
          title="Sales">
        </iframe>

      </section>


      <!-- Customers -->
      <section class="page feature-page" id="customers">

        <iframe
          class="feature-frame"
          src="customers/customers.html"
          title="Customers">
        </iframe>

      </section>


      <!-- Expenses -->
      <section class="page feature-page" id="expenses">

        <iframe
          class="feature-frame"
          src="expenses/expenses.html"
          title="Expenses">
        </iframe>

      </section>


      <!-- Invoices -->
      <section class="page feature-page" id="invoices">

        <iframe
          class="feature-frame"
          src="invoices/invoices.html"
          title="Invoices">
        </iframe>

      </section>


      <!-- Reports -->
      <section class="page feature-page" id="reports">

        <iframe
          class="feature-frame"
          src="reports/reports.html"
          title="Reports">
        </iframe>

      </section>


      <!-- Settings -->
      <section class="page feature-page" id="settings">

        <iframe
          class="feature-frame"
          src="settings/settings.html"
          title="Settings">
        </iframe>

      </section>

    </main>

  </div>


  <script src="script.js"></script>

</body>
</html>
```
