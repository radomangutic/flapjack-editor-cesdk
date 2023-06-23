import { useState, useEffect } from "react";

type TriggerUpsellOptions = Partial<{
  shouldTrigger: boolean;
}>;

export function useUpsell(subscribed?: boolean, userId?: string) {
  const [checkoutLink, setCheckoutLink] = useState();
  useEffect(() => {
    async function getCheckoutLink() {
      const checkoutURL = await fetch(
        `${window.location.origin}/api/checkout`,
        {
          method: "POST",
          body: JSON.stringify({ userId }),
        }
      )
        .then((res) => res.json())
        .then((data) => data.url);
      setCheckoutLink(checkoutURL);
    }
    getCheckoutLink();
  }, [userId]);

  const openCheckoutLink = () => window.open(checkoutLink, "_blank");

  const triggerUpsellOr = (
    callback?: () => void,
    options?: TriggerUpsellOptions
  ) => {
    const shouldTriggerUpsell = options ? options.shouldTrigger : !subscribed;
    return shouldTriggerUpsell ? openCheckoutLink : callback;
  };

  return { triggerUpsellOr };
}
