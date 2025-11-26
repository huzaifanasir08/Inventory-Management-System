from rest_framework import generics
from .models import PurchaseInvoice, SaleInvoice
from .serializers import PurchaseInvoiceSerializer, SaleInvoiceSerializer

# Purchase Views
class PurchaseInvoiceListCreateView(generics.ListCreateAPIView):
    queryset = PurchaseInvoice.objects.prefetch_related('items').all()
    serializer_class = PurchaseInvoiceSerializer


class PurchaseInvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PurchaseInvoice.objects.prefetch_related('items').all()
    serializer_class = PurchaseInvoiceSerializer


# Sale Views
class SaleInvoiceListCreateView(generics.ListCreateAPIView):
    queryset = SaleInvoice.objects.prefetch_related('items').all()
    serializer_class = SaleInvoiceSerializer


class SaleInvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SaleInvoice.objects.prefetch_related('items').all()
    serializer_class = SaleInvoiceSerializer
