const EXPENSES_KEY = "shopManagerExpenses";

let expenses = [];
let editingExpenseId = null;

/* =========================
   DOM ELEMENTS
========================= */

const addExpenseBtn =
  document.getElementById("addExpenseBtn");

const emptyAddExpenseBtn =
  document.getElementById("emptyAddExpenseBtn");

const expenseModal =
  document.getElementById("expenseModal");

const closeExpenseModal =
  document.getElementById("closeExpenseModal");

const cancelExpenseBtn =
  document.getElementById("cancelExpenseBtn");

const expenseForm =
  document.getElementById("expenseForm");

const expenseModalTitle =
  document.getElementById("expenseModalTitle");

const expenseName =
  document.getElementById("expenseName");

const expenseCategory =
  document.getElementById("expenseCategory");

const expenseAmount =
  document.getElementById("expenseAmount");

const expenseDate =
  document.getElementById("expenseDate");

const expenseDescription =
  document.getElementById("expenseDescription");

const expenseSearch =
  document.getElementById("expenseSearch");

const expensesTableBody =
  document.getElementById("expensesTableBody");

const totalExpenses =
  document.getElementById("totalExpenses");

const todayExpenses =
  document.getElementById("todayExpenses");

const monthExpenses =
  document.getElementById("monthExpenses");

const expenseRecords =
  document.getElementById("expenseRecords");


/* =========================
   LOAD / SAVE
========================= */

function loadExpenses() {

  try {

    expenses = JSON.parse(
      localStorage.getItem(EXPENSES_KEY) || "[]"
    );

  } catch {

    expenses = [];

  }

}


function saveExpenses() {

  localStorage.setItem(
    EXPENSES_KEY,
    JSON.stringify(expenses)
  );

}


/* =========================
   HELPERS
========================= */

function formatMoney(value) {

  return `Rs. ${Number(value || 0).toLocaleString()}`;

}


function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function getTodayString() {

  const date = new Date();

  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );

}


function getMonthString() {

  const date = new Date();

  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0")
  );

}


function getCategoryIcon(category) {

  const icons = {

    Rent: "🏢",

    Electricity: "⚡",

    Water: "💧",

    Internet: "🌐",

    Salary: "👨‍💼",

    Transport: "🚚",

    Supplies: "📦",

    Maintenance: "🔧",

    Other: "💸"

  };

  return icons[category] || "💸";

}


/* =========================
   MODAL
========================= */

function setDefaultDate() {

  expenseDate.value =
    getTodayString();

}


function openAddExpenseModal() {

  editingExpenseId = null;

  expenseModalTitle.textContent =
    "Add Expense";

  expenseForm.reset();

  setDefaultDate();

  expenseModal.classList.add("show");

  setTimeout(() => {
    expenseName.focus();
  }, 100);

}


function openEditExpenseModal(id) {

  const expense =
    expenses.find(
      item =>
        String(item.id) ===
        String(id)
    );

  if (!expense) {
    return;
  }

  editingExpenseId = expense.id;

  expenseModalTitle.textContent =
    "Edit Expense";

  expenseName.value =
    expense.name || "";

  expenseCategory.value =
    expense.category || "";

  expenseAmount.value =
    expense.amount || "";

  expenseDate.value =
    expense.date || getTodayString();

  expenseDescription.value =
    expense.description || "";

  expenseModal.classList.add("show");

  setTimeout(() => {
    expenseName.focus();
  }, 100);

}


function closeExpenseModalWindow() {

  expenseModal.classList.remove("show");

  editingExpenseId = null;

  expenseForm.reset();

}


addExpenseBtn.addEventListener(
  "click",
  openAddExpenseModal
);


emptyAddExpenseBtn.addEventListener(
  "click",
  openAddExpenseModal
);


closeExpenseModal.addEventListener(
  "click",
  closeExpenseModalWindow
);


cancelExpenseBtn.addEventListener(
  "click",
  closeExpenseModalWindow
);


/* =========================
   SAVE EXPENSE
========================= */

expenseForm.addEventListener(
  "submit",
  event => {

    event.preventDefault();

    const name =
      expenseName.value.trim();

    const category =
      expenseCategory.value;

    const amount =
      Number(expenseAmount.value);

    const date =
      expenseDate.value;

    const description =
      expenseDescription.value.trim();


    if (!name) {

      alert("Please enter an expense name.");

      expenseName.focus();

      return;

    }


    if (!category) {

      alert("Please select a category.");

      expenseCategory.focus();

      return;

    }


    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {

      alert("Please enter a valid expense amount.");

      expenseAmount.focus();

      return;

    }


    if (!date) {

      alert("Please select a date.");

      expenseDate.focus();

      return;

    }


    /* EDIT */

    if (editingExpenseId !== null) {

      const expense =
        expenses.find(
          item =>
            String(item.id) ===
            String(editingExpenseId)
        );

      if (!expense) {

        alert("Expense not found.");

        return;

      }


      expense.name =
        name;

      expense.category =
        category;

      expense.amount =
        amount;

      expense.date =
        date;

      expense.description =
        description;

    }


    /* ADD */

    else {

      const newExpense = {

        id:
          "E-" +
          Date.now()
            .toString()
            .slice(-8),

        name:
          name,

        category:
          category,

        amount:
          amount,

        date:
          date,

        description:
          description,

        createdAt:
          new Date().toISOString()

      };


      expenses.unshift(
        newExpense
      );

    }


    saveExpenses();

    closeExpenseModalWindow();

    renderExpenses(
      expenseSearch.value
    );

    updateStatistics();

    alert(
      editingExpenseId !== null
        ? "Expense updated successfully!"
        : "Expense added successfully!"
    );

  }
);


