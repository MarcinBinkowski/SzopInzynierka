from django.conf import settings
import stripe
from django.core.exceptions import ValidationError
import logging

from stripe import PaymentIntent, StripeError

logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeService:
    """Service class for handling Stripe operations"""
    
    @staticmethod
    def create_payment_intent(amount: int, currency: str='usd')-> PaymentIntent:
        """
        Create a Stripe PaymentIntent
        
        Args:
            amount: Amount in cents
            currency: Currency code (default: 'usd')
            
        Returns:
            PaymentIntent data
        """
        try:
            payment_intent_data = {
                'amount': amount,
                'currency': currency,
                'automatic_payment_methods': {
                    'enabled': True,
                },
            }
            
            payment_intent = PaymentIntent.create(**payment_intent_data)
            
            logger.info(f"Created PaymentIntent: {payment_intent.id}")
            return payment_intent
            
        except StripeError as e:
            logger.error(f"Stripe error creating PaymentIntent: {e}")
            raise ValidationError(f"Payment processing error: {str(e)}")
    
    @staticmethod
    def confirm_payment_intent(payment_intent_id, payment_method_id)->PaymentIntent:
        """
        Confirm a PaymentIntent
        
        Args:
            payment_intent_id: Stripe PaymentIntent ID
            payment_method_id: Stripe PaymentMethod ID
            
        Returns:
            Confirmed PaymentIntent object
        """
        try:
            payment_intent = PaymentIntent.confirm(
                payment_intent_id,
                payment_method=payment_method_id
            )
            
            logger.info(f"Confirmed PaymentIntent: {payment_intent_id}")
            return payment_intent
            
        except StripeError as e:
            logger.error(f"Stripe error confirming PaymentIntent: {e}")
            raise ValidationError(f"Payment confirmation error: {str(e)}")
    
    