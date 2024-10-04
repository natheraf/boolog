import * as React from "react";
import {
  Box,
  Button,
  Collapse,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  Grow,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { searchOpenLib } from "../api/OpenLibrary";
import { searchGoogleBooks } from "../api/GoogleAPI";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";
import { Tiles } from "../components/Tiles";
import { indexedDBBooksInterface } from "../api/IndexedDB/Books";
import { useTheme } from "@emotion/react";

export const SearchBook = () => {
  const theme = useTheme();
  const greaterThanMid = useMediaQuery(theme.breakpoints.up("md"));
  const [useDetailedSearch, setUseDetailedSearch] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState({
    total_items: 0,
    items: [],
  });
  const [sortHelperText, setSortHelperText] = React.useState(
    "Best Results Descending"
  );
  const defaultSearchApi = "Open Library";
  const [apiHelperText, setApiHelperText] = React.useState(defaultSearchApi);
  const [searchSortType, setSearchSortType] = React.useState("relevance");
  const [searchRowsPerPage, setSearchRowsPerPage] = React.useState(5);
  const [searchPage, setSearchPage] = React.useState(1);
  const [selApi, setSelApi] = React.useState(defaultSearchApi);
  const [renderSearchResultsApi, setRenderSearchResultsApi] =
    React.useState(defaultSearchApi);
  const [performNewSearch, setPerformNewSearch] = React.useState(true);
  const defaultSearch = "The Empty Box and Zeroth Maria";
  const topResultRef = React.useRef(null);

  const handleSearch = React.useCallback(() => {
    if (performNewSearch === false) {
      return;
    }
    const querySearch = `${
      selApi === "Google Books" && useDetailedSearch ? "q=" : ""
    }${
      useDetailedSearch
        ? [
            {
              label: "Title",
              "Open Library": "title=",
              "Google Books": "intitle:",
            },
            {
              label: "Author",
              "Open Library": "author=",
              "Google Books": "inauthor:",
            },
            {
              label: "Publisher",
              "Open Library": "publisher=",
              "Google Books": "inpublisher:",
            },
            {
              label: "Year",
              "Open Library": "first_publish_year=",
              "Google Books": "",
            },
            { label: "ISBN", "Open Library": "isbn=", "Google Books": "isbn:" },
            {
              label: "Subject",
              "Open Library": "subject=",
              "Google Books": "subject:",
            },
          ]
            .filter(
              (obj) =>
                (document.getElementById(`tfDetailedSearch${obj.label}`).value
                  .length === 0 ||
                  (selApi === "Google Books" && obj.label === "Year")) === false
            )
            .map(
              (obj) =>
                `${obj[selApi]}${
                  document.getElementById(`tfDetailedSearch${obj.label}`).value
                }`
            )
            .join(selApi === "Google Books" ? "+" : "&")
        : `q=${document.getElementById("tfQuerySearch").value}`
    }`;
    setIsSearching(true);
    const searchFunction = {
      "Open Library": searchOpenLib,
      "Google Books": searchGoogleBooks,
    };
    searchFunction[selApi](
      `${querySearch}${selApi === "Google Books" ? "&orderBy=" : "&sort="}${
        selApi === "Open Library" && searchSortType === "relevance"
          ? ""
          : searchSortType
      }`,
      searchRowsPerPage,
      searchPage
    ).then((res) => {
      setSearchResults(repackApiResponse(res));
      setRenderSearchResultsApi(selApi);
      setIsSearching(false);
      setPerformNewSearch(false);
      topResultRef?.current?.scrollIntoView({
        behavior: theme.transitions.reduceMotion ? "smooth" : "instant",
        block: "start",
      });
    });
  }, [performNewSearch, selApi, searchPage, searchSortType, searchRowsPerPage]);

  const repackApiResponse = (response) => {
    const res = {
      total_items: searchApiInterface(response, "total_items"),
      items: [],
    };
    for (const item of searchApiInterface(response, "items")) {
      res.items.push({
        title: searchApiInterface(item, "title"),
        authors: searchApiInterface(item, "authors"),
        description: searchApiInterface(item, "description"),
        publisher: searchApiInterface(item, "publisher"),
        publish_year: searchApiInterface(item, "publish_year"),
        number_of_pages: searchApiInterface(item, "number_of_pages"),
        isbn: searchApiInterface(item, "isbn"),
        api_source: selApi,
        cover_url:
          selApi === "Open Library"
            ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg?default=false`
            : `https://books.google.com/books/publisher/content/images/frontcover/${item.id}?fife=w480-h690`,
      });
    }
    return res;
  };

  const handlePageChange = (event, newPage) => {
    setSearchPage(newPage);
    setPerformNewSearch(true);
  };

  const handleChangeRowsPerPage = (event, newRows) => {
    setSearchRowsPerPage(event.target.value);
    setSearchPage(1);
  };

  const handleSortChange = (event, selectedElement) => {
    setSortHelperText(selectedElement.props.name);
    setSearchSortType(selectedElement.props.value);
    setPerformNewSearch(true);
  };

  const handleApiChange = (event, selectedElement) => {
    setApiHelperText(selectedElement.props.name);
    setSelApi(selectedElement.props.value);
    setSortHelperText("Best Results Descending");
    setSearchSortType("relevance");
    setPerformNewSearch(false);
  };

  const handlePerformNewSearch = () => {
    setPerformNewSearch(true);
    setSearchPage(1);
    handleSearch();
  };

  const keyPress = (event) => {
    const enterKey = 13;
    const value = event.target.value;
    if (event.keyCode === enterKey) {
      if (
        event.target.id === "tfPageNum" &&
        isNaN(parseInt(value)) === false &&
        value >= 1 &&
        value <= Math.ceil(searchResults.total_items / searchRowsPerPage)
      ) {
        setSearchPage(parseInt(value));
      }
      if (event.target.id === "tfQuerySearch") {
        handlePerformNewSearch();
      }
    }
  };

  const searchApiInterface = (obj, key) => {
    const apiMap = {
      "Open Library": {
        total_items: obj?.numFound,
        items: obj?.docs,
        title: obj?.title,
        authors: obj?.author_name,
        publisher: obj?.publisher,
        publish_year: obj?.first_publish_year,
        number_of_pages: obj?.number_of_pages_median,
        isbn: obj?.isbn,
      },
      "Google Books": {
        total_items: obj?.totalItems,
        items: obj?.items,
        title: obj?.volumeInfo?.title,
        authors: obj?.volumeInfo?.authors,
        description: obj?.volumeInfo?.description,
        publisher: obj?.volumeInfo?.publisher,
        publish_year: obj?.volumeInfo?.publishedDate,
        number_of_pages: obj?.volumeInfo?.pageCount,
        isbn: obj?.volumeInfo?.industryIdentifiers
          ?.filter((obj) => obj?.type?.indexOf("ISBN") === 0)
          ?.map((obj) => obj?.identifier),
      },
    };
    return apiMap[selApi]?.[key];
  };

  React.useEffect(() => {
    handleSearch();
  }, [handleSearch, selApi]);

  return (
    <Grid container justifyContent="center" alignItems="flex-start" spacing={2}>
      <Paper>
        <Grid item sx={{ maxWidth: "40rem" }} m={2}>
          <Stack spacing={2}>
            <Typography variant="h3">Search Books</Typography>
            <Stack direction="row" justifyContent={"space-between"}>
              <FormControl>
                <InputLabel id="selApiLabel">Search Source</InputLabel>
                <Select
                  id="selApi"
                  labelId="selApiLabel"
                  label="Search Source"
                  value={selApi}
                  onChange={handleApiChange}
                  sx={{ minWidth: "40%" }}
                >
                  {[
                    {
                      value: "Open Library",
                      label: "Open Library",
                      helperText: "Open Library",
                    },
                    {
                      value: "Google Books",
                      label: "Google Books",
                      helperText: "Google Books",
                    },
                  ].map((obj) => (
                    <MenuItem
                      key={obj.value}
                      name={obj.helperText}
                      value={obj.value}
                    >
                      {obj.label}
                    </MenuItem>
                  ))}
                </Select>
                {/* <FormHelperText>{apiHelperText}</FormHelperText> */}
              </FormControl>
              <FormControlLabel
                control={<Switch />}
                label={"Detailed Search"}
                onChange={() => setUseDetailedSearch((prev) => !prev)}
              />
            </Stack>
            <Collapse in={!useDetailedSearch}>
              <TextField
                id="tfQuerySearch"
                label="Search"
                defaultValue={defaultSearch}
                onKeyDown={keyPress}
                disabled={useDetailedSearch}
                fullWidth
              />
            </Collapse>
            <Collapse in={useDetailedSearch}>
              <Grid
                spacing={2}
                container
                direction={"row"}
                justifyContent={"left"}
                alignItems={"flex-start"}
                sx={{ height: { xs: "7rem", sm: "auto" }, overflow: "auto" }}
              >
                {[
                  { label: "Title", width: "100%" },
                  { label: "Author", width: "50%" },
                  { label: "Publisher", width: "50%" },
                  { label: "Year", width: "20%" },
                  { label: "ISBN", width: "50%" },
                  { label: "Subject", width: "20%" },
                ].map((obj, index) => (
                  <Grid item key={obj.label} sx={{ minWidth: obj.width }}>
                    <Grow
                      in={useDetailedSearch}
                      style={{ transformOrigin: "0 0 0" }}
                      {...(useDetailedSearch
                        ? {
                            timeout:
                              (400 * index + 800) *
                              theme.transitions.reduceMotion,
                          }
                        : {})}
                    >
                      <TextField
                        id={`tfDetailedSearch${obj.label}`}
                        label={obj.label}
                        disabled={
                          selApi === "Google Books" && obj.label === "Year"
                        }
                        helperText={
                          selApi === "Google Books" && obj.label === "Year"
                            ? "Not Available with Google Books"
                            : ""
                        }
                        fullWidth
                      />
                    </Grow>
                  </Grid>
                ))}
              </Grid>
            </Collapse>
            <Button
              variant="contained"
              onClick={handlePerformNewSearch}
              endIcon={
                isSearching ? (
                  <CircularProgress color="inherit" size={16} />
                ) : (
                  <SearchIcon />
                )
              }
              disabled={isSearching}
            >
              {`Search${isSearching ? "ing" : ""}`}
            </Button>
          </Stack>
        </Grid>
      </Paper>
      <Grid item sx={{ width: "50rem" }}>
        <Box
          ref={topResultRef}
          sx={{
            position: "relative",
            top: -70,
          }}
        />
        <Stack spacing={2} p={2}>
          <FormControl>
            <InputLabel id="selSortLabel">Sort By</InputLabel>
            <Select
              id="selSort"
              labelId="selSortLabel"
              label="Sort by"
              value={searchSortType}
              disabled={isSearching}
              onChange={handleSortChange}
              sx={{ minWidth: "40%" }}
            >
              {(selApi === "Google Books"
                ? [
                    {
                      value: "relevance",
                      label: <em>Relevance</em>,
                      helperText: "Best Results Descending",
                    },
                    {
                      value: "newest",
                      label: "New",
                      helperText: "Release Date Descending",
                    },
                  ]
                : [
                    {
                      value: "relevance",
                      label: <em>Relevance</em>,
                      helperText: "Best Results Descending",
                    },
                    {
                      value: "new",
                      label: "New",
                      helperText: "Release Date Descending",
                    },
                    {
                      value: "old",
                      label: "Old",
                      helperText: "Release Date Ascending",
                    },
                    {
                      value: "rating",
                      label: "Rated Best",
                      helperText: "Rating Descending",
                    },
                    {
                      value: "rating asc",
                      label: "Rated Worst",
                      helperText: "Rating Ascending",
                    },
                    {
                      value: "readinglog",
                      label: "Popular on OpenLibrary",
                      helperText: "OpenLibrary Users Count Descending",
                    },
                    {
                      value: "already_read",
                      label: "Most Read",
                      helperText: "Read Count Descending",
                    },
                    {
                      value: "currently_reading",
                      label: "Most being Read",
                      helperText: "Reading Count Descending",
                    },
                    {
                      value: "want_to_read",
                      label: "Most Desired Reads",
                      helperText: "Plan to Read Count Descending",
                    },
                    {
                      value: "title",
                      label: "Title Alphabetically",
                      helperText: "Title Alphabetically Descending",
                    },
                  ]
              ).map((obj) => (
                <MenuItem
                  key={obj.value}
                  name={obj.helperText}
                  value={obj.value}
                >
                  {obj.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{sortHelperText}</FormHelperText>
          </FormControl>
          {searchResults.total_items === 0 ? (
            <Typography variant="h4">No Result</Typography>
          ) : (
            <Tiles
              objectArray={searchResults}
              keysData={[
                { key: "title", label: "", variant: "h4" },
                { key: "authors", label: "by ", variant: "h6" },
                {
                  key: "publisher",
                  label: "Published by ",
                  variant: "body",
                },
                {
                  key: "publish_year",
                  label: "Published in ",
                  variant: "body2",
                },
                {
                  key: "number_of_pages",
                  label: "Pages: ",
                  variant: "body2",
                },
                {
                  key: "isbn",
                  label: "ISBN: ",
                  variant: "subtitle2",
                },
              ]}
              actionArea={{
                api: indexedDBBooksInterface,
                mediaUniqueIdentifier: "isbn",
                orientation: greaterThanMid ? "vertical" : "horizontal",
              }}
              size="large"
            />
          )}
          <Grid
            container
            direction="row"
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Pagination
              count={
                renderSearchResultsApi === "Google Books"
                  ? Math.min(
                      99,
                      Math.ceil(searchResults.total_items / searchRowsPerPage)
                    )
                  : Math.ceil(searchResults.total_items / searchRowsPerPage)
              }
              disabled={isSearching}
              page={searchPage}
              onChange={handlePageChange}
            />
          </Grid>
        </Stack>
      </Grid>
    </Grid>
  );
};
