import { useNavigate, useSearchParams } from "react-router-dom";
import { handleSimpleRequest } from "../../api/Axios";
import { AlertsContext } from "../../context/Alerts";
import * as React from "react";

export const Passwordless = () => {
  const navigate = useNavigate();
  const addAlert = React.useContext(AlertsContext).addAlert;
  const [searchParams, setSearchParams] = useSearchParams();
  const code = searchParams.get("code");
  const email = searchParams.get("email");
  const handlePasswordlessLogin = () => {
    handleSimpleRequest(
      "post",
      {
        email,
        verificationCode: code,
      },
      "auth/passwordless/checkcode"
    )
      .then((res) => addAlert(res.data.message, "info"))
      .catch((error) => addAlert(error.toString(), "error"))
      .finally(() => navigate("/"));
  };

  React.useEffect(() => handlePasswordlessLogin(), []);
};
