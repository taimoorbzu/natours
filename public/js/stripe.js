/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async tourId => {
  try {
    // 1) Get checkout session from API
    const res = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) Redirect to Stripe hosted checkout page
    if (res.data.session && res.data.session.url) {
      window.location.assign(res.data.session.url);
    }
  } catch (err) {
    console.error(err);
    const bookBtn = document.getElementById('book-tour');
    if (bookBtn) bookBtn.textContent = 'Book tour now!';
    showAlert('error', err.response?.data?.message || 'Something went wrong while booking!');
  }
};

