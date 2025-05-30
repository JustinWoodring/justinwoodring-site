+++
title = "In Praise of Shuttle: Oxidizing the Capibara Web API"
description = "An essay on the modernizing state of the Rust web development experience."
date = 2025-05-30
+++

For those of you following obscure languages you may be aware that Scala 2 has somewhat died as Scala 3 has finally been released and mostly stabilized. So what that means for me is, my web api stack for the Capibara project is officially on LTS life support. Realistically speaking, it's not a great place to be for hobby side projects let alone large corporate infrastructure. This predicament led me back to Rust—and allow me to clarify that I was an early band wagoner for Rust. Probably about a year before Rust exploded in popularity I was definitely one of those people going "Rust! Have your heard about it? Let's use Rust! etc."

# What is Capibara?

For those of you who are unfamiliar with the Capibara project which I'm going to assume is the majority here, "Capibara is crowd-sourced C library documentation and plugins for your favorite editors like VS Code, Vim, etc." at least that's the tagline I've been running with for a while. If we break it down there's several core components:

- CAPI
- Capibara Processor  
- API / Web Frontend
- Various IDE / Editor plugins

## CAPI
The CAPI (basically named as such for C as in the language, API) represents the human manageable / readable form of the raw yaml documentation of individual header files and their respective macros, enums, structs, typedefs, and functions organized in a directory structure. This structure makes it easy to: add, edit, or remove definitions while utilizing the power of version control.

## Capibara Processor
The Capibara Processor is effectively an accumulator that ingests the directory structure, validates internal / cross references with other parts of the documentation, and finally exports one definitions file in json (the capibara.json file) that can be utilized by the web api or various plugins to provide local documentation lookup.

## API / Web Frontend
The API / Web Frontend serves as the distribution point for the capibara.json file. Editor extensions are configured by default to access this API to download their own copy of the capibara.json file and cache it locally for use on and offline. Moreover, the API facilitates searching and lookup functions over that same capibara.json file for the web frontend, a SPA written in React. And the SPA is also the landing page that coordinates the efforts and documentation for the project as a whole.

## Various IDE Plugins
Various IDE plugins comprise the last link in the chain of human readable, crowdsourced, documentation that is delivered straight into your editor, or integrations with your MCP servers, or language servers. Currently, the VS code plugin is the flagship plugin with on-hover documentation lookup for C types, macros, and functions, an experience familiar for Rust developers in VS code. That said, plugins have been built for Vim and Emacs as well.

# Rusting the API
So concluding our diversion into what Capibara even is, allow me to share my latest tale of web API exploits in Rust. And yes I have developed APIs in Rust before; the last time I did was about two or three years ago. And yeah, a lot really has changed.

So here's my perspective on some of the biggest things that have changed:

- Async / Await: Tokio is dead; Long live Tokio.
- No more nightly.
- Shuttle.

To me the ecosystem has stabilized immensely. When I last looked at working with web APIs in Rust, everything felt hacky and unstable. Like:
- "Async / Await in the standard library is here but not quite."
- "You need to bet on an async runtime and hope it will be around next year."
- "If you don't use this exact version of this specific library with these features targeting this runtime everything will break."

Nothing about this made me feel as though I could trust anything I was building would still work a year later, nonetheless have actual fixes. And interestingly, at the time Rocket stood almost entirely alone against many other far more complicated or minimalistic frameworks as one that enabled you to actually get things done without building cookies yourself or alternatively having to pull out Actix to build a simple microservice.

What's changed is that the current state of Rust frameworks is really great. I will always love the Rocket framework, guards scratch an itch in my brain, and I genuinely hope it continues to evolve but even if it doesn't, other Rust web development frameworks such as Axum and Loco (an Axum derivative) are really exciting even if somewhat immature still.

## From Scala to Rust: Implementation Details

Scala and Rust share a lot of similarities in terms of overall code structure since both kind of mince an imperative / functional control flow together, which is probably the reason I like them both. Nonetheless, this made my job much easier. And in reality utilizing Rocket to do this was super simple compared to getting it working in Scala the first time.

### API responsibilities
So the API only ever had one Controller, which was responsible for:
- searching definitions
- returning header file listings  
- allowing one to upload a new capibara.json file
- caching the capibara.json file for ease of access
- persisting that file in case the server got restarted
- allowing users to download the file

The API was also responsible for returning the single page application and its respective assets.

### File Persistence
So one of the significant changes between the old API and new API was that I no longer persist the capibara.json file on the hard disk. Instead, because I was using Shuttle I chose to persist the file in a macro enabled PostgreSQL database. This was done via simple blob store table which is reasonable because the file is only 120kb currently and this can be re-engineered in the future if need be.

