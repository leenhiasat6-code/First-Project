// Expense Tracker - Frontend Logic

// API URL
const API_URL = "http://localhost:3000/api/expenses";

// Store the expenses returned from the server
let expenses = [];

let currentSort = {
    column: "", direction: "asc"
};

// DOM ELEMENTS

// Add Expense Form
const expenseForm = document.getElementById("expenseForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

// Add Expense Error Messages
const titleError = document.getElementById("titleError");
const amountError = document.getElementById("amountError");
const categoryError = document.getElementById("categoryError");
const dateError = document.getElementById("dateError");

// Table
const expensesTableBody = document.getElementById("expensesTableBody");

// Category Filter
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");

// Loading Spinner
const loadingSpinner = document.getElementById("loadingSpinner");

// Empty Message
const emptyMessage = document.getElementById("emptyMessage");

// Alert Container
const alertContainer = document.getElementById("alertContainer");

// Summary Cards
const totalAmount = document.getElementById("totalAmount");
const expenseCount = document.getElementById("expenseCount");
const highestExpense = document.getElementById("highestExpense");

// Edit Modal
const editExpenseModalElement =
    document.getElementById("editExpenseModal");

const editExpenseForm =
    document.getElementById("editExpenseForm");

const editExpenseId =
    document.getElementById("editExpenseId");

const editTitle =
    document.getElementById("editTitle");

const editAmount =
    document.getElementById("editAmount");

const editCategory =
    document.getElementById("editCategory");

const editDate =
    document.getElementById("editDate");

// Edit Error Messages
const editTitleError =
    document.getElementById("editTitleError");

const editAmountError =
    document.getElementById("editAmountError");

const editCategoryError =
    document.getElementById("editCategoryError");

const editDateError =
    document.getElementById("editDateError");

// Bootstrap Modal
const editModal = new bootstrap.Modal(
    editExpenseModalElement
);
// Category Chart
const categoryChartCanvas =
    document.getElementById("categoryChart");

let categoryChart = null;

// PAGE LOAD

document.addEventListener("DOMContentLoaded", function () {
    refresh();
});


// GET EXPENSES
async function getExpenses() {
    const response = await fetch(API_URL);

    // Check if the server returned an error
    if (!response.ok) {
        let message = "Failed to load expenses.";

        try {
            const errorData = await response.json();

            if (errorData.message) {
                message = errorData.message;
            }
        } catch (error) {
            // Use the default error message
        }

        throw new Error(message);
    }

    // Convert response to JSON
    const data = await response.json();

    return data;
}


// ADD EXPENSE

async function addExpense(data) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)
        });

        // Read server response
        const responseData = await response.json();

        // Check response status
        if (!response.ok) {
            throw new Error(
                responseData.message ||
                "Failed to add expense."
            );
        }

        // Show success message
        showAlert(
            "Expense added successfully.",
            "success"
        );

        // Refresh from the database
        await refresh();

        // Clear form after successful request
        expenseForm.reset();

    } catch (error) {
        console.error("Add expense error:", error);

        showAlert(
            error.message || "Failed to add expense.",
            "danger"
        );
    }
}


// UPDATE EXPENSE

async function updateExpense(id, data) {
    try {
        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            }
        );

        // Read server response
        const responseData = await response.json();

        // Check response status
        if (!response.ok) {
            throw new Error(
                responseData.message ||
                "Failed to update expense."
            );
        }

        // Close modal
        editModal.hide();

        // Show success message
        showAlert(
            "Expense updated successfully.",
            "success"
        );

        // Refresh from the database
        await refresh();

    } catch (error) {
        console.error("Update expense error:", error);

        showAlert(
            error.message || "Failed to update expense.",
            "danger"
        );
    }
}


// DELETE EXPENSE

async function deleteExpense(id) {
    // Ask for confirmation
    const confirmed = confirm(
        "Are you sure you want to delete this expense?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );

        // Read server response
        const responseData = await response.json();

        // Check response status
        if (!response.ok) {
            throw new Error(
                responseData.message ||
                "Failed to delete expense."
            );
        }

        // Show success message
        showAlert(
            "Expense deleted successfully.",
            "success"
        );

        // Refresh from the database
        await refresh();

    } catch (error) {
        console.error("Delete expense error:", error);

        showAlert(
            error.message || "Failed to delete expense.",
            "danger"
        );
    }
}


