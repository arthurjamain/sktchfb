# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0009_auto_20141221_1214'),
    ]

    operations = [
        migrations.AddField(
            model_name='card',
            name='views',
            field=models.IntegerField(default=0),
            preserve_default=True,
        ),
    ]
