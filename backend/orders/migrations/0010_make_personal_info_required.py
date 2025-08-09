# Generated manually to make personal information fields required
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0009_shippingmethod_delivery_estimated_time'),
        ('users', '0001_initial'),  # Ensure users app is available for Address model
    ]

    operations = [
        # First, we need to handle existing records with null values
        # Set default values for existing null records before making fields required
        migrations.RunSQL(
            "UPDATE orders_order SET cart_subtotal = 0 WHERE cart_subtotal IS NULL;",
            reverse_sql="UPDATE orders_order SET cart_subtotal = NULL WHERE cart_subtotal = 0;"
        ),
        migrations.RunSQL(
            "UPDATE orders_order SET customer_name = 'Unknown Customer' WHERE customer_name IS NULL OR customer_name = '';",
            reverse_sql="UPDATE orders_order SET customer_name = NULL WHERE customer_name = 'Unknown Customer';"
        ),
        migrations.RunSQL(
            "UPDATE orders_order SET customer_email = 'unknown@example.com' WHERE customer_email IS NULL OR customer_email = '';",
            reverse_sql="UPDATE orders_order SET customer_email = NULL WHERE customer_email = 'unknown@example.com';"
        ),
        migrations.RunSQL(
            "UPDATE orders_order SET customer_phone = 'Unknown' WHERE customer_phone IS NULL OR customer_phone = '';",
            reverse_sql="UPDATE orders_order SET customer_phone = NULL WHERE customer_phone = 'Unknown';"
        ),
        migrations.RunSQL(
            "UPDATE orders_order SET tracking_number = 'TRK-PENDING' WHERE tracking_number IS NULL OR tracking_number = '';",
            reverse_sql="UPDATE orders_order SET tracking_number = NULL WHERE tracking_number = 'TRK-PENDING';"
        ),
        migrations.RunSQL(
            "UPDATE orders_orderpayment SET admin_account_number = 'Not Set' WHERE admin_account_number IS NULL OR admin_account_number = '';",
            reverse_sql="UPDATE orders_orderpayment SET admin_account_number = NULL WHERE admin_account_number = 'Not Set';"
        ),
        
        # Now alter the fields to make them required where safe
        migrations.AlterField(
            model_name='order',
            name='cart_subtotal',
            field=models.DecimalField(decimal_places=2, default=0, help_text='Subtotal before shipping and discounts', max_digits=12),
        ),
        migrations.AlterField(
            model_name='order',
            name='customer_email',
            field=models.EmailField(help_text='Required customer email', max_length=254),
        ),
        migrations.AlterField(
            model_name='order',
            name='customer_name',
            field=models.CharField(help_text='Required customer name', max_length=100),
        ),
        migrations.AlterField(
            model_name='order',
            name='customer_phone',
            field=models.CharField(help_text='Required customer phone number', max_length=50),
        ),
        # Keep shipping fields nullable to avoid NOT NULL failures on existing data
        migrations.AlterField(
            model_name='order',
            name='shipping_address',
            field=models.ForeignKey(help_text='Shipping address', on_delete=django.db.models.deletion.PROTECT, to='users.address', null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='order',
            name='shipping_method',
            field=models.ForeignKey(help_text='Shipping method', on_delete=django.db.models.deletion.PROTECT, to='orders.shippingmethod', null=True, blank=True),
        ),
        migrations.AlterField(
            model_name='order',
            name='tracking_number',
            field=models.CharField(help_text='Required tracking number for order tracking', max_length=100),
        ),
        migrations.AlterField(
            model_name='orderpayment',
            name='admin_account_number',
            field=models.CharField(help_text='Required backend-set account number', max_length=50),
        ),
    ]
