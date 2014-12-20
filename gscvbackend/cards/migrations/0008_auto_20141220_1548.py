# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0007_auto_20141220_1542'),
    ]

    operations = [
        migrations.AlterField(
            model_name='card',
            name='fields',
            field=models.CharField(max_length=4096, null=True),
            preserve_default=True,
        ),
    ]
