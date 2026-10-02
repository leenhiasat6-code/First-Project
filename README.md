# Expensy – Expense Tracker

Expensy is a web-based expense tracking application that helps users manage their daily expenses. Users can add, view, edit, delete, search, and filter expenses through a responsive and user-friendly interface.

The application is built using HTML, CSS, JavaScript, and Bootstrap for the frontend, with a Node.js and Express backend connected to a PostgreSQL database to store and manage expense data.

## Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript
* Bootstrap
* Fetch API (for communication with the backend)

### Backend

* Node.js
* Express.js
* PostgreSQL
* REST API

## Features

* [x] Add new expenses with input validation
* [x] View all expenses
* [x] Edit existing expenses
* [x] Delete expenses
* [x] Filter expenses by category
* [x] Search expenses
* [x] Sort expenses
* [x] Display summary cards:

  * Total expenses
  * Number of expenses
  * Highest expense
* [x] Display expense categories in a chart
* [x] Export expenses to CSV
* [x] Light and dark mode
* [x] Responsive design for desktop and mobile devices
* [x] Store expense data in a PostgreSQL database
* [x] Handle loading states and server errors

## Project Structure

```text
expense-tracker-starter/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── schema.sql
│   ├── .env.example
│   └── .env
│
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── images/
|
│__ Web Images
|
|__ README.md

```

## How to Run

### Backend

1. Make sure Node.js and PostgreSQL are installed on your computer.

2. Open a terminal in the project folder and navigate to the backend directory:

   ```bash
   cd backend
   ```

3. Install the required dependencies:

   ```bash
   npm install
   ```

4. Create a PostgreSQL database named `expense_tracker`.

5. Run the `schema.sql` file on the `expense_tracker` database to create the required table.

6. Create a `.env` file inside the `backend` folder and add your PostgreSQL connection details:

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_postgresql_username
   DB_PASSWORD=your_postgresql_password
   DB_NAME=expense_tracker
   ```

   Replace the example username and password with your own PostgreSQL credentials.

7. Start the backend server:

   ```bash
   node server.js
   ```

8. The backend API will be available at:

   ```text
   http://localhost:3000
   ```

### Frontend

1. Make sure the backend server is running.

2. Navigate to the `frontend` folder.

3. Open `index.html` in your browser.

   You can also use the **Live Server** extension in Visual Studio Code to run the frontend locally.

4. The frontend will communicate with the backend API at `http://localhost:3000/api/expenses`.

## API Endpoints

| Method | Endpoint            | Description                 |
| ------ | ------------------- | --------------------------- |
| GET    | `/api/expenses`     | Retrieve all expenses       |
| GET    | `/api/expenses/:id` | Retrieve a specific expense |
| POST   | `/api/expenses`     | Add a new expense           |
| PUT    | `/api/expenses/:id` | Update an existing expense  |
| DELETE | `/api/expenses/:id` | Delete an expense           |

## Data Validation and Error Handling

* Required fields must be provided.
* Expense titles containing only spaces are rejected.
* The amount must be a valid number greater than zero.
* The category must be one of the supported categories: Food, Transport, Bills, Entertainment, or Other.
* The date must be valid and use the `YYYY-MM-DD` format.
* Invalid input returns an appropriate `400` response.
* Requests for expenses that do not exist return a `404` response.
* Server or database errors are handled with a `500` response.


## What Was the Hardest Part?

One of the most challenging parts of this project was connecting the frontend to the backend and making sure that expense data was correctly stored and updated in the PostgreSQL database. I worked through this by building and testing the REST API endpoints, using asynchronous JavaScript with `fetch`, and handling validation and server errors to keep the application working reliably.

## Future Improvements

* Add user authentication and personal expense accounts.
* Add monthly and yearly expense reports.
* Provide more detailed spending analytics.

## Author
**Eng.Leen Hiasat**
