import * as React from "react";
import {
  Box,
  Button,
  Collapse,
  FormControlLabel,
  Grid,
  Grow,
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

  const handleSearch = () => {
    setIsSearching(true);
    searchOpenLib(document.getElementById("tfQuerySearch").value).then(
      (res) => {
        setSearchResults(res);
        setIsSearching(false);
      }
    );
  };

  const printArray = (arr) => {
    return (
      arr.slice(0, Math.min(2, arr.length - 1)).join(", ") +
      (arr.length > 1 ? " and " : "") +
      (arr.length < 4 ? arr[arr.length - 1] : arr.length - 3 + " others")
    );
  };

  return (
    <Grid container justifyContent="center" alignItems="flex-start" spacing={2}>
      <Grid item sx={{ maxWidth: "40rem" }}>
        <Stack spacing={1}>
          <Typography variant="h3">Search Books</Typography>
          <FormControlLabel
            control={<Switch />}
            label={"Detailed Search"}
            onChange={() => setUseDetailedSearch((prev) => !prev)}
          />
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
                    <TextField label={label} fullWidth />
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
                      src={`https://covers.openlibrary.org/b/id/${bookObj.cover_i}-M.jpg?default=false`}
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
                            : bookObj[key] ?? "None"
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
