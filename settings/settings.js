/* =========================================
   SHOP MANAGER SETTINGS
   ROBUST VERSION
   ========================================= */

"use strict";

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
   HELPERS
   ========================================= */

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    return JSON.parse(value);

  } catch (error) {
    console.error("Shop Manager: read error:", key, error);
    return fallback;
  }
}


function writeJSON(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;

  } catch (error) {
    console.error("Shop Manager: write error:", key, error);
    return false;
  }
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

  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value;
  }

  return {};
}


function saveSettings(settings) {
  return writeJSON(
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
   MESSAGE
   ========================================= */

function showMessage(text) {
  const oldMessage =
    document.querySelector(
      ".settings-message"
    );

  if (oldMessage) {
    oldMessage.remove();
  }

  const message =
    document.createElement("div");

  message.className =
    "settings-message";

  message.textContent = text;

  Object.assign(
    message.style,
    {
      position: "fixed",
      left: "50%",
      bottom: "25px",
      transform: "translateX(-50%)",
      zIndex: "999999",
      padding: "13px 20px",
      borderRadius: "10px",
      background: "#172033",
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: "600",
      boxShadow: "0 8px 25px rgba(0,0,0,.25)"
    }
  );

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

  settings.shopName =
    document.getElementById("shopName")?.value.trim() || "";

  settings.ownerName =
    document.getElementById("ownerName")?.value.trim() || "";

  settings.phone =
    document.getElementById("shopPhone")?.value.trim() || "";

  settings.email =
    document.getElementById("shopEmail")?.value.trim() || "";

  settings.address =
    document.getElementById("shopAddress")?.value.trim() || "";


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

  settings.currency =
    document.getElementById("currency")?.value || "Rs";

  settings.invoicePrefix =
    document.getElementById("invoicePrefix")?.value.trim() || "INV";


  let threshold =
    Number(
      document.getElementById(
        "lowStockThreshold"
      )?.value
    );

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
  const values = {
    backupProductsCount:
      getArray(PRODUCTS_KEY).length,

    backupSalesCount:
      getArray(SALES_KEY).length,

    backupCustomersCount:
      getArray(CUSTOMERS_KEY).length,

    backupExpensesCount:
      getArray(EXPENSES_KEY).length,

    backupInvoicesCount:
      getArray(INVOICES_KEY).length,

    backupInventoryCount:
      getArray(INVENTORY_KEY).length
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
          type: "application/json"
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

    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);


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
    event.target.files?.[0];

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


  const required = [
    "products",
    "sales",
    "customers",
    "expenses",
    "invoices"
  ];


  for (const key of required) {

    if (
      !Array.isArray(
        backup[key]
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
    window.confirm(
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
   RESET ALL DATA
   ========================================= */

function resetAllData() {

  const first =
    window.confirm(
      "WARNING!\n\n" +
      "This will delete all Shop Manager data from this device.\n\n" +
      "Continue?"
    );


  if (!first) {
    return;
  }


  const second =
    window.confirm(
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
   REFRESH DASHBOARD
   ========================================= */

function refreshParent() {

  try {

    if (
      window.parent &&
      window.parent !== window
    ) {

      window.parent.postMessage(
        {
          type:
            "shopManagerRefresh"
        },
        "*"
      );


      window.parent.postMessage(
        {
          type:
            "shopManagerDataChanged"
        },
        "*"
      );
    }

  } catch (error) {

    console.log(
      "Parent refresh unavailable."
    );
  }
}


/* =========================================
   SETUP BUTTON EVENTS
   ========================================= */

function setupEvents() {

  console.log(
    "Shop Manager Settings: attaching events..."
  );


  /* SHOP FORM */

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


  /* SAVE BUSINESS */

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


  /* APPEARANCE */

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


  /* EXPORT */

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


  /* IMPORT */

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


  /* CLOSE IMPORT */

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


  /* CANCEL IMPORT */

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


  /* RESTORE */

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


  /* RESET */

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


  /* CLOSE MODAL WHEN CLICKING OUTSIDE */

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


  /* ESCAPE */

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


  console.log(
    "Shop Manager Settings: events attached successfully."
  );
}


/* =========================================
   SYSTEM THEME
   ========================================= */

function setupSystemThemeListener() {

  if (!window.matchMedia) {
    return;
  }


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
      "change",
      systemThemeChanged
    );
  }
}


/* =========================================
   GLOBAL FALLBACK FUNCTIONS
   ========================================= */

window.saveShopInformation =
  saveShopInformation;

window.saveBusinessSettings =
  saveBusinessSettings;

window.saveAppearance =
  saveAppearance;

window.createBackup =
  createBackup;

window.handleImportFile =
  handleImportFile;

window.openImportModal =
  openImportModal;

window.closeImportModal =
  closeImportModal;

window.restoreBackup =
  restoreBackup;

window.resetAllData =
  resetAllData;


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
    resetAllData,

  refresh:
    function () {
      loadSettings();
      updateBackupSummary();
    }
};


/* =========================================
   START
   ========================================= */

function startSettings() {

  console.log(
    "SHOP MANAGER SETTINGS JS LOADED"
  );

  loadSettings();

  setupEvents();

  updateBackupSummary();

  setupSystemThemeListener();

  console.log(
    "SHOP MANAGER SETTINGS READY"
  );
}


/*
   Works whether this file is loaded
   before or after DOM parsing.
*/

if (
  document.readyState === "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    startSettings
  );

} else {

  startSettings();
}
```