/* =========================
   RENDER EXPENSES
========================= */

function renderExpenses(searchTerm = "") {

  loadExpenses();

  const search =
    searchTerm.trim().toLowerCase();


  let filteredExpenses =
    expenses;


  if (search) {

    filteredExpenses =
      expenses.filter(expense => {

        return (

          String(expense.name || "")
            .toLowerCase()
            .includes(search) ||

          String(expense.category || "")
            .toLowerCase()
            .includes(search) ||

          String(expense.description || "")
            .toLowerCase()
            .includes(search) ||

          String(expense.date || "")
            .toLowerCase()
            .includes(search)

        );

      });

  }


  if (filteredExpenses.length === 0) {

    expensesTableBody.innerHTML = `

      <tr>

        <td colspan="6">

          <div class="empty-expenses">

            <div class="empty-expenses-icon">
              💸
            </div>

            <h2>
              ${
                search
                  ? "No expenses found"
                  : "No expenses yet"
              }
            </h2>

            <p>
              ${
                search
                  ? "Try another search."
                  : "Add your first expense to start tracking."
              }
            </p>

            ${
              search
                ? ""
                : `
                  <button
                    class="add-expense-btn"
                    onclick="openAddExpenseModal()"
                  >
                    + Add First Expense
                  </button>
                `
            }

          </div>

        </td>

      </tr>

    `;

    return;

  }


  expensesTableBody.innerHTML =
    filteredExpenses
      .map(expense => {

        const icon =
          getCategoryIcon(
            expense.category
          );


        const formattedDate =
          new Date(
            expense.date + "T00:00:00"
          ).toLocaleDateString();


        return `

          <tr>

            <td>

              <div class="expense-name">

                <div class="expense-icon">
                  ${icon}
                </div>

                <div>

                  <strong>
                    ${escapeHTML(expense.name)}
                  </strong>

                  <small>
                    ${escapeHTML(expense.id)}
                  </small>

                </div>

              </div>

            </td>


            <td>

              <span class="expense-category">
                ${escapeHTML(expense.category)}
              </span>

            </td>


            <td>
              ${escapeHTML(formattedDate)}
            </td>


            <td>

              <div class="expense-description">

                ${
                  escapeHTML(
                    expense.description ||
                    "—"
                  )
                }

              </div>

            </td>


            <td>

              <strong class="expense-amount">
                ${formatMoney(expense.amount)}
              </strong>

            </td>


            <td>

              <div class="expense-actions-cell">

                <button
                  class="action-btn"
                  onclick="openEditExpenseModal('${escapeHTML(expense.id)}')"
                  title="Edit expense"
                >
                  ✏️
                </button>

                <button
                  class="action-btn delete-btn"
                  onclick="deleteExpense('${escapeHTML(expense.id)}')"
                  title="Delete expense"
                >
                  🗑️
                </button>

              </div>

            </td>

          </tr>

        `;

      })
      .join("");

}


/* =========================
   DELETE EXPENSE
========================= */

function deleteExpense(id) {

  const expense =
    expenses.find(
      item =>
        String(item.id) ===
        String(id)
    );


  if (!expense) {
    return;
  }


  const confirmed =
    confirm(
      `Delete "${expense.name}"?\n\nAmount: ${formatMoney(expense.amount)}`
    );


  if (!confirmed) {
    return;
  }


  expenses =
    expenses.filter(
      item =>
        String(item.id) !==
        String(id)
    );


  saveExpenses();

  renderExpenses(
    expenseSearch.value
  );

  updateStatistics();

}


/* =========================
   SEARCH
========================= */

expenseSearch.addEventListener(
  "input",
  () => {

    renderExpenses(
      expenseSearch.value
    );

  }
);


/* =========================
   STATISTICS
========================= */

function updateStatistics() {

  loadExpenses();


  let total = 0;

  let todayTotal = 0;

  let monthTotal = 0;


  const today =
    getTodayString();

  const month =
    getMonthString();


  expenses.forEach(expense => {

    const amount =
      Number(expense.amount || 0);


    total += amount;


    if (
      expense.date === today
    ) {

      todayTotal += amount;

    }


    if (
      String(expense.date || "")
        .startsWith(month)
    ) {

      monthTotal += amount;

    }

  });


  totalExpenses.textContent =
    formatMoney(total);

  todayExpenses.textContent =
    formatMoney(todayTotal);

  monthExpenses.textContent =
    formatMoney(monthTotal);

  expenseRecords.textContent =
    expenses.length;

}


/* =========================
   MODAL CONTROLS
========================= */

expenseModal.addEventListener(
  "click",
  event => {

    if (
      event.target ===
      expenseModal
    ) {

      closeExpenseModalWindow();

    }

  }
);


document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape" &&
      expenseModal.classList.contains("show")
    ) {

      closeExpenseModalWindow();

    }

  }
);


/* =========================
   INITIALIZE
========================= */

loadExpenses();

renderExpenses();

updateStatistics();


/* =========================
   GLOBAL FUNCTIONS
========================= */

window.openAddExpenseModal =
  openAddExpenseModal;

window.openEditExpenseModal =
  openEditExpenseModal;

window.deleteExpense =
  deleteExpense;


/* =========================
   SHOP MANAGER EXPENSES API
========================= */

window.ShopManagerExpenses = {

  getExpenses: () =>
    expenses,

  getTotalExpenses: () =>
    expenses.reduce(
      (total, expense) =>
        total +
        Number(expense.amount || 0),
      0
    ),

  refresh: () => {

    loadExpenses();

    renderExpenses();

    updateStatistics();

  }

};
```
