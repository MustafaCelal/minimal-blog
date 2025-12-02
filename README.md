# Minimalist Blog

A clean, minimalist blog application built with Vanilla JavaScript, HTML, and CSS. It uses `json-server` to simulate a backend REST API.

## Features

-   **Minimalist Design:** Clean typography and whitespace-focused layout.
-   **Dynamic Content:** Blog posts and pages are fetched asynchronously from a mock API.
-   **Admin Panel:** Secure (simulated) admin area to manage content.
    -   **Login:** Simple authentication (`admin` / `admin`).
    -   **CRUD Operations:** Create, Read, Update, and Delete blog posts.
-   **Routing:** Simple client-side routing for Home, Post Details, Pages (About/Contact), and Admin views.
-   **Data Persistence:** All data is stored in `db.json` via `json-server`.

## Tech Stack

-   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
-   **Backend (Simulation):** [json-server](https://github.com/typicode/json-server)
-   **Data:** JSON (`db.json`)

## Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd minimal-blog
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the API Server:**
    ```bash
    npm run start:api
    ```
    This will start `json-server` on `http://localhost:3000`.

4.  **Run the Application:**
    Open `index.html` in your browser.
    *Note: For the best experience, use a local development server (e.g., Live Server in VS Code) to avoid CORS issues with file protocol, although `json-server` is configured to allow CORS.*

## Usage

-   **Public View:** Browse posts on the home page, read full articles, and view About/Contact pages.
-   **Admin Access:**
    1.  Click the "Admin" link in the footer.
    2.  Login with username: `admin` and password: `admin`.
    3.  Manage your blog posts from the dashboard.

## Project Structure

-   `index.html`: Main entry point and layout structure.
-   `style.css`: All styles for the application.
-   `script.js`: Application logic, API handling, and routing.
-   `db.json`: Database file for `json-server`.
