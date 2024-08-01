import * as React from "react";
import {
  Box,
  Button,
  Collapse,
  FormControlLabel,
  Grid,
  Grow,
  ListItemIcon,
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

  const handleSearch = () => {
    const query = `${
      useDetailedSearch
        ? [
            ["Title"],
            ["Author"],
            ["Publisher"],
            ["Year", "first_publish_year"],
            ["ISBN"],
            ["Subject"],
          ]
            .filter(
              ([label, key]) =>
                document.getElementById(`tfDetailedSearch${label}`).value
                  .length > 0
            )
            .map(
              ([label, key]) =>
                `${key ?? label.toLowerCase()}=${
                  document.getElementById(`tfDetailedSearch${label}`).value
                }`
            )
            .join("&")
        : `q=${document.getElementById("tfQuerySearch").value}`
    }&sort=${sortType}`;
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
                ["Title", "100%"],
                ["Author", "50%"],
                ["Publisher", "50%"],
                ["Year", "20%"],
                ["ISBN", "50%"],
                ["Subject", "20%"],
              ].map(([label, width], index) => (
                <Grid item key={label} sx={{ minWidth: width }}>
                  <Grow
                    in={useDetailedSearch}
                    style={{ transformOrigin: "0 0 0" }}
                    {...(useDetailedSearch
                      ? { timeout: 400 * index + 800 }
                      : {})}
                  >
                    <TextField
                      id={`tfDetailedSearch${label}`}
                      label={label}
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
                        ["title", "", "h4"],
                        ["author_name", "by ", "h6"],
                        ["publisher", "Published by ", "body"],
                        ["first_publish_year", "First published in ", "body2"],
                        ["number_of_pages_median", "Pages: ", "body2"],
                        ["isbn", "ISBN: ", "subtitle2"],
                      ].map(([key, label, variant]) => (
                        <Typography
                          key={key}
                          variant={variant}
                          sx={{ wordBreak: "break-word", textWrap: "balance" }}
                        >{`${label} ${
                          Array.isArray(bookObj[key])
                            ? printArray(bookObj[key])
                            : bookObj[key] ?? "N/A"
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
