import * as React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import LinkIcon from "@mui/icons-material/Link";
import { AlertsContext } from "../../../context/Alerts";
import {
  clearTemporaryMarks,
  handleInjectingMarkToEpubNodes,
  waitForElement,
} from "../domUtils";
import { handleSearchEpub } from "../epubUtils";
import PropTypes from "prop-types";
import { getNewId } from "../../../api/IndexedDB/common";
import { useTheme } from "@emotion/react";

export const SearchV2 = ({
  epubObject,
  currentSpineIndex,
  goToAndPreloadImages,
  setForceFocus,
}) => {
  const spine = epubObject.spine;
  const currentChapterLabel = spine[currentSpineIndex].label;
  const theme = useTheme();
  const defaultHighlightColor =
    theme.palette.mode === "dark"
      ? theme.palette.secondary.dark
      : theme.palette.secondary.light;
  const addAlert = React.useContext(AlertsContext).addAlert;
  const [open, setOpen] = React.useState(false);
  const [textfieldFocused, setTextfieldFocused] = React.useState(false);
  const [canSearch, setCanSearch] = React.useState(false);
  const [searchTextfieldValue, setSearchTextfieldValue] = React.useState("");
  const [searchResults, setSearchResults] = React.useState([]);
  const [searchTimeTaken, setSearchTimeTaken] = React.useState(null);

  const millisecondsToSeconds = (ms, precision = 3) =>
    Math.trunc(ms * Math.pow(10, precision - 3)) / Math.pow(10, precision);

  const handleTextfieldOnFocused = () => {
    setTextfieldFocused(true);
  };

  const handleTextfieldOnBlur = () => {
    setTextfieldFocused(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
    clearTemporaryMarks();
    waitForElement("#search-text-field").then((element) => element.focus());
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleTextfieldOnChange = (event) => {
    setSearchTextfieldValue(event?.target?.value ?? "");
    if (event?.target?.value?.length === 0) {
      return setCanSearch(false);
    }
    setCanSearch(true);
  };

  const handleSearch = () => {
    if (!searchTextfieldValue || searchTextfieldValue.length === 0) {
      return addAlert("Search input is falsely or empty", "error");
    }
    const startTime = performance.now();
    const res = handleSearchEpub(searchTextfieldValue, spine);
    const timeTaken = {};
    timeTaken.totalSearchResults = 0;
    for (const chapterResult of res) {
      chapterResult.chapterLabel = chapterResult.label;
      chapterResult.isExpanded =
        chapterResult.label === spine[currentSpineIndex].label;
      timeTaken.totalSearchResults += chapterResult.searchResults.length;
    }
    const endTime = performance.now();
    timeTaken.searchTimeTaken = endTime - startTime;
    setSearchTimeTaken(timeTaken);
    setSearchResults(res);
    scrollToCurrentChapterSubheader();
  };

  const handleSearchOnReturn = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const searchResultsHandleChangePage =
    (chapterResultsIndex) => (_event, newPage) => {
      setSearchResults((prev) =>
        prev.map((e, index) => {
          if (index !== chapterResultsIndex) {
            return e;
          }
          prev[chapterResultsIndex].page = newPage;
          return prev[chapterResultsIndex];
        })
      );
    };

  const searchResultsHandleChangeRowsPerPage =
    (chapterResultsIndex) => (event) => {
      setSearchResults((prev) =>
        prev.map((e, index) => {
          if (index !== chapterResultsIndex) {
            return e;
          }
          prev[chapterResultsIndex].page = 0;
          prev[chapterResultsIndex].rowsPerPage = parseInt(event.target.value);
          return prev[chapterResultsIndex];
        })
      );
    };

  const scrollToCurrentChapterSubheader = () => {
    waitForElement(".current-chapter").then((element) => {
      element.scrollIntoView();
    });
  };

  const searchResultsAccordionHandleOnChange =
    (chapterResultsIndex) => (_event, isExpanded) => {
      setSearchResults((prev) =>
        prev.map((e, index) => {
          if (index !== chapterResultsIndex) {
            return e;
          }
          prev[chapterResultsIndex].isExpanded = isExpanded;
          return prev[chapterResultsIndex];
        })
      );
    };

  const searchResultHandleOnClick = (searchResult) => () => {
    goToAndPreloadImages(searchResult.spineIndex, 0);
    waitForElement(`[nodeid='${searchResult.startContainerId}']`).then(
      (element) => {
        const range = searchResult;
        range.startContainer = document.querySelector(
          `[nodeId="${range.startContainerId}"]`
        );
        range.endContainer = document.querySelector(
          `[nodeId="${range.endContainerId}"]`
        );
        handleInjectingMarkToEpubNodes(
          document,
          null,
          range,
          "",
          "temporary-mark"
        );
        element.id = getNewId();
        const forceFocus = {
          type: "element",
          attributeName: "id",
          attributeValue: element.id,
        };
        setForceFocus(forceFocus);
      }
    );
    handleClose();
  };

  return (
    <>
      <Tooltip title="Search (s)">
        <IconButton onClick={handleClickOpen}>
          <SearchIcon />
        </IconButton>
      </Tooltip>
      {open && (
        <Dialog
          fullWidth={true}
          maxWidth={"md"}
          open={open}
          onClose={handleClose}
        >
          <DialogTitle>
            <Box>
              <Stack spacing={2} direction={"row"}>
                <TextField
                  id={"search-text-field"}
                  label={"Search"}
                  onFocus={handleTextfieldOnFocused}
                  onBlur={handleTextfieldOnBlur}
                  variant="filled"
                  InputProps={
                    textfieldFocused
                      ? {
                          endAdornment: (
                            <Tooltip title={"Press Enter to Search"}>
                              <KeyboardReturnIcon
                                fontSize="small"
                                color={canSearch ? "success" : "disabled"}
                              />
                            </Tooltip>
                          ),
                        }
                      : null
                  }
                  onChange={handleTextfieldOnChange}
                  value={searchTextfieldValue}
                  fullWidth={true}
                  onKeyDown={canSearch ? handleSearchOnReturn : null}
                />
                <Button
                  color={textfieldFocused ? "success" : "info"}
                  variant="contained"
                  disabled={!canSearch}
                  onClick={handleSearch}
                >
                  <SearchIcon />
                </Button>
              </Stack>
            </Box>
          </DialogTitle>
          <DialogContent dividers={true}>
            <Typography variant="subtitle1" color={"gray"}>
              {`${
                searchTimeTaken?.totalSearchResults ?? 0
              } results (${millisecondsToSeconds(
                searchTimeTaken?.searchTimeTaken ?? 0
              )}s)`}
            </Typography>
            {searchResults.map((chapterResults, chapterResultsIndex) => (
              <Accordion
                expanded={chapterResults.isExpanded}
                className={
                  chapterResults.isCurrentChapter ? "current-chapter" : null
                }
                key={chapterResults.label}
                onChange={searchResultsAccordionHandleOnChange(
                  chapterResultsIndex
                )}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack
                    direction={"row"}
                    justifyContent={"space-between"}
                    alignItems={"center"}
                    sx={{ width: "100%" }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight:
                          chapterResults.chapterLabel === currentChapterLabel
                            ? "bold"
                            : "unset",
                      }}
                    >
                      {chapterResults.label}
                    </Typography>
                    {chapterResults.isExpanded ? (
                      <TablePagination
                        onClick={(event) => event.stopPropagation()}
                        component="div"
                        count={chapterResults.searchResults.length}
                        page={chapterResults.page ?? 0}
                        onPageChange={searchResultsHandleChangePage(
                          chapterResultsIndex
                        )}
                        rowsPerPage={chapterResults.rowsPerPage ?? 5}
                        onRowsPerPageChange={searchResultsHandleChangeRowsPerPage(
                          chapterResultsIndex
                        )}
                        rowsPerPageOptions={[
                          5,
                          10,
                          25,
                          50,
                          100,
                          { value: -1, label: "All" },
                        ]}
                        showFirstButton
                        showLastButton
                      />
                    ) : (
                      <Typography color="lightgray">{`Count: ${chapterResults.searchResults.length}`}</Typography>
                    )}
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    {chapterResults.searchResults
                      .slice(
                        (chapterResults.page ?? 0) *
                          (chapterResults.rowsPerPage ?? 5),
                        ((chapterResults.page ?? 0) + 1) *
                          (chapterResults.rowsPerPage ?? 5)
                      )
                      .map((searchResult, searchResultIndex) => (
                        <Paper
                          key={searchResult.needle + searchResultIndex}
                          elevation={0}
                          sx={{ padding: 1 }}
                        >
                          <Stack
                            direction={"row"}
                            alignItems={"center"}
                            justifyContent={"space-between"}
                          >
                            <Typography variant="subtitle2" color="dimgray">
                              Part:{" "}
                              {(spine[searchResult.spineIndex]?.backCount ??
                                0) + 1}
                            </Typography>
                            <Stack direction={"row"}>
                              <Tooltip title="Go to location">
                                <IconButton
                                  onClick={searchResultHandleOnClick(
                                    searchResult
                                  )}
                                  size="small"
                                >
                                  <LinkIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </Stack>
                          <Typography
                            variant="h6"
                            component={"span"}
                            style={{ color: "gray" }}
                          >
                            {searchResult.previewPrefix}
                          </Typography>
                          <Typography
                            variant="h5"
                            component={"span"}
                            style={{ color: "lightgray" }}
                          >
                            {searchResult.needle}
                          </Typography>
                          <Typography
                            variant="h6"
                            component={"span"}
                            style={{ color: "gray" }}
                          >
                            {searchResult.previewSuffix}
                          </Typography>
                        </Paper>
                      ))}
                    <TablePagination
                      onClick={(event) => event.stopPropagation()}
                      component="div"
                      count={chapterResults.searchResults.length}
                      page={chapterResults.page ?? 0}
                      onPageChange={searchResultsHandleChangePage(
                        chapterResultsIndex
                      )}
                      rowsPerPage={chapterResults.rowsPerPage ?? 5}
                      onRowsPerPageChange={searchResultsHandleChangeRowsPerPage(
                        chapterResultsIndex
                      )}
                      rowsPerPageOptions={[
                        5,
                        10,
                        25,
                        50,
                        100,
                        { value: -1, label: "All" },
                      ]}
                      showFirstButton
                      showLastButton
                    />
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

SearchV2.propTypes = {
  epubObject: PropTypes.object.isRequired,
  currentSpineIndex: PropTypes.number.isRequired,
  goToAndPreloadImages: PropTypes.func.isRequired,
  setForceFocus: PropTypes.func.isRequired,
};
