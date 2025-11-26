from django.db import models, transaction
from django.utils import timezone
from products.models import Product
from decimal import Decimal


class PurchaseInvoice(models.Model):
    supplier_name = models.CharField(max_length=150)
    date = models.DateField(default=timezone.now)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    def __str__(self):
        return f"Purchase #{self.id} - {self.supplier_name}"


class PurchaseItem(models.Model):
    invoice = models.ForeignKey(PurchaseInvoice, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    selling_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # 👈 new field

    def save(self, *args, **kwargs):
        old_quantity = 0
        if self.pk:
            old_quantity = PurchaseItem.objects.get(pk=self.pk).quantity

        super().save(*args, **kwargs)
        difference = self.quantity - old_quantity
        self.product.stock += difference
        self.product.buying_price = Decimal(self.price)
        if self.selling_price and self.selling_price > 0:
            self.product.selling_price = Decimal(self.selling_price)
        self.product.save()


    def __str__(self):
        return f"{self.product.name} x {self.quantity}"



class SaleInvoice(models.Model):
    customer_name = models.CharField(max_length=255)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # 👈 NEW
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Invoice #{self.id} - {self.customer_name}"



class SaleItem(models.Model):
    invoice = models.ForeignKey(SaleInvoice, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        with transaction.atomic():
            super().save(*args, **kwargs)
            

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"
