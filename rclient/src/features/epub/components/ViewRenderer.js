import * as React from "react";
import PropTypes from "prop-types";
import { SideButtons } from "./SideButtons";
import { PageView } from "./PageView";
import { ScrollView } from "./ScrollView";
import { ContinuousScrollView } from "./ContinuousScrollView";

/**
 * Content state manager: progress
 * @param {*} param0
 * @returns
 */
export const ViewRenderer = ({
  epubObject,
  spineIndex,
  partProgress,
  focusElement,
  setFocusElement,
  formatting,
  setProgress,
  view,
}) => {
  const viewMap = new Map([
    [
      "scroll",
      <ContinuousScrollView
        key={spineIndex}
        epubObject={epubObject}
        spineIndex={spineIndex}
        partProgress={partProgress}
        focusElement={focusElement}
        setFocusElement={setFocusElement}
        formatting={formatting}
        setProgress={setProgress}
      />,
    ],
    [
      "page",
      <PageView
        key={spineIndex}
        epubObject={epubObject}
        spineIndex={spineIndex}
        partProgress={partProgress}
        focusElement={focusElement}
        setFocusElement={setFocusElement}
        formatting={formatting}
        setProgress={setProgress}
      />,
    ],
  ]);

  return (view && viewMap.get(view)) ?? null;
};

ViewRenderer.propType = {
  epubObject: PropTypes.object.isRequired,
  spineIndex: PropTypes.number.isRequired,
  partProgress: PropTypes.number.isRequired,
  focusElement: PropTypes.object.isRequired,
  setFocusElement: PropTypes.func.isRequired,
  formatting: PropTypes.object.isRequired,
  setProgress: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired,
};
