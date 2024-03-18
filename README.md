# Anime Stream Api

An API built with NestJS designed towards scraping anime streams. Its scrapes data from anime providers by using an unique interface. This API can scrape some anime information, but it is mainly dedicated to extracting video sources.

## Running the App

Rename file `.env.example` to `.env` and change `PORT` to whatever port you want to use.

Then run

```
pnpm install
pnpm start:dev
```

## Usage

The API supports the following providers:

- 9Anime
- Gogoanime
- Anicrush
- ...and more to come

To use a specific provider, go to their routes, e.g `/9anime`

If the provider is not specified in the route, the API will redirect the request to the matching provider, based on the `url` query param.

For example, going to `/` or `/filter` is the same as going to `/9anime` or `/9anime/filter`, respectively.

But if the url is `/episodes?url=https%3A%2F%2Fanitaku.to%2Fone-piece-episode-1`, then the route will be prefixed with `/gogoanime` and redirected.

### Routes

The following routes can be prefixed with `/${providerName}` to specify the provider used, otherwise the rules listed above will apply.

- `/` - Gets anime from homepage
- `/genres` - Gets all genres listed by the provider
- `/genres/:genre` - Gets anime by specified genre
- `/scrape?url=<url>` - Scrapes anime from url specified
- `/episodes?url=<animeUrl>` - Scrapes episodes from specified anime url
- `/servers?url=<episodeUrl>` - Scrapes servers available to watch an episode

To extract the sources from the player urls returned by `/servers`, pass the player url to `/sources?url=${playerUrl}` without any prefixes.
