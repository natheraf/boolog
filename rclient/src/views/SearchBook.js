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
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { searchOpenLib } from "../api/OpenLibrary";
import { searchGoogleBooks } from "../api/GoogleAPI";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";

export const SearchBook = () => {
  const [useDetailedSearch, setUseDetailedSearch] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState({ numFound: 0 });
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
      setSearchResults(res);
      setRenderSearchResultsApi(selApi);
      setIsSearching(false);
      setPerformNewSearch(false);
    });
  }, [performNewSearch, selApi, searchPage, searchSortType, searchRowsPerPage]);

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

  const keyPress = (event) => {
    const enterKey = 13;
    const value = event.target.value;
    if (event.keyCode === enterKey) {
      if (
        event.target.id === "tfPageNum" &&
        isNaN(parseInt(value)) === false &&
        value >= 1 &&
        value <=
          Math.ceil(
            searchApiInterface(searchResults, "numFound") / searchRowsPerPage
          )
      ) {
        setSearchPage(parseInt(value));
      }
      if (event.target.id === "tfQuerySearch") {
        setPerformNewSearch(true);
        handleSearch();
      }
    }
  };

  const searchApiInterface = (obj, key) => {
    const apiMap = {
      "Open Library": {
        numFound: obj?.numFound,
        title: obj?.title,
        author_name: obj?.author_name,
        publisher: obj?.publisher,
        first_publish_year: obj?.first_publish_year,
        number_of_pages_median: obj?.number_of_pages_median,
        isbn: obj?.isbn,
        docs: obj?.docs,
      },
      "Google Books": {
        numFound: obj?.totalItems,
        docs: obj?.items,
        title: obj?.volumeInfo?.title,
        author_name: obj?.volumeInfo?.authors,
        description: obj?.volumeInfo?.description,
        publisher: obj?.volumeInfo?.publisher,
        first_publish_year: obj?.volumeInfo?.publishedDate,
        number_of_pages_median: obj?.volumeInfo?.pageCount,
        isbn: obj?.volumeInfo?.industryIdentifiers
          ?.filter((obj) => obj?.type?.indexOf("ISBN") === 0)
          ?.map((obj) => obj?.identifier),
        id: obj?.id,
      },
    };
    return apiMap[renderSearchResultsApi]?.[key];
  };

  const printArray = (arr) => {
    return (
      arr.slice(0, Math.min(2, arr.length - 1)).join(", ") +
      (arr.length > 1 ? " and " : "") +
      (arr.length < 4
        ? arr[arr.length - 1]
        : arr.length - 3 + " other" + (arr.length - 3 > 1 ? "s" : ""))
    );
  };

  React.useEffect(() => {
    handleSearch();
  }, [handleSearch, selApi]);

  return (
    <Grid container justifyContent="center" alignItems="flex-start" spacing={2}>
      <Grid item sx={{ maxWidth: "40rem" }}>
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
                      ? { timeout: 400 * index + 800 }
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
            onClick={() => {
              setPerformNewSearch(true);
              handleSearch();
            }}
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
      <Grid item sx={{ width: "50rem" }}>
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
          {searchApiInterface(searchResults, "numFound") === 0 ? (
            <Typography variant="h4">No Result</Typography>
          ) : (
            searchApiInterface(searchResults, "docs")?.map((bookObj, index) => (
              <Grow
                key={bookObj.key}
                in={searchApiInterface(searchResults, "numFound") > 0}
                style={{ transformOrigin: "0 0 0" }}
                timeout={600 * index + 1000}
              >
                <Grid
                  container
                  direction={"row"}
                  justifyContent={"left"}
                  alignItems={"center"}
                  p={1}
                  sx={{ backgroundColor: "white" }}
                  gap={2}
                >
                  <Grid item sx={{ width: "25%" }}>
                    <Box
                      component="img"
                      src={
                        renderSearchResultsApi === "Open Library"
                          ? `https://covers.openlibrary.org/b/id/${bookObj.cover_i}-L.jpg?default=false`
                          : `https://books.google.com/books/publisher/content/images/frontcover/${bookObj.id}?fife=w480-h690`
                      }
                      alt={`cover for ${bookObj.title}`}
                      sx={{
                        borderRadius: "5px",
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </Grid>
                  <Grid
                    item
                    sx={{
                      height: "100%",
                      width: "70%",
                    }}
                  >
                    <Stack spacing={1}>
                      {[
                        { key: "title", label: "", variant: "h4" },
                        { key: "author_name", label: "by ", variant: "h6" },
                        {
                          key: "publisher",
                          label: "Published by ",
                          variant: "body",
                        },
                        {
                          key: "first_publish_year",
                          label: "First published in ",
                          variant: "body2",
                        },
                        {
                          key: "number_of_pages_median",
                          label: "Pages: ",
                          variant: "body2",
                        },
                        { key: "isbn", label: "ISBN: ", variant: "subtitle2" },
                      ].map((obj) => (
                        <Typography
                          key={obj.key}
                          variant={obj.variant}
                          sx={{ wordBreak: "break-word", textWrap: "balance" }}
                        >{`${obj.label} ${
                          Array.isArray(searchApiInterface(bookObj, obj.key))
                            ? printArray(searchApiInterface(bookObj, obj.key))
                            : searchApiInterface(bookObj, obj.key) ?? "N/A"
                        }`}</Typography>
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
              </Grow>
            ))
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
                      Math.ceil(
                        searchApiInterface(searchResults, "numFound") /
                          searchRowsPerPage
                      )
                    )
                  : Math.ceil(
                      searchApiInterface(searchResults, "numFound") /
                        searchRowsPerPage
                    )
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
