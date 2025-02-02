import * as React from "react";
import { CookiesContext } from "./Cookies";
import { getCurrentUser } from "../api/IndexedDB/State";

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
          getCurrentUser().then((user) => {
            const isLoggedIn = getCookies(`userInfo_${user.id}`) !== undefined;
            localStorage.setItem("userId", user.id);
            localStorage.setItem("userName", user.name);
            localStorage.setItem("profilePicture", user.profilePicture);
            localStorage.setItem("isLoggedIn", isLoggedIn);
            setLoggedIn(isLoggedIn);
            resolve(isLoggedIn);
          });
        }),
    }),
    [loggedIn]
  );

  React.useEffect(() => {
    userInfoMemo.refreshAndIsLoggedIn().then(() => {
      setIsLoading(false);
    });
  }, []);

  if (isLoading === false) {
    return (
      <UserInfoContext.Provider value={userInfoMemo} children={children} />
    );
  }
};
