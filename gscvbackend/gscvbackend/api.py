from tastypie.resources import ModelResource
from tastypie.constants import ALL
from tastypie.authorization import Authorization
from cards.models import Card

class CardResource(ModelResource):
    class Meta:
        queryset = Card.objects.all()
        resource_name = 'card'
        list_allowed_methods = ['get', 'post', 'put', 'delete']
        filtering = { "name" : ALL, "title" : ALL }
        always_return_data = True
        authorization = Authorization()