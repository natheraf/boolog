import { EpubState } from "./EpubState";
import PropTypes from "prop-types";

export const EpubProvider = ({ children }) => {
  return <EpubState>{children}</EpubState>;
};

EpubProvider.propTypes = {
  children: PropTypes.element.isRequired,
};
