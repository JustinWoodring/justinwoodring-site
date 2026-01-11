+++
title = "This Week in Slatron v1.1: The Ghost in the Machine"
description = "Putting a voice inside the box with local ONNX decoding and AI personalities."
date = 2026-01-11
+++

In my [last post](/building-slatron), I talked about how I built Slatron to be the robust, distributed system I always wanted. It was stable. It was efficient. It played video files perfectly.
But it was also... dead.
A perfect playlist is boring. The magic of radio or live TV isn't just the content; it's the *glue* between the content. It's the DJ introducing a track, the news update that breaks in, or the station ID that reminds you where you are.
So for the v1.1 update, I decided to stop building a video player and start building a broadcaster. I wanted to put a ghost in the machine.

## Enter the AI DJ
Static video files are easy. You just hand a path to MPV and wait. But creating a dynamic host requires intelligence.
I've introduced a first-class **AI DJ System** into Slatron. You can now create "Personalities"—defining their vibe, their backstory, and their voice—and assign them to schedule blocks.

### The Technical Feat: Local ONNX Decoding
We support Google Gemini for cloud TTS, but the real technical achievement this week is **Orpheus**.
I wanted Slatron to support high-quality AI voices *without* an internet connection or an API subscription. We achieved this by integrating with [Orpheus](https://huggingface.co/isaiahbjork/orpheus-3b-0.1-ft-Q4_K_M-GGUF), a local text-to-speech system.
Slatron communicates with a local LLM (running in LM Studio) to receive audio tokens. But here's the kicker: the audio *decoding* happens natively inside Slatron.
I implemented the **SNAC (Multi-Scale Neural Audio Codec)** decoder directly in Rust using [ort] (ONNX Runtime). When you enable the `ml-support` feature flag, Slatron takes the raw token stream from the LLM and synthesizes the audio waveform locally on the CPU. It’s a complex pipeline of tensor operations running right inside the server binary, keeping everything offline and zero-cost.

## The Context
The real power isn't just generating text; it's generating *relevant* text. I extended the **Rhai** scripting engine to support "Context Injectors".
Before the DJ speaks, the server runs a user-defined script. This script can:
*   Fetch the local weather.
*   Check the current server load.
*   Pull a headline from an RSS feed.
It returns a string, which is injected into the LLM's system prompt. So instead of a generic "Coming up next," the DJ says, *"It's pouring rain outside in Chicago right now, so here's some lo-fi jazz to stay cozy."*

## Polish: The Art of "Ducking"
Adding a voice revealed a new problem: silence. If the DJ talks *over* the music, it's messy. If they talk during silence, it's awkward.
I implemented **audio ducking** directly in the node's control loop. When an `InjectAudio` command arrives:
1.  The node reads the current volume.
2.  It smoothly ramps the volume down (ducking) to a background level.
3.  The DJ audio plays on a secondary audio channel.
4.  Once finished, the volume swells back up to its original level.
It’s a subtle touch, but it’s the difference between "software that plays sound" and "professional broadcast."

## Automation with Content Loaders
Finally, I got tired of manually pasting YouTube URLs. I expanded the scripting engine to support **Content Loaders**.
This allows you to write scripts that fetch content from external sources—like parsing a YouTube playlist or an RSS feed—and presenting the results as a list. You run the loader manually in the dashboard, review the "Found Items," and bulk-import them into your library with one click. It turns the tedious task of library management into a 10-second operation.

## Eyes on the Edge
And just to keep tabs on everything, the dashboard now receives **live screenshots** from every node on the network. Every 60 seconds, the node captures its framebuffer, encodes it to base64, and fires it over the WebSocket. It gives me immediate peace of mind seeing the grid of screens actually *working* in the UI.


Go [check out the release](https://github.com/JustinWoodring/slatron/releases) and build something weird.
