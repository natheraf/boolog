import * as React from "react";
import PropType from "prop-types";
import { SideButtons } from "./SideButtons";
import { PageView } from "./PageView";
import { ScrollView } from "./ScrollView";

/**
 * Content state manager: progress
 * @param {*} param0
 * @returns
 */
export const ViewRenderer = ({
  epubObject,
  spineIndex,
  partProgress,
  formatting,
  setProgress,
  view,
}) => {
  const viewMap = new Map([
    [
      "scroll",
      <ScrollView
        key={spineIndex}
        spine={epubObject.spine}
        spineIndex={spineIndex}
        partProgress={partProgress}
        formatting={formatting}
        setProgress={setProgress}
      />,
    ],
    [
      "page",
      <PageView
        spine={epubObject.spine}
        spineIndex={spineIndex}
        partProgress={partProgress}
        formatting={formatting}
        setProgress={setProgress}
      />,
    ],
  ]);

  return (view && viewMap.get(view)) ?? null;
};

ViewRenderer.propType = {
  epubObject: PropType.object.isRequired,
  spineIndex: PropType.number.isRequired,
  partProgress: PropType.number.isRequired,
  formatting: PropType.object.isRequired,
  setProgress: PropType.func.isRequired,
  view: PropType.string.isRequired,
};
