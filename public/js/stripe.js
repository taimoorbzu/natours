/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
let stripe;

export const bookTour = async tourId => {
  try {
    if (!stripe && typeof Stripe !== 'undefined') {
      stripe = Stripe('pk_test_BUkd0ZXAj6m0q0jMyRgBxNns00PPtgvjjr');
    }

    // 1) Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

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
