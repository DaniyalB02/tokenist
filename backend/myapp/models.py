# myapp/models.py
from django.db import models

class ListData(models.Model):
    data = models.JSONField()
