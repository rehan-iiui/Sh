id="k7m2qp"
const SETTINGS_KEY = "shopManagerSettings";

const DATA_KEYS = {
  products: "shopManagerProducts",
  sales: "shopManagerSales",
  customers: "shopManagerCustomers",
  expenses: "shopManagerExpenses",
  invoices: "shopManagerInvoices",
  settings: SETTINGS_KEY
};

const defaultSettings = {
  shopName: "My Shop",
  ownerName: "",
  phone: "",
  email: "",
  address: "",
  currency: "Rs",
  invoicePrefix: "INV",
  lowStockThreshold: 5,
  theme: "light"
};

const $ = (id) => document.getElementById(id);

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY));

    return {
      ...defaultSettings,
      ...(saved || {})
    };
  } catch (error) {
    return { ...defaultSettings };
  }
}

function saveSettings() {
  const settings = {
    shopName: $("shopName").value.trim(),
    ownerName: $("ownerName").value.trim(),
    phone: $("shopPhone").value.trim(),
    email: $("shopEmail").value.trim(),
    address: $("shopAddress").value.trim(),
    currency: $("currency").value,
    invoicePrefix: $("invoicePrefix").value.trim() || "INV",
    lowStockThreshold:
      Math.max(1, Number($("lowStockThreshold").value) || 5),
    theme:
      document.querySelector('input[name="theme"]:checked')?.value || "light"
  };

  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

  applyTheme(settings.theme);
  showSaveMessage("Settings saved successfully!");
}

function loadForm() {
  const settings = loadSettings();

  $("shopName").value = settings.shopName;
  $("ownerName").value = settings.ownerName;
  $("shopPhone").value = settings.phone;
  $("shopEmail").value = settings.email;
  $("shopAddress").value = settings.address;
  $("currency").value = settings.currency;
  $("invoicePrefix").value = settings.invoicePrefix;
  $("lowStockThreshold").value = settings.lowStockThreshold;

  const themeInput = document.querySelector(
    `input[name="theme"][value="${settings.theme}"]`
  );

  if (themeInput) {
    themeInput.checked = true;
  }

  applyTheme(settings.theme);
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else if (theme === "system") {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    document.documentElement.setAttribute(
      "data-theme",
      prefersDark ? "dark" : "light"
    );
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
}

function showSaveMessage(message) {
  const messageBox = $("saveMessage");

  messageBox.textContent = message;
  messageBox.classList.add("show");

  clearTimeout(window.saveMessageTimer);

  window.saveMessageTimer = setTimeout(() => {
    messageBox.classList.remove("show");
  }, 2500);
}

/* EXPORT DATA */

function exportData() {
  const backup = {
    app: "Shop Manager",
    version: "1.0",
    exportedAt: new Date().toISOString(),
    data: {}
  };

  Object.entries(DATA_KEYS).forEach(([name, key]) => {
    const value = localStorage.getItem(key);

    try {
      backup.data[name] = value ? JSON.parse(value) : [];
    } catch (error) {
      backup.data[name] = value;
    }
  });

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;

  const date = new Date().toISOString().slice(0, 10);
  link.download = `shop-manager-backup-${date}.json`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  showSaveMessage("Backup exported successfully!");
}

/* IMPORT DATA */

function importData() {
  $("importFile").click();
}

function handleImport(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    try {
      const backup = JSON.parse(reader.result);

      if (
        !backup ||
        backup.app !== "Shop Manager" ||
        !backup.data
      ) {
        throw new Error("Invalid backup file");
      }

      const confirmed = confirm(
        "Import this backup?\n\nExisting Shop Manager data will be replaced."
      );

      if (!confirmed) {
        $("importFile").value = "";
        return;
      }

      Object.entries(DATA_KEYS).forEach(([name, key]) => {
        if (Object.prototype.hasOwnProperty.call(backup.data, name)) {
          localStorage.setItem(
            key,
            JSON.stringify(backup.data[name])
          );
        }
      });

      loadForm();

      showSaveMessage("Backup imported successfully!");

      setTimeout(() => {
        location.reload();
      }, 1200);

    } catch (error) {
      alert(
        "Could not import this file.\n\nPlease select a valid Shop Manager backup."
      );
    }

    $("importFile").value = "";
  };

  reader.readAsText(file);
}

/* RESET DATA */

function resetAllData() {
  const firstConfirm = confirm(
    "Are you sure you want to reset Shop Manager?\n\nAll products, sales, customers, expenses, invoices and settings will be deleted."
  );

  if (!firstConfirm) {
    return;
  }

  const secondConfirm = confirm(
    "This action cannot be undone.\n\nPress OK to permanently delete all Shop Manager data."
  );

  if (!secondConfirm) {
    return;
  }

  Object.values(DATA_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });

  localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(defaultSettings)
  );

  alert("Shop Manager has been reset.");

  location.reload();
}

/* SYSTEM THEME */

function watchSystemTheme() {
  const mediaQuery = window.matchMedia(
    "(prefers-color-scheme: dark)"
  );

  mediaQuery.addEventListener("change", () => {
    const settings = loadSettings();

    if (settings.theme === "system") {
      applyTheme("system");
    }
  });
}

/* EVENTS */

$("saveSettingsBtn").addEventListener("click", saveSettings);

$("exportDataBtn").addEventListener("click", exportData);

$("importDataBtn").addEventListener("click", importData);

$("importFile").addEventListener("change", handleImport);

$("resetDataBtn").addEventListener("click", resetAllData);

document.querySelectorAll('input[name="theme"]').forEach((input) => {
  input.addEventListener("change", () => {
    applyTheme(input.value);
  });
});

/* INITIALIZE */

loadForm();
watchSystemTheme();

/* PUBLIC API */

window.ShopManagerSettings = {
  loadSettings,
  saveSettings,
  exportData,
  importData,
  resetAllData,
  applyTheme
};
```