### Document Access / Caching Semantics
Using Rust lets you think about lower-level cross threading semantics. And FromRequest guard instantiators in Rocket provide a brilliant way to abstract this behavior out of controllers. I genuinely think of this as an improvement over the Scala caching approach. Basically, by wrapping the document in RW lock, assuming that the document is in fact cached, many requests can be served simultaneously without incurring database reads, and assuming that the service is restarted or somehow the cache is cleared the Document request guard logic will attempt to acquire a write lock in order to update the document and then it will refresh the document from the database into the cache and release the lock, enabling other request handler tasks to resume using the document.

You can see this logic is separately contained from the model itself and the controllers here:

*website/capibara-website/src/infrastructure/document.rs*
```rust
#[rocket::async_trait]
impl<'r> FromRequest<'r> for Document {
    type Error = DocumentError;

    async fn from_request(req: &'r Request<'_>) ->
        Outcome<Self, DocumentError> {
        let outcome = req.guard::<&State<CapibaraState>>().await;
        let state = outcome.succeeded().unwrap();

        let mut not_populated = false;
        if let Ok(lock) = state.document.try_read() {
            let value = (*lock).clone();

            if let Some(document) = value {
                return Outcome::Success(document);
            } else {
                not_populated = true;
            }
        }

        if not_populated {
            let query = sqlx::query(r#"
                SELECT title, convert_from(blob_data, 'UTF8')
                as data FROM blob_persist WHERE title = $1;
            "#);

            let result = query
            .bind("capibara_document")
            .fetch_one(&state.pool).await;

            if let Ok(row) = result {
                let data : &str = row.try_get("data").unwrap_or("");
                if let Ok(document) = serde_json::from_str::<Document>(data) {
                    let mut lock = state.document.write().await;
                    *lock = Some(document.clone());

                    return Outcome::Success(document)
                } else {
                    println!("data {}", data);
                }
            } else {
                println!("{:?}", result)
            }
        }

        Outcome::Error((Status::BadRequest, DocumentError::Unresolvable))
    }
}
```

## The Magic of Shuttle
In general, I'm the last person to advertise a vendor lock in, but realistically, the people who built shuttle couldn't have done a better job. As far as integrations go, removing vs adding shuttle into your code is pretty much all in the main.rs file, for my code. It injects secrets, a DB, and even handles mapping ports to a web available URL, it's incredibly unobtrusive while keeping most of the config in the main.rs file. Suffice to say for me it's an incredibly painless hosting experience and the price point is very reasonable, seeing as a basic starter project is still free.

Here is the difference in terms of rocket code, a slightly different version of Rocket in the Cargo.toml file and then this in the main.rs file:

```rust
#[shuttle_runtime::main]
async fn main(
    #[shuttle_runtime::Secrets] secrets: SecretStore,
    #[shuttle_shared_db::Postgres(
        local_uri = "postgres://postgres:password@localhost:5432/postgres
    ")] pool: PgPool
) -> shuttle_rocket::ShuttleRocket {}
```

# Conclusion
In my opinion, the state of rust web api development has matured to a point where the developer experience is really great. The transformation from the hacky, unstable ecosystem I remembered to today's mature platform represents more than technical evolution—it demonstrates what happens when a community commits to stability without sacrificing innovation.

For projects like Capibara, this maturation offers practical benefits beyond convenience. Where I once worried about betting on runtimes that might disappear or dealing with nightly-only features, I now have confidence in building something that will remain maintainable for years to come. The combination of Rust's performance and safety guarantees with increasingly polished frameworks like Rocket, Axum, and platforms like Shuttle creates a compelling foundation for long-term sustainability.

The developer experience has reached a point where choosing Rust for web APIs no longer requires justification based on future potential—the present reality delivers on the promises that early adopters like myself made on faith.

## A Note on Scala
As I was writing this post it occurred to me that perhaps this content might express a lack of desire to continue working with Scala, dismay with the state of the community, perhaps even an attempt to siphon off it's very productive and happy community. And I wanted to counter that with vehement "No." My intention with this article was to express my satisfaction with the current state of Rust web development, a far cry from a few years ago. As a programming language, Scala is one of my favorites right alongside Rust and PHP. Although some of these languages are popular and some get in my opinion undue amounts of hate, I'd encourage anyone who enjoys using Rust to check out Scala—especially if you find yourself looking for similar expressiveness but bound to the JVM.

Furthermore, as I expand Capibara offerings I recognize that people might want different self-hosted APIs and this might offer a reason to maintain the Scala codebase by rewriting the code in Play Framework for Scala 3, as it offers a JVM based private hosting solution as opposed to a native one.

## Connecting with Capibara 

Finally, if you're interested in Capibara or want to learn more about please connect with me and others in the Capibara discord server or over issues and PRs in the repositories. And of course, please star the repositories to show some love!

### Project Discord and Repositories
- Github Organization: https://github.com/Capibara-Tools
- Capibara Discord: https://discord.gg/XwNUMMY4b2


