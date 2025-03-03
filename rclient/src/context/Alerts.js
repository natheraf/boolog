import * as React from "react";
import { Alert, Box, Stack } from "@mui/material";
import { TimedLoadingBar } from "../components/TimedLoadingBar";
import { FadingBox } from "../components/FadingBox";
import { useTheme } from "@emotion/react";

export const AlertsContext = React.createContext({
  addAlert: () => {},
});

export const Alerts = ({ children }) => {
  const theme = useTheme();
  const [alerts, setAlerts] = new React.useState({});
  const timeout = { ms: 5000, str: "5s" };
  const alertSeverities = ["info", "success", "warning", "error"];

  const alertMemo = React.useMemo(
    () => ({
      addAlert: (children, severity) => {
        setAlerts((prev) => ({
          ...prev,
          [children]: {
            children,
            severity,
            timeOutId: setTimeout(
              () => setAlerts((prev) => delete prev.children),
              timeout.ms
            ),
          },
        }));
      },
    }),
    []
  );

  return (
    <AlertsContext.Provider value={alertMemo}>
      <Stack
        spacing={1}
        sx={{
          position: "fixed",
          top: 70,
          right: 10,
          zIndex: 1301 /* default zIndex for modal (floating dialog) is 1300 */,
        }}
      >
        {Object.values(alerts).map((alert) => (
          <FadingBox
            key={alert.timeOutId}
            duration={500}
            timeout={
              Math.floor(timeout.ms / 2) +
              alertSeverities.indexOf(alert.severity) * 500
            }
            blurduration={theme.transitions.reduceMotion ? 500 : 0}
            blurtimeout={
              theme.transitions.reduceMotion ? timeout.ms : timeout.ms
            }
          >
            <Alert severity={alert.severity}>{alert.children}</Alert>
            <TimedLoadingBar
              color={
                alert.severity === "success"
                  ? "green"
                  : alert.severity === "error"
                  ? "red"
                  : alert.severity === "info"
                  ? "lightblue"
                  : "gold"
              }
              duration={timeout.ms}
            />
          </FadingBox>
        ))}
      </Stack>
      {children}
    </AlertsContext.Provider>
  );
};
