import * as React from "react";
import { Alerts as GlobalAlertsWrapper } from "./Alerts";
import { Cookies as GlobalCookiesWrapper } from "./Cookies";
import { UserInfo as GlobalUserInfoWrapper } from "./UserInfo";
import { Sync as GlobalSyncWrapper } from "./Sync";

export const Wrappers = ({ children }) => {
  return (
    <GlobalCookiesWrapper>
      <GlobalUserInfoWrapper>
        <GlobalAlertsWrapper>
          <GlobalSyncWrapper>{children}</GlobalSyncWrapper>
        </GlobalAlertsWrapper>
      </GlobalUserInfoWrapper>
    </GlobalCookiesWrapper>
  );
};
