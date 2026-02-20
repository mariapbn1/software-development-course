from django.db import models

from api.products.models import Product


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

    product = models.ForeignKey(Product, on_delete=models.CASCADE)