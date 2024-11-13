# Welcome to Strava API Consumer Project

## How to set up

For starters, install every necessary package to run the project running

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then, add your client_id and client_secret to .env file as shown in .env.example.

Now you are ready to start the development server:

```bash
npm run start
# or
yarn start
# or
pnpm start
# or
bun start
```

## Development Information

### Assumptions

1. The user consistently grants `read_all` permission when prompted by Strava authentication.
2. The user has at least one activity record within the past three months.

### Key Decisions

1. Due to limitations in the API endpoint for retrieving user activity data, the `after` parameter does not work as expected. As a result, I chose to retrieve activity data in bulk and filter out unnecessary information afterward. This approach circumvents the restriction of using `before`, `after`, and `per_page` parameters simultaneously, which would otherwise increase the number of requests and associated costs.

### Potential Improvements with More Time

1. **Enhanced UI/UX**: As UI/UX is not my primary focus, the current interface lacks polish. Normally, I would work from a Figma design or similar tool to create a more visually appealing interface.
2. **Improved Error Handling**: Error handling is currently basic. With additional time, I would implement custom error objects with detailed structures to improve reusability and robustness.
