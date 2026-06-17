from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StreamViewSet, SubjectViewSet, StudentViewSet, AssessmentViewSet,
    ScoreViewSet, GradingScaleViewSet, RegisterView, ProfileView, dashboard_stats
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register('streams', StreamViewSet, basename='streams')
router.register('subjects', SubjectViewSet, basename='subjects')
router.register('students', StudentViewSet, basename='students')
router.register('assessments', AssessmentViewSet, basename='assessments')
router.register('scores', ScoreViewSet, basename='scores')
router.register('grading-scales', GradingScaleViewSet, basename='grading-scales')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register', RegisterView.as_view(), name='register'),
    path('auth/me', ProfileView.as_view(), name='profile'),
    path('results/dashboard', dashboard_stats, name='dashboard-stats'),
]
