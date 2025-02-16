import * as React from "react";
import { useTheme } from "@emotion/react";
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

import { ReaderFormat } from "./ReaderFormat";
import { convertFileToBlob } from "../api/IndexedDB/Files";

import CloseIcon from "@mui/icons-material/Close";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

// refactor to use one ver with CreateBook.js:35 DialogSlideUpTransition()
const DialogSlideUpTransition = React.forwardRef(function Transition(
  props,
  ref
) {
  return <Slide unmountOnExit direction="up" ref={ref} {...props} />;
});

const parseCSSText = (cssText) => {
  var cssTxt = cssText.replace(/\/\*(.|\s)*?\*\//g, " ").replace(/\s+/g, " ");
  var style = {},
    [, ruleName, rule] = cssTxt.match(/ ?(.*?) ?{([^}]*)}/) || [, , cssTxt];
  var cssToJs = (s) =>
    s.replace(/\W+\w/g, (match) => match.slice(-1).toUpperCase());
  var properties = rule
    .split(";")
    .map((o) => o.split(":").map((x) => x && x.trim()));
  for (var [property, value] of properties) style[cssToJs(property)] = value;
  return { cssText, ruleName, style };
}; // https://stackoverflow.com/a/43012849

export const EpubReader = ({ open, setOpen, epubObject }) => {
  const [isLoading, setIsLoading] = React.useState(true);

  const [formatting, setFormatting] = React.useState({
    fontSize: 100,
    _fontSizeStep: 10,
    lineHeight: 12,
    _lineHeightStep: 1,
    pageMargins: 500,
    _pageMarginsStep: 50,
    pagesNumber: 1,
    fontFamily: { label: "Original", value: "inherit" },
    _fontFamilies: [
      // formatted for MUI Selector use
      { group: "none" },
      { label: "Original", value: "inherit" },

      { group: "Generic" },
      { label: "Serif", value: "serif" },
      { label: "Sans-Serif", value: "sans-serif" },
      { label: "Monospace", value: "monospace" },
      { label: "Cursive", value: "cursive" },
      { label: "Fantasy", value: "fantasy" },
      { label: "Math", value: "math" },
      { label: "Fangsong", value: "fangsong" },
      { label: "System-UI", value: "system-ui" },
    ],
    textAlign: { label: "Original", value: "inherit" },
    _textAlignments: [
      { label: "Original", value: "inherit" },
      { label: "Left", value: "start" },
      { label: "Middle", value: "center" },
      { label: "Right", value: "end" },
      { label: "Justified", value: "justify" },
    ],
  });

  const structureRef = epubObject["OEBPS"];
  const contentRef = epubObject["opf"].package;

  const [spine, setSpine] = React.useState(null);
  const [hrefSpineMap, setHrefSpineMap] = React.useState(null);
  const [spinePointer, setSpinePointer] = React.useState(null);

  const [currentPage, setCurrentPage] = React.useState(0);
  const columnGap = 10;
  const pageWidth = React.useMemo(
    () => window.innerWidth - formatting.pageMargins - columnGap,
    [formatting.pageMargins]
  );
  const [pageHeight, setPageHeight] = React.useState(window.innerHeight - 88);

  const handleViewOutOfBounds = React.useEffect(() => {
    if (
      [document.getElementById("content"), currentPage, formatting].reduce(
        (acc, val) => acc && val,
        true
      )
    ) {
      const totalWidth = document.getElementById("content").scrollWidth;
      const totalPages = Math.floor(totalWidth / pageWidth);
      if (currentPage >= totalPages) {
        setCurrentPage(totalPages - 1);
      }
    }
  }, [currentPage, pageWidth, formatting]);

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
      if (attribute.name === "style") {
        props.style = parseCSSText(attribute.value).style;
      } else if (attribute.name === "class") {
        props.className = attribute.value;
      } else if (attribute.name !== "href") {
        props[attribute.name] = attribute.value;
      }
    }
    if (tag === "svg") {
      props.style = {
        height: pageHeight,
        width: pageWidth,
      };
    } else if (tag === "image") {
      let src = null;
      for (const key of ["xlink:href", "href"]) {
        if (htmlElement.getAttribute(key) !== null) {
          src = htmlElement.getAttribute(key);
        }
      }
      if (src !== null) {
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
        props["href"] = URL.createObjectURL(blob);
        props["height"] = "100%";
        delete props.width;
      }
    } else if (tag === "img") {
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
        maxHeight: pageHeight,
        objectFit: "scale-down",
        margin: "auto",
      };
    } else if (tag === "a" && htmlElement.getAttribute("href") !== null) {
      const href = htmlElement.getAttribute("href");
      props.style = { color: "lightblue" };
      props.linkto =
        href.startsWith("http") === false && href.indexOf("#") !== -1
          ? href.substring(0, href.indexOf("#"))
          : href;
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
        styleElement.id = `epub-css-${it.name}`;
        styleElement.innerHTML = `#content, #previous-content {\n${it.text}\n}`;
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
    const totalPages = Math.floor(totalWidth / pageWidth);
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
    const totalPages = Math.floor(previousTotalWidth / pageWidth);
    if (currentPage === 0) {
      setCurrentPage(totalPages - 1);
      setSpinePointer((prev) => Math.max(0, prev - 1));
    } else {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const putFormattingStyleElement = () => {
    const userFormattingStyle = `
      font-size: ${formatting.fontSize}%; 
      line-height: ${formatting.lineHeight / 10}; 
      font-family: ${formatting.fontFamily.value}; 
      text-align: ${formatting.textAlign.value};
    `;
    const styleElement = document.createElement("style");
    styleElement.id = `epub-css-user-formatting`;
    styleElement.innerHTML = `#content, #previous-content {\n${userFormattingStyle}\n}`;
    document.head.insertAdjacentElement("beforeend", styleElement);
  };

  const updateFormattingStyle = React.useEffect(putFormattingStyleElement, [
    formatting,
  ]);

  const processSpineAndRenderEpubDOM = () =>
    new Promise((resolve, reject) => {
      processSpine().then(resolve);
    });

  React.useEffect(() => {
    if (spine === null) {
      processSpineAndRenderEpubDOM().then(() => {
        if (spinePointer === null) {
          setSpinePointer(0);
        }
        putFormattingStyleElement();
      });
    }
  }, []);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={DialogSlideUpTransition}
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
          <Typography variant="h6" noWrap>
            {contentRef?.metadata?.["dc:title"]?.["#text"] ??
              contentRef?.metadata?.["dc:title"] ??
              "error"}
          </Typography>
          <Stack direction={"row"} spacing={2}>
            <ReaderFormat
              formatting={formatting}
              setFormatting={setFormatting}
            />
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
                height: pageHeight,
                columnFill: "auto",
                columnGap: `${columnGap}px`,
                columnWidth: `${pageWidth}px`,
                transform: `translate(-${
                  currentPage * (pageWidth + columnGap)
                }px);`,
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
              height: pageHeight,
              overflow: "visible",
              columnFill: "auto",
              columnGap: `${columnGap}px`,
              columnWidth: `${pageWidth}px`,
            }}
          >
            {spine?.[(spinePointer ?? 0) - 1] ?? "test"}
          </Box>
        </Box>
      </Stack>
    </Dialog>
  );
};
