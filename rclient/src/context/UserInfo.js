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

  const refreshAndIsLoggedIn = () =>
    new Promise((resolve, reject) => {
      getCurrentUserId().then((id) => {
        const isLoggedIn = getCookies(`userInfo_${id}`) !== undefined;
        setLoggedIn(isLoggedIn);
        resolve(isLoggedIn);
      });
    });
  refreshAndIsLoggedIn();

  const userInfoMemo = React.useMemo(
    () => ({
      isLoggedIn: () => loggedIn,
      refreshAndIsLoggedIn,
    }),
    [loggedIn]
  );

  return <UserInfoContext.Provider value={userInfoMemo} children={children} />;
};
