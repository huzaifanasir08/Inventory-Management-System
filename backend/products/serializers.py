from rest_framework import serializers
from .models import Product

# class CategorySerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Category
#         fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    # category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'unit',
            'buying_price', 'selling_price', 'stock','min_stock', 'created_at'
        ]
