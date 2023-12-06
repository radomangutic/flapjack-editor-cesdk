import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Return() {
  const router = useRouter();
  const [status, setStatus] = useState<any>(null);
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionId = urlParams.get("session_id");

    fetch(`/api/checkout_sessions?session_id=${sessionId}`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("🚀 ~ file: return.tsx:19 ~ .then ~ data:", data);
        setStatus(data.session.status);
        setCustomerEmail(data.session.customer_email);
      })
      .catch((err) => {
        console.log("🚀 ~ file: return.tsx:19 ~ .then ~ err:", err);
        setStatus("failed");
      });
  }, []);
  if (status === "open") {
    return router.push("/");
  }

  if (status === "complete") {
    return (
      <section id="success">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <h4>Success Message</h4>
        </div>
      </section>
    );
  } else if (status === "failed") {
    return (
      <section id="failed">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <h1>Failed Message</h1>
        </div>
      </section>
    );
  }
}
