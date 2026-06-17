from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Student, ClassStream, Subject, Assessment, Score, GradingScale
from .serializers import (
    UserSerializer, StudentSerializer, StreamSerializer, SubjectSerializer,
    AssessmentSerializer, ScoreSerializer, GradingScaleSerializer,
)

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.data
        username = data.get('email') or data.get('username')
        password = data.get('password')
        if not password:
            return Response({'detail': 'Password required'}, status=400)
        user = User.objects.create_user(
            username=username,
            email=data.get('email'),
            first_name=data.get('firstName') or data.get('first_name', ''),
            last_name=data.get('lastName') or data.get('last_name', ''),
        )
        user.set_password(password)
        role = data.get('role')
        if role:
            user.role = role
        user.save()
        refresh = RefreshToken.for_user(user)
        return Response({'token': str(refresh.access_token), 'user': UserSerializer(user).data})


class ProfileView(APIView):
    def get(self, request):
        return Response({'user': UserSerializer(request.user).data})


class StreamViewSet(viewsets.ModelViewSet):
    queryset = ClassStream.objects.all()
    serializer_class = StreamSerializer


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer

    @action(detail=False, methods=['post'])
    def assign(self, request):
        # simple assign placeholder
        return Response({'detail': 'assigned'})


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer


class AssessmentViewSet(viewsets.ModelViewSet):
    queryset = Assessment.objects.all()
    serializer_class = AssessmentSerializer

    @action(detail=True, methods=['get'])
    def scores(self, request, pk=None):
        assessment = self.get_object()
        scores = assessment.scores.all()
        return Response({'scores': ScoreSerializer(scores, many=True).data})

    @action(detail=False, methods=['post'])
    def scores_bulk(self, request):
        assessment_id = request.data.get('assessmentId')
        scores = request.data.get('scores', [])
        created = []
        for s in scores:
            try:
                st = Student.objects.get(id=s.get('studentId'))
                a = Assessment.objects.get(id=assessment_id)
                obj = Score.objects.create(assessment=a, student=st, marks=s.get('marks', 0), remarks=s.get('remarks', ''))
                created.append(obj)
            except Exception:
                continue
        return Response({'created': len(created)})


class ScoreViewSet(viewsets.ModelViewSet):
    queryset = Score.objects.all()
    serializer_class = ScoreSerializer


class GradingScaleViewSet(viewsets.ModelViewSet):
    queryset = GradingScale.objects.all()
    serializer_class = GradingScaleSerializer


@api_view(['GET'])
def dashboard_stats(request):
    # return simple stats placeholder
    return Response({'students': Student.objects.count(), 'streams': ClassStream.objects.count()})
