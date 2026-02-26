import * as React from "react";
import PropTypes from "prop-types";
import { Box, Fade } from "@mui/material";
import { SideButtons } from "./SideButtons";
import { waitForElement } from "../domUtils";

export const PageView = ({
  spine,
  spineIndex,
  partProgress,
  formatting,
  setProgress,
}) => {
  const getTotalPages = () =>
    document.getElementById("content")
      ? Math.floor(
          document.getElementById("content").scrollWidth /
            formatting.contentWidth
        ) +
        +(
          formatting.pagesShown > 1 &&
          (document.getElementById("content").scrollWidth %
            formatting.contentWidth) /
            formatting.contentWidth >
            1 / formatting.pagesShown
        )
      : 0;

  const [currentPage, setCurrentPage] = React.useState(() =>
    Math.floor(partProgress * getTotalPages())
  );

  const handleNextPage = () => {
    const totalPages = getTotalPages();
    const isLastPage = currentPage + 1 === totalPages;
    if (isLastPage) {
      const newSpineIndex = Math.min(spineIndex + 1, spine.length - 1);
      setProgress(newSpineIndex, 0);
      setCurrentPage(0);
    } else {
      setProgress(spineIndex, (currentPage + 1) / totalPages);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    const totalPages = getTotalPages();
    const isFirstPage = currentPage === 0;
    if (isFirstPage) {
      if (spineIndex > 0) {
        setProgress(spineIndex - 1, 0.999999);
        setCurrentPage(1 << 30);
      }
    } else {
      const newPage = Math.max(0, (currentPage - 1) / totalPages);
      setProgress(spineIndex, newPage);
      setCurrentPage((prev) => prev - 1);
    }
  };

  React.useEffect(() => {
    setCurrentPage(Math.floor(partProgress * getTotalPages()));
  }, [spineIndex]);

  return (
    <SideButtons
      leftButtonOnClick={handlePreviousPage}
      rightButtonOnClick={handleNextPage}
      formatting={formatting}
    >
      <Box
        sx={{
          height: "100%",
          minWidth: `${formatting.contentWidth}px`,
          maxWidth: `${formatting.contentWidth}px`,
          overflow: "visible",
        }}
      >
        <Box
          id="content"
          sx={{
            width: "100%",
            height: "100%",
            columnFill: "balance",
            columnGap: `${formatting.columnGap}px`,
            columnWidth: `${
              (formatting.contentWidth -
                formatting.columnGap * formatting.pagesShown) /
              formatting.pagesShown
            }px`,
            transform: `translate(-${currentPage * (formatting.contentWidth + formatting.columnGap)}px);`,
          }}
          dangerouslySetInnerHTML={{
            __html:
              spine?.[spineIndex ?? -1]?.element ??
              "something went wrong...<br/> spine.current is missing",
          }}
        />
      </Box>
    </SideButtons>
  );
};

PageView.propType = {
  spine: PropTypes.array.isRequired,
  spineIndex: PropTypes.number.isRequired,
  partProgress: PropTypes.number.isRequired,
  formatting: PropTypes.object.isRequired,
  setProgress: PropTypes.func.isRequired,
};
