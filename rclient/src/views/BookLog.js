import * as React from "react";
import { getAllBooks } from "../api/IndexedDB";
import { Tiles } from "../components/Tiles";
import { Stack } from "@mui/material";

export const BookLog = () => {
  const [library, setLibrary] = React.useState();

  React.useEffect(() => {
    getAllBooks((res) => {
      setLibrary({ items: res, total_items: res.length });
    });
  }, []);

  return (
    <Stack spacing={2} sx={{ width: "50%" }}>
      <Tiles
        objectArray={library}
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
        actionArea={false}
      />
    </Stack>
  );
};
