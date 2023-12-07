import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/router";
import axios from "axios";
// import { getUser } from "../hooks";

const pub_key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = loadStripe(pub_key);

export default function App() {
  // const user = getUser();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const loadEmbeddedCheckout = async () => {
    setLoading(true);

    try {
      // const userEmail = user?.email;

      const response = await axios.post("/api/checkout_sessions", {
        userEmail: "",
      });

      const data = response.data;
      if (typeof data === "string") setError(data);
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error("Error loading embedded checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (true) {
      loadEmbeddedCheckout();
    } else router.replace("/");
  }, []);
  const router = useRouter();
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <h3 style={{}}>Please wait...</h3>
      </div>
    );

  return (
    <>
      {clientSecret ? (
        <div
          className="fj-stripe-container"
          style={{
            paddingTop: 20,
            display: "flex",
            justifyContent: "center",
          }}
          id="checkout"
        >
          <div>
            <div className="fj-stripe-info">
              <p
                className="fj-stripe-text"
                style={{
                  fontSize: 13,
                  marginBottom: 2,
                }}
              >
                $0 Upfront - Custom Menu Design, Optimization, and Management
              </p>
              <h1
                className="fj-stripe-text"
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  marginBottom: 2,
                  color: "black",
                }}
              >
                14 days trial
              </h1>
              <p
                className="fj-stripe-text"
                style={{
                  fontSize: 12,
                  marginBottom: 12,
                }}
              >
                Then $299.00 per month
              </p>
              <p
                className="fj-stripe-text"
                style={{
                  fontSize: 13,
                }}
              >
                Fully custom, eye-catching menu design, expertly crafted for
                your restaurant. Includes unlimited menu revisions and an easy
                to use online menu editor on Flapjack.co. Cancel anytime.
              </p>
            </div>
          </div>

          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <EmbeddedCheckout className="fJ-stripe-container" />
          </EmbeddedCheckoutProvider>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <h5 style={{}}>
            {error || "Unfortunately, something went wrong."}{" "}
            <span
              style={{
                textDecoration: "underline",
                cursor: "pointer",
                marginLeft: 10,
                color: "#0070f3",
              }}
              onClick={() => router.replace("/templates")}
            >
              Go Home
            </span>
          </h5>
        </div>
      )}
    </>
  );
}