// REFRESH
async function refresh() {
    // Show loading spinner
    loadingSpinner.classList.remove("d-none");

    // Hide empty message while loading
    emptyMessage.classList.add("d-none");

    try {
        // Get the latest expenses from the server
        expenses = await getExpenses();

        // Display expenses in the table
        applyFilter();

        // Update summary cards
        renderSummary(expenses);

        renderCategoryChart(expenses);

    } catch (error) {
        console.error("Refresh error:", error);

        // Clear old data if loading failed
        expensesTableBody.innerHTML = "";

        // Keep summary values from showing outdated information
        renderSummary([]);
        renderCategoryChart([]);

        // Show error message instead of the empty state
        emptyMessage.classList.add("d-none");

        showAlert(
            error.message === "Failed to load expenses."
                ? error.message
                : "Cannot connect to the server. Please make sure the backend is running.",
            "danger"
        );

    } finally {
        // Hide loading spinner whether the request succeeds or fails
        loadingSpinner.classList.add("d-none");
    }
}


// RENDER TABLE

function renderTable(list) {
    // Clear existing rows
    expensesTableBody.innerHTML = "";

    // Check if there are no expenses
    if (list.length === 0) {
        emptyMessage.classList.remove("d-none");
        return;
    }

    // Hide empty message
    emptyMessage.classList.add("d-none");

    // Create a table row for each expense
    list.forEach(function (expense) {
        // ROW
        const row = document.createElement("tr");

        // TITLE
        const titleCell = document.createElement("td");
        titleCell.textContent = expense.title;

        // AMOUNT
        const amountCell = document.createElement("td");
        amountCell.textContent =
            `$${Number(expense.amount).toFixed(2)}`;

        // CATEGORY
        const categoryCell = document.createElement("td");
        const categoryBadge = document.createElement("span");

        categoryBadge.classList.add(
            "badge",
            "rounded-pill"
        );

        categoryBadge.textContent = expense.category;

        // Apply category color
        categoryBadge.style.backgroundColor =
            categoryColors[expense.category] || categoryColors.Other;

        categoryBadge.style.color = "#ffffff";

        categoryCell.appendChild(categoryBadge);

        // DATE
        const dateCell = document.createElement("td");
        dateCell.textContent = expense.date;

        // ACTIONS
        const actionsCell = document.createElement("td");

        // Edit Button
        const editButton =
            document.createElement("button");

        editButton.type = "button";

        editButton.classList.add(
            "btn",
            "btn-sm",
            "btn-outline-light",
            "me-2"
        );

        editButton.textContent = "Edit";

        editButton.addEventListener("click", function () {
            openEditModal(expense.id);
        });

        // Delete Button
        const deleteButton =
            document.createElement("button");

        deleteButton.type = "button";

        deleteButton.classList.add(
            "btn",
            "btn-sm",
            "btn-outline-danger"
        );

        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function () {
            deleteExpense(expense.id);
        });

        // Add buttons to Actions cell
        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);

        // ADD CELLS TO ROW
        row.appendChild(titleCell);
        row.appendChild(amountCell);
        row.appendChild(categoryCell);
        row.appendChild(dateCell);
        row.appendChild(actionsCell);

        // Add row to table
        expensesTableBody.appendChild(row);
    });
}

// RENDER SUMMARY

function renderSummary(list) {
    // Number of expenses
    expenseCount.textContent = list.length;

    // If there are no expenses
    if (list.length === 0) {
        totalAmount.textContent = "$0.00";
        highestExpense.textContent = "$0.00";

        return;
    }

    // Calculate total amount
    const total = list.reduce(
        function (sum, expense) {
            return sum + Number(expense.amount);
        },
        0
    );

    // Find lowest expense
    const lowest = Math.min(
        ...list.map(function (expense) {
            return Number(expense.amount);
        })
    );

    // Display values
    totalAmount.textContent =
        `$${total.toFixed(2)}`;

    highestExpense.textContent =
        `$${highest.toFixed(2)}`;
}

// Colors
const categoryColors = {
    Food: "#0a3c0b",
    Transport: "#133a73",
    Bills: "#36070ce7",
    Entertainment: "#785f14",
    Other: "#6f747e"
};
// RENDER CATEGORY CHART

