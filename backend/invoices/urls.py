from django.urls import path
from . import views

urlpatterns = [
    # Purchases
    path('purchases/', views.PurchaseInvoiceListCreateView.as_view(), name='purchase-list-create'),
    path('purchases/<int:pk>/', views.PurchaseInvoiceDetailView.as_view(), name='purchase-detail'),

    # Sales
    path('sales/', views.SaleInvoiceListCreateView.as_view(), name='sale-list-create'),
    path('sales/<int:pk>/', views.SaleInvoiceDetailView.as_view(), name='sale-detail'),
]
