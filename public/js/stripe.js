/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
let stripe;

export const bookTour = async tourId => {
  try {
    if (!stripe && typeof Stripe !== 'undefined') {
      stripe = Stripe(`${process.env.STRIPE_PUBLISHABLE_KEY}`);
    }

    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // 2) Create checkout form + charge credit card
    if (stripe) {
      await stripe.redirectToCheckout({
        sessionId: session.data.session.id
      });
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
