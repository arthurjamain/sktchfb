import re
from tastypie.resources import ModelResource
from tastypie.constants import ALL
from tastypie.authorization import Authorization
from django.http import HttpResponse
from cards.models import Card
from cards.renderer import Renderer
from cards.shortener import UrlEncoder


renderer = Renderer()
shortener = UrlEncoder()
apiOverrideRe = re.compile('(?!^\d+$)^.+$')

class CardResource(ModelResource):

    # Configure resource
    class Meta:
        queryset = Card.objects.all()
        resource_name = 'card'
        list_allowed_methods = ['get', 'post', 'put', 'delete']
        ordering = ['views']
        filtering = { "name" : ALL, "title" : ALL }
        always_return_data = True
        authorization = Authorization()

    # Override dispatch to resolve shortened urls
    def dispatch(self, request_type, request, **kwargs):


        fragments = request.path.split('/')
        digest = fragments[-2].encode("utf8")

        print "DISPATCH", request_type, request.path

        if (len(fragments) == 5 and apiOverrideRe.match(digest)):

            del(fragments[-1])
            del(fragments[-1])
            expanded = shortener.decode_url(digest)
            path = str('/'.join(fragments)) + '/' + str(expanded)

            kwargs['pk'] = str(expanded)
            request.META['PATH_INFO'] = path
            request.path = path

        r = super(CardResource, self).dispatch(request_type, request, **kwargs)
        return r

    # Hook at object creation
    def obj_create( self, bundle, request = None, **kwargs ):

        renderName = renderer.render(bundle)
        bundle.data['render'] = renderName

        card_bundle = super( CardResource, self ).obj_create( bundle, **kwargs )

        return card_bundle

    # Hook at object read
    def obj_get( self, bundle, **kwargs ):

        card_bundle = super( CardResource, self ).obj_get( bundle, **kwargs )
        card_bundle.views += 1
        card_bundle.save()

        return card_bundle

    # Hook at the creation of the HTTP response to create a shortened URL based on the object's ID
    def create_response( self, request, bundle, response_class=HttpResponse, **response_kwargs ):

        response = super ( CardResource, self ).create_response( request, bundle, response_class, **response_kwargs )

        if request.META['REQUEST_METHOD'] == 'POST':
            # Inject shortened URL
            bundle.data['digest'] = shortener.encode_url(int(bundle.data['id']))
            bundle = super( CardResource, self ).obj_update( bundle, request, **response_kwargs )
            response = super ( CardResource, self ).create_response( request, bundle, response_class, **response_kwargs )

        return response

    # Hook at object update
    def obj_update( self, bundle, request=None, **kwargs ):

        renderName = renderer.render(bundle)
        bundle.data['render'] = renderName

        card_bundle = super( CardResource, self ).obj_update( bundle, request, **kwargs )
        return card_bundle

