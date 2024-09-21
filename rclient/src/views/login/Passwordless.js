import { useNavigate, useSearchParams } from "react-router-dom";
import { handleSimpleRequest } from "../../api/Axios";

export const Passwordless = () => {
  const navigate = useNavigate();
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
      .then((res) => {
        console.log(res);
        navigate("/");
      })
      .catch((error) => console.log(error));
  };

  handlePasswordlessLogin();
};
