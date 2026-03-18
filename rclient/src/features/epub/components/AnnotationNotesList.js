import * as React from "react";
import PropTypes from "prop-types";
import { AnnotationNotesGrouped } from "./AnnotationNotesGrouped";

export const AnnotationNotesList = ({
  epubObject,
  spineIndex,
  notes,
  grouped,
}) => {
  const spine = epubObject.spine;
  const [expandedNotes, setExpandedNotes] = React.useState(new Map());

  return (
    grouped && (
      <AnnotationNotesGrouped
        spine={spine}
        spineIndex={spineIndex}
        notes={notes}
        expandedNotes={expandedNotes}
      />
    )
  );
};

AnnotationNotesList.propTypes = {
  epubObject: PropTypes.object.isRequired,
  spineIndex: PropTypes.number.isRequired,
  notes: PropTypes.object.isRequired,
  grouped: PropTypes.bool.isRequired,
};
