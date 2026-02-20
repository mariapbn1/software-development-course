from django.db import models

class Comment(models.Model):
    user = models.CharField(max_length=50)
    date = models.DateField()
    email = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )
    comment = models.TextField()

    def __str__(self):
        return f"{self.user} - {self.date}"