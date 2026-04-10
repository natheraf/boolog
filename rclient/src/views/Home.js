import * as React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { handleSimpleRequest } from "../api/Axios";
import { UserInfoContext } from "../context/UserInfo";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Chat } from "../features/ai/Chat";

export const Home = () => {
  const userInfoContext = React.useContext(UserInfoContext);

  const updates = {
    "Update 4/09/26 7:55PM": [
      "feat: dictionary in annotator can now play audio",
      "feat: use full screen dialog on mobile and menu otherwise in reader",
    ],
    "Update 4/06/26 10:57PM": [
      "feat: simple dictionary in annotator",
      "feat: go to search location button on search iterator",
    ],
    "Update 4/06/26 2:52PM": [
      "fix: large text clipping on narrow screens",
      "feat: toc scrolls to current chapter",
      "feat: larger default font size",
      "feat: chapter navigation tab sizes changes based on chapter length",
      "feat: new app icon",
    ],
    "Update 4/06/26 1:33AM": [
      "Search iterator at the bottom after going to search result location",
    ],
    "Update 3/19/26 1:13AM": [
      "Rewrite of the reader is now live",
      "progress reliability. no more losing progress and opening to a random page on open",
      "highlight reliability. no more infinite loops (i hope)",
      "page tabs reliability. not 100% but should be more accurate to how many pages are left and the current location",
      "----Whats new----",
      "SCROLL VIEW LESGOOOOOO",
      "auto hide header in reader",
      "new formatter",
      "back and forward buttons (history)",
      "navigation tabs are now on the sides rather than top and bottom",
      "prob other stuff idk",
    ],
    "Update 3/2/26 11:30PM": [
      "ISSUE: [iPhone 13 - ios 18.7.1 - latest CHROME] scroll view stutters at the start of the first scroll. unreproducible on the same device on safari and brave, and [Galaxy S21 FE 5G - Android 15 - latest CHROME]",
    ],
    "Update 7/20/25 9:18PM": [
      "fixed issue with ios highlighting the first paragraph when cutoff",
      "standard formatting available",
    ],
    "Update 5/25/25 6:09PM": [
      "improved compatibility with more epubs (https://www.gutenberg.org/ebooks/64317 and https://www.planetebook.com/the-great-gatsby/)",
      "fixed issues with highlights inheriting unwanted styles from parent",
      "users can now import a sample epub if their library is empty",
    ],
    "Update 5/23/25 4:29AM": [
      "been busy. feels like a lot and not much has changed at the same time. not all changes are listed",
      "reminder: alpha software. none of your data is safe from deletion",
      "format page width instead of page margins",
      "annotation view has sort feature",
      "sync is now available. sign in with google or email",
      'google drive integration is now available only when singed in "with" google',
      "preview notes in annotation viewer for context",
      "-- technical notes below --",
      "rewritten highlights to fix syncing issues",
      "redesigned local database structure to allow cheap partial writes",
    ],
    "Update 3/21/25 6:35PM": [
      "Added back button in reader.",
      "Clicking added keys d and space to turn pages in reader.",
    ],
    "Update 3/19/25 4:18AM": [
      "Annotation viewer saves on countdown. Still saves immediately on close.",
      "Can change the color of each note in annotation viewer with popup.",
    ],
    "Update 3/18/25 3:55AM": [
      "Fixed bug where swiping in annotation viewer turns pages.",
      "Using an accordion for each chapter's notes for a better experience.",
      "Notes in annotation viewer each have a button to go to where they are located in the book.",
    ],
  };

  const nuke = async () => {
    const databases = await indexedDB.databases();
    for (const database of databases) {
      window.indexedDB.deleteDatabase(database.name);
    }

    window.localStorage.clear();

    await handleSimpleRequest("post", {}, "auth/signout");
    userInfoContext.refreshAndIsLoggedIn().then(() => window.location.reload());
  };

  return (
    <div>
      <Chat />
      <Button onClick={nuke} color="error">
        If something is broken, click here to nuke local storage. Will logout
        and reset app.
      </Button>
      <Stack spacing={3}>
        <Stack spacing={2}>
          <Typography variant="h4">
            Hi, this is an epub reader / reading tracker!
          </Typography>
          <Typography variant="h5">
            Everything is work in progress so things will break until further
            notice D: Check here for updates
          </Typography>
          <Typography variant="h5">
            Search only adds books as entries. They don't give you epubs. You
            can add entries to track books you're reading, read, dropped, or
            finished.
          </Typography>
          <Typography variant="h5">
            To import an EPUB, go to the library page, click on the plus button
            on the bottom right, and click on the import icon. You can also drag
            one or multiple into the library page.
          </Typography>
          <Typography variant="h5">
            To open the epub, click on the picture of the book cover.
          </Typography>
        </Stack>

        <Divider />

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h4">How to use the EPUB Reader</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6">
              To change pages: press on the side, use the arrow keys, or swipe
            </Typography>
            <Typography variant="h6">
              To open the annotator: highlight on desktop; highlight then
              press/resize the highlight on mobile.
            </Typography>
            <Typography variant="h6">
              Right click the highlight to edit it. Or edit it in annotation
              viewer.
            </Typography>
            <Typography variant="h6">
              To view all your notes and memos for the book: click on the
              annotation viewer button top right.
            </Typography>
            <Typography variant="h6">
              To search: press on the search icon top right and type. Press
              enter to search.
            </Typography>
            <Typography variant="h6">
              To open the table of contents: click on the icon top right.
            </Typography>
            <Typography variant="h6">
              To change formatting: icon top right. fonts have google fonts if
              your connected to the internet.
            </Typography>
            <Typography variant="h6">
              Small tabs on the right for pages and the left for chapters allow
              you to navigate quickly or see your progress.
            </Typography>
            <Typography variant="h6">
              Press on your profile picture and there are buttons to toggle
              animations and dark/light modes.
            </Typography>
            <Typography variant="h6">Everything else is WIP</Typography>
          </AccordionDetails>
        </Accordion>

        <Divider />

        {Object.entries(updates).map(([summary, details]) => (
          <Accordion key={summary}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h4">{summary}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <ul>
                {details.map((text) => (
                  <li key={text}>
                    <Typography variant="h6">{text}</Typography>
                  </li>
                ))}
              </ul>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </div>
  );
};
