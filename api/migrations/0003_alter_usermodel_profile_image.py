# Generated by Django 5.0.6 on 2024-06-13 10:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_alter_reelmodel_options_alter_sequencemodel_options_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usermodel',
            name='profile_image',
            field=models.ImageField(default=None, null=True, upload_to='uploads/user'),
        ),
    ]
