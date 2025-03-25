import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { AlertsContext } from "../../context/Alerts";
import { UserInfoContext } from "../../context/UserInfo";
import { handleSimpleRequest } from "../../api/Axios";

export const GoogleAuth = () => {
  const addAlert = React.useContext(AlertsContext).addAlert;
  const userInfoContext = React.useContext(UserInfoContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const code = searchParams.get("code");
  const scope = searchParams.get("scope");
  const handlePasswordlessLogin = () => {
    console.log(code, scope);
    handleSimpleRequest(
      "post",
      {
        code,
      },
      "auth/google/get-token"
    )
      .then((res) => {
        console.log(res.data);
        // addAlert(res.data.message, "info");
        // userInfoContext.refreshAndIsLoggedIn();
      })
      .catch((error) => addAlert(error.toString(), "error"));
    // .finally(() => (window.location.href = "/"));
  };

  // Timeout is there to stop strict mode from calling function twice
  React.useEffect(() => {
    const timeoutId = setTimeout(handlePasswordlessLogin, 100);
    return () => clearTimeout(timeoutId);
  }, []);
};
