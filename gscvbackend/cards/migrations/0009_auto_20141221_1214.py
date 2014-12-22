# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0008_auto_20141220_1548'),
    ]

    operations = [
        migrations.AddField(
            model_name='card',
            name='digest',
            field=models.CharField(max_length=64, null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='card',
            name='render',
            field=models.CharField(max_length=128, null=True),
            preserve_default=True,
        ),
    ]
