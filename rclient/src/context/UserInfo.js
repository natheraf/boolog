import * as React from "react";
import { CookiesContext } from "./Cookies";
import { getCurrentUserId } from "../api/IndexedDB/State";

export const UserInfoContext = React.createContext({
  isLoggedIn: () => {},
  refreshAndIsLoggedIn: () => {},
});

export const UserInfo = ({ children }) => {
  const getCookies = React.useContext(CookiesContext).getCookies;
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const userInfoMemo = React.useMemo(
    () => ({
      isLoggedIn: () => loggedIn,
      refreshAndIsLoggedIn: () =>
        new Promise((resolve, reject) => {
          getCurrentUserId().then((id) => {
            const isLoggedIn = getCookies(`userInfo_${id}`) !== undefined;
            setLoggedIn(isLoggedIn);
            resolve(isLoggedIn);
          });
        }),
    }),
    [loggedIn]
  );

  userInfoMemo.refreshAndIsLoggedIn().then(() => {
    setIsLoading(false);
  });

  if (isLoading === false) {
    return (
      <UserInfoContext.Provider value={userInfoMemo} children={children} />
    );
  }
};
