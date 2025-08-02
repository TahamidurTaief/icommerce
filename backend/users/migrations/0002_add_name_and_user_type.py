# Generated manually to add missing fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='name',
            field=models.CharField(default='', max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='user',
            name='user_type',
            field=models.CharField(
                choices=[('CUSTOMER', 'Customer'), ('SELLER', 'Seller'), ('ADMIN', 'Admin')],
                default='CUSTOMER',
                max_length=10
            ),
        ),
    ]
