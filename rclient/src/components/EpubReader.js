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
  const [spinePointer, setSpinePointer] = React.useState(4);

  const [pageWidth, setPageWidth] = React.useState(window.innerWidth - 500);
  const [contentHorizontalOffset, setContentHorizontalOffset] =
    React.useState(0);

  const [currentContent, setCurrentContent] = React.useState(null);
  const contentBox = React.useRef(null);

  const handlePathHref = (path) => {
    path = path.substring(path.indexOf("/") + 1);
    setSpinePointer((prev) => prev + 1);
    return console.log(spinePointer);
    setSpinePointer(hrefSpineMap.get(path));
  };

  const createReactDOM = async (htmlElement) => {
    if (htmlElement === null) {
      return null;
    }
    if (htmlElement.nodeName === "#text") {
      return htmlElement.data;
    }
    const tag = htmlElement.tagName.toLowerCase();
    if (tag === "br") {
      return React.createElement("br");
    }
    const props = {};
    for (const attribute of htmlElement.attributes) {
      if (attribute.name === "class") {
        props.className = attribute.value;
      } else if (["style", "href"].includes(attribute.name) === false) {
        props[attribute.name] = attribute.value;
      }
    }
    if (tag === "img") {
      const originalSrc = htmlElement.src.substring(
        htmlElement.src.lastIndexOf("/") + 1
      );
      const imgFile = structureRef["Images"][originalSrc];
      const blob = await convertFileToBlob(imgFile);
      props.src = URL.createObjectURL(blob);
      // props.sx = { objectFit: "contain", width: "100%", height: "100%" };
    } else if (tag === "a") {
      const originalHref = htmlElement.getAttribute("href");
      if (originalHref.startsWith("http") === false) {
        props.onClick = () => handlePathHref(originalHref);
      }
    }

    const reactChildren = [];
    for (const child of htmlElement.childNodes) {
      reactChildren.push(await createReactDOM(child));
    }

    return React.createElement(tag, props, ...reactChildren);
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
        document.head.insertAdjacentElement("beforeend", styleElement);
        continue;
      }
      if (it.hasOwnProperty("filename")) {
        continue;
      }

      const page = document.createElement("html");
      page.innerHTML = it.text;
      const body = page.querySelector("body") ?? page.querySelector("section");
      const pageContent = document.createElement("div");
      pageContent.innerHTML = body.innerHTML;
      const reactNode = await createReactDOM(pageContent);

      if (item.hasOwnProperty("@_properties")) {
        elementMap.set(item["@_properties"], reactNode);
      }
      elementMap.set(item["@_id"], {
        section: reactNode,
        href: item["@_href"],
      });
    }

    const spineStack = [];
    const spineMap = {};
    const spineRef = contentRef.spine.itemref;
    for (const item of spineRef) {
      spineMap[elementMap.get(item["@_idref"]).href] = spineStack.length;
      spineStack.push(elementMap.get(item["@_idref"]).section);
    }
    setSpine(spineStack);
    setHrefSpineMap(spineMap);
    localStorage.setItem("hrefSpineMap", JSON.stringify(spineMap));
    return spineStack;
  };

  const handleClose = () => {
    setOpen(false);
  };

  React.useEffect(() => {
    const processAndRender = async () => {
      const spineStack = await processSpine();

      setCurrentContent(
        spineStack?.[spinePointer] ??
          "something went wrong...<br/> spine is missing"
      );

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
          <Typography
            onClick={() => setSpinePointer((prev) => prev + 1)}
            variant="h6"
          >
            {contentRef?.metadata?.["dc:title"]?.["#text"] ?? "err"}
          </Typography>
          <Stack
            onClick={() => console.log(spinePointer)}
            direction={"row"}
            spacing={2}
          >
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
            ref={contentBox}
            // dangerouslySetInnerHTML={{ __html: currentContent }}
            sx={{
              height: window.innerHeight - 88,
              width: pageWidth,
              columnFill: "auto",
              columnGap: 0,
              columnWidth: pageWidth,
              transform: `translate(-${contentHorizontalOffset}px);`,
            }}
            key={hrefSpineMap?.size}
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
