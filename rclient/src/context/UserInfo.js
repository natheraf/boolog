import * as React from "react";
import { CookiesContext } from "./Cookies";
import { getCurrentUser } from "../api/IndexedDB/State";
import { handleSimpleRequest } from "../api/Axios";
import { AlertsContext } from "./Alerts";

export const UserInfoContext = React.createContext(null);

export const UserInfo = ({ children }) => {
  const addAlert = React.useContext(AlertsContext).addAlert;
  const getCookies = React.useContext(CookiesContext).getCookies;
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const refreshAndIsLoggedIn = React.useCallback(
    () =>
      new Promise((resolve, _reject) => {
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
    [getCookies]
  );

  const handleLogout = React.useCallback(() => {
    handleSimpleRequest("post", {}, "auth/signout")
      .then((_res) => {
        window.location.reload();
      })
      .catch((error) => addAlert(error.toString(), "error"));
  }, [addAlert]);

  const nuke = React.useCallback(async () => {
    const databases = await indexedDB.databases();
    for (const database of databases) {
      window.indexedDB.deleteDatabase(database.name);
    }
    handleLogout();
    window.localStorage.clear();
  }, [handleLogout]);

  const userInfoMemo = React.useMemo(
    () => ({
      isLoggedIn: () => loggedIn,
      refreshAndIsLoggedIn,
      handleLogout,
      nuke,
    }),
    [handleLogout, loggedIn, nuke, refreshAndIsLoggedIn]
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
