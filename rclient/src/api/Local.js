export const userTemplates = [
  {
    name: "Grun",
    profilePicture:
      "https://images.unsplash.com/photo-1638898407927-79801f46960b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Bits",
    profilePicture:
      "https://images.unsplash.com/photo-1510771463146-e89e6e86560e?q=80&w=1227&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Tux",
    profilePicture:
      "https://images.unsplash.com/photo-1462888210965-cdf193fb74de?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Peeper",
    profilePicture:
      "https://images.unsplash.com/photo-1513568821485-d64ace9a3509?q=80&w=1201&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Bloop",
    profilePicture:
      "https://images.unsplash.com/photo-1637308111472-fdf4886a2e07?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Tibbers",
    profilePicture:
      "https://images.unsplash.com/photo-1595173425119-1c54835c1874?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Tony",
    profilePicture:
      "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?q=80&w=1064&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export const defaultFormatting = {
  fontSize: "Original",
  _fontSizeDefault: 1,
  _fontSizeStep: 0.05,
  _fontSizeBounds: { min: 0.05, max: Infinity },
  lineHeight: "Original",
  _lineHeightDefault: 12,
  _lineHeightBounds: { min: 1, max: Infinity },
  _lineHeightStep: 1,
  pageMargins: 500,
  _pageMarginsStep: 50,
  _pageMarginsBounds: { min: 70, max: Infinity },
  pagesShown: 1,
  _pagesShownStep: 1,
  _pagesShownBounds: { min: 1, max: Infinity },
  fontFamily: {
    label: "Original",
    value: "inherit",
    group: null,
    kind: "local",
  },
  textAlign: { label: "Original", value: "inherit" },
  _textAlignments: [
    { label: "Original", value: "inherit" },
    { label: "Left", value: "start" },
    { label: "Middle", value: "center" },
    { label: "Right", value: "end" },
    { label: "Justified", value: "justify" },
  ],
  showDividers: true,
  showArrows: true,
  fontWeight: "Original",
  _fontWeightDefault: 400,
  _fontWeightStep: 100,
  _fontWeightBounds: { min: 1, max: 1000 },
  textColor: "Original",
  pageColor: "Original",
  pageHeightMargins: 25,
  _pageHeightMarginsStep: 25,
  _pageHeightMarginsBounds: { min: 0, max: Infinity },
  textIndent: "Original",
  _textIndentDefault: 1,
  _textIndentStep: 1,
  _textIndentBounds: { min: 0, max: Infinity },
  showPageNavigator: true,
  showSpineNavigator: true,
};

const relators = [
  {
    "@id": "http://id.loc.gov/vocabulary/relators/fmo",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "former owner" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/aue",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "audio engineer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dsr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "designer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/spk",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "speaker" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/bpd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "bookplate designer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/prn",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "production company" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dis",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "dissertant" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/mus",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "musician" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cor",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "collection registrar" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/bka",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "book artist" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/rse",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "respondent-appellee" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ptf",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "plaintiff" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/egr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "engraver" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ccp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "conceptor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/gis",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "geographic information specialist" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/prt",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "printer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/app",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "applicant" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cpc",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "copyright claimant" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/lil",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "libelant" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ape",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "appellee" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/hnr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "honoree" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cpt",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "complainant-appellant" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/orm",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "organizer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/brl",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "braille embosser" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/adp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "adapter" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/win",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "writer of introduction" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ltg",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "lithographer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/fnd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "funder" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/crr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "corrector" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/vac",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "voice actor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/wde",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "wood engraver" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/anm",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "animator" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/mon",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "monitor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/elt",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "electrotyper" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/asn",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "associated name" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/tlp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "television producer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/org",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "originator" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/sgd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "stage director" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/com",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "compiler" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ins",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "inscriber" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cre",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "creator" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/mfr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "manufacturer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/mod",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "moderator" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/fmd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "film director" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cmp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "composer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dtc",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "data contributor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/sce",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "scenarist" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/tyd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "type designer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/pro",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "producer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dln",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "delineator" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/tad",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "technical advisor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cos",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "contestant" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cli",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "client" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/prc",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "process contact" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/trl",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "translator" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/pmn",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "production manager" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/mtk",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "minute taker" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/pbl",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "publisher" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ann",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "annotator" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/tau",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "television writer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/lel",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "libelee" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/aup",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "audio producer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/arr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "arranger" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/enj",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "enacting jurisdiction" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cst",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "costume designer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/mte",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "metal engraver" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/tld",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "television director" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/wal",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "writer of added lyrics" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cph",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "copyright holder" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/chr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "choreographer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/stl",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "storyteller" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/mdc",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "metadata contact" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/rev",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "reviewer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/lse",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "licensee" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/clt",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "collotyper" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ivr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "interviewer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ill",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "illustrator" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/arc",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "architect" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/lee",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "libelee-appellee" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cts",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "contestee" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/adi",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "art director" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/elg",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "electrician" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/osp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "onscreen presenter" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ant",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "bibliographic antecedent" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/rcp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "addressee" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/anc",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "announcer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/tlh",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "television host" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/sde",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "sound engineer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/drm",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "draftsman" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/stm",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "stage manager" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ilu",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "illuminator" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/pbd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "publisher director" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/att",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "attributed name" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ldr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "laboratory director" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/prg",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "programmer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/sng",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "singer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/wam",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "writer of accompanying material" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/sll",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "seller" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/rsr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "restorationist" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/abr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "abridger" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/hst",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [{ "@value": "host" }],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/rsg",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "restager" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/prm",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "printmaker" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dto",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "dedicator" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/rcd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "recordist" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/uvp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "university place" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/rth",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "research team head" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ctb",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "contributor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/pat",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "patron" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/srv",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "surveyor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/tch",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "teacher" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/aud",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "author of dialog" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/wpr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "writer of preface" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cns",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "censor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/prs",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "production designer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/art",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "artist" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/mcp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "music copyist" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/pan",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "panelist" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/stg",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "setting" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/mfp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "manufacture place" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/apl",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "appellant" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/pte",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "plaintiff-appellee" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/edm",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "editor of moving image work" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/wit",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "witness" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/act",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "actor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/rpt",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "reporter" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/stn",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "standards body" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ive",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "interviewee" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/vfx",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "visual effects provider" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/aui",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "author of introduction, etc." },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/lsa",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "landscape architect" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators",
    "@type": [
      "http://www.loc.gov/mads/rdf/v1#MADSScheme",
      "http://www.w3.org/2004/02/skos/core#ConceptScheme",
    ],
    "http://www.loc.gov/mads/rdf/v1#hasMADSSchemeMember": [
      { "@id": "http://id.loc.gov/vocabulary/relators/mka" },
      { "@id": "http://id.loc.gov/vocabulary/relators/mtk" },
      { "@id": "http://id.loc.gov/vocabulary/relators/pra" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dnc" },
      { "@id": "http://id.loc.gov/vocabulary/relators/nrt" },
      { "@id": "http://id.loc.gov/vocabulary/relators/hst" },
      { "@id": "http://id.loc.gov/vocabulary/relators/opn" },
      { "@id": "http://id.loc.gov/vocabulary/relators/prf" },
      { "@id": "http://id.loc.gov/vocabulary/relators/rsg" },
      { "@id": "http://id.loc.gov/vocabulary/relators/lie" },
      { "@id": "http://id.loc.gov/vocabulary/relators/wat" },
      { "@id": "http://id.loc.gov/vocabulary/relators/app" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ccp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/mfr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cur" },
      { "@id": "http://id.loc.gov/vocabulary/relators/prd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/asn" },
      { "@id": "http://id.loc.gov/vocabulary/relators/pat" },
      { "@id": "http://id.loc.gov/vocabulary/relators/elg" },
      { "@id": "http://id.loc.gov/vocabulary/relators/sng" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dte" },
      { "@id": "http://id.loc.gov/vocabulary/relators/str" },
      { "@id": "http://id.loc.gov/vocabulary/relators/wal" },
      { "@id": "http://id.loc.gov/vocabulary/relators/drm" },
      { "@id": "http://id.loc.gov/vocabulary/relators/mfp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/prv" },
      { "@id": "http://id.loc.gov/vocabulary/relators/res" },
      { "@id": "http://id.loc.gov/vocabulary/relators/pnc" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cnd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/sgd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/pfr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/std" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ive" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cph" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ths" },
      { "@id": "http://id.loc.gov/vocabulary/relators/pre" },
      { "@id": "http://id.loc.gov/vocabulary/relators/com" },
      { "@id": "http://id.loc.gov/vocabulary/relators/edd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/anl" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cou" },
      { "@id": "http://id.loc.gov/vocabulary/relators/red" },
      { "@id": "http://id.loc.gov/vocabulary/relators/wac" },
      { "@id": "http://id.loc.gov/vocabulary/relators/wft" },
      { "@id": "http://id.loc.gov/vocabulary/relators/egr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/wit" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dnr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dfd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/rth" },
      { "@id": "http://id.loc.gov/vocabulary/relators/fmd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/voc" },
      { "@id": "http://id.loc.gov/vocabulary/relators/rbr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/sfx" },
      { "@id": "http://id.loc.gov/vocabulary/relators/frg" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dln" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ard" },
      { "@id": "http://id.loc.gov/vocabulary/relators/aui" },
      { "@id": "http://id.loc.gov/vocabulary/relators/gis" },
      { "@id": "http://id.loc.gov/vocabulary/relators/rst" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dgc" },
      { "@id": "http://id.loc.gov/vocabulary/relators/con" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dgg" },
      { "@id": "http://id.loc.gov/vocabulary/relators/rcd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/bkp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/bdd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/vdg" },
      { "@id": "http://id.loc.gov/vocabulary/relators/msd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/own" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ins" },
      { "@id": "http://id.loc.gov/vocabulary/relators/rpt" },
      { "@id": "http://id.loc.gov/vocabulary/relators/scl" },
      { "@id": "http://id.loc.gov/vocabulary/relators/let" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cot" },
      { "@id": "http://id.loc.gov/vocabulary/relators/wts" },
      { "@id": "http://id.loc.gov/vocabulary/relators/bkd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cad" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dst" },
      { "@id": "http://id.loc.gov/vocabulary/relators/elt" },
      { "@id": "http://id.loc.gov/vocabulary/relators/lel" },
      { "@id": "http://id.loc.gov/vocabulary/relators/prn" },
      { "@id": "http://id.loc.gov/vocabulary/relators/lso" },
      { "@id": "http://id.loc.gov/vocabulary/relators/aus" },
      { "@id": "http://id.loc.gov/vocabulary/relators/apl" },
      { "@id": "http://id.loc.gov/vocabulary/relators/pht" },
      { "@id": "http://id.loc.gov/vocabulary/relators/brl" },
      { "@id": "http://id.loc.gov/vocabulary/relators/rcp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/bnd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ptt" },
      { "@id": "http://id.loc.gov/vocabulary/relators/adp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/lsa" },
      { "@id": "http://id.loc.gov/vocabulary/relators/vfx" },
      { "@id": "http://id.loc.gov/vocabulary/relators/aup" },
      { "@id": "http://id.loc.gov/vocabulary/relators/wam" },
      { "@id": "http://id.loc.gov/vocabulary/relators/pro" },
      { "@id": "http://id.loc.gov/vocabulary/relators/aut" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cmm" },
      { "@id": "http://id.loc.gov/vocabulary/relators/inv" },
      { "@id": "http://id.loc.gov/vocabulary/relators/wdc" },
      { "@id": "http://id.loc.gov/vocabulary/relators/rse" },
      { "@id": "http://id.loc.gov/vocabulary/relators/srv" },
      { "@id": "http://id.loc.gov/vocabulary/relators/prp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/lbr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/mup" },
      { "@id": "http://id.loc.gov/vocabulary/relators/anm" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cor" },
      { "@id": "http://id.loc.gov/vocabulary/relators/prt" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dpc" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dgs" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cpt" },
      { "@id": "http://id.loc.gov/vocabulary/relators/sll" },
      { "@id": "http://id.loc.gov/vocabulary/relators/bsl" },
      { "@id": "http://id.loc.gov/vocabulary/relators/enj" },
      { "@id": "http://id.loc.gov/vocabulary/relators/eng" },
      { "@id": "http://id.loc.gov/vocabulary/relators/mod" },
      { "@id": "http://id.loc.gov/vocabulary/relators/nan" },
      { "@id": "http://id.loc.gov/vocabulary/relators/fon" },
      { "@id": "http://id.loc.gov/vocabulary/relators/stl" },
      { "@id": "http://id.loc.gov/vocabulary/relators/tlh" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cng" },
      { "@id": "http://id.loc.gov/vocabulary/relators/tyd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/fmp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/mxe" },
      { "@id": "http://id.loc.gov/vocabulary/relators/pbl" },
      { "@id": "http://id.loc.gov/vocabulary/relators/tau" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ivr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/csl" },
      { "@id": "http://id.loc.gov/vocabulary/relators/act" },
      { "@id": "http://id.loc.gov/vocabulary/relators/prs" },
      { "@id": "http://id.loc.gov/vocabulary/relators/mdc" },
      { "@id": "http://id.loc.gov/vocabulary/relators/mon" },
      { "@id": "http://id.loc.gov/vocabulary/relators/evp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/uvp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/adi" },
      { "@id": "http://id.loc.gov/vocabulary/relators/pad" },
      { "@id": "http://id.loc.gov/vocabulary/relators/isb" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ltg" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ppt" },
      { "@id": "http://id.loc.gov/vocabulary/relators/stn" },
      { "@id": "http://id.loc.gov/vocabulary/relators/tcd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/csp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/itr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/mte" },
      { "@id": "http://id.loc.gov/vocabulary/relators/vac" },
      { "@id": "http://id.loc.gov/vocabulary/relators/fmo" },
      { "@id": "http://id.loc.gov/vocabulary/relators/hnr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/lyr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cst" },
      { "@id": "http://id.loc.gov/vocabulary/relators/org" },
      { "@id": "http://id.loc.gov/vocabulary/relators/arr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/edm" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cmp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ctb" },
      { "@id": "http://id.loc.gov/vocabulary/relators/crr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/rps" },
      { "@id": "http://id.loc.gov/vocabulary/relators/lee" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dbd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ilu" },
      { "@id": "http://id.loc.gov/vocabulary/relators/sgn" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cwt" },
      { "@id": "http://id.loc.gov/vocabulary/relators/mrk" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ctr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/lbt" },
      { "@id": "http://id.loc.gov/vocabulary/relators/tad" },
      { "@id": "http://id.loc.gov/vocabulary/relators/rce" },
      { "@id": "http://id.loc.gov/vocabulary/relators/rdd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/sht" },
      { "@id": "http://id.loc.gov/vocabulary/relators/stm" },
      { "@id": "http://id.loc.gov/vocabulary/relators/tch" },
      { "@id": "http://id.loc.gov/vocabulary/relators/acp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/rev" },
      { "@id": "http://id.loc.gov/vocabulary/relators/mus" },
      { "@id": "http://id.loc.gov/vocabulary/relators/sec" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dsr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/djo" },
      { "@id": "http://id.loc.gov/vocabulary/relators/spn" },
      { "@id": "http://id.loc.gov/vocabulary/relators/rtm" },
      { "@id": "http://id.loc.gov/vocabulary/relators/tld" },
      { "@id": "http://id.loc.gov/vocabulary/relators/fld" },
      { "@id": "http://id.loc.gov/vocabulary/relators/fpy" },
      { "@id": "http://id.loc.gov/vocabulary/relators/len" },
      { "@id": "http://id.loc.gov/vocabulary/relators/rxa" },
      { "@id": "http://id.loc.gov/vocabulary/relators/stg" },
      { "@id": "http://id.loc.gov/vocabulary/relators/med" },
      { "@id": "http://id.loc.gov/vocabulary/relators/wde" },
      { "@id": "http://id.loc.gov/vocabulary/relators/sde" },
      { "@id": "http://id.loc.gov/vocabulary/relators/win" },
      { "@id": "http://id.loc.gov/vocabulary/relators/lit" },
      { "@id": "http://id.loc.gov/vocabulary/relators/onp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/chr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/etr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/pth" },
      { "@id": "http://id.loc.gov/vocabulary/relators/blw" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cas" },
      { "@id": "http://id.loc.gov/vocabulary/relators/pup" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ppm" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dtc" },
      { "@id": "http://id.loc.gov/vocabulary/relators/rsp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/anc" },
      { "@id": "http://id.loc.gov/vocabulary/relators/clr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dpt" },
      { "@id": "http://id.loc.gov/vocabulary/relators/coe" },
      { "@id": "http://id.loc.gov/vocabulary/relators/osp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/sds" },
      { "@id": "http://id.loc.gov/vocabulary/relators/wfs" },
      { "@id": "http://id.loc.gov/vocabulary/relators/bjd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/led" },
      { "@id": "http://id.loc.gov/vocabulary/relators/tlg" },
      { "@id": "http://id.loc.gov/vocabulary/relators/bpd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/mcp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/trc" },
      { "@id": "http://id.loc.gov/vocabulary/relators/aue" },
      { "@id": "http://id.loc.gov/vocabulary/relators/arc" },
      { "@id": "http://id.loc.gov/vocabulary/relators/crt" },
      { "@id": "http://id.loc.gov/vocabulary/relators/his" },
      { "@id": "http://id.loc.gov/vocabulary/relators/lgd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/prm" },
      { "@id": "http://id.loc.gov/vocabulary/relators/mrb" },
      { "@id": "http://id.loc.gov/vocabulary/relators/abr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/rpy" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cos" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cte" },
      { "@id": "http://id.loc.gov/vocabulary/relators/sce" },
      { "@id": "http://id.loc.gov/vocabulary/relators/col" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ltr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/brd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/jud" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dft" },
      { "@id": "http://id.loc.gov/vocabulary/relators/rap" },
      { "@id": "http://id.loc.gov/vocabulary/relators/pdr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/aft" },
      { "@id": "http://id.loc.gov/vocabulary/relators/fac" },
      { "@id": "http://id.loc.gov/vocabulary/relators/fnd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ctt" },
      { "@id": "http://id.loc.gov/vocabulary/relators/aud" },
      { "@id": "http://id.loc.gov/vocabulary/relators/tyg" },
      { "@id": "http://id.loc.gov/vocabulary/relators/plt" },
      { "@id": "http://id.loc.gov/vocabulary/relators/scr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ink" },
      { "@id": "http://id.loc.gov/vocabulary/relators/pan" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cpe" },
      { "@id": "http://id.loc.gov/vocabulary/relators/jug" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dub" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cli" },
      { "@id": "http://id.loc.gov/vocabulary/relators/bka" },
      { "@id": "http://id.loc.gov/vocabulary/relators/art" },
      { "@id": "http://id.loc.gov/vocabulary/relators/exp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/gdv" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cpc" },
      { "@id": "http://id.loc.gov/vocabulary/relators/lse" },
      { "@id": "http://id.loc.gov/vocabulary/relators/pmn" },
      { "@id": "http://id.loc.gov/vocabulary/relators/pbd" },
      { "@id": "http://id.loc.gov/vocabulary/relators/clt" },
      { "@id": "http://id.loc.gov/vocabulary/relators/pta" },
      { "@id": "http://id.loc.gov/vocabulary/relators/spy" },
      { "@id": "http://id.loc.gov/vocabulary/relators/trl" },
      { "@id": "http://id.loc.gov/vocabulary/relators/spk" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ill" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dto" },
      { "@id": "http://id.loc.gov/vocabulary/relators/aqt" },
      { "@id": "http://id.loc.gov/vocabulary/relators/auc" },
      { "@id": "http://id.loc.gov/vocabulary/relators/pma" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cll" },
      { "@id": "http://id.loc.gov/vocabulary/relators/fmk" },
      { "@id": "http://id.loc.gov/vocabulary/relators/att" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dis" },
      { "@id": "http://id.loc.gov/vocabulary/relators/lil" },
      { "@id": "http://id.loc.gov/vocabulary/relators/pte" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cop" },
      { "@id": "http://id.loc.gov/vocabulary/relators/asg" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cpl" },
      { "@id": "http://id.loc.gov/vocabulary/relators/wpr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ctg" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ldr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/crp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/pop" },
      { "@id": "http://id.loc.gov/vocabulary/relators/edt" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cre" },
      { "@id": "http://id.loc.gov/vocabulary/relators/edc" },
      { "@id": "http://id.loc.gov/vocabulary/relators/prc" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cts" },
      { "@id": "http://id.loc.gov/vocabulary/relators/flm" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cov" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cmt" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ren" },
      { "@id": "http://id.loc.gov/vocabulary/relators/drt" },
      { "@id": "http://id.loc.gov/vocabulary/relators/wst" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ape" },
      { "@id": "http://id.loc.gov/vocabulary/relators/rpc" },
      { "@id": "http://id.loc.gov/vocabulary/relators/rsr" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ann" },
      { "@id": "http://id.loc.gov/vocabulary/relators/orm" },
      { "@id": "http://id.loc.gov/vocabulary/relators/tlp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ant" },
      { "@id": "http://id.loc.gov/vocabulary/relators/cns" },
      { "@id": "http://id.loc.gov/vocabulary/relators/fds" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ato" },
      { "@id": "http://id.loc.gov/vocabulary/relators/prg" },
      { "@id": "http://id.loc.gov/vocabulary/relators/ptf" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dtm" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dbp" },
      { "@id": "http://id.loc.gov/vocabulary/relators/oth" },
      { "@id": "http://id.loc.gov/vocabulary/relators/dfe" },
      { "@id": "http://id.loc.gov/vocabulary/relators/sad" },
      { "@id": "http://id.loc.gov/vocabulary/relators/swd" },
    ],
    "http://www.w3.org/2000/01/rdf-schema#label": [
      { "@language": "en", "@value": "Relators" },
    ],
    "http://www.w3.org/2000/01/rdf-schema#comment": [{ "@value": "" }],
    "http://www.loc.gov/mads/rdf/v1#definitionNote": [
      {
        "@language": "en",
        "@value":
          "Relator terms and their associated codes designate the relationship between an agent and a bibliographic resource.",
      },
    ],
    "http://www.loc.gov/mads/rdf/v1#adminMetadata": [
      { "@id": "_:b1222iddOtlocdOtgovvocabularyrelators" },
    ],
    "http://www.w3.org/2004/02/skos/core#definition": [
      {
        "@language": "en",
        "@value":
          "Relator terms and their associated codes designate the relationship between an agent and a bibliographic resource.",
      },
    ],
    "http://www.w3.org/2004/02/skos/core#changeNote": [
      { "@id": "_:b1237iddOtlocdOtgovvocabularyrelators" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/auc",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "auctioneer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/sgn",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "signer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ctt",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "contestee-appellant" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/pdr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "project director" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cng",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "cinematographer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/jud",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "judge" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/led",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [{ "@value": "lead" }],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/col",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "collector" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/brd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "broadcaster" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/own",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "owner" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dfe",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "defendant-appellee" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/nrt",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "narrator" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cmt",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "compositor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/lit",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "libelant-appellant" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dnc",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "dancer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/etr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "etcher" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/flm",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "film editor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/lbt",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "librettist" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/rpc",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "radio producer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/exp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "expert" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/rce",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "recording engineer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/sht",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "supporting host" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dte",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "dedicatee" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/rbr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "rubricator" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/pra",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "praeses" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cou",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "court governed" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/coe",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "contestant-appellee" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/rpy",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "responsible party" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/aut",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "author" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/mxe",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "mixing engineer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/itr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "instrumentalist" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/msd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "musical director" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dgg",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "degree granting institution" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/spn",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "sponsor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/drt",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "director" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dbp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "distribution place" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/jug",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "jurisdiction governed" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/djo",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [{ "@value": "dj" }],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/csp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "consultant to a project" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/rst",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "respondent-appellant" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/bdd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "binding designer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/rdd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "radio director" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cur",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "curator" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ths",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "thesis advisor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/edd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "editorial director" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/wac",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "writer of added commentary" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/bkd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "book designer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/mup",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "music programmer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/len",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "lender" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cpl",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "complainant" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/sfx",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "special effects provider" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/pad",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "place of address" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/pfr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "proofreader" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/let",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "libelee-appellant" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cwt",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "commentator for written text" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/aft",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "author of afterword, colophon, etc." },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/clr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "colorist" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/spy",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "second party" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dgs",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "degree supervisor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/bnd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "binder" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/lyr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "lyricist" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/aqt",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "author in quotations or text abstracts" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ren",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "renderer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/mrk",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "markup editor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dfd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "defendant" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/prf",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "performer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ato",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "autographer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/his",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "host institution" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/std",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "set designer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/fon",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "founder" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dub",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "dubious author" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/pth",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "patent holder" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/tcd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "technical director" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/inv",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "inventor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/tyg",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "typographer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/asg",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "assignee" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/wat",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "writer of added text" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cop",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "camera operator" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/aus",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "screenwriter" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cmm",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "commentator" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ard",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "artistic director" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/bsl",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "bookseller" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/edt",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "editor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/bkp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "book producer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/vdg",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "videographer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cll",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "calligrapher" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ptt",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "plaintiff-appellant" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/wdc",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "woodcutter" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/rtm",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "research team member" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ctg",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "cartographer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/eng",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "engineer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/mka",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "makeup artist" },
    ],
  },
  {
    "@id": "_:b1237iddOtlocdOtgovvocabularyrelators",
    "@type": ["http://purl.org/vocab/changeset/schema#ChangeSet"],
    "http://purl.org/vocab/changeset/schema#subjectOfChange": [
      { "@id": "http://id.loc.gov/vocabulary/relators" },
    ],
    "http://purl.org/vocab/changeset/schema#creatorName": [
      { "@id": "https://id.loc.gov/vocabulary/organizations/dlc" },
    ],
    "http://purl.org/vocab/changeset/schema#createdDate": [
      {
        "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
        "@value": "2021-08-02T00:00:00",
      },
    ],
    "http://purl.org/vocab/changeset/schema#changeReason": [
      { "@type": "http://www.w3.org/2001/XMLSchema#string", "@value": "new" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/res",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "researcher" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ctr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "contractor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cad",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "casting director" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cov",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "cover designer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/frg",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "forger" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/trc",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "transcriber" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cpe",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "complainant-appellee" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ink",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "inker" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/tlg",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "television guest" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/pop",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "printer of plates" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dbd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "dubbing director" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/pnc",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "penciler" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/rps",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "repository" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/lso",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "licensor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/fds",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "film distributor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/red",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "redaktor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dgc",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "degree committee member" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ppt",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "puppeteer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/str",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "stereotyper" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dft",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "defendant-appellant" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/crp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "correspondent" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/isb",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "issuing body" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/rap",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "rapporteur" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/con",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "conservator" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/wst",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "writer of supplementary textual content" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/scr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "scribe" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/acp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "art copyist" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/voc",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "vocalist" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/swd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "software developer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/lbr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "laboratory" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/csl",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "consultant" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/sad",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "scientific advisor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dpt",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "depositor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/sds",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "sound designer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/bjd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "bookjacket designer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/edc",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "editor of compilation" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dpc",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "depicted" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/fac",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "facsimilist" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/scl",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "sculptor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dst",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "distributor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/wft",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "writer of intertitles" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/lie",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "libelant-appellee" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cot",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "contestant-appellant" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/prp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "production place" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/sec",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "secretary" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/fmp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "film producer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/onp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "onscreen participant" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/blw",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "blurb writer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/wts",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "writer of television story" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cas",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "caster" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/prv",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "provider" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/pup",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "publication place" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/lgd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "lighting designer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/oth",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "other" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/plt",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "platemaker" },
    ],
  },
  {
    "@id": "_:b1222iddOtlocdOtgovvocabularyrelators",
    "@type": ["http://id.loc.gov/ontologies/RecordInfo#RecordInfo"],
    "http://id.loc.gov/ontologies/RecordInfo#recordStatus": [
      { "@type": "http://www.w3.org/2001/XMLSchema#string", "@value": "new" },
    ],
    "http://id.loc.gov/ontologies/RecordInfo#recordChangeDate": [
      {
        "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
        "@value": "2021-08-02T00:00:00",
      },
    ],
    "http://id.loc.gov/ontologies/RecordInfo#recordContentSource": [
      { "@id": "https://id.loc.gov/vocabulary/organizations/dlc" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/mrb",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "marbler" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cte",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "contestee-appellee" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/fld",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "field director" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/wfs",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "writer of film story" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/opn",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "opponent" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/anl",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "analyst" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/pma",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "permitting agency" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/rxa",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "remix artist" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/pre",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "presenter" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/pht",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "photographer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/pta",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "patent applicant" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dnr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "donor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/med",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "medium" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/evp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "event place" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/cnd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "conductor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/gdv",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "game developer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/dtm",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "data manager" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ltr",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "letterer" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/ppm",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "papermaker" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/fpy",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "first party" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/rsp",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "respondent" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/nan",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "news anchor" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/crt",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "court reporter" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/prd",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "production personnel" },
    ],
  },
  {
    "@id": "http://id.loc.gov/vocabulary/relators/fmk",
    "@type": ["http://www.loc.gov/mads/rdf/v1#Authority"],
    "http://www.loc.gov/mads/rdf/v1#authoritativeLabel": [
      { "@value": "filmmaker" },
    ],
  },
];
export const getRelatorsLabelFromIdentifier = (id) =>
  relators.find(
    (obj) => obj["@id"] === `http://id.loc.gov/vocabulary/relators/${id}`
  )?.["http://www.loc.gov/mads/rdf/v1#authoritativeLabel"]?.[0]?.["@value"];
