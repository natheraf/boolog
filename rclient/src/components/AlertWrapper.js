import * as React from "react";
import { Alert, Box, Stack } from "@mui/material";
import { TimedLoadingBar } from "./TimedLoadingBar";

export const AlertContext = React.createContext({});

export const AlertWrapper = ({ children }) => {
  const [alerts, setAlerts] = new React.useState([]);
  const timeout = { ms: 5000, str: "5s" };

  const alertMemo = React.useMemo(
    () => ({
      addAlert: (children, severity) => {
        setAlerts((prev) => [
          ...prev,
          {
            children,
            severity,
            timeOutId: setTimeout(
              () => setAlerts((prev) => prev.slice(1)),
              timeout.ms
            ),
          },
        ]);
      },
    }),
    []
  );

  return (
    <AlertContext.Provider value={alertMemo}>
      <Stack
        spacing={1}
        sx={{
          position: "fixed",
          top: 70,
          right: 10,
          zIndex: 1301 /* default zIndex for modal (floating dialog) is 1300 */,
        }}
      >
        {alerts.map((alert) => (
          <Box key={alert.timeOutId}>
            <Alert severity={alert.severity}>{alert.children}</Alert>
            <TimedLoadingBar
              color={
                alert.severity === "success"
                  ? "green"
                  : alert.severity === "error"
                  ? "red"
                  : alert.severity === "info"
                  ? "blue"
                  : "yellow"
              }
              duration={timeout.str}
            />
          </Box>
        ))}
      </Stack>
      {children}
    </AlertContext.Provider>
  );
};