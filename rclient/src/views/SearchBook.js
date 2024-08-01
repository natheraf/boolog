import * as React from "react";
import {
  Box,
  Button,
  Collapse,
  FormControlLabel,
  Grid,
  Grow,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { searchOpenLib } from "../api/OpenLibrary";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";

export const SearchBook = () => {
  const [useDetailedSearch, setUseDetailedSearch] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState({ numFound: 0 });
  const [sortHelperText, setSortHelperText] = React.useState(
    "Best Results Descending"
  );
  const [sortType, setSortType] = React.useState("");

  const handleSearch = (sortValue) => {
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
        : `q=${document.getElementById("tfQuerySearch").value}`
    }&sort=${sortValue ?? sortType}`;
    setIsSearching(true);
    searchOpenLib(query).then((res) => {
      setSearchResults(res);
      setIsSearching(false);
    });
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

  return (
    <Grid container justifyContent="center" alignItems="flex-start" spacing={2}>
      <Grid item sx={{ maxWidth: "40rem" }}>
        <Stack spacing={1}>
          <Typography variant="h3">Search Books</Typography>
          <Stack direction="row" justifyContent={"space-between"}>
            <TextField
              id="selSort"
              label="Sort by"
              defaultValue={"relevance"}
              select
              sx={{ minWidth: "40%" }}
              helperText={sortHelperText}
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
                  value={obj.value}
                  onClick={() => {
                    setSortHelperText(obj.helperText);
                    setSortType(obj.value === "relevance" ? "" : obj.value);
                  }}
                >
                  {obj.label}
                </MenuItem>
              ))}
            </TextField>
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
            onClick={handleSearch}
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
        <Stack spacing={2} sx={{ backgroundColor: "gray" }} p={2}>
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
        </Stack>
      </Grid>
    </Grid>
  );
};
