from django.contrib import admin
from .models import User, Student, ClassStream, Subject, Assessment, Score, GradingScale

admin.site.register(User)
admin.site.register(Student)
admin.site.register(ClassStream)
admin.site.register(Subject)
admin.site.register(Assessment)
admin.site.register(Score)
admin.site.register(GradingScale)
