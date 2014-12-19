# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0002_auto_20141215_1628'),
    ]

    operations = [
        migrations.AddField(
            model_name='card',
            name='public',
            field=models.BooleanField(default=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='card',
            name='title',
            field=models.CharField(default=b'A Title !', max_length=200),
            preserve_default=True,
        ),
    ]
