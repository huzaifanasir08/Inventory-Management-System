from datetime import datetime, date, timedelta
from django.utils import timezone
from django.db.models import Sum, F, FloatField, ExpressionWrapper
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from invoices.models import SaleItem, PurchaseItem
from products.models import Product


def _parse_date(qs_date):
    """Parse YYYY-MM-DD or return today (date)."""
    if not qs_date:
        return timezone.localdate()
    try:
        return datetime.strptime(qs_date, "%Y-%m-%d").date()
    except Exception:
        return None


class DayEndReportView(APIView):
    """
    GET /api/reports/day/?date=YYYY-MM-DD
    Returns totals for that date (local date).
    """
    def get(self, request):
        qdate = _parse_date(request.query_params.get('date'))
        if qdate is None:
            return Response({"detail": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        start = datetime.combine(qdate, datetime.min.time()).astimezone(timezone.get_current_timezone())
        end = datetime.combine(qdate, datetime.max.time()).astimezone(timezone.get_current_timezone())

        # Sales total
        sales_agg = SaleItem.objects.filter(invoice__date=qdate).aggregate(
            sales_total=Sum(ExpressionWrapper(F('quantity') * F('price'), output_field=FloatField()))
        )
        sales_total = sales_agg['sales_total'] or 0.0

        # Purchases total
        purchases_agg = PurchaseItem.objects.filter(invoice__date=qdate).aggregate(
            purchases_total=Sum(ExpressionWrapper(F('quantity') * F('price'), output_field=FloatField()))
        )
        purchases_total = purchases_agg['purchases_total'] or 0.0

        # Approximate COGS: sum(quantity * product.buying_price) for sale items that day
        cogs_agg = SaleItem.objects.filter(invoice__date=qdate).annotate(
            cost=ExpressionWrapper(F('quantity') * F('product__buying_price'), output_field=FloatField())
        ).aggregate(cogs=Sum('cost'))
        cogs = cogs_agg['cogs'] or 0.0

        gross_profit = sales_total - cogs

        return Response({
            "date": qdate.isoformat(),
            "sales_total": round(sales_total, 2),
            "purchases_total": round(purchases_total, 2),
            "cogs_approx": round(cogs, 2),
            "gross_profit_approx": round(gross_profit, 2),
        })


class PeriodReportView(APIView):
    """
    GET /api/reports/period/?start=YYYY-MM-DD&end=YYYY-MM-DD
    Returns aggregated totals for the date-range inclusive.
    """
    def get(self, request):
        start_q = _parse_date(request.query_params.get('start'))
        end_q = _parse_date(request.query_params.get('end'))

        if start_q is None or end_q is None:
            return Response({"detail": "Provide valid start and end dates in YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        if end_q < start_q:
            return Response({"detail": "end must be >= start."}, status=status.HTTP_400_BAD_REQUEST)

        # filter by invoice date (invoice__date is a DateField)
        sales_agg = SaleItem.objects.filter(invoice__date__gte=start_q, invoice__date__lte=end_q).aggregate(
            sales_total=Sum(ExpressionWrapper(F('quantity') * F('price'), output_field=FloatField()))
        )
        sales_total = sales_agg['sales_total'] or 0.0

        purchases_agg = PurchaseItem.objects.filter(invoice__date__gte=start_q, invoice__date__lte=end_q).aggregate(
            purchases_total=Sum(ExpressionWrapper(F('quantity') * F('price'), output_field=FloatField()))
        )
        purchases_total = purchases_agg['purchases_total'] or 0.0

        cogs_agg = SaleItem.objects.filter(invoice__date__gte=start_q, invoice__date__lte=end_q).annotate(
            cost=ExpressionWrapper(F('quantity') * F('product__buying_price'), output_field=FloatField())
        ).aggregate(cogs=Sum('cost'))
        cogs = cogs_agg['cogs'] or 0.0

        gross_profit = sales_total - cogs

        return Response({
            "start": start_q.isoformat(),
            "end": end_q.isoformat(),
            "sales_total": round(sales_total, 2),
            "purchases_total": round(purchases_total, 2),
            "cogs_approx": round(cogs, 2),
            "gross_profit_approx": round(gross_profit, 2),
        })


class QuickSummaryView(APIView):
    """
    GET /api/reports/summary/?type=day|week|month|year&date=YYYY-MM-DD
    Returns a predefined summary for:
      - day (same as DayEndReportView),
      - week (7 days ending at date),
      - month (calendar month containing date),
      - year (calendar year containing date).
    If date missing, defaults to today.
    """
    def get(self, request):
        typ = (request.query_params.get('type') or 'day').lower()
        qdate = _parse_date(request.query_params.get('date'))
        if qdate is None:
            return Response({"detail": "Invalid date."}, status=status.HTTP_400_BAD_REQUEST)

        if typ == 'day':
            start = qdate
            end = qdate
        elif typ == 'week':
            # week ending on qdate (7 days)
            start = qdate - timedelta(days=6)
            end = qdate
        elif typ == 'month':
            # month containing qdate
            start = date(qdate.year, qdate.month, 1)
            # next month first day minus one day:
            if qdate.month == 12:
                nxt = date(qdate.year + 1, 1, 1)
            else:
                nxt = date(qdate.year, qdate.month + 1, 1)
            end = nxt - timedelta(days=1)
        elif typ == 'year':
            start = date(qdate.year, 1, 1)
            end = date(qdate.year, 12, 31)
        else:
            return Response({"detail": "Invalid type. Use day, week, month, or year."}, status=status.HTTP_400_BAD_REQUEST)

        # Reuse PeriodReport logic but directly compute
        sales_agg = SaleItem.objects.filter(invoice__date__gte=start, invoice__date__lte=end).aggregate(
            sales_total=Sum(ExpressionWrapper(F('quantity') * F('price'), output_field=FloatField()))
        )
        sales_total = sales_agg['sales_total'] or 0.0

        purchases_agg = PurchaseItem.objects.filter(invoice__date__gte=start, invoice__date__lte=end).aggregate(
            purchases_total=Sum(ExpressionWrapper(F('quantity') * F('price'), output_field=FloatField()))
        )
        purchases_total = purchases_agg['purchases_total'] or 0.0

        cogs_agg = SaleItem.objects.filter(invoice__date__gte=start, invoice__date__lte=end).annotate(
            cost=ExpressionWrapper(F('quantity') * F('product__buying_price'), output_field=FloatField())
        ).aggregate(cogs=Sum('cost'))
        cogs = cogs_agg['cogs'] or 0.0

        gross_profit = sales_total - cogs

        return Response({
            "type": typ,
            "start": start.isoformat(),
            "end": end.isoformat(),
            "sales_total": round(sales_total, 2),
            "purchases_total": round(purchases_total, 2),
            "cogs_approx": round(cogs, 2),
            "gross_profit_approx": round(gross_profit, 2),
        })
