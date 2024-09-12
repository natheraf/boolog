import * as React from "react";

export const MediaController = ({
  mediaObject,
  apiFunctions,
  mediaUniqueIdentifier,
}) => {
  const [mediaObject, setMediaObject] = React.useState({ status: null });

  React.useEffect(() => {
    if (mediaUniqueIdentifier === "isbn") {
      setMediaObject({ status: null });
      apiFunctions
        .getBook("isbn", mediaObj.isbn[0])
        .then((res) => setMediaObject(res ?? mediaObj))
        .catch((error) => console.log(error));
    } else {
      setLibraryEquivalentMediaObj(mediaObj);
    }
  }, [apiFunctions, mediaObj, mediaUniqueIdentifier]);
};
