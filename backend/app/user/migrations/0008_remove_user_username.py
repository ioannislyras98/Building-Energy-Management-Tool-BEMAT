# Generated by Django 5.1.6 on 2025-03-23 09:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0007_user_last_login'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='username',
        ),
    ]
