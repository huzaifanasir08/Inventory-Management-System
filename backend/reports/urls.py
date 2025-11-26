from django.urls import path
from .views import DayEndReportView, PeriodReportView, QuickSummaryView

urlpatterns = [
    path('day/', DayEndReportView.as_view(), name='report-day'),
    path('period/', PeriodReportView.as_view(), name='report-period'),
    path('summary/', QuickSummaryView.as_view(), name='report-summary'),
]
