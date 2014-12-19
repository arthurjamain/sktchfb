# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0004_auto_20141215_1700'),
    ]

    operations = [
        migrations.AddField(
            model_name='card',
            name='imageCoordinates',
            field=models.CharField(max_length=100, null=True),
            preserve_default=True,
        ),
    ]
