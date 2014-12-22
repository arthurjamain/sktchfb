# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0010_card_views'),
    ]

    operations = [
        migrations.AddField(
            model_name='card',
            name='fieldsSizes',
            field=models.CharField(max_length=2048, null=True),
            preserve_default=True,
        ),
    ]
