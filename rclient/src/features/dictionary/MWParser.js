export const buildAudioUrl = (
  sound,
  format = "mp3",
  lang = "en",
  country = "us"
) => {
  if (!sound?.audio) {
    return null;
  }
  const audio = sound.audio;
  let subdir;
  if (audio.startsWith("bix")) {
    subdir = "bix";
  } else if (audio.startsWith("gg")) {
    subdir = "gg";
  } else if (/^[0-9_]/.test(audio)) {
    subdir = "number";
  } else {
    subdir = audio[0];
  }
  return `https://media.merriam-webster.com/audio/prons/${lang}/${country}/${format}/${subdir}/${audio}.${format}`;
};

export const getDataFromMWEntry = (entry) => {
  const dataMap = {
    id: entry?.meta?.id,
    term: entry?.meta?.id?.includes(":")
      ? entry?.meta?.id?.substring(0, entry?.meta?.id?.indexOf(":"))
      : entry?.meta?.id,
    idNum: entry?.meta?.id?.includes(":")
      ? entry?.meta?.id?.substring(entry?.meta?.id?.indexOf(":"))
      : null,
    offensive: entry?.meta?.offensive,
    pronunciation: entry?.hwi?.prs?.[0]?.mw,
    audio: buildAudioUrl(
      entry?.hwi?.prs?.find((pr) => pr.hasOwnProperty("sound"))?.sound
    ),
    functionalLabel: entry?.fl,
    shortDefinitions: entry?.shortdef,
    date: entry?.date,
    dateFormatted: entry?.date?.includes("{")
      ? entry?.date?.substring(0, entry.date.indexOf("{"))
      : entry?.date,
  };
  dataMap.shortDefinitions ??= [];
  return dataMap;
};
