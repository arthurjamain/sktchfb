from __future__ import division
import urllib, cStringIO, os, sys, json
from PIL import Image, ImageDraw, ImageFont
import uuid;


# Card Renderer
# -------------
# Eat card data, compose image, save it, return its path
class Renderer:

  # Arbitraty card dimensions
  cardDimensions = 550, 300

  def __init__(self):

    print('New renderer :)')

  # Main rendering function.
  # It should be called manually.
  # Takes a Card bundle, returns a string
  def render(self, bundle):

    print('Render');

    scriptDir       = os.path.dirname(os.path.realpath(sys.argv[0]))
    renderedDir     = '/cards/static/'
    staticDir       = 'renders/'
    rendered        = Image.new('RGB', self.cardDimensions)
    renderedDrawer  = ImageDraw.Draw(rendered)
    data            = bundle.data
    name            = self.generateName()
    format          = '.png'


    if 'color' in data:

      self.__renderBackgroundColor(data, renderedDrawer)

    if 'image' in data and data['image'] != None:

      self.__renderImage(data, rendered)

    if 'radius' in data:

      self.__renderRadius(data, rendered)

    if 'fieldsCoordinates' in data and 'fieldsColors' in data:

      self.__renderText(data, rendered)

    fullPath = scriptDir + renderedDir + staticDir + name + format

    rendered.save(fullPath)
    return renderedDir + staticDir + name + format

  def __renderBackgroundColor(self, data, draw):

    color = data['color']

    print('Render background color')

    draw.rectangle([(0, 0), self.cardDimensions], fill = self.formatColor(color))


  def __renderImage(self, data, im):

    print('Render background image')
    coords = {'top': 0, 'left': 0}
    imageSize = 'original'
    backgroundImageResource = cStringIO.StringIO(urllib.urlopen(data['image']).read())
    backgroundImage = Image.open(backgroundImageResource)

    if 'imageCoordinates' in data:
      coords = data['imageCoordinates'] or {'top': 0, 'left': 0}

    if 'imageSize'in data:
      imageSize = data['imageSize'] or 'original'

    if imageSize == 'contain':

      targetH = self.cardDimensions[1]
      ratio = targetH / backgroundImage.size[1]
      targetW = int(backgroundImage.size[0] * ratio)
      backgroundImage.thumbnail((targetW, targetH), Image.ANTIALIAS)
      im.paste(backgroundImage, (coords['left'], coords['top']))

    elif imageSize == 'cover':

      targetW = self.cardDimensions[0]
      ratio = targetW / backgroundImage.size[0]
      targetH = int(backgroundImage.size[1] * ratio)
      backgroundImage.thumbnail((targetW, targetH), Image.ANTIALIAS)
      im.paste(backgroundImage, (coords['left'], coords['top']))

    elif imageSize == 'original':

      im.paste(backgroundImage, (coords['left'], coords['top']))

  def __renderText(self, data, im):

    print('Render text')

    name    = data['name']
    fields  = data['fields']
    coords  = data['fieldsCoordinates']
    colors  = data['fieldsColors']
    sizes   = data['fieldsSizes']

    namesize = 16

    if 'name' in sizes:
      namesize = sizes['name'] or 16

    draw = ImageDraw.Draw(im)
    font = ImageFont.truetype('fonts/OpenSans-Regular.ttf', namesize)

    #name
    draw.text((coords['name']['left'], coords['name']['top'] + 16), name, self.formatColor(colors['name']), font=font)

    #fields
    for fieldName, fieldValue in fields.iteritems():

      fontsize = 16

      if fieldName in sizes:
        fontsize = sizes[fieldName] or 16

      font = ImageFont.truetype('fonts/OpenSans-Regular.ttf', fontsize)
      draw.text((coords[fieldName]['left'], coords[fieldName]['top'] + 16), fieldValue, self.formatColor(colors[fieldName]), font=font)


  def __renderRadius(self, data, im):

    print('Render radius')

    rad = data['radius']

    circle = Image.new('L', (rad * 2, rad * 2), 0)
    draw = ImageDraw.Draw(circle)
    draw.ellipse((0, 0, rad * 2, rad * 2), fill=255)
    alpha = Image.new('L', im.size, "white")
    w, h = im.size
    alpha.paste(circle.crop((0, 0, rad, rad)), (0, 0))
    alpha.paste(circle.crop((0, rad, rad, rad * 2)), (0, h - rad))
    alpha.paste(circle.crop((rad, 0, rad * 2, rad)), (w - rad, 0))
    alpha.paste(circle.crop((rad, rad, rad * 2, rad * 2)), (w - rad, h - rad))
    im.putalpha(alpha)

  # Utils
  # -----
  def formatColor(self, color):

    return 'rgb(' + str(int(color['r'] * 255)) + ',' + str(int(color['g'] * 255)) + ',' + str(int(color['b'] * 255)) + ')'

  def generateName(self):

    return str(uuid.uuid4().get_hex().upper()[0:12]);



