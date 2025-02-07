import * as React from "react";
import {
  AppBar,
  Box,
  Dialog,
  IconButton,
  Slide,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@emotion/react";
import { convertFileToBlob, convertObjectToXML } from "../api/IndexedDB/Files";

// refactor to use one ver with CreateBook.js:35 DialogSlideUpTransition()
const DialogSlideUpTransition = React.forwardRef(function Transition(
  props,
  ref
) {
  return <Slide unmountOnExit direction="up" ref={ref} {...props} />;
});

export const EpubReader = ({ open, setOpen, epubObject }) => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = React.useState(true);

  console.log(epubObject);
  const structure = epubObject["OEBPS"];
  const content = structure["content.opf"];
  const spine = content.package.spine.itemref;
  const [spinePointer, setSpinePointer] = React.useState(0);
  const [manifest, setManifest] = React.useState(() => {
    const manifestObject = {};
    for (const item of content.package.manifest.item) {
      if (item.hasOwnProperty("@_properties")) {
        manifestObject[item["@_properties"]] = item["@_href"];
      }
      manifestObject[item["@_id"]] = item["@_href"];
    }
    return manifestObject;
  });

  const [pageWidth, setPageWidth] = React.useState(window.innerWidth);
  const [contentHorizontalOffset, setContentHorizontalOffset] =
    React.useState(0);

  const [previousContent, setPreviousContent] = React.useState(null);
  const [currentContent, setCurrentContent] = React.useState(null);
  const [nextContent, setNextContent] = React.useState(null);

  const getContent = async () => {
    const idRef = spine[spinePointer]["@_idref"];
    const path = manifest[idRef].split("/");
    let it = structure;
    for (const node of path) {
      it = it[node];
    }
    const xml = convertObjectToXML(it);
    const page = document.createElement("div");
    page.innerHTML = xml;
    const img = page.querySelector("img");
    if (img) {
      const originalSrc = img.src.substring(img.src.lastIndexOf("/") + 1);
      const imgFile = structure["Images"][originalSrc];
      const blob = await convertFileToBlob(imgFile);
      img.src = URL.createObjectURL(blob);
      img.style.objectFit = "contain";
      img.style.width = "100%";
      img.style.height = "100%";
    }
    setCurrentContent(page.innerHTML);
  };

  const handleClose = () => {
    setOpen(false);
  };

  React.useEffect(() => {
    getContent();
  }, []);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={DialogSlideUpTransition}
      transitionDuration={200 * theme.transitions.reduceMotion}
    >
      <AppBar
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
          <Typography variant="h6">
            {content?.package?.metadata?.["dc:title"]?.["#text"]}
          </Typography>
          <Stack direction={"row"} spacing={2}>
            {"buttons"}
          </Stack>
        </Toolbar>
      </AppBar>
      <Stack
        alignItems={"center"}
        sx={{ width: "100%", height: "100%", mt: "10px" }}
      >
        <Box
          id="content"
          dangerouslySetInnerHTML={{ __html: currentContent }}
          sx={{ width: "500px" }}
        />
      </Stack>
    </Dialog>
  );
};
