# BBDash
BBDash is an app that aims to aggregate commonly accessed data from Blackboard into a customizable dashboard.

## Developing

### Prerequisites
Building BBDash requires [NodeJS](https://nodejs.org/en/download/) v14 or later, and [yarn v2](https://yarnpkg.com/)

### Setup
1. Clone the repo using `git clone git@gitlab.cci.drexel.edu:fds21/70bblopposition/bbdash.git`

2. In the base directory, execute `yarn` to install all dependencies for the project. We use [Yarn Workspaces](https://yarnpkg.com/features/workspaces) for managing our packages.

### Building
Once your environment is set up, you're ready to build.

All plain-TypeScript projects can be built in one go thanks to TS references. You can run `yarn ts:build` for a one-off build or `yarn ts:watch` for incremental builds.

To build the Chromium extension, run `yarn crx:build` or `yarn crx:watch` for incremental compilation.