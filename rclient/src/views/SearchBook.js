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
                ["Author", "40%"],
                ["Publisher", "40%"],
                ["Year", "20%"],
                ["ISBN", "20%"],
                ["Subject", "20%"],
              ].map(([label, width], index) => (
                <Grid item key={label} sx={{ minWidth: width }}>
                  <Grow
                    in={useDetailedSearch}
                    style={{ transformOrigin: "0 0 0" }}
                    {...(useDetailedSearch ? { timeout: 400 * index } : {})}
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
      <Grid item sx={{ width: "40rem" }}>
        <Stack spacing={2} sx={{ backgroundColor: "gray" }}>
          {searchResults.numFound === 0 ? (
            <Typography variant="h4">No Result</Typography>
          ) : (
            searchResults.docs.map((bookObj, index) => (
              <Grow
                key={bookObj.isbn[0]}
                in={searchResults.numFound > 0}
                style={{ transformOrigin: "0 0 0" }}
                timeout={600 * index + 1000}
              >
                <Stack direction="row" spacing={2}>
                  <Box
                    component="img"
                    src={`https://covers.openlibrary.org/b/id/${bookObj.cover_i}-M.jpg?default=false`}
                    alt={`no cover for ${bookObj.title}`}
                    sx={{ maxWidth: "500px", height: "auto" }}
                  />

                  <Stack spacing={1}>
                    {[
                      "title",
                      "author_name",
                      "publisher",
                      "first_publish_year",
                      "isbn",
                      "number_of_pages_median",
                    ].map((key) => (
                      <Typography
                        key={key}
                      >{`${key}: ${bookObj[key]}`}</Typography>
                    ))}
                  </Stack>
                </Stack>
              </Grow>
            ))
          )}
        </Stack>
      </Grid>
    </Grid>
  );
};
