from django.db import models


class Supplier(models.Model):
    name = models.CharField(max_length=150)
    company_name = models.CharField(max_length=150, blank=True, null=True)
    phone = models.CharField(max_length=20, unique=True)
    # email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.company_name})" if self.company_name else self.name


class Customer(models.Model):
    name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, unique=True)
    # email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
