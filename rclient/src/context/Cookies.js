import * as React from "react";

export const CookiesContext = React.createContext({
  getCookies: () => {},
});

export const Cookies = ({ children }) => {
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
    return res;
  };

  const cookiesMemo = React.useMemo(
    () => ({
      /**
       * Get all cookies or cookie
       * @param {String} [name] name of cookie. if blank, return object of all cookies
       * @returns {Object}
       */
      getCookies: (name) => (name ? parseCookies()?.[name] : parseCookies()),
    }),
    []
  );

  return <CookiesContext.Provider value={cookiesMemo} children={children} />;
};
