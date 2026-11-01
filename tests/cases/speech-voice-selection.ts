import { englishSpeechText, selectSpeechVoice } from "../../src/domain/speech/voice";
import { c2Questions } from "../../src/content/questions/c2";
import { assert } from "../support/assertions";

console.log("\nSpeech voice selection:");
const voices = [
  { identifier: "tr-high", language: "tr-TR", quality: "Enhanced" },
  { identifier: "us-default", language: "en-US", quality: "Default" },
  { identifier: "gb-high", language: "en-GB", quality: "Enhanced" },
  { identifier: "us-high", language: "en-US", quality: "Enhanced" },
];
assert(selectSpeechVoice(voices, "en-US") === "us-high", "Enhanced US voice is preferred for English");
assert(selectSpeechVoice(voices.slice(0, 3), "en-US") === "us-default", "US default is preferred over a different accent");
assert(selectSpeechVoice([voices[0]], "en-US") === undefined, "A Turkish voice is never chosen for English");
assert(selectSpeechVoice([], "en-US") === undefined, "Missing voices fall back to the system");
assert(englishSpeechText("articulate", "/ɑːrˈtɪkjʊlət/") === "articulate", "IPA notation is not passed to speech");
assert(englishSpeechText("water", "water") === "water", "Plain speech text remains available");
assert(c2Questions.every((question) => question.pronunciation === question.word), "C2 speech uses words rather than IPA");
