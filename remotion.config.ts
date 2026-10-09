import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(false); // never replace an existing file (scripts/render.mjs picks a new name)
Config.setCodec("h264");
Config.setAudioCodec("aac");
