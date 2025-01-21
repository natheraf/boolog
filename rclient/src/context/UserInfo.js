import * as React from "react";
import { CookiesContext } from "./Cookies";
import { getCurrentUserId } from "../api/IndexedDB/State";

export const UserInfoContext = React.createContext({
  isLoggedIn: () => {},
  refreshAndIsLoggedIn: () => {},
});

export const UserInfo = ({ children }) => {
  const getCookies = React.useContext(CookiesContext).getCookies;
  const [loggedIn, setLoggedIn] = React.useState(
    getCookies("userInfo") !== undefined
  );

  const userInfoMemo = React.useMemo(
    () => ({
      isLoggedIn: () => loggedIn,
      refreshAndIsLoggedIn: async () => {
        const isLoggedIn =
          getCookies(`userInfo_${await getCurrentUserId()}`) !== undefined;
        setLoggedIn(isLoggedIn);
        return isLoggedIn;
      },
    }),
    [loggedIn]
  );

  return <UserInfoContext.Provider value={userInfoMemo} children={children} />;
};
