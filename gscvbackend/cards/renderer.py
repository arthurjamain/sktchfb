import urllib, cStringIO
from PIL import Image


class Renderer:
  
  def __init__(self):
    
    print('New renderer :)')
    
  def render(self, bundle):
    
    print('Render');
    
    
    imageFile = cStringIO.StringIO(urllib.urlopen(bundle.data.image).read())
    img = Image.open(imageFile)
    
    img.save('salut7234.png')
    
    print(bundle.data);
    