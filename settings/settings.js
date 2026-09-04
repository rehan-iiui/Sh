/* =========================================
   SHOP MANAGER SETTINGS
   ========================================= */

const SETTINGS_KEY = "shopManagerSettings";
const PRODUCTS_KEY = "shopManagerProducts";
const SALES_KEY = "shopManagerSales";
const CUSTOMERS_KEY = "shopManagerCustomers";
const EXPENSES_KEY = "shopManagerExpenses";
const INVOICES_KEY = "shopManagerInvoices";
const INVENTORY_KEY = "shopManagerInventoryHistory";
const LAST_BACKUP_KEY = "shopManagerLastBackup";

const BACKUP_VERSION = "2.0";

let pendingBackup = null;


/* =========================================
   BASIC HELPERS
   ========================================= */

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    return JSON.parse(value);
  } catch (error) {
    console.error("Could not read:", key, error);
    return fallback;
  }
}


function writeJSON(key, value) {
  localStorage.setItem(
    key,
    JSON.stringify(value)
  );
}


function getArray(key) {
  const value = readJSON(key, []);
  return Array.isArray(value) ? value : [];
}


function getSettings() {
  const value = readJSON(
    SETTINGS_KEY,
    {}
  );

  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  )
    ? value
    : {};
}


function saveSettings(settings) {
  writeJSON(
    SETTINGS_KEY,
    settings
  );
}


function formatDate(value) {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString();
}


/* =========================================
   DEFAULT SETTINGS
   ========================================= */

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


/* =========================================
   MESSAGE
   ========================================= */

function showMessage(text) {
  const oldMessage =
    document.querySelector(".settings-message");

  if (oldMessage) {
    oldMessage.remove();
  }

  const message =
    document.createElement("div");

  message.className =
    "settings-message";

  message.textContent = text;

  message.style.position = "fixed";
  message.style.left = "50%";
  message.style.bottom = "25px";
  message.style.transform = "translateX(-50%)";
  message.style.zIndex = "99999";
  message.style.padding = "13px 20px";
  message.style.borderRadius = "10px";
  message.style.background = "#172033";
  message.style.color = "#ffffff";
  message.style.fontSize = "14px";
  message.style.fontWeight = "600";
  message.style.boxShadow =
    "0 8px 25px rgba(0,0,0,.25)";

  document.body.appendChild(message);

  setTimeout(function () {
    if (message.parentNode) {
      message.remove();
    }
  }, 3000);
}


/* =========================================
   LOAD SETTINGS
   ========================================= */

function loadSettings() {
  const saved = getSettings();

  const settings = {
    ...defaultSettings,
    ...saved
  };

  const shopName =
    document.getElementById("shopName");

  const ownerName =
    document.getElementById("ownerName");

  const shopPhone =
    document.getElementById("shopPhone");

  const shopEmail =
    document.getElementById("shopEmail");

  const shopAddress =
    document.getElementById("shopAddress");

  const currency =
    document.getElementById("currency");

  const invoicePrefix =
    document.getElementById("invoicePrefix");

  const lowStockThreshold =
    document.getElementById("lowStockThreshold");


  if (shopName) {
    shopName.value =
      settings.shopName || "";
  }

  if (ownerName) {
    ownerName.value =
      settings.ownerName || "";
  }

  if (shopPhone) {
    shopPhone.value =
      settings.phone || "";
  }

  if (shopEmail) {
    shopEmail.value =
      settings.email || "";
  }

  if (shopAddress) {
    shopAddress.value =
      settings.address || "";
  }

  if (currency) {
    currency.value =
      settings.currency || "Rs";
  }

  if (invoicePrefix) {
    invoicePrefix.value =
      settings.invoicePrefix || "INV";
  }

  if (lowStockThreshold) {
    lowStockThreshold.value =
      settings.lowStockThreshold ?? 5;
  }


  const appearance =
    settings.appearance || "system";

  const radio =
    document.querySelector(
      'input[name="appearance"][value="' +
      appearance +
      '"]'
    );

  if (radio) {
    radio.checked = true;
  }

  applyAppearance(appearance);
}


/* =========================================
   SAVE SHOP INFORMATION
   ========================================= */

function saveShopInformation() {
  const settings = {
    ...defaultSettings,
    ...getSettings()
  };

  const shopName =
    document.getElementById("shopName");

  const ownerName =
    document.getElementById("ownerName");

  const shopPhone =
    document.getElementById("shopPhone");

  const shopEmail =
    document.getElementById("shopEmail");

  const shopAddress =
    document.getElementById("shopAddress");


  settings.shopName =
    shopName ? shopName.value.trim() : "";

  settings.ownerName =
    ownerName ? ownerName.value.trim() : "";

  settings.phone =
    shopPhone ? shopPhone.value.trim() : "";

  settings.email =
    shopEmail ? shopEmail.value.trim() : "";

  settings.address =
    shopAddress ? shopAddress.value.trim() : "";


  saveSettings(settings);

  showMessage(
    "Shop information saved successfully."
  );

  refreshParent();
}


