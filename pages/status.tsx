import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";

const getStatusMessage = (status: string) => {
  switch (status) {
    case "loading":
      return "Your request is being processed. Please wait...";
    case "complete":
      return "Credit card added successfully.";
    case "failed":
      return "Unfortunately, adding your bank details failed. Please try again or contact <a href='mailto:jessica@flapjack.co' style='color: #0000EE; '>jessica@flapjack.co</a>.";
    case "invalid":
      return "Session not found.";
    case "expired":
      return "Your session has expired.";
    default:
      return "Something went wrong. Please try again or contact <a href='mailto:jessica@flapjack.co' style='color: #0000EE; '>jessica@flapjack.co</a>.";
  }
};

export default function Return() {
  const router = useRouter();
  const [status, setStatus] = useState<any>("loading");
  const [customerEmail, setCustomerEmail] = useState("");

  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sessionId = urlParams.get("session_id");
    setStatus("loading");
    fetch(`/api/checkout_sessions?session_id=${sessionId}`, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("data", data);
        if (
          typeof data === "string" &&
          data?.includes("No such checkout.session")
        ) {
          setStatus("invalid");
        } else {
          setStatus(data.session.status);
          setCustomerEmail(data.session.customer_email);
        }
      })
      .catch((err) => {
        console.log("error session", err);
        setStatus("failed");
      });
  }, []);
  return (
    <section id={status}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <h4 dangerouslySetInnerHTML={{ __html: getStatusMessage(status) }}></h4>
      </div>
    </section>
  );
}