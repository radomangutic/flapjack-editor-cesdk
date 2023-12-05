import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Return() {
  const router = useRouter();
  const [status, setStatus] = useState(null);
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
      });
  }, []);
  console.log("status", status);
  if (status === "open") {
    return router.push("/");
  }

  if (status === "complete") {
    return (
      <section id="success">
        <p>success</p>
      </section>
    );
  }

  return null;
}
