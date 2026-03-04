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
  forceFocus,
  setForceFocus,
  formatting,
  setProgress,
  view,
  formatMenuIsOpen,
}) => {
  const viewMap = new Map([
    [
      "scroll",
      <ScrollView
        key={spineIndex}
        epubObject={epubObject}
        spineIndex={spineIndex}
        partProgress={partProgress}
        forceFocus={forceFocus}
        setForceFocus={setForceFocus}
        formatting={formatting}
        setProgress={setProgress}
        formatMenuIsOpen={formatMenuIsOpen}
      />,
    ],
    [
      "page",
      <PageView
        key={spineIndex}
        epubObject={epubObject}
        spineIndex={spineIndex}
        partProgress={partProgress}
        forceFocus={forceFocus}
        setForceFocus={setForceFocus}
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
  forceFocus: PropTypes.object,
  setForceFocus: PropTypes.func.isRequired,
  formatting: PropTypes.object.isRequired,
  setProgress: PropTypes.func.isRequired,
  view: PropTypes.string.isRequired,
  formatMenuIsOpen: PropTypes.bool.isRequired,
};
