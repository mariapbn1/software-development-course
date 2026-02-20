from django.db import models


class Brand(models.Model):
    name = models.CharField(max_length=50)


class Color(models.Model):
    name = models.CharField(max_length=50)


class MaxSupportNetwork(models.Model):
    name = models.CharField(max_length=50)


class OperatingSystem(models.Model):
    name = models.CharField(max_length=50)


class Product(models.Model):
    name = models.CharField(max_length=50)
    storage = models.IntegerField()
    ram = models.IntegerField()
    release_date = models.DateField()
    max_battery = models.IntegerField()
    main_camera_res = models.FloatField()
    selfie_camera_res = models.FloatField()
    has_nfc = models.BooleanField(default=False)
    has_headphone_jack = models.BooleanField(default=True)
    product_image = models.URLField(max_length=250)
    synopsis = models.TextField()

    brand = models.ForeignKey(Brand, on_delete=models.CASCADE)
    color = models.ForeignKey(Color, on_delete=models.CASCADE)
    max_supported_network = models.ForeignKey(MaxSupportNetwork, on_delete=models.CASCADE)
    operating_system = models.ForeignKey(OperatingSystem, on_delete=models.CASCADE)
