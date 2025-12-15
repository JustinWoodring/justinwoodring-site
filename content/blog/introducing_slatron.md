+++
title = "Building Slatron: The Digital TV Scheduling and Automation System"
description = "From Failed Prototype to Robust Distribution. "
date = 2025-12-14
+++

I've been working on **Slatron**, a robust, distributed digital signage and TV scheduling system written in Rust. But this isn't my first attempt at solving this problem.

## The Ghost of Projects Past
Years ago, I tried to build a system like this. Back then, I dove straight into coding without much upfront design. I was a weaker programmer at the time, and the result reflected that.

My "solution" was basically a single-page React application backed by a SQLite database. But here's the kicker: I had a completely separate Python script querying that same database to try and manage state. Since SQLite only allows one writer at a time, I constantly ran into database lock errors and race conditions. It was a mess. It fell apart as soon as I needed anything complex.

## Doing It Right with Rust
With Slatron, I wanted to correct those mistakes. This failed project, took on several more partially finished iterations that never made it to even a hobby level of deployment,
but during this time I was architecting what I ideally wanted to acheive. I designed it from the ground up to be a distributed system. I chose **Rust** for its reliability and
performance and because I love it. Importantly, I divided the architecture into three distinct components:
- **slatron-server**: The central brain (Axum/SQLite) that manages the library, schedules, and nodes.
- **slatron-node**: The resilient player (Rust) that sits on the edge devices, caching content and controlling playback via MPV.
- **slatron-ui**: The modern dashboard (React) for management.

This time, I also focused heavily on the "Day 2" problems: deployment, cross-compilation, and user experience.

## 1. Cross-Compilation is Hard (Until it isn't)

One of my goals was to automatically generate nightly binaries for:
- **Linux x86_64** (Standard servers)
- **Linux aarch64** (Raspberry Pis, ARM servers)
- **macOS Apple Silicon** (Local dev/testing)

### The C-Dependency Headache
Rust makes cross-compilation relatively easy, but as soon as you introduce C dependencies, things get tricky. Slatron relies on:
- **SQLite** (via `diesel`)
- **OpenSSL** (via `reqwest`)

When checking out cross-compilation guides, you'll often see complex Docker setups or instructions to install multi-arch system libraries (`apt-get install libssl-dev:arm64`). While effective, this clutters your CI/CD pipeline.

### The Solution: Vendor Everything
The easiest path forward was to lean on the `vendored` and `bundled` features provided by many Rust crates.

In `Cargo.toml`, I enabled static linking for both critical dependencies:

```toml
[dependencies]
# Statically link OpenSSL
openssl = { version = "0.10", features = ["vendored"] }
# Statically link SQLite
libsqlite3-sys = { version = "0.26", features = ["bundled"] }
# Tell reqwest to use the vendored TLS
reqwest = { version = "0.12", features = ["json", "native-tls-vendored"] }
```

With this configuration, `cargo build --target aarch64-unknown-linux-gnu` just works. No need to install system libraries on the runner or configure `PKG_CONFIG` paths manually. The compiler builds OpenSSL and SQLite from source and links them statically into the final binary.

## 2. GitHub Actions Matrix
With static linking in place, setting up GitHub Actions was straightforward. I used a matrix strategy to handle the different OS and Target combinations.

```yaml
strategy:
  matrix:
    include:
      - target: x86_64-unknown-linux-gnu
        os: ubuntu-latest
      - target: aarch64-unknown-linux-gnu
        os: ubuntu-latest
      # Cross-compiling for macOS isn't really a thing, 
      # so we just use a macos-latest runner!
      - target: aarch64-apple-darwin
        os: macos-latest
```

## 3. Embedding the Frontend
To simplify deployment, I wanted a single binary that includes the UI. Ultimately, a common software problem, is how do I hand someone a single executable file and it's enough for them to use. But this felt like an ingenious solution.
I used a `build.rs` script and a feature flag:

```toml
[features]
embed-ui = []
```

When building with `--features embed-ui`, the build script runs `npm run build` in the UI directory, zips the result, and embeds it into the server binary.

The server then checks for this embedded asset at runtime. If present, it serves the UI directly from memory. If not, it looks for a local `./static` folder. This gives me the best of both worlds: a single portable binary for users, and hot-reloading for development.

## 4. The Vision: Programmable Digital Signage with Rhai

One of the limitations of my previous attempt—and many commercial solutions—is that they are just dumb playlist players. You upload a video, you schedule it, it plays.

With Slatron, I wanted the nodes to be **smart**. I didn't just want a player; I wanted a programmable runtime.

I chose [Rhai](https://rhai.rs) for this because it integrates seamlessly with Rust, is memory-safe, and allows me to expose a controlled API to the user. This turns Slatron into a platform where behavior is defined by code, not just configuration.

### Beyond Static Playlists
The scripting engine allows for logic that dynamic playlists simply can't handle.
- **Context Awareness**: A `transform` hook can check the local weather via an API call and swap out a generic "Coffee" ad for an "Iced Coffee" ad if it's over 80°F.
- **System Integration**: Scripts can trigger external hardware (like DMX lighting or relays) via `shell_execute` when specific content starts playing, creating immersive 4D experiences.
- **Dynamic Overlays**: Instead of baking subtitles or graphics into the video file, `on_load` scripts can generate real-time overlays—news tickers, stock prices, or "Now Playing" metadata.

```rust
// Example: Station Bug Script
fn on_load(settings) {
    // Check if we are playing a commercial
    if settings.get("content_type") != "commercial" {
        // Overlay the station logo in the top-right corner
        mpv_overlay("logo.png", 1800, 50, 0.8);
    }
}
```

This flexibility ensures Slatron can evolve to meet requirements I haven't even thought of yet, all without recompiling the core binary.

## 5. Interactive CLI Onboarding
Finally, I wanted to improve the "Day 0" experience. Running a server application usually involves hunting down a sample config key, copying it, and editing values.

I implemented an interactive onboarding wizard directly in the binaries using `dialoguer`.

```rust
// In main.rs
if config_missing && console::user_attended() {
    let host = Input::new().with_prompt("Server Host").interact()?;
    // ... prompt for other values ...
    generate_config_file(host, ...);
}
```

Now, if a user runs `slatron-server` (or `slatron-node`) without a config file, it kindly asks them for the necessary details and generates the TOML file `server-config.toml` or `node-config.toml` for them.

## Conclusion
Rust's tooling continues to impress me. By combining feature flags, build scripts, and the `vendored` crate ecosystem, I was able to build a cross-platform, self-contained distributed application pipeline that is robust and easy to maintain.

Check out the code on GitHub: [JustinWoodring/slatron](https://github.com/JustinWoodring/slatron)

Or watch this video to set up slatron for yourself with prebuilt binaries: [Getting Started with Slatron on Mac](https://youtu.be/alMnX4MNhcI)
