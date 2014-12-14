from django.conf.urls import patterns, include, url
from django.contrib import admin
from api import CardResource
from cards import views
from django.conf import settings
from django.conf.urls.static import static

cardResource = CardResource()

urlpatterns = patterns(
  '',
  url(r'^admin/', include(admin.site.urls)),
  url(r'^api/', include(cardResource.urls)),   
  url(r'^$', views.index, name='index'),
)

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS)
