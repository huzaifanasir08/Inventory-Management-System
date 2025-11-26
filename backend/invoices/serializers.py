from rest_framework import serializers
from .models import PurchaseInvoice, PurchaseItem, SaleInvoice, SaleItem
from products.models import Product  # import your Product model


# Nested Item Serializers
class PurchaseItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = PurchaseItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'selling_price']



class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price']


# Main Invoice Serializers
class PurchaseInvoiceSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True)

    class Meta:
        model = PurchaseInvoice
        fields = ['id', 'supplier_name', 'date', 'total_amount', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        invoice = PurchaseInvoice.objects.create(**validated_data)
        total = 0
        for item_data in items_data:
            item = PurchaseItem.objects.create(invoice=invoice, **item_data)
            total += item.quantity * item.price
        invoice.total_amount = total
        invoice.save()
        return invoice


class SaleInvoiceSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)

    class Meta:
        model = SaleInvoice
        fields = ['id', 'customer_name', 'total_amount', 'discount', 'date', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        discount = validated_data.get('discount', 0)
        invoice = SaleInvoice.objects.create(**validated_data)

        total = 0
        for item in items_data:
            product_id = item['product'].id if hasattr(item['product'], 'id') else item['product']
            product = Product.objects.get(id=product_id)

            quantity = item['quantity']
            price = product.selling_price
            total += price * quantity

            # create item
            SaleItem.objects.create(
                invoice=invoice,
                product=product,
                quantity=quantity,
                price=price
            )

            # stock deduction
            product.stock -= quantity
            product.save()

        invoice.total_amount = total - discount
        invoice.save()
        return invoice
