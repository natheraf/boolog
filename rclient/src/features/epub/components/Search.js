import {
  Autocomplete,
  Box,
  CircularProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import * as React from "react";
import { CircularProgressWithLabel } from "../../CustomComponents";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { useTheme } from "@emotion/react";
import PropTypes from "prop-types";

export const Search = ({ searchProps, setSearchFocused, spine }) => {
  const theme = useTheme();
  const greaterThanSmall = useMediaQuery(theme.breakpoints.up("sm"));

  const handleOnBlur = () => {
    setSearchFocused(false);
    searchProps.handleSearchOnBlur();
  };

  return (
    <Autocomplete
      value={null}
      onChange={searchProps.handleSearchOnChange}
      onInputChange={searchProps.handleSearchInputOnChange}
      onKeyDown={searchProps.handleSearchOnKeyDown}
      options={searchProps.searchResult}
      onFocus={searchProps.handleSearchOnFocus}
      onBlur={handleOnBlur}
      aria-placeholder={searchProps.searchNeedle.current}
      groupBy={(option) =>
        spine.current?.[option?.spineIndex]?.label ?? "No Chapter"
      }
      getOptionLabel={(option) =>
        option.previewStart + option.needle + option.previewEnd
      }
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          key={[
            option.spineIndex,
            option.page,
            option.textIndex,
            option.nodeNumber,
          ].join("|")}
        >
          <Stack>
            <Typography variant="caption">{`Part ${
              option.chapterPartNumber
            } Page ${option.page + 1}`}</Typography>
            <span>
              <span style={{ color: "gray" }}>{option.previewStart}</span>
              {option.needle}
              <span style={{ color: "gray" }}>{option.previewEnd}</span>
            </span>
          </Stack>
        </Box>
      )}
      loading={searchProps.searchNeedle.current !== null}
      loadingText={
        (searchProps.spineSearchPointer ?? 0) >=
        (spine.current?.length ?? 0) - 2
          ? "Loading results…"
          : "Searching…"
      }
      renderInput={(params) => (
        <TextField
          {...params}
          autoFocus
          placeholder="Search"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {searchProps.searchNeedle.current !== null ? (
                  (searchProps.spineSearchPointer ?? 0) >=
                  (spine.current?.length ?? 0) - 2 ? (
                    <CircularProgress
                      color={"inherit"}
                      size={20}
                      disableShrink
                    />
                  ) : (
                    <CircularProgressWithLabel
                      value={
                        ((searchProps.spineSearchPointer ?? 0) /
                          (spine.current?.length ?? 0)) *
                        100
                      }
                      color={"inherit"}
                      size={20}
                      sx={{ circle: { transition: "none" } }}
                    />
                  )
                ) : (
                  <Tooltip title={"Press Enter to Search"}>
                    <KeyboardReturnIcon fontSize="small" color="success" />
                  </Tooltip>
                )}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      size="small"
      disabled={spine.current === null}
      disableClearable
      sx={{ width: greaterThanSmall ? "300px" : "180px" }}
    />
  );
};

Search.propTypes = {
  searchProps: PropTypes.object.isRequired,
  setSearchFocused: PropTypes.func.isRequired,
  spine: PropTypes.object.isRequired,
};
