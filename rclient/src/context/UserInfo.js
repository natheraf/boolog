import * as React from "react";
import { CookiesContext } from "./Cookies";

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
      refreshAndIsLoggedIn: () => {
        const isLoggedIn = getCookies("userInfo") !== undefined;
        setLoggedIn(isLoggedIn);
        return isLoggedIn;
      },
    }),
    [loggedIn]
  );

  return <UserInfoContext.Provider value={userInfoMemo} children={children} />;
};
