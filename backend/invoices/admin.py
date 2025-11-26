from django.contrib import admin
from .models import PurchaseInvoice, PurchaseItem, SaleInvoice, SaleItem
from products.models import Product
from accounts.models import Supplier, Customer



# ---------- PURCHASE ----------
class PurchaseItemInline(admin.TabularInline):
    model = PurchaseItem
    extra = 1  # one empty row by default for quick adding
    autocomplete_fields = ['product']  # better for large product lists


@admin.register(PurchaseInvoice)
class PurchaseInvoiceAdmin(admin.ModelAdmin):
    list_display = ('supplier_name', 'date', 'total_amount')
    list_filter = ('date',)
    search_fields = ('supplier_name',)
    inlines = [PurchaseItemInline]


# ---------- SALE ----------
class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 1
    autocomplete_fields = ['product']


@admin.register(SaleInvoice)
class SaleInvoiceAdmin(admin.ModelAdmin):
    list_display = ('customer_name', 'date', 'total_amount')
    list_filter = ('date',)
    search_fields = ('customer_name',)
    inlines = [SaleItemInline]

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'stock', 'min_stock', 'selling_price')
    search_fields = ('name',)  # REQUIRED for autocomplete_fields to work

    
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'address')
    search_fields = ('name',) 


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'company_name', 'phone', 'address')
    search_fields = ('name',)  