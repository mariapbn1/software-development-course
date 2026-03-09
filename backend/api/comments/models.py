from django.db import models

from api.products.models import Product
from api.users.models import User


class Comment(models.Model):
    date = models.DateField(auto_now=True)
    comment = models.TextField()

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
