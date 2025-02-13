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
  const contentRef = epubObject["opf"].package;

  const [spine, setSpine] = React.useState(null);
  const [hrefSpineMap, setHrefSpineMap] = React.useState(null);
  const [spinePointer, setSpinePointer] = React.useState(null);

  const [currentPage, setCurrentPage] = React.useState(0);
  const [pageWidth, setPageWidth] = React.useState(window.innerWidth - 500);

  const handlePathHref = React.useCallback(
    (path) => {
      if (path.startsWith("http")) {
        window.open(path, "_blank");
        return;
      }
      setCurrentPage(0);
      path = path.substring(path.indexOf("/") + 1);
      setSpinePointer(hrefSpineMap.get(path));
    },
    [hrefSpineMap]
  );

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
      }
    }
    if (tag === "img") {
      const src = htmlElement.getAttribute("src");
      const path = src
        .substring(src.indexOf("..") === -1 ? 0 : src.indexOf("/") + 1)
        .split("/");
      const fileName = path.pop();
      let it = structureRef;
      for (const node of path) {
        it = it[node];
      }
      const imgFile = it[fileName];
      const blob = await convertFileToBlob(imgFile);
      props.src = URL.createObjectURL(blob);
      props.style = {
        maxHeight: window.innerHeight - 88,
        objectFit: "scale-down",
        margin: "auto",
      };
    } else if (
      tag === "a" &&
      (htmlElement.getAttribute("href").startsWith("http") ||
        (htmlElement.getAttribute("href").startsWith("http") === false &&
          htmlElement.getAttribute("href")?.indexOf("#") === -1))
    ) {
      props.style = { color: "lightblue" };
      props.linkto = htmlElement.getAttribute("href");
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

  const addEventListenersToAnchors = React.useMemo(() => {
    if (spine !== null && spinePointer !== null) {
      const config = { childList: true, subtree: true };
      const observer = new MutationObserver((mutationList, observer) => {
        document.querySelectorAll("a[linkto]").forEach((node) => {
          node.addEventListener("click", () => {
            handlePathHref(node.getAttribute("linkto"));
          });
        });
      });
      observer.observe(document.getElementById("content"), config);
    }
  }, [spine]);

  const handleNextPage = () => {
    const totalWidth = document.getElementById("content").scrollWidth;
    const totalPages = totalWidth / pageWidth;
    if (currentPage === totalPages - 1) {
      setCurrentPage(0);
      setSpinePointer((prev) => Math.min(spine.length - 1, prev + 1));
    } else {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    const previousTotalWidth =
      document.getElementById("previous-content").scrollWidth;
    const totalPages = Math.ceil(previousTotalWidth / pageWidth);
    if (currentPage === 0) {
      setCurrentPage(totalPages - 1);
      setSpinePointer((prev) => Math.max(0, prev - 1));
    } else {
      setCurrentPage((prev) => prev - 1);
    }
  };

  React.useEffect(() => {
    const processAndRender = async () => {
      await processSpine();
      if (spinePointer === null) {
        setSpinePointer(4);
      }
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
      <Stack sx={{ overflow: "hidden" }}>
        <Stack
          direction="row"
          alignItems={"center"}
          justifyContent={"center"}
          sx={{ mt: "10px", height: "100%" }}
          spacing={1}
        >
          <IconButton onClick={handlePreviousPage}>
            <NavigateBeforeIcon />
          </IconButton>
          <Box sx={{ width: pageWidth, overflow: "hidden" }}>
            <Box
              id="content"
              sx={{
                height: window.innerHeight - 88,
                columnFill: "auto",
                columnGap: 0,
                columnWidth: pageWidth,
                transform: `translate(-${currentPage * pageWidth}px);`,
              }}
            >
              {spine?.[spinePointer ?? -1] ??
                "something went wrong...<br/> spine is missing"}
            </Box>
          </Box>
          <IconButton onClick={handleNextPage}>
            <NavigateNextIcon />
          </IconButton>
        </Stack>
        <Box sx={{ width: pageWidth, visibility: "hidden" }}>
          <Box
            id="previous-content"
            sx={{
              height: window.innerHeight - 88,
              overflow: "visible",
              columnFill: "auto",
              columnGap: 0,
              columnWidth: pageWidth,
            }}
          >
            {spine?.[(spinePointer ?? 0) - 1] ?? "test"}
          </Box>
        </Box>
      </Stack>
    </Dialog>
  );
};
