import * as React from "react";
import { Alerts as GlobalAlertsWrapper } from "./Alerts";
import { Cookies as GlobalCookiesWrapper } from "./Cookies";
import { UserInfo as GlobalUserInfoWrapper } from "./UserInfo";
import { Sync as GlobalSyncWrapper } from "./Sync";
import { GlobalData as GlobalDataWrapper } from "../features/context/GlobalData";

export const Wrappers = ({ children }) => {
  return (
    <GlobalCookiesWrapper>
      <GlobalUserInfoWrapper>
        <GlobalAlertsWrapper>
          <GlobalSyncWrapper>
            <GlobalDataWrapper>{children}</GlobalDataWrapper>
          </GlobalSyncWrapper>
        </GlobalAlertsWrapper>
      </GlobalUserInfoWrapper>
    </GlobalCookiesWrapper>
  );
};
