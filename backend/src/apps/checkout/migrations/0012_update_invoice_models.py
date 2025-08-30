# Generated manually to update invoice models

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('checkout', '0011_remove_invoice_generated_by_remove_invoice_template_and_more'),
    ]

    operations = [
        # Add is_default field to InvoiceTemplate
        migrations.AddField(
            model_name='invoicetemplate',
            name='is_default',
            field=models.BooleanField(
                default=False,
                help_text='Use as default template for automatic invoice generation'
            ),
        ),
        
        # Add constraint to ensure only one default template
        migrations.AddConstraint(
            model_name='invoicetemplate',
            constraint=models.UniqueConstraint(
                fields=['is_default'],
                condition=models.Q(is_default=True),
                name='unique_default_template'
            ),
        ),
        
        # Add html_content field to Invoice
        migrations.AddField(
            model_name='invoice',
            name='html_content',
            field=models.TextField(
                help_text='Rendered HTML content of the invoice',
                default=''
            ),
        ),
        
        # Remove template field from Invoice
        migrations.RemoveField(
            model_name='invoice',
            name='template',
        ),
        
        # Remove generated_by field from Invoice
        migrations.RemoveField(
            model_name='invoice',
            name='generated_by',
        ),
    ] 