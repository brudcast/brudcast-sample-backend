# Brudcast sample backend

The server half of a Brudcast mobile integration, for the sample apps of the
[iOS](https://github.com/brudcast/brudcast-sdk-ios) and
[Android](https://github.com/brudcast/brudcast-sdk-android) SDKs. A small TypeScript app on
[Express](https://expressjs.com), with request bodies validated by [Joi](https://joi.dev) and calls
to Brudcast made with [axios](https://axios-http.com).

- [Brudcast sample backend](#brudcast-sample-backend)
  - [What it does](#what-it-does)
  - [How it works](#how-it-works)
  - [Quick start](#quick-start)
  - [Configuration](#configuration)
  - [API reference](#api-reference)
    - [`POST /login`](#post-login)
    - [`POST /welcome`](#post-welcome)
    - [`GET /health`](#get-health)
    - [Errors](#errors)
  - [Project structure](#project-structure)
  - [Customising the welcome message](#customising-the-welcome-message)
  - [Development](#development)
  - [Before production](#before-production)
  - [License](#license)

## What it does

It does the two things a mobile app must never do itself:

- **Prove who the user is.** After sign-in it returns the user's `userHash`, the
  `HMAC-SHA256(identitySecret, externalId)` that an application enforcing identity verification
  requires with `Brudcast.identify`. The identity secret stays on this server.
- **Call the Brudcast API.** It sends the signed-in user a welcome in-app message with an API key,
  which also never ships in the app.

## How it works

```
           POST /login                     the app calls Brudcast.identify(externalId, userHash)
 App ───────────────────────▶ this backend
     ◀─── externalId, userHash

           POST /welcome                   POST /in-app/messages (API key)
 App ───────────────────────▶ this backend ─────────────────────────────▶ Brudcast
     ◀──────────────── the message arrives in the app over the SDK's live connection
```

1. **Sign-in.** The app sends the user's id to `POST /login`. The backend computes the user hash
   with the identity secret and returns it. The app passes both to `Brudcast.identify`, which links
   the device to the user's contact in Brudcast.
2. **A message for that user.** The app asks `POST /welcome` for a welcome message. The backend
   builds the message and sends it to `POST /in-app/messages` with its API key. Brudcast finds the
   contact by the external id and delivers the message to the app, which shows it at once.

A real product sends messages like this from its own events, such as an account being created or
an order shipping.

## Quick start

You need Node.js 22.18 or later, and a Brudcast organization with the in-app product.

1. In the Brudcast dashboard, or through the API:
   - create an in-app application with identity verification enforced. Copy its id, its publishable
     key (`bpk_...`) and its identity secret (`bis_...`), which is shown only once;
   - create an API key with the `messages:send` scope.
2. Copy `.env.example` to `.env` and fill it in (see [Configuration](#configuration)).
3. Install and start the server:

   ```sh
   npm install
   npm start
   ```

4. Point the sample app at it: `brudcast.sampleBackendUrl` in the Android sample's
   `local.properties`, or `SAMPLE_BACKEND_URL` in the iOS sample's `Config/Local.xcconfig`. The
   publishable key goes in the app; see each SDK's sample README.

Node runs the `.ts` files directly, so there is no build step.

## Configuration

The server reads `.env` at start-up, and refuses to start without the required settings, naming
the ones that are missing.

| Variable                   | Required | Description                                                                                                 |
| -------------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `BRUDCAST_API_URL`         | Yes      | The Brudcast API up to and including `/user`, such as `http://localhost:8086/api/v1/user` for a local stack |
| `BRUDCAST_API_KEY`         | Yes      | An API key with the `messages:send` scope (`bk_live_...`)                                                   |
| `BRUDCAST_APPLICATION_ID`  | Yes      | The in-app application's id                                                                                 |
| `BRUDCAST_IDENTITY_SECRET` | Yes      | The application's identity secret (`bis_...`), whole                                                        |
| `PORT`                     | No       | The port to listen on. Default `4000`                                                                       |
| `HOST`                     | No       | The interface to listen on. Default `0.0.0.0`                                                               |

On `0.0.0.0`, an Android emulator reaches the backend at `http://10.0.2.2:4000` and an iOS
simulator at `http://localhost:4000`. A phone on the same network uses your computer's address.

## API reference

| Method | Path                        | Description                                              |
| ------ | --------------------------- | -------------------------------------------------------- |
| `POST` | [`/login`](#post-login)     | Sign a user in and return what `Brudcast.identify` needs |
| `POST` | [`/welcome`](#post-welcome) | Send the user a welcome in-app message                   |
| `GET`  | [`/health`](#get-health)    | Check the server is up                                   |

Request bodies are JSON, up to 16 KB.

### `POST /login`

```sh
curl -s localhost:4000/login -H 'Content-Type: application/json' \
  -d '{"userId":"ada-lovelace","email":"ada@example.com"}'
```

| Field    | Type   | Rules                                                                                     |
| -------- | ------ | ----------------------------------------------------------------------------------------- |
| `userId` | string | Required. Trimmed, 1 to 191 characters. It becomes the external id.                       |
| `email`  | string | Optional. A valid email address; blank counts as none. Brudcast stores it on the contact. |

**`200`**

```json
{ "externalId": "ada-lovelace", "userHash": "2c7f45f0…", "email": "ada@example.com" }
```

This endpoint stands in for your real sign-in and trusts the user id it is given. See
[Before production](#before-production).

### `POST /welcome`

```sh
curl -s localhost:4000/welcome -H 'Content-Type: application/json' -d '{"externalId":"ada-lovelace"}'
```

| Field        | Type   | Rules                                   |
| ------------ | ------ | --------------------------------------- |
| `externalId` | string | Required. Trimmed, 1 to 191 characters. |

**`202`**, once Brudcast accepted the message. `brudcast` is the `data` of Brudcast's response.

```json
{ "message": "Welcome message sent", "brudcast": { "...": "..." } }
```

The user must have signed in through the SDK first. Calling `/login` alone is not enough, because
it is `Brudcast.identify` in the app that creates the contact. For a user who never has, Brudcast
answers `Contact not found` and this endpoint returns a `502`.

### `GET /health`

**`200`**

```json
{ "status": "ok" }
```

### Errors

Every error is JSON with a `message`.

| Status | When                                                               |
| ------ | ------------------------------------------------------------------ |
| `400`  | The body is not JSON                                               |
| `404`  | No such endpoint                                                   |
| `413`  | The body is over 16 KB                                             |
| `422`  | The body fails validation; `errors` names each problem             |
| `502`  | Brudcast refused the request; `brudcast` holds Brudcast's response |
| `500`  | Anything else; the details go to the server log                    |

```json
{
  "message": "The request body is invalid",
  "errors": [{ "field": "email", "message": "\"email\" must be a valid email" }]
}
```

## Project structure

```
src/
├── server.ts                      Starts the server
├── app.ts                         The Express app: body parsing, routes, 404 and errors
├── types.ts                       What the controllers depend on
├── config/
│   └── env.ts                     The settings, read from the environment
├── routes/
│   └── index.ts                   Every endpoint, with its validator and controller
├── validators/                    Joi schemas for each request body
│   ├── common.ts
│   ├── auth.validator.ts
│   └── messages.validator.ts
├── middleware/
│   ├── validate.ts                Runs a schema and answers 422 when the body fails it
│   └── error-handler.ts           The JSON 404, and errors turned into responses
├── controllers/                   What each endpoint does
│   ├── auth.controller.ts
│   └── messages.controller.ts
├── services/
│   ├── identity.service.ts        The identity hash
│   └── brudcast/
│       ├── client.ts              The Brudcast API client, on axios
│       └── types.ts               The types of an in-app message
└── messages/
    └── welcome.message.ts         The welcome message's design
test/                              The tests, laid out like src/
```

A request goes through `routes`, then `middleware/validate.ts` with the endpoint's schema from
`validators`, then its controller, which calls the `services`. Anything thrown ends in
`middleware/error-handler.ts`.

## Customising the welcome message

`src/messages/welcome.message.ts` builds the message as JSON, in the same format the dashboard's
in-app message builder produces:

- a centred modal the user can close, over a dimmed background;
- the title "Welcome, <user>" and a line of body text;
- a **Get started** button that opens `brudcast-sample://welcome` in the app, and a **Not now**
  button that closes the message;
- a copy in the user's inbox for 30 days.

Change the text, the buttons or the layout there. A button's `id` comes back on its click event,
and its `action` is a `deeplink` into the app, a `url` to open, or `dismiss`. The `InAppDesign`
type in `src/services/brudcast/types.ts` describes every field, so `npm run typecheck` catches a
design Brudcast would refuse.

To send a different message, add a builder next to it in `src/messages/`, a schema in
`src/validators/`, a handler in a controller, and a route in `src/routes/index.ts`.

## Development

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm start`         | Starts the server with the settings in `.env` |
| `npm test`          | Runs the tests with Node's built-in runner    |
| `npm run typecheck` | Checks the types with `tsc`, emitting nothing |

The tests need no Brudcast stack: the endpoints are tested against a stand-in client, and the API
client against a small local server that plays Brudcast.

`typescript` and the `@types` packages are development dependencies, used only to check the types.
Node runs TypeScript by stripping the types, so the code sticks to syntax that can be erased: no
`enum`s, no `namespace`s and no constructor parameter properties. `erasableSyntaxOnly` in
`tsconfig.json` makes `tsc` reject them, and imports name the `.ts` file.

## Before production

The sample keeps to what a Brudcast integration needs. Before running something like it in
production:

- **Authenticate sign-in.** Replace `POST /login` with your real sign-in, and return the hash only
  for the user it authenticated, so an app can never get the hash of someone else.
- **Authenticate every endpoint.** `POST /welcome` sends to whatever external id it is given. Take
  the user from the session instead.
- **Keep the secrets secret.** Load the API key and identity secret from your secret store, serve
  over HTTPS, and never log them.
- **Send from your own events.** Messages usually follow something on your server, such as a
  purchase, rather than a request from the app.

## License

Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
