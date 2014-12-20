from tastypie.resources import ModelResource
from tastypie.constants import ALL
from tastypie.authorization import Authorization
from cards.models import Card
from cards.renderer import Renderer


renderer = Renderer()

class CardResource(ModelResource):
    class Meta:
        queryset = Card.objects.all()
        resource_name = 'card'
        list_allowed_methods = ['get', 'post', 'put', 'delete']
        filtering = { "name" : ALL, "title" : ALL }
        always_return_data = True
        authorization = Authorization()
      
    
    def obj_create(self, bundle, request=None, **kwargs):

        card_bundle = super( CardResource, self ).obj_create( bundle, request, **kwargs )
        
        return card_bundle

    def obj_update(self, bundle, request=None, **kwargs):

        card_bundle = super( CardResource, self ).obj_update( bundle, request, **kwargs )
        url = renderer.render(card_bundle)
        return card_bundle
        
        