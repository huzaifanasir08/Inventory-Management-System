# Inventory Management System

A full-stack, real-time inventory management platform built to track
stock, generate invoices, and deliver actionable business insights.

## 🚀 Features

### 📦 Product & Stock Management

-   Add, edit, delete products
-   Real-time stock tracking
-   Minimum-stock alerts

### 🧾 Invoice Management

-   Sales & purchase invoice creation
-   Automatic stock adjustment

### 📊 Dashboard

-   Daily sales/purchase stats
-   Total stock & product count
-   Trend indicators
-   Critical stock alerts

### 📈 Reporting

-   Daily, period-based, and summary reports

### 👥 Accounts

-   Customers & suppliers management

## 🛠 Tech Stack

### Backend (Django REST Framework)

-   Django, DRF
-   Apps: products, invoices, reports, accounts

### Frontend (React + Vite)

-   React hooks, TailwindCSS
-   Axios, Lucide Icons

## 📁 Django Routes (urls.py)

    urlpatterns = [
        path('admin/', admin.site.urls),
        path('api/', include('products.urls')),
        path('api/invoices/', include('invoices.urls')),
        path('api/reports/', include('reports.urls')),
        path('api/accounts/', include('accounts.urls')),
    ]

## 🖥 Frontend API Structure

Handles CRUD operations for products, invoices, accounts, and reports.

## ⚙️ Setup

### Backend

    cd backend
    python -m venv venv
    venv\Scripts\activate
    pip install -r req.txt
    python manage.py migrate
    python manage.py runserver

### Frontend

    cd frontend
    npm install
    npm run dev

## 🔗 Env Variable

    VITE_API_BASE_URL=http://localhost:8000/api

## 📌 Future Improvements

-   JWT auth
-   Role-based permissions
-   PDF/CSV export
-   Barcode scanning
-   Offline mode