function renderCategoryChart(list) {
    // Calculate total amount for each category
    const categoryTotals = {};

    list.forEach(function (expense) {
        const category = expense.category;
        const amount = Number(expense.amount);

        categoryTotals[category] =
            (categoryTotals[category] || 0) + amount;
    });

    const labels = Object.keys(categoryTotals);
    const values = Object.values(categoryTotals);


    const backgroundColors = labels.map(function (category) {
        return categoryColors[category] || "#6f747e";
    });

    // Remove the previous chart
    if (categoryChart) {
        categoryChart.destroy();
    }

    // Create the chart
    categoryChart = new Chart(categoryChartCanvas, {
        type: "bar",

        data: {
            labels: labels,
            datasets: [{
                label: "Total Expenses",
                data: values,
                backgroundColor: backgroundColors,
                borderRadius: 6,
                borderSkipped: false,
                barPercentage: 0.65
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: true,

            plugins: {
                legend: {
                    display: false
                },

                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `Total: $${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            },

            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return "$" + value;
                        }
                    }
                }
            }
        }
    });
}

// APPLY FILTER

function applyFilter() {
    const searchTerm = searchInput.value
        .trim()
        .toLowerCase();

    const selectedCategory = categoryFilter.value;

    const filteredExpenses = expenses.filter(function (expense) {
        const matchesTitle = expense.title
            .toLowerCase()
            .includes(searchTerm);

        const matchesCategory =
            selectedCategory === "All" ||
            expense.category === selectedCategory;

        return matchesTitle && matchesCategory;
    });

    // Apply sorting
    if (currentSort.column !== "") {
        filteredExpenses.sort(function (a, b) {
            let valueA = a[currentSort.column];
            let valueB = b[currentSort.column];

            if (currentSort.column === "amount") {
                valueA = Number(valueA);
                valueB = Number(valueB);
            } else {
                valueA = String(valueA).toLowerCase();
                valueB = String(valueB).toLowerCase();
            }

            if (valueA < valueB) {
                return currentSort.direction === "asc" ? -1 : 1;
            }

            if (valueA > valueB) {
                return currentSort.direction === "asc" ? 1 : -1;
            }

            return 0;
        });
    }

    renderTable(filteredExpenses);
}

// SORT TABLE BY COLUMN TITLE

document.querySelectorAll(".sortable").forEach(function (header) {
    header.style.cursor = "pointer";

    header.addEventListener("click", function () {
        const column = header.dataset.sort;

        if (currentSort.column === column) {
            currentSort.direction =
                currentSort.direction === "asc" ? "desc" : "asc";
        } else {
            currentSort.column = column;
            currentSort.direction = "asc";
        }

        applyFilter();
    });
});


// EXPORT EXPENSES TO CSV

const exportCSVButton = document.getElementById("exportCSV");

exportCSVButton.addEventListener("click", function () {
    const headers = ["Title", "Amount", "Category", "Date"];

    const rows = expenses.map(function (expense) {
        return [
            expense.title,
            expense.amount,
            expense.category,
            expense.date
        ];
    });

    // Escape quotes and wrap values safely
    const csvContent = [headers, ...rows]
        .map(function (row) {
            return row.map(function (value) {
                return `"${String(value ?? "").replace(/"/g, '""')}"`;
            }).join(",");
        })
        .join("\r\n");

    // Add UTF-8 BOM for spreadsheet compatibility
    const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "expensy-expenses.csv";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});


// When category changes
categoryFilter.addEventListener("change", function () {
    applyFilter();
}
);

searchInput.addEventListener("input", applyFilter);

// VALIDATE EXPENSE

function validateExpense(data, errors) {
    // Clear previous error messages
    Object.values(errors).forEach(function (errorElement) {
        errorElement.textContent = "";
    });

    let isValid = true;

    // Validate title
    if (data.title === "") {
        errors.title.textContent = "Title is required.";
        isValid = false;
    }

    // Validate amount
    if (data.amount === "") {
        errors.amount.textContent = "Amount is required.";
        isValid = false;

    } else if (
        !Number.isFinite(Number(data.amount)) ||
        Number(data.amount) <= 0
    ) {
        errors.amount.textContent =
            "Amount must be greater than 0.";

        isValid = false;
    }

    // Validate category
    if (data.category === "") {
        errors.category.textContent =
            "Please select a category.";

        isValid = false;
    }

    // Validate date
    if (data.date === "") {
        errors.date.textContent = "Date is required.";
        isValid = false;
    }

    return isValid;
}


// ADD EXPENSE FORM

