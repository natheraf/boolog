import * as React from "react";
import { Alerts as GlobalAlertsWrapper } from "./Alerts";
import { Cookies as GlobalCookiesWrapper } from "./Cookies";
import { UserInfo as GlobalUserInfoWrapper } from "./UserInfo";

export const Wrappers = ({ children }) => {
  return (
    <GlobalCookiesWrapper>
      <GlobalUserInfoWrapper>
        <GlobalAlertsWrapper>{children}</GlobalAlertsWrapper>
      </GlobalUserInfoWrapper>
    </GlobalCookiesWrapper>
  );
};
