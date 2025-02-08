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
import { convertFileToBlob } from "../api/IndexedDB/Files";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

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

  const structureRef = epubObject["OEBPS"];
  const contentRef = structureRef["content.opf"].package;

  const [spine, setSpine] = React.useState(null);
  const [hrefSpineMap, setHrefSpineMap] = React.useState(null);
  const [spinePointer, setSpinePointer] = React.useState(5);

  const [pageWidth, setPageWidth] = React.useState(window.innerWidth - 500);
  const [contentHorizontalOffset, setContentHorizontalOffset] =
    React.useState(0);

  const [currentContent, setCurrentContent] = React.useState(null);

  const handlePathHref = (path) => {
    return console.log(path);
    path = path.substring(path.indexOf("/") + 1);
    setSpinePointer(hrefSpineMap.get(path));
  };

  const processSpine = async () => {
    const manifestRef = contentRef.manifest.item;

    const elementMap = new Map();
    for (const item of manifestRef) {
      const path = item["@_href"].split("/");
      let it = structureRef;
      for (const node of path) {
        it = it[node];
      }
      if (it.type === "css") {
        const styleElement = document.createElement("style");
        styleElement.id = "epub_style";
        styleElement.innerHTML = it.text;
        document.head.insertAdjacentElement("afterbegin", styleElement);
        continue;
      }
      if (it.hasOwnProperty("filename")) {
        continue;
      }
      const page = document.createElement("div");
      page.innerHTML = it.text;

      const imgs = page.querySelectorAll("img");
      for (const img of imgs) {
        const originalSrc = img.src.substring(img.src.lastIndexOf("/") + 1);
        const imgFile = structureRef["Images"][originalSrc];
        const blob = await convertFileToBlob(imgFile);
        img.src = URL.createObjectURL(blob);
        img.style.objectFit = "contain";
        img.style.width = "100%";
        img.style.height = "100%";
      }

      const anchors = page.querySelectorAll("a");
      for (const anchor of anchors) {
        if (anchor.getAttribute("href").startsWith("http")) {
          continue;
        }
        // anchor.setAttribute(
        //   "onclick",
        //   `handlePathHref('${anchor.getAttribute("href")}')`
        // );
        anchor.removeAttribute("href");
      }

      const section = page.querySelector("section") ?? page;
      if (item.hasOwnProperty("@_properties")) {
        elementMap.set(item["@_properties"], section);
      }
      elementMap.set(item["@_id"], { section, href: item["@_href"] });
    }

    const spineStack = [];
    const spineMap = new Map();
    const spineRef = contentRef.spine.itemref;
    for (const item of spineRef) {
      spineMap.set(elementMap.get(item["@_idref"]).href, spineStack.length);
      spineStack.push(elementMap.get(item["@_idref"]).section);
    }
    setSpine(spineStack);
    setHrefSpineMap(spineMap);
    return spineStack;
  };

  const handleClose = () => {
    setOpen(false);
  };

  React.useEffect(() => {
    const processAndRender = async () => {
      const spineStack = await processSpine();
      const testNode = React.createElement(
        "div",
        {},
        React.createElement(
          "a",
          {
            onClick: () => handlePathHref("Text/cover.xhtml"),
          },
          "go to cover"
        )
      );
      // createRoot
      setCurrentContent(testNode);
      // setCurrentContent(
      //   spineStack?.[spinePointer].innerHTML ??
      //     "something went wrong...<br/> spine is missing"
      // );

      console.log("set content");
    };
    if (spine === null) {
      processAndRender();
    }
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
            {contentRef?.metadata?.["dc:title"]?.["#text"] ?? "err"}
          </Typography>
          <Stack direction={"row"} spacing={2}>
            {"buttons"}
          </Stack>
        </Toolbar>
      </AppBar>
      <Stack
        direction="row"
        alignItems={"center"}
        justifyContent={"center"}
        sx={{ mt: "10px", height: "100%" }}
        spacing={1}
      >
        <IconButton
          onClick={() => setContentHorizontalOffset((prev) => prev - pageWidth)}
        >
          <NavigateBeforeIcon />
        </IconButton>
        <Box sx={{ overflow: "hidden" }}>
          <Box
            id="content"
            // dangerouslySetInnerHTML={{ __html: currentContent }}
            sx={{
              height: window.innerHeight - 88,
              width: pageWidth,
              columnFill: "auto",
              columnGap: 0,
              columnWidth: pageWidth,
              transform: `translate(-${contentHorizontalOffset}px);`,
            }}
          >
            {currentContent ?? "test"}
          </Box>
        </Box>
        <IconButton
          onClick={() => setContentHorizontalOffset((prev) => prev + pageWidth)}
        >
          <NavigateNextIcon />
        </IconButton>
      </Stack>
    </Dialog>
  );
};
