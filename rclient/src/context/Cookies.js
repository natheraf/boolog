import * as React from "react";

export const CookiesContext = React.createContext({});

export const Cookies = ({ children }) => {
  const [cookies, setCookies] = React.useState({});

  const cookiesMemo = React.useMemo(
    () => ({
      /**
       * Get all cookies or cookie
       * @param {String} [name] name of cookie. if blank, return object of all cookies
       * @returns {Object}
       */
      getCookies: (name) => (name ? cookies[name] : cookies),
    }),
    [cookies]
  );

  const parseCookies = () => {
    const res = {};
    decodeURIComponent(document.cookie)
      .split(";")
      .forEach((str) => {
        const key = str.substring(0, str.indexOf("=")).trim();
        if (key) {
          const obj = JSON.parse(
            str.substring(str.indexOf("{"), str.lastIndexOf("."))
          );
          res[key] = obj;
        }
      });
    setCookies(res);
  };

  React.useEffect(() => {
    parseCookies();
  }, []);

  return <CookiesContext.Provider value={cookiesMemo} children={children} />;
};
