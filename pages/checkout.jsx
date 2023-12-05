import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51OJt1kKffdXhvHhpIYwYMvHugVgVplAgSygj1taCHFYcFfjxpF70r368ha2m9usZ1rGYwlEamfadi8m1KsxK04Nm00QZNIgthu');

export default function App() {
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(false);
    const loadEmbeddedCheckout = async () => {
        setLoading(true);
        const response = await fetch('/api/checkout_sessions', {
            method: 'POST'
        });
        const data = await response.json();
        console.log("🚀 ~ file: checkout.jsx:19 ~ loadEmbeddedCheckout ~ data:", data)
        setClientSecret(data.clientSecret);
        setLoading(false);
    }

    useEffect(() => {
        loadEmbeddedCheckout();
    }, []);
    console.log("🚀 ~ file: checkout.jsx:12 ~ App ~ clientSecret:", clientSecret)
    if (loading) return <h1>Loading...</h1>
    return (

        <div style={{
            paddingTop: 100
        }} id="checkout">
            {clientSecret && (
                <EmbeddedCheckoutProvider
                    stripe={stripePromise}
                    options={{ clientSecret }}
                >
                    <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
            )}
        </div>
    )
}