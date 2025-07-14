from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("checkout", "0008_alter_shippingmethod_courier"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            -- Function to automatically update order status based on shipment changes
            CREATE OR REPLACE FUNCTION update_order_status_on_shipment()
            RETURNS TRIGGER AS $$
            BEGIN
                -- When shipment is created (shipped_at is set)
                IF NEW.shipped_at IS NOT NULL AND (OLD.shipped_at IS NULL OR OLD.shipped_at IS NULL) THEN
                    UPDATE checkout_order 
                    SET status = 'shipped' 
                    WHERE id = NEW.order_id;
                    
                -- When shipment is delivered (delivered_at is set)
                ELSIF NEW.delivered_at IS NOT NULL AND (OLD.delivered_at IS NULL OR OLD.delivered_at IS NULL) THEN
                    UPDATE checkout_order 
                    SET status = 'delivered' 
                    WHERE id = NEW.order_id;
                END IF;
                
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
            """,
            reverse_sql="""
            DROP FUNCTION IF EXISTS update_order_status_on_shipment();
            """,
        ),
        migrations.RunSQL(
            sql="""
            -- Trigger that automatically calls the function when shipment changes
            CREATE TRIGGER shipment_status_trigger
                AFTER INSERT OR UPDATE ON checkout_shipment
                FOR EACH ROW
                EXECUTE FUNCTION update_order_status_on_shipment();
            """,
            reverse_sql="""
            DROP TRIGGER IF EXISTS shipment_status_trigger ON checkout_shipment;
            """,
        ),
    ]
