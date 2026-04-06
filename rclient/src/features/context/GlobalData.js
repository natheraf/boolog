import React from "react";
import { fontFamilies } from "../../api/Local";
import { getGoogleFonts } from "../../api/GoogleAPI";

export const GlobalDataContext = React.createContext(null);

export const GlobalData = ({ children }) => {
  const [allFonts, setAllFonts] = React.useState(fontFamilies);
  const [randomFont, setRandomFont] = React.useState(null);

  const addRemoteFontFamiliesHeaderLink = (font) => {
    const remoteFont = font.kind === "webfonts#webfont";
    if (!remoteFont) {
      return;
    }
    const linkId = "webfont-google";
    const linkElement =
      document.querySelector(`#${linkId}`) ?? document.createElement("link");
    linkElement.id = linkId;
    linkElement.rel = "stylesheet";
    linkElement.href = `https://fonts.googleapis.com/css?family=${encodeURIComponent(
      font.family
    )}`;
    document.head.insertAdjacentElement("afterbegin", linkElement);
  };

  const getRandomFont = React.useCallback(
    (fonts = allFonts) => {
      const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
      addRemoteFontFamiliesHeaderLink(randomFont);
      return randomFont;
    },
    [allFonts]
  );

  const changeRandomFont = React.useCallback(
    (fonts = allFonts) => {
      setRandomFont(getRandomFont(fonts));
    },
    [allFonts, getRandomFont]
  );

  const globalDataMemo = React.useMemo(
    () => ({
      allFonts,
      randomFont,
      changeRandomFont,
    }),
    [allFonts, randomFont, changeRandomFont]
  );

  React.useEffect(() => {
    getGoogleFonts().then((res) => {
      const allFonts = [...fontFamilies, ...res.items];
      setAllFonts(allFonts);
      changeRandomFont(allFonts);
    });
  }, []);

  return (
    <GlobalDataContext.Provider value={globalDataMemo}>
      {children}
    </GlobalDataContext.Provider>
  );
};
