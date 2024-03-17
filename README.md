# FRC 1721 Dashboard
## Running the dashboard for the sim 
- Make sure you have sed installed
- Make sure Robot sim is running
- Make sure npm and pipenv is installed

Make sure you are in the dashboard/ folder.

Install deps

``` sh
make ready
```

Build webpage

``` sh
make build
```

(OPTIONAL) You can build automatically when a file changes in src/ (requires 'entr', `paru -S entr` `paman install entr`)

``` sh
make dev
```

Run webpage

``` sh
make run
```

`make run` can be left running when you run `make build`, and doesn't need to be run again to update the webpage

## Running on the robot

Generate the execute files
```sh
make stage
```

Start the dashboard
```sh
cd dist
chmod +x ./entrypoint.sh
pipenv run ./entrypoint.sh
```

(OPTIONAL) You can build automatically when a file changes in src/ (requires 'entr', `paru -S entr` `paman install entr`)

```sh
make dev
```

You can leave `entrypoint.sh` running while `make dev` is running
