import * as React from "react";
import PropTypes from "prop-types";

export const EpubContext = React.createContext(null);

export const EpubState = ({ children }) => {
  const [searchV2SearchResults, setSearchV2SearchResults] = React.useState([]);
  const [searchV2CurrentSearchSelection, setSearchV2CurrentSearchSelection] =
    React.useState(null);

  const epubMemo = React.useMemo(
    () => ({
      searchV2SearchResults,
      setSearchV2SearchResults,
      searchV2CurrentSearchSelection,
      setSearchV2CurrentSearchSelection,
    }),
    [searchV2CurrentSearchSelection, searchV2SearchResults]
  );

  return (
    <EpubContext.Provider value={epubMemo}>{children}</EpubContext.Provider>
  );
};

EpubState.propTypes = {
  children: PropTypes.element.isRequired,
};
