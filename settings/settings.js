```javascript
const SETTINGS_KEY = "shopManagerSettings";
const PRODUCTS_KEY = "shopManagerProducts";
const SALES_KEY = "shopManagerSales";
const CUSTOMERS_KEY = "shopManagerCustomers";
const EXPENSES_KEY = "shopManagerExpenses";
const INVOICES_KEY = "shopManagerInvoices";
const INVENTORY_KEY = "shopManagerInventoryHistory";
const LAST_BACKUP_KEY = "shopManagerLastBackup";

const BACKUP_VERSION = "2.0";


/* ================================
   HELPERS
================================ */

function getArray(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveArray(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function getSettings() {
  try {
    const data = JSON.parse(localStorage.getItem(SETTINGS_KEY));
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function formatDate(dateValue) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* ================================
   DEFAULT SETTINGS
================================ */

const defaultSettings = {
  shopName: "",
  ownerName: "",
  phone: "",
  email: "",
  address: "",
  currency: "Rs",
  invoicePrefix: "INV",
  lowStockThreshold: 5,
  appearance: "system"
};


/* ================================
   LOAD SETTINGS
================================ */

function loadSettings() {
  const saved = getSettings();

  const settings = {
    ...defaultSettings,
    ...saved
  };

  document.getElementById("shopName").value =
    settings.shopName || "";

  document.getElementById("ownerName").value =
    settings.ownerName || "";

  document.getElementById("shopPhone").value =
    settings.phone || "";

  document.getElementById("shopEmail").value =
    settings.email || "";

  document.getElementById("shopAddress").value =
    settings.address || "";

  document.getElementById("currency").value =
    settings.currency || "Rs";

  document.getElementById("invoicePrefix").value =
    settings.invoicePrefix || "INV";

  document.getElementById("lowStockThreshold").value =
    settings.lowStockThreshold ?? 5;

  const appearance =
    settings.appearance || "system";

  const appearanceRadio =
    document.querySelector(
      `input[name="appearance"][value="${appearance}"]`
    );

  if (appearanceRadio) {
    appearanceRadio.checked = true;
  }

  applyAppearance(appearance);
}


/* ================================
   SHOP INFORMATION
================================ */

function saveShopInformation() {
  const settings = getSettings();

  settings.shopName =
    document.getElementById("shopName").value.trim();

  settings.ownerName =
    document.getElementById("ownerName").value.trim();

  settings.phone =
    document.getElementById("shopPhone").value.trim();

  settings.email =
    document.getElementById("shopEmail").value.trim();

  settings.address =
    document.getElementById("shopAddress").value.trim();

  saveSettings(settings);

  showMessage(
    "Shop information saved successfully."
  );
}


/* ================================
   BUSINESS SETTINGS
================================ */

function saveBusinessSettings() {
  const settings = getSettings();

  settings.currency =
    document.getElementById("currency").value;

  settings.invoicePrefix =
    document
      .getElementById("invoicePrefix")
      .value
      .trim() || "INV";

  settings.lowStockThreshold =
    Math.max(
      0,
      Number(
        document.getElementById(
          "lowStockThreshold"
        ).value
      ) || 0
    );

  saveSettings(settings);

  showMessage(
    "Business settings saved successfully."
  );

  refreshOtherPages();
}


/* ================================
   APPEARANCE
================================ */

function applyAppearance(mode) {
  let dark = false;

  if (mode === "dark") {
    dark = true;
  }

  if (mode === "system") {
    dark =
      window.matchMedia &&
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
  }

  document.body.classList.toggle(
    "dark-mode",
    dark
  );
}

function saveAppearance(mode) {
  const settings = getSettings();

  settings.appearance = mode;

  saveSettings(settings);

  applyAppearance(mode);

  refreshOtherPages();
}


/* ================================
   BACKUP COUNTS
================================ */

function updateBackupSummary() {
  const products = getArray(PRODUCTS_KEY);
  const sales = getArray(SALES_KEY);
  const customers = getArray(CUSTOMERS_KEY);
  const expenses = getArray(EXPENSES_KEY);
  const invoices = getArray(INVOICES_KEY);
  const inventory = getArray(INVENTORY_KEY);

  document.getElementById(
    "backupProductsCount"
  ).textContent = products.length;

  document.getElementById(
    "backupSalesCount"
  ).textContent = sales.length;

  document.getElementById(
    "backupCustomersCount"
  ).textContent = customers.length;

  document.getElementById(
    "backupExpensesCount"
  ).textContent = expenses.length;

  document.getElementById(
    "backupInvoicesCount"
  ).textContent = invoices.length;

  document.getElementById(
    "backupInventoryCount"
  ).textContent = inventory.length;

  updateBackupStatus();
}


/* ================================
   BACKUP STATUS
================================ */

function updateBackupStatus() {
  const lastBackup =
    localStorage.getItem(LAST_BACKUP_KEY);

  const timeElement =
    document.getElementById("lastBackupTime");

  const titleElement =
    document.getElementById("backupStatusTitle");

  const textElement =
    document.getElementById("backupStatusText");

  if (!lastBackup) {
    timeElement.textContent = "Never";

    titleElement.textContent =
      "Your data is stored locally";

    textElement.textContent =
      "Create a backup regularly to protect your shop data.";

    return;
  }

  timeElement.textContent =
    formatDate(lastBackup);

  titleElement.textContent =
    "Backup available";

  textElement.textContent =
    "Your latest backup was created on " +
    formatDate(lastBackup) +
    ".";
}


/* ================================
   CREATE BACKUP
================================ */

function createBackup() {
  const backup = {
    backupVersion: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),

    products: getArray(PRODUCTS_KEY),
    sales: getArray(SALES_KEY),
    customers: getArray(CUSTOMERS_KEY),
    expenses: getArray(EXPENSES_KEY),
    invoices: getArray(INVOICES_KEY),
    inventoryHistory: getArray(INVENTORY_KEY),

    settings: getSettings()
  };

  const json = JSON.stringify(
    backup,
    null,
    2
  );

  const blob = new Blob(
    [json],
    {
      type: "application/json"
    }
  );

  const url =
    URL.createObjectURL(blob);

  const datePart =
    new Date()
      .toISOString()
      .slice(0, 10);

  const shopName =
    (getSettings().shopName || "shop-manager")
      .replace(/[^a-z0-9-_]/gi, "-")
      .toLowerCase();

  const filename =
    `${shopName}-backup-${datePart}.json`;

  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);

  const now =
    new Date().toISOString();

  localStorage.setItem(
    LAST_BACKUP_KEY,
    now
  );

  updateBackupStatus();

  showMessage(
    "Full backup exported successfully."
  );
}


/* ================================
   IMPORT BACKUP
================================ */

let pendingBackup = null;

function handleImportFile(event) {
  const file =
    event.target.files &&
    event.target.files[0];

  if (!file) return;

  const reader =
    new FileReader();

  reader.onload = function () {
    try {
      const backup =
        JSON.parse(reader.result);

      if (!validateBackup(backup)) {
        throw new Error(
          "Invalid backup file."
        );
      }

      pendingBackup = backup;

      showImportPreview(backup);

      openImportModal();

    } catch (error) {
      console.error(error);

      showMessage(
        "This file is not a valid Shop Manager backup."
      );
    }

    event.target.value = "";
  };

  reader.onerror = function () {
    showMessage(
      "Could not read the backup file."
    );

    event.target.value = "";
  };

  reader.readAsText(file);
}


/* ================================
   VALIDATE BACKUP
================================ */

function validateBackup(backup) {
  if (
    !backup ||
    typeof backup !== "object"
  ) {
    return false;
  }

  const requiredArrays = [
    "products",
    "sales",
    "customers",
    "expenses",
    "invoices"
  ];

  for (const key of requiredArrays) {
    if (!Array.isArray(backup[key])) {
      return false;
    }
  }

  if (
    backup.inventoryHistory !== undefined &&
    !Array.isArray(
      backup.inventoryHistory
    )
  ) {
    return false;
  }

  if (
    backup.settings !== undefined &&
    (
      typeof backup.settings !== "object" ||
      Array.isArray(backup.settings)
    )
  ) {
    return false;
  }

  return true;
}


/* ================================
   IMPORT PREVIEW
================================ */

function showImportPreview(backup) {
  document.getElementById(
    "importBackupDate"
  ).textContent =
    formatDate(backup.exportedAt);

  document.getElementById(
    "importBackupVersion"
  ).textContent =
    backup.backupVersion || "1.0";

  document.getElementById(
    "importProductsCount"
  ).textContent =
    backup.products.length;

  document.getElementById(
    "importSalesCount"
  ).textContent =
    backup.sales.length;

  document.getElementById(
    "importCustomersCount"
  ).textContent =
    backup.customers.length;

  document.getElementById(
    "importExpensesCount"
  ).textContent =
    backup.expenses.length;

  document.getElementById(
    "importInvoicesCount"
  ).textContent =
    backup.invoices.length;

  document.getElementById(
    "importInventoryCount"
  ).textContent =
    Array.isArray(
      backup.inventoryHistory
    )
      ? backup.inventoryHistory.length
      : 0;
}


/* ================================
   MODAL
================================ */

function openImportModal() {
  document
    .getElementById("importModal")
    .classList.add("active");
}

function closeImportModal() {
  document
    .getElementById("importModal")
    .classList.remove("active");

  pendingBackup = null;
}


/* ================================
   RESTORE BACKUP
================================ */

function restoreBackup() {
  if (!pendingBackup) {
    showMessage(
      "No backup is selected."
    );

    return;
  }

  const confirmed =
    confirm(
      "Restore this backup?\n\n" +
      "Your current Shop Manager data will be replaced."
    );

  if (!confirmed) {
    return;
  }

  try {
    saveArray(
      PRODUCTS_KEY,
      pendingBackup.products
    );

    saveArray(
      SALES_KEY,
      pendingBackup.sales
    );

    saveArray(
      CUSTOMERS_KEY,
      pendingBackup.customers
    );

    saveArray(
      EXPENSES_KEY,
      pendingBackup.expenses
    );

    saveArray(
      INVOICES_KEY,
      pendingBackup.invoices
    );

    saveArray(
      INVENTORY_KEY,
      Array.isArray(
        pendingBackup.inventoryHistory
      )
        ? pendingBackup.inventoryHistory
        : []
    );

    const restoredSettings = {
      ...defaultSettings,
      ...(pendingBackup.settings || {})
    };

    saveSettings(restoredSettings);

    closeImportModal();

    loadSettings();

    updateBackupSummary();

    refreshOtherPages();

    showMessage(
      "Backup restored successfully."
    );

    notifyParent(
      "shopManagerDataRestored"
    );

  } catch (error) {
    console.error(error);

    showMessage(
      "Could not restore the backup."
    );
  }
}


/* ================================
   RESET ALL DATA
================================ */

function resetAllData() {
  const firstConfirm =
    confirm(
      "WARNING!\n\n" +
      "This will permanently delete all Shop Manager data from this device.\n\n" +
      "Do you want to continue?"
    );

  if (!firstConfirm) {
    return;
  }

  const secondConfirm =
    confirm(
      "FINAL CONFIRMATION\n\n" +
      "All products, sales, customers, expenses, invoices and inventory history will be deleted.\n\n" +
      "Press OK to permanently reset everything."
    );

  if (!secondConfirm) {
    return;
  }

  const keysToRemove = [
    PRODUCTS_KEY,
    SALES_KEY,
    CUSTOMERS_KEY,
    EXPENSES_KEY,
    INVOICES_KEY,
    INVENTORY_KEY,
    LAST_BACKUP_KEY
  ];

  keysToRemove.forEach(
    key => localStorage.removeItem(key)
  );

  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(defaultSettings)
  );

  loadSettings();

  updateBackupSummary();

  refreshOtherPages();

  showMessage(
    "All Shop Manager data has been reset."
  );

  notifyParent(
    "shopManagerDataReset"
  );
}


/* ================================
   REFRESH OTHER PAGES
================================ */

function refreshOtherPages() {
  try {
    window.parent.postMessage(
      {
        type: "shopManagerRefresh"
      },
      "*"
    );
  } catch (error) {
    console.log(error);
  }
}

function notifyParent(type) {
  try {
    window.parent.postMessage(
      {
        type
      },
      "*"
    );
  } catch (error) {
    console.log(error);
  }
}


/* ================================
   MESSAGE
================================ */

function showMessage(message) {
  const existing =
    document.querySelector(
      ".settings-message"
    );

  if (existing) {
    existing.remove();
  }

  const messageBox =
    document.createElement("div");

  messageBox.className =
    "settings-message";

  messageBox.textContent = message;

  Object.assign(
    messageBox.style,
    {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      zIndex: "10000",
      background: "#172033",
      color: "#ffffff",
      padding: "13px 18px",
      borderRadius: "10px",
      fontSize: "13px",
      fontWeight: "600",
      boxShadow:
        "0 10px 30px rgba(0,0,0,.2)"
    }
  );

  document.body.appendChild(
    messageBox
  );

  setTimeout(() => {
    messageBox.remove();
  }, 3000);
}


/* ================================
   EVENT LISTENERS
================================ */

document
  .getElementById("shopForm")
  .addEventListener(
    "submit",
    function (event) {
      event.preventDefault();
      saveShopInformation();
    }
  );


document
  .getElementById("saveBusinessSettings")
  .addEventListener(
    "click",
    saveBusinessSettings
  );


document
  .querySelectorAll(
    'input[name="appearance"]'
  )
  .forEach(radio => {
    radio.addEventListener(
      "change",
      function () {
        saveAppearance(
          this.value
        );
      }
    );
  });


document
  .getElementById("exportDataBtn")
  .addEventListener(
    "click",
    createBackup
  );


document
  .getElementById("importDataInput")
  .addEventListener(
    "change",
    handleImportFile
  );


document
  .getElementById("closeImportModal")
  .addEventListener(
    "click",
    closeImportModal
  );


document
  .getElementById("cancelImportBtn")
  .addEventListener(
    "click",
    closeImportModal
  );


document
  .getElementById("confirmImportBtn")
  .addEventListener(
    "click",
    restoreBackup
  );


document
  .getElementById("resetDataBtn")
  .addEventListener(
    "click",
    resetAllData
  );


document
  .getElementById("importModal")
  .addEventListener(
    "click",
    function (event) {
      if (event.target === this) {
        closeImportModal();
      }
    }
  );


document.addEventListener(
  "keydown",
  function (event) {
    if (
      event.key === "Escape"
    ) {
      closeImportModal();
    }
  }
);


/* ================================
   SYSTEM THEME CHANGES
================================ */

if (window.matchMedia) {
  const mediaQuery =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

  const handleThemeChange =
    function () {
      const settings =
        getSettings();

      if (
        settings.appearance ===
        "system"
      ) {
        applyAppearance("system");
      }
    };

  if (
    mediaQuery.addEventListener
  ) {
    mediaQuery.addEventListener(
      "change",
      handleThemeChange
    );
  } else if (
    mediaQuery.addListener
  ) {
    mediaQuery.addListener(
      handleThemeChange
    );
  }
}


/* ================================
   PUBLIC API
================================ */

window.ShopManagerSettings = {
  getSettings,
  saveSettings,
  updateBackupSummary,
  createBackup,
  resetAllData
};


/* ================================
   START
================================ */

loadSettings();
updateBackupSummary();
```
