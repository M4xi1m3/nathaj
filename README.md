<img src="doc/nathaj.svg" width=300 />

Näthaj (pronounced /nɛːthajː/) is a web-based network simulator written in TypeScript using the React library.

## Structure of the project

Näthaj is managed as a monorepo using yarn workspaces, having the simulation core and the react frontend separated from each other :

```
<root>
 |- packages
 |  |- simulator            Näthaj's simulation code
 |  |  |- src               Sources
 |  |  |- package.json
 |  |- frontend             Näthaj's react frontend
 |  |  |- src               Sources
 |  |  |- package.json
 |- package.json            Project's package.json
```

## Building, running, testing

You can start the project in development mode with

```
yarn start
```

This allows you to make changes and have them applied in real time in the browser without the need to rebuild or refresh manually.

To build the project, one should run

```
yarn build
```

The simulation core's unit tests can be run with

```
yarn test
```

## License and copyright

Copyright (C) 2023 Maxime FRIESS <M4x1me@pm.me>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
