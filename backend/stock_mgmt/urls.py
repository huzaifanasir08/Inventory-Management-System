from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('products.urls')),
    path('api/invoices/', include('invoices.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/accounts/', include('accounts.urls')),
]
