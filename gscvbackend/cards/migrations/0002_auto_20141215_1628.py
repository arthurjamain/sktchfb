# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='card',
            name='color',
            field=models.CharField(max_length=7, null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='card',
            name='fields',
            field=models.CharField(max_length=2048, null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='card',
            name='image',
            field=models.CharField(max_length=8192, null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='card',
            name='radius',
            field=models.IntegerField(null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='card',
            name='title',
            field=models.CharField(default='Title', max_length=200),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='card',
            name='name',
            field=models.CharField(max_length=200, null=True),
            preserve_default=True,
        ),
    ]
