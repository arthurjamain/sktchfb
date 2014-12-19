from django.db import models

# Create your models here.


class Card(models.Model):
  public = models.BooleanField(default=True)
  title = models.CharField(max_length=200, default="A Title !")
  name = models.CharField(max_length=200, null=True)
  created_at = models.DateTimeField(auto_now_add=True)
  color = models.CharField(max_length=200, null=False, default="#FF0066")
  image = models.CharField(max_length=8192, null=True)
  imageCoordinates = models.CharField(max_length=100, null=True)
  imageSize = models.CharField(max_length=10, null=True)
  radius = models.IntegerField(null=True)
  fields = models.CharField(max_length=2048, null=True)
  
  def __unicode__(self):
    return self.title