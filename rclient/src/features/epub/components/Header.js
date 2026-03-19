import {
  AppBar,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from "prop-types";
import { useTheme } from "@emotion/react";
import { TableOfContents } from "./TableOfContents";
import { AnnotationViewer } from "./AnnotationViewer";
import { ReaderFormat } from "../../../components/ReaderFormat";
import { SearchV2 } from "./SearchV2";

/**
 * @deprecated
 * @param {*} param0
 * @returns
 */
export const Header = ({
  handleClose,
  title,
  subtitle,
  spine,
  searchV2Props,
  annotatorProps,
  entryId,
  notes,
  epubObject,
  spinePointer,
  handlePathHref,
  formatterProp,
}) => {
  const appBarHeight = 48;
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));

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
        <Stack spacing={1} direction={"row"}>
          {/* {previousSpineIndexAndPage !== null ? (
                <Tooltip title="Back">
                <IconButton onClick={goBack}>
                <ArrowBackIcon />
                </IconButton>
                </Tooltip>
                ) : null} */}
          <SearchV2
            spine={spine}
            currentSpineIndex={spinePointer}
            goToAndPreloadImages={searchV2Props.goToAndPreloadImages}
            goToLinkFragment={searchV2Props.goToLinkFragment}
            clearTemporaryMarks={searchV2Props.clearTemporaryMarks}
          />
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
            handlePathHref={handlePathHref}
            currentSpineIndexLabel={spine.current[spinePointer].label}
          />
          <ReaderFormat
            formatting={formatterProp.formatting}
            setFormatting={formatterProp.handleSetFormatting}
            useGlobalFormatting={formatterProp.useGlobalFormatting}
            setUseGlobalFormatting={formatterProp.setUseGlobalFormattingHelper}
            useStandardFormatting={formatterProp.useStandardFormatting}
            setUseStandardFormatting={
              formatterProp.setUseStandardFormattingHelper
            }
          />
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
  searchV2Props: PropTypes.object.isRequired,
  annotatorProps: PropTypes.object.isRequired,
  spinePointer: PropTypes.number.isRequired,
  formatterProp: PropTypes.object.isRequired,
  handlePathHref: PropTypes.func.isRequired,
};