expenseForm.addEventListener(
    "submit",
    async function (event) {
        // Prevent page reload
        event.preventDefault();

        // Get values
        const title =
            titleInput.value.trim();

        const amount =
            amountInput.value;

        const category =
            categoryInput.value;

        const date =
            dateInput.value;

        // VALIDATION
        const isValid = validateExpense(
            { title, amount, category, date },
            {
                title: titleError,
                amount: amountError,
                category: categoryError,
                date: dateError
            }
        );

        // Stop if validation failed
        if (!isValid) {
            return;
        }

        // ADD TO SERVER
        const data = {
            title: title,
            amount: Number(amount),
            category: category,
            date: date
        };

        await addExpense(data);
    }
);


// OPEN EDIT MODAL

function openEditModal(id) {
    // Find expense
    const expense = expenses.find(
        function (item) {
            return Number(item.id) === Number(id);
        }
    );

    // If not found
    if (!expense) {
        showAlert(
            "Expense not found.",
            "danger"
        );

        return;
    }

    // Clear previous errors
    clearEditErrors();

    // Fill modal fields
    editExpenseId.value =
        expense.id;

    editTitle.value =
        expense.title;

    editAmount.value =
        expense.amount;

    editCategory.value =
        expense.category;

    editDate.value =
        expense.date;

    // Show modal
    editModal.show();
}


// EDIT EXPENSE FORM

editExpenseForm.addEventListener(
    "submit",
    async function (event) {
        // Prevent page reload
        event.preventDefault();

        // Get values
        const id =
            editExpenseId.value;

        const title =
            editTitle.value.trim();

        const amount =
            editAmount.value;

        const category =
            editCategory.value;

        const date =
            editDate.value;

        // VALIDATION
        const isValid = validateExpense(
            { title, amount, category, date },
            {
                title: editTitleError,
                amount: editAmountError,
                category: editCategoryError,
                date: editDateError
            }
        );

        // Stop if validation failed
        if (!isValid) {
            return;
        }

        // UPDATE ON SERVER
        const data = {
            title: title,
            amount: Number(amount),
            category: category,
            date: date
        };

        await updateExpense(id, data);
    }
);


// CLEAR EDIT ERRORS

function clearEditErrors() {
    editTitleError.textContent = "";
    editAmountError.textContent = "";
    editCategoryError.textContent = "";
    editDateError.textContent = "";
}


// BOOTSTRAP TOAST ALERT

function showAlert(message, type = "danger") {
    // Create toast element
    const toast = document.createElement("div");

    toast.classList.add(
        "toast",
        "align-items-center",
        `text-bg-${type}`,
        "border-0"
    );

    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    // Create toast content
    const toastBody = document.createElement("div");
    toastBody.classList.add("d-flex");

    const messageElement = document.createElement("div");
    messageElement.classList.add("toast-body");
    messageElement.textContent = message;

    // Create close button
    const closeButton = document.createElement("button");

    closeButton.type = "button";

    closeButton.classList.add(
        "btn-close",
        "btn-close-white",
        "me-2",
        "m-auto"
    );

    closeButton.setAttribute("data-bs-dismiss", "toast");
    closeButton.setAttribute("aria-label", "Close");

    // Build toast
    toastBody.appendChild(messageElement);
    toastBody.appendChild(closeButton);
    toast.appendChild(toastBody);

    // Add toast to page
    alertContainer.appendChild(toast);

    // Display toast
    const bootstrapToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: 4000
    });

    bootstrapToast.show();

    // Remove toast from DOM after it is hidden
    toast.addEventListener("hidden.bs.toast", function () {
        toast.remove();
    });
}

// DARK MODE

const themeToggle = document.getElementById("themeToggle");
const htmlElement = document.documentElement;

// Load saved theme
let currentTheme = localStorage.getItem("theme") || "light";

// Apply theme when the page loads
htmlElement.setAttribute("data-bs-theme", currentTheme);

// Update toggle button
function updateThemeButton() {
    if (currentTheme === "dark") {
        themeToggle.textContent = "Light Mode";
        themeToggle.setAttribute("aria-label", "Switch to light mode");
    } else {
        themeToggle.textContent = "Dark Mode";
        themeToggle.setAttribute("aria-label", "Switch to dark mode");
    }
}

// Toggle between light and dark themes
themeToggle.addEventListener("click", function () {
    currentTheme = currentTheme === "light" ? "dark" : "light";

    // Apply the selected theme
    htmlElement.setAttribute("data-bs-theme", currentTheme);

    // Save the selected theme
    localStorage.setItem("theme", currentTheme);

    // Update button text
    updateThemeButton();

    // Redraw chart with the current theme
    renderCategoryChart(expenses);
});

// Set button text on page load
updateThemeButton();