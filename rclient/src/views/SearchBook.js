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
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import { searchOpenLib } from "../api/OpenLibrary";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import CircularProgress from "@mui/material/CircularProgress";

export const SearchBook = () => {
  const [useDetailedSearch, setUseDetailedSearch] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState({ numFound: 0 });
  const [sortHelperText, setSortHelperText] = React.useState(
    "Best Results Descending"
  );
  const [searchSortType, setSearchSortType] = React.useState("");
  const [searchRowsPerPage, setSearchRowsPerPage] = React.useState(5);
  const [searchPage, setSearchPage] = React.useState(1);
  const [tfQuerySearchValue, setTfQuerySearch] = React.useState("Chainsaw Man");

  const handleSearch = React.useCallback(() => {
    const query = `${
      useDetailedSearch
        ? [
            { label: "Title", key: "title" },
            { label: "Author", key: "author" },
            { label: "Publisher", key: "publisher" },
            { label: "Year", key: "first_publish_year" },
            { label: "ISBN", key: "isbn" },
            { label: "Subject", key: "subject" },
          ]
            .filter(
              (obj) =>
                document.getElementById(`tfDetailedSearch${obj.label}`).value
                  .length > 0
            )
            .map(
              (obj) =>
                `${obj.key}=${
                  document.getElementById(`tfDetailedSearch${obj.label}`).value
                }`
            )
            .join("&")
        : `q=${tfQuerySearchValue}`
    }&sort=${searchSortType}`;
    setIsSearching(true);
    searchOpenLib(query, searchRowsPerPage, searchPage).then((res) => {
      setSearchResults(res);
      setIsSearching(false);
    });
  }, [
    searchPage,
    searchRowsPerPage,
    searchSortType,
    useDetailedSearch,
    tfQuerySearchValue,
  ]);

  const handlePageChange = (event, newPage) => {
    setSearchPage(event.target.value ?? newPage + 1);
  };

  const handleChangeRowsPerPage = (event, newRows) => {
    setSearchRowsPerPage(event.target.value);
    setSearchPage(1);
  };

  const handleSortChange = (event, newElement) => {
    setSortHelperText(newElement.props.name);
    setSearchSortType(
      newElement.props.value === "relevance" ? "" : newElement.props.value
    );
    setSearchPage(1);
  };

  const handleNewSearch = () => {
    setSearchPage(1);
    setTfQuerySearch(document.getElementById("tfQuerySearch").value);
  };

  const keyPress = (event) => {
    const enterKey = 13;
    const value = event.target.value;
    if (event.keyCode === enterKey) {
      if (
        event.target.id === "tfPageNum" &&
        isNaN(parseInt(value)) === false &&
        value >= 1 &&
        value <= Math.ceil(searchResults.numFound / searchRowsPerPage)
      ) {
        setSearchPage(parseInt(value));
      }
      if (event.target.id === "tfQuerySearch" && isSearching === false) {
        handleNewSearch();
      }
    }
  };

  const SearchTablePagination = () => (
    <Grid
      container
      direction="row"
      justifyContent={"space-between"}
      alignItems={"center"}
    >
      {Math.ceil(searchResults.numFound / searchRowsPerPage) === 0 ||
      Math.ceil(searchResults.numFound / searchRowsPerPage) > 10 ? (
        <TextField
          id="tfPageNum"
          label="Page"
          onKeyDown={keyPress}
          sx={{ width: "10rem" }}
          size="small"
          defaultValue={searchPage}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Typography>{`/ ${Math.ceil(
                  searchResults.numFound / searchRowsPerPage
                )}`}</Typography>
              </InputAdornment>
            ),
          }}
        />
      ) : (
        <FormControl>
          <InputLabel id="selPageNumLabel">Page</InputLabel>
          <Select
            labelId="selPageNumLabel"
            id="selPageNum"
            label="Page"
            value={searchPage}
            onChange={handlePageChange}
            sx={{ minWidth: "40%" }}
          >
            {[
              ...Array(
                Math.ceil(searchResults.numFound / searchRowsPerPage)
              ).keys(),
            ].map((pageValue) => (
              <MenuItem key={pageValue} value={pageValue + 1}>
                {pageValue + 1}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <TablePagination
        component="div"
        count={searchResults.numFound}
        page={searchPage - 1}
        onPageChange={handlePageChange}
        rowsPerPage={searchRowsPerPage}
        rowsPerPageOptions={[5, 10, 15, 20]}
        onRowsPerPageChange={handleChangeRowsPerPage}
        disabled={isSearching}
      />
    </Grid>
  );

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
  }, [handleSearch]);

  return (
    <Grid container justifyContent="center" alignItems="flex-start" spacing={2}>
      <Grid item sx={{ maxWidth: "40rem" }}>
        <Stack spacing={1}>
          <Typography variant="h3">Search Books</Typography>
          <Stack direction="row" justifyContent={"space-between"}>
            <FormControl>
              <InputLabel id="selSortLabel">Sort By</InputLabel>
              <Select
                id="selSort"
                labelId="selSortLabel"
                label="Sort by"
                defaultValue="relevance"
                onChange={handleSortChange}
                sx={{ minWidth: "40%" }}
              >
                {[
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
              <FormHelperText>{sortHelperText}</FormHelperText>
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
              defaultValue={"Chainsaw Man"}
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
                      fullWidth
                    />
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </Collapse>
          <Button
            variant="contained"
            onClick={handleNewSearch}
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
          <SearchTablePagination />
          {searchResults.numFound === 0 ? (
            <Typography variant="h4">No Result</Typography>
          ) : (
            searchResults.docs.map((bookObj, index) => (
              <Grow
                key={bookObj.key}
                in={searchResults.numFound > 0}
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
                      src={`https://covers.openlibrary.org/b/id/${bookObj.cover_i}-L.jpg?default=false`}
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
                          Array.isArray(bookObj[obj.key])
                            ? printArray(bookObj[obj.key])
                            : bookObj[obj.key] ?? "N/A"
                        }`}</Typography>
                      ))}
                    </Stack>
                  </Grid>
                </Grid>
              </Grow>
            ))
          )}
          <SearchTablePagination />
        </Stack>
      </Grid>
    </Grid>
  );
};
