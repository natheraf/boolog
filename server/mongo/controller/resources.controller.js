const {
  searchGoogleBooks,
  fetchGoogleFonts,
} = require("../../externalAPI/google/googleAPI");
const { getDatabase } = require("../database");
const { sampleEpubPath } = require("../config/resources.config");
const { lookupMWDictionary } = require("../../externalAPI/dictionaryAPI");
const { default: OpenAI } = require("openai");

const getGoogleFonts = () =>
  new Promise((resolve, reject) => {
    getDatabase("server").then((db) => {
      db.collection("resources")
        .findOne({ key: "googleFonts" })
        .then((res) => {
          if (res === null) {
            fetchGoogleFonts().then((value) =>
              db
                .collection("resources")
                .insertOne({ key: "googleFonts", value })
                .then(resolve(value))
            );
          } else {
            resolve(res.value);
          }
        });
    });
  });

exports.get = (req, res) => {
  const key = req.query.key;
  if (key === "googleFonts") {
    getGoogleFonts().then((fonts) => res.status(200).send({ fonts }));
  } else if (key === "googleBooks") {
    const query = req.query.query;
    const pageLimit = req.query.pageLimit;
    const page = req.query.page;
    searchGoogleBooks(query, pageLimit, page).then((searchResults) =>
      res.status(200).send({ searchResults })
    );
  } else if (key === "sampleEpub") {
    const fs = require("fs");
    const readStream = fs.createReadStream(sampleEpubPath);
    res.writeHead(200, {
      "Content-Type": "application/epub+zip",
    });
    readStream.pipe(res);
  } else if (key === "mwDictionary") {
    const query = req.query.query;
    lookupMWDictionary(query).then((lookupResult) =>
      res.status(200).send({ lookupResult })
    );
  } else if (key === "mwThesaurus") {
    const query = req.query.query;
    lookupMWThesaurus(query).then((lookupResult) =>
      res.status(200).send({ lookupResult })
    );
  } else {
    res.status(500).send({ message: "no key found" });
  }
};

exports.gemma4 = async (req, res) => {
  const { messages } = req.body;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const client = new OpenAI({
    baseURL: process.env.LLAMA_HOST,
    apiKey: "dummy",
  });

  const promptStart = Date.now();
  const stream = await client.chat.completions.create({
    model: "gemma-4",
    messages,
    stream: true,
    stream_options: { include_usage: true },
  });
  const promptMs = Date.now() - promptStart;

  const genStart = Date.now();
  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content;
    if (token) {
      res.write(`data: ${JSON.stringify({ token })}\n\n`);
    }
    if (chunk.usage) {
      res.write(
        `data: ${JSON.stringify({
          usage: { ...chunk.usage, genMs: Date.now() - genStart, promptMs },
        })}\n\n`
      );
    }
  }

  res.write("data: [DONE]\n\n");
  res.end();
};
