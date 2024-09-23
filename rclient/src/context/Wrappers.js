import * as React from "react";
import { Alerts as GlobalAlertsWrapper } from "./Alerts";
import { Cookies as GlobalCookiesWrapper } from "./Cookies";

export const Wrappers = ({ children }) => {
  return (
    <GlobalCookiesWrapper>
      <GlobalAlertsWrapper>{children}</GlobalAlertsWrapper>
    </GlobalCookiesWrapper>
  );
};
