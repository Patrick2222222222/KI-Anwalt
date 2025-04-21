// config/stripe.js
import { loadStripe } from '@stripe/stripe-js';

// Load the Stripe publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

export default stripePromise;
