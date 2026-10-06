
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// PostgreSQL Database Configuration
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
  user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Allowed Categories
const allowedCategories = [
    "Food",
    "Transport",
    "Bills",
    "Entertainment",
    "Other"
];

// Validate ID
function isValidId(id) {
    return /^\d+$/.test(id) && Number(id) > 0;
}

// Validate expense data for POST and PUT
function validateExpense(title, amount, category, date) {
    if (
        typeof title !== "string" ||
        title.trim() === "" ||
        amount === undefined ||
        amount === null ||
        amount === "" ||
        !category ||
        !date
    ) {
        return {
            valid: false,
            message: "Title, category, amount, and date are required."
        };
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return {
            valid: false,
            message: "Amount must be a positive number."
        };
    }

    if (!allowedCategories.includes(category)) {
        return {
            valid: false,
            message: "Category must be one of: Food, Transport, Bills, Entertainment, Other."
        };
    }

    if (
        typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        Number.isNaN(Date.parse(date)) ||
        new Date(date).toISOString().slice(0, 10) !== date
    ) {
        return {
            valid: false,
            message: "Date must be a valid date in YYYY-MM-DD format."
        };
    }

    return {
        valid: true,
        numericAmount
    };
}

// GET all expenses
app.get("/api/expenses", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, title, amount::float8, category,
                to_char(date, 'YYYY-MM-DD') AS date
             FROM expenses`
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Database Error:", error);

        res.status(500).json({
            message: "A server error occurred while fetching data."
        });
    }
});

// GET one expense by ID
app.get("/api/expenses/:id", async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({
            message: "Invalid ID format"
        });
    }

    try {
        const result = await pool.query(
            `SELECT id, title, amount::float8, category,
                to_char(date, 'YYYY-MM-DD') AS date
             FROM expenses
             WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Database Error:", error);

        res.status(500).json({
            message: "A server error occurred while fetching data."
        });
    }
});

// POST new expense
app.post("/api/expenses", async (req, res) => {
    const { title, amount, category, date } = req.body;

    const validation = validateExpense(title, amount, category, date);

    if (!validation.valid) {
        return res.status(400).json({
            message: validation.message
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO expenses (title, amount, category, date)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, amount::float8, category,
                to_char(date, 'YYYY-MM-DD') AS date`,
            [title.trim(), validation.numericAmount, category, date]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Database Error:", error);

        res.status(500).json({
            message: "A server error occurred while adding the expense."
        });
    }
});

// PUT update expense
app.put("/api/expenses/:id", async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({
            message: "Invalid ID format"
        });
    }

    const { title, amount, category, date } = req.body;

    const validation = validateExpense(title, amount, category, date);

    if (!validation.valid) {
        return res.status(400).json({
            message: validation.message
        });
    }

    try {
        const result = await pool.query(
            `UPDATE expenses
             SET title = $1,
                 amount = $2,
                 category = $3,
                 date = $4
             WHERE id = $5
             RETURNING id, title, amount::float8, category,
                to_char(date, 'YYYY-MM-DD') AS date`,
            [title.trim(), validation.numericAmount, category, date, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Database Error:", error);

        res.status(500).json({
            message: "A server error occurred while updating the expense."
        });
    }
});

// DELETE expense
app.delete("/api/expenses/:id", async (req, res) => {
    const { id } = req.params;

    if (!isValidId(id)) {
        return res.status(400).json({
            message: "Invalid ID format"
        });
    }

    try {
        const result = await pool.query(
            `DELETE FROM expenses
             WHERE id = $1`,
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Expense not found"
            });
        }

        res.status(200).json({
            message: "Expense deleted successfully."
        });
    } catch (error) {
        console.error("Database Error:", error);

        res.status(500).json({
            message: "A server error occurred while deleting the expense."
        });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});