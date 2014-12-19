# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0005_card_imagecoordinates'),
    ]

    operations = [
        migrations.AddField(
            model_name='card',
            name='imageSize',
            field=models.CharField(max_length=10, null=True),
            preserve_default=True,
        ),
    ]
