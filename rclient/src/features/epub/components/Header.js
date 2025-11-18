import {
  AppBar,
  Autocomplete,
  Box,
  IconButton,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";
import { TableOfContents } from "./TableOfContents";
import { AnnotationViewer } from "./AnnotationViewer";
import { ReaderFormat } from "../../../components/ReaderFormat";
import {
  DialogSlideUpTransition,
  CircularProgressWithLabel,
} from "../../CustomComponents";
import * as React from "react";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { Search } from "./Search";

export const Header = ({
  handleClose,
  title,
  subtitle,
  spine,
  searchProps,
  annotatorProps,
  entryId,
  notes,
  epubObject,
  spinePointer,
  tocProps,
  formatterProp,
}) => {
  const appBarHeight = 48;
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));
  const [searchFocused, setSearchFocused] = React.useState(false);

  const handleSearchIconClick = () => {
    setSearchFocused(true);
  };

  return (
    <AppBar
      id="appBar"
      variant="outlined"
      elevation={0}
      sx={{
        position: "sticky",
        top: 0,
        width: "100%",
      }}
    >
      <Toolbar
        component={Stack}
        direction="row"
        alignItems={"center"}
        justifyContent={"space-between"}
        spacing={2}
        sx={{ minHeight: `${appBarHeight}px`, height: `${appBarHeight}px` }}
        variant="dense"
      >
        <Stack
          alignItems={"center"}
          direction="row"
          spacing={1}
          sx={{ overflow: "hidden" }}
        >
          <Tooltip title="esc">
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
          {greaterThanSmall ? (
            <Stack spacing={-0.5}>
              <Typography variant="subtitle2" noWrap>
                {title ?? "Untitled"}
              </Typography>
              {subtitle && (
                <Typography variant="subtitle1" noWrap>
                  {subtitle}
                </Typography>
              )}
            </Stack>
          ) : null}
        </Stack>
        <Stack direction={"row"} spacing={2}>
          {searchFocused ? (
            <Search
              searchProps={searchProps}
              setSearchFocused={setSearchFocused}
              spine={spine}
            />
          ) : (
            <Stack spacing={1} direction={"row"}>
              {/* {previousSpineIndexAndPage !== null ? (
                <Tooltip title="Back">
                  <IconButton onClick={goBack}>
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
              ) : null} */}
              <Tooltip title="Search">
                <IconButton onClick={handleSearchIconClick}>
                  <SearchIcon />
                </IconButton>
              </Tooltip>
              <AnnotationViewer
                spine={spine.current}
                entryId={entryId}
                clearTemporaryMarks={annotatorProps.clearTemporaryMarks}
                notes={notes.current}
                memos={epubObject.memos}
                currentSpineIndex={spinePointer}
                goToNote={annotatorProps.goToNote}
              />
              <TableOfContents
                toc={epubObject.toc}
                handlePathHref={tocProps.handlePathHref}
                currentSpineIndexLabel={spine.current[spinePointer].label}
              />
              <ReaderFormat
                formatting={formatterProp.formatting}
                setFormatting={formatterProp.handleSetFormatting}
                useGlobalFormatting={formatterProp.useGlobalFormatting}
                setUseGlobalFormatting={
                  formatterProp.setUseGlobalFormattingHelper
                }
                useStandardFormatting={formatterProp.useStandardFormatting}
                setUseStandardFormatting={
                  formatterProp.setUseStandardFormattingHelper
                }
              />
            </Stack>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

Header.propTypes = {
  epubObject: PropTypes.object.isRequired,
  notes: PropTypes.object.isRequired,
  entryId: PropTypes.string.isRequired,
  handleClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  spine: PropTypes.object.isRequired,
  searchProps: PropTypes.object.isRequired,
  annotatorProps: PropTypes.object.isRequired,
  spinePointer: PropTypes.number.isRequired,
  formatterProp: PropTypes.object.isRequired,
  tocProps: PropTypes.object.isRequired,
};
