import { useNavigate, useSearchParams } from "react-router-dom";
import { handleSimpleRequest } from "../../api/Axios";
import { AlertsContext } from "../../context/Alerts";
import * as React from "react";
import { UserInfoContext } from "../../context/UserInfo";

export const Passwordless = () => {
  const navigate = useNavigate();
  const addAlert = React.useContext(AlertsContext).addAlert;
  const userInfoContext = React.useContext(UserInfoContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const code = searchParams.get("code");
  const codeId = searchParams.get("codeId");
  const purpose = searchParams.get("purpose");
  const handlePasswordlessLogin = () => {
    if (purpose === "login") {
      handleSimpleRequest(
        "post",
        {
          verificationId: codeId,
          verificationCode: code,
        },
        "auth/passwordless/checkcode"
      )
        .then((res) => {
          addAlert(res.data.message, "info");
          userInfoContext.refreshAndIsLoggedIn();
        })
        .catch((error) => addAlert(error.toString(), "error"))
        .finally(() => (window.location.href = "/"));
    } else if (purpose === "signup") {
      handleSimpleRequest(
        "post",
        {
          verificationId: codeId,
          verificationCode: code,
        },
        "auth/signup/checkcode"
      )
        .then((res) => {
          addAlert(res.data.message, "info");
          userInfoContext.refreshAndIsLoggedIn();
        })
        .catch((error) => addAlert(error.toString(), "error"))
        .finally(() => navigate("/"));
    }
  };

  React.useEffect(() => {
    const timeoutId = setTimeout(handlePasswordlessLogin, 100);
    return () => clearTimeout(timeoutId);
  }, []);
};
