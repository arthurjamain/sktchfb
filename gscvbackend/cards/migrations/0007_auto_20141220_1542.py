# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0006_card_imagesize'),
    ]

    operations = [
        migrations.AddField(
            model_name='card',
            name='fieldsColors',
            field=models.CharField(max_length=2048, null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='card',
            name='fieldsCoordinates',
            field=models.CharField(max_length=2048, null=True),
            preserve_default=True,
        ),
    ]