/* =========================================
   SAVE BUSINESS SETTINGS
   ========================================= */

function saveBusinessSettings() {
  const settings = {
    ...defaultSettings,
    ...getSettings()
  };

  const currency =
    document.getElementById("currency");

  const invoicePrefix =
    document.getElementById("invoicePrefix");

  const lowStockThreshold =
    document.getElementById("lowStockThreshold");


  settings.currency =
    currency
      ? currency.value
      : "Rs";

  settings.invoicePrefix =
    invoicePrefix
      ? invoicePrefix.value.trim() || "INV"
      : "INV";


  let threshold =
    lowStockThreshold
      ? Number(lowStockThreshold.value)
      : 5;

  if (
    !Number.isFinite(threshold) ||
    threshold < 0
  ) {
    threshold = 5;
  }

  settings.lowStockThreshold =
    Math.floor(threshold);


  saveSettings(settings);

  showMessage(
    "Business settings saved successfully."
  );

  refreshParent();
}


/* =========================================
   APPEARANCE
   ========================================= */

function applyAppearance(mode) {
  let dark = false;

  if (mode === "dark") {
    dark = true;
  }

  if (
    mode === "system" &&
    window.matchMedia
  ) {
    dark =
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
  const settings = {
    ...defaultSettings,
    ...getSettings()
  };

  settings.appearance = mode;

  saveSettings(settings);

  applyAppearance(mode);

  showMessage(
    "Appearance updated."
  );

  refreshParent();
}


/* =========================================
   BACKUP SUMMARY
   ========================================= */

function updateBackupSummary() {
  const products =
    getArray(PRODUCTS_KEY);

  const sales =
    getArray(SALES_KEY);

  const customers =
    getArray(CUSTOMERS_KEY);

  const expenses =
    getArray(EXPENSES_KEY);

  const invoices =
    getArray(INVOICES_KEY);

  const inventory =
    getArray(INVENTORY_KEY);


  const elements = {
    backupProductsCount:
      products.length,

    backupSalesCount:
      sales.length,

    backupCustomersCount:
      customers.length,

    backupExpensesCount:
      expenses.length,

    backupInvoicesCount:
      invoices.length,

    backupInventoryCount:
      inventory.length
  };


  Object.keys(elements).forEach(
    function (id) {
      const element =
        document.getElementById(id);

      if (element) {
        element.textContent =
          elements[id];
      }
    }
  );


  updateBackupStatus();
}


/* =========================================
   BACKUP STATUS
   ========================================= */

function updateBackupStatus() {
  const lastBackup =
    localStorage.getItem(
      LAST_BACKUP_KEY
    );

  const title =
    document.getElementById(
      "backupStatusTitle"
    );

  const text =
    document.getElementById(
      "backupStatusText"
    );

  const time =
    document.getElementById(
      "lastBackupTime"
    );


  if (!lastBackup) {
    if (title) {
      title.textContent =
        "Your data is stored locally";
    }

    if (text) {
      text.textContent =
        "Create a backup regularly to protect your shop data.";
    }

    if (time) {
      time.textContent =
        "Never";
    }

    return;
  }


  const formatted =
    formatDate(lastBackup);

  if (title) {
    title.textContent =
      "Backup available";
  }

  if (text) {
    text.textContent =
      "Your latest backup was created on " +
      formatted +
      ".";
  }

  if (time) {
    time.textContent =
      formatted;
  }
}


/* =========================================
   CREATE BACKUP
   ========================================= */

function createBackup() {
  try {
    const backup = {
      backupVersion:
        BACKUP_VERSION,

      exportedAt:
        new Date().toISOString(),

      products:
        getArray(PRODUCTS_KEY),

      sales:
        getArray(SALES_KEY),

      customers:
        getArray(CUSTOMERS_KEY),

      expenses:
        getArray(EXPENSES_KEY),

      invoices:
        getArray(INVOICES_KEY),

      inventoryHistory:
        getArray(INVENTORY_KEY),

      settings:
        getSettings()
    };


    const json =
      JSON.stringify(
        backup,
        null,
        2
      );


    const blob =
      new Blob(
        [json],
        {
          type:
            "application/json"
        }
      );


    const url =
      URL.createObjectURL(blob);


    const shopName =
      (
        backup.settings.shopName ||
        "shop-manager"
      )
      .replace(
        /[^a-z0-9-_]/gi,
        "-"
      )
      .toLowerCase();


    const date =
      new Date()
        .toISOString()
        .slice(0, 10);


    const filename =
      shopName +
      "-backup-" +
      date +
      ".json";


    const link =
      document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);


    const backupTime =
      new Date().toISOString();

    localStorage.setItem(
      LAST_BACKUP_KEY,
      backupTime
    );


    updateBackupSummary();

    showMessage(
      "Backup downloaded successfully."
    );

  } catch (error) {
    console.error(
      "Backup error:",
      error
    );

    showMessage(
      "Backup could not be created."
    );
  }
}


