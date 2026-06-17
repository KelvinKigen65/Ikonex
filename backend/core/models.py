from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLES = (
        ('ADMIN', 'Admin'),
        ('TEACHER', 'Teacher'),
        ('STUDENT', 'Student'),
        ('SUPER_ADMIN', 'Super Admin'),
    )
    role = models.CharField(max_length=32, choices=ROLES, default='TEACHER')


class ClassStream(models.Model):
    name = models.CharField(max_length=128)

    def __str__(self):
        return self.name


class Subject(models.Model):
    name = models.CharField(max_length=128)
    code = models.CharField(max_length=32, blank=True, null=True)

    def __str__(self):
        return self.name


class Student(models.Model):
    user = models.OneToOneField('core.User', on_delete=models.CASCADE, related_name='student_profile', null=True, blank=True)
    first_name = models.CharField(max_length=128)
    last_name = models.CharField(max_length=128)
    admission_number = models.CharField(max_length=64, unique=True)
    stream = models.ForeignKey(ClassStream, on_delete=models.SET_NULL, null=True, blank=True)
    gender = models.CharField(max_length=16, blank=True, null=True)
    dob = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Assessment(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    stream = models.ForeignKey(ClassStream, on_delete=models.CASCADE)
    title = models.CharField(max_length=256)
    term = models.CharField(max_length=32, blank=True, null=True)
    academic_year = models.CharField(max_length=32, blank=True, null=True)
    max_marks = models.IntegerField(default=100)
    date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.title


class Score(models.Model):
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='scores')
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    marks = models.FloatField()
    remarks = models.TextField(blank=True, null=True)


class GradingScale(models.Model):
    grade = models.CharField(max_length=8)
    min_score = models.IntegerField()
    max_score = models.IntegerField()
    remark = models.CharField(max_length=128, blank=True, null=True)

    def __str__(self):
        return self.grade