/* =========================================
   IMPORT FILE
   ========================================= */

function handleImportFile(event) {
  const file =
    event.target.files &&
    event.target.files[0];

  if (!file) {
    return;
  }


  const reader =
    new FileReader();


  reader.onload =
    function () {
      try {
        const backup =
          JSON.parse(
            reader.result
          );


        if (
          !isValidBackup(backup)
        ) {
          throw new Error(
            "Invalid backup"
          );
        }


        pendingBackup =
          backup;


        showImportPreview(
          backup
        );

        openImportModal();

      } catch (error) {
        console.error(
          "Import error:",
          error
        );

        showMessage(
          "Invalid Shop Manager backup file."
        );
      }


      event.target.value = "";
    };


  reader.onerror =
    function () {
      showMessage(
        "Could not read the backup file."
      );

      event.target.value = "";
    };


  reader.readAsText(file);
}


/* =========================================
   VALIDATE BACKUP
   ========================================= */

function isValidBackup(backup) {
  if (
    !backup ||
    typeof backup !== "object" ||
    Array.isArray(backup)
  ) {
    return false;
  }


  const required =
    [
      "products",
      "sales",
      "customers",
      "expenses",
      "invoices"
    ];


  for (
    let i = 0;
    i < required.length;
    i++
  ) {
    if (
      !Array.isArray(
        backup[required[i]]
      )
    ) {
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


/* =========================================
   IMPORT PREVIEW
   ========================================= */

function showImportPreview(backup) {
  const values = {
    importBackupDate:
      formatDate(
        backup.exportedAt
      ),

    importBackupVersion:
      backup.backupVersion ||
      "1.0",

    importProductsCount:
      backup.products.length,

    importSalesCount:
      backup.sales.length,

    importCustomersCount:
      backup.customers.length,

    importExpensesCount:
      backup.expenses.length,

    importInvoicesCount:
      backup.invoices.length,

    importInventoryCount:
      Array.isArray(
        backup.inventoryHistory
      )
        ? backup.inventoryHistory.length
        : 0
  };


  Object.keys(values).forEach(
    function (id) {
      const element =
        document.getElementById(id);

      if (element) {
        element.textContent =
          values[id];
      }
    }
  );
}


/* =========================================
   IMPORT MODAL
   ========================================= */

function openImportModal() {
  const modal =
    document.getElementById(
      "importModal"
    );

  if (modal) {
    modal.classList.add(
      "active"
    );
  }
}


function closeImportModal() {
  const modal =
    document.getElementById(
      "importModal"
    );

  if (modal) {
    modal.classList.remove(
      "active"
    );
  }

  pendingBackup = null;
}


/* =========================================
   RESTORE BACKUP
   ========================================= */

function restoreBackup() {
  if (!pendingBackup) {
    showMessage(
      "No backup selected."
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
    writeJSON(
      PRODUCTS_KEY,
      pendingBackup.products
    );

    writeJSON(
      SALES_KEY,
      pendingBackup.sales
    );

    writeJSON(
      CUSTOMERS_KEY,
      pendingBackup.customers
    );

    writeJSON(
      EXPENSES_KEY,
      pendingBackup.expenses
    );

    writeJSON(
      INVOICES_KEY,
      pendingBackup.invoices
    );

    writeJSON(
      INVENTORY_KEY,
      Array.isArray(
        pendingBackup.inventoryHistory
      )
        ? pendingBackup.inventoryHistory
        : []
    );


    const settings = {
      ...defaultSettings,
      ...(pendingBackup.settings || {})
    };

    saveSettings(settings);


    closeImportModal();

    loadSettings();

    updateBackupSummary();

    refreshParent();

    showMessage(
      "Backup restored successfully."
    );

  } catch (error) {
    console.error(
      "Restore error:",
      error
    );

    showMessage(
      "Backup could not be restored."
    );
  }
}


/* =========================================
   RESET EVERYTHING
   ========================================= */

function resetAllData() {
  const first =
    confirm(
      "WARNING!\n\n" +
      "This will delete all Shop Manager data from this device.\n\n" +
      "Continue?"
    );


  if (!first) {
    return;
  }


  const second =
    confirm(
      "FINAL CONFIRMATION\n\n" +
      "Products, sales, customers, expenses, invoices and inventory history will be deleted.\n\n" +
      "Are you absolutely sure?"
    );


  if (!second) {
    return;
  }


  localStorage.removeItem(
    PRODUCTS_KEY
  );

  localStorage.removeItem(
    SALES_KEY
  );

  localStorage.removeItem(
    CUSTOMERS_KEY
  );

  localStorage.removeItem(
    EXPENSES_KEY
  );

  localStorage.removeItem(
    INVOICES_KEY
  );

  localStorage.removeItem(
    INVENTORY_KEY
  );

  localStorage.removeItem(
    LAST_BACKUP_KEY
  );


  saveSettings({
    ...defaultSettings
  });


  loadSettings();

  updateBackupSummary();

  refreshParent();

  showMessage(
    "All Shop Manager data has been reset."
  );
}


/* =========================================
   REFRESH MAIN DASHBOARD
   ========================================= */

function refreshParent() {
  try {
    window.parent.postMessage(
      {
        type:
          "shopManagerRefresh"
      },
      "*"
    );
  } catch (error) {
    console.log(
      "Parent refresh unavailable."
    );
  }


  try {
    window.parent.postMessage(
      {
        type:
          "shopManagerDataChanged"
      },
      "*"
    );
  } catch (error) {
    console.log(
      "Data change message unavailable."
    );
  }
}


/* =========================================
   BUTTON EVENTS
   ========================================= */

function setupEvents() {

  /* Shop form */

  const shopForm =
    document.getElementById(
      "shopForm"
    );

  if (shopForm) {
    shopForm.addEventListener(
      "submit",
      function (event) {
        event.preventDefault();

        saveShopInformation();
      }
    );
  }


  /* Business settings */

  const businessButton =
    document.getElementById(
      "saveBusinessSettings"
    );

  if (businessButton) {
    businessButton.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        saveBusinessSettings();
      }
    );
  }


  /* Appearance */

  const appearanceButtons =
    document.querySelectorAll(
      'input[name="appearance"]'
    );


  appearanceButtons.forEach(
    function (radio) {
      radio.addEventListener(
        "change",
        function () {
          saveAppearance(
            this.value
          );
        }
      );
    }
  );


  /* Export */

  const exportButton =
    document.getElementById(
      "exportDataBtn"
    );

  if (exportButton) {
    exportButton.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        createBackup();
      }
    );
  }


  /* Import */

  const importInput =
    document.getElementById(
      "importDataInput"
    );

  if (importInput) {
    importInput.addEventListener(
      "change",
      handleImportFile
    );
  }


  /* Close modal */

  const closeButton =
    document.getElementById(
      "closeImportModal"
    );

  if (closeButton) {
    closeButton.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        closeImportModal();
      }
    );
  }


  /* Cancel import */

  const cancelButton =
    document.getElementById(
      "cancelImportBtn"
    );

  if (cancelButton) {
    cancelButton.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        closeImportModal();
      }
    );
  }


  /* Restore */

  const restoreButton =
    document.getElementById(
      "confirmImportBtn"
    );

  if (restoreButton) {
    restoreButton.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        restoreBackup();
      }
    );
  }


  /* Reset */

  const resetButton =
    document.getElementById(
      "resetDataBtn"
    );

  if (resetButton) {
    resetButton.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        resetAllData();
      }
    );
  }


  /* Close modal by clicking outside */

  const modal =
    document.getElementById(
      "importModal"
    );

  if (modal) {
    modal.addEventListener(
      "click",
      function (event) {
        if (
          event.target === modal
        ) {
          closeImportModal();
        }
      }
    );
  }


  /* Escape */

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
}


/* =========================================
   SYSTEM DARK MODE
   ========================================= */

if (window.matchMedia) {

  const media =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    );


  const systemThemeChanged =
    function () {
      const settings =
        getSettings();

      if (
        settings.appearance ===
        "system"
      ) {
        applyAppearance(
          "system"
        );
      }
    };


  if (
    media.addEventListener
  ) {
    media.addEventListener(
      "change",
      systemThemeChanged
    );
  } else if (
    media.addListener
  ) {
    media.addListener(
      systemThemeChanged
    );
  }
}


/* =========================================
   PUBLIC API
   ========================================= */

window.ShopManagerSettings = {
  getSettings:
    getSettings,

  saveSettings:
    saveSettings,

  updateBackupSummary:
    updateBackupSummary,

  createBackup:
    createBackup,

  resetAllData:
    resetAllData
};


/* =========================================
   START APP
   ========================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {
    loadSettings();

    setupEvents();

    updateBackupSummary();
  }
);
```
