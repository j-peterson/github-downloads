# GitHub 'Release-Assets' Download Tracker

*A group of scripts for collecting daily download statistics for release assets from the GitHub API.*

###Rationale
We switched to GitHub and weren't satisfied with the temporal resolution of the 'release assets' download counters. The API and UI seem to only provide a gross total of downloads per file while we would prefer daily download numbers. To remedy this situation, there is a simple node.js script which is run daily with crontab to collect data and a to-be-written number crunching app.

This repo has two sub directories: `/github-downloads-collector` and a to-be-written number crunching app.
- **`/github-downloads-collector`** - a simple node script to query the GitHub API and record all download numbers to a local Mongo database. The script is invoked with a cron job at midnight local time.
- **`/TBD-analytics-app`** - serve the mongo data to client.

###Getting Started - `/github-downloads-collector`

Install with:
```bash
git clone https://github.com/j-peterson/github-downloads.git
cd github-downloads/github-downloads-collector/
npm install
```

The node.js script `downloads-collector.js` does the work. I run it with a midnight cron job to collect daily downloads data:

```bash
0 0 * * * node /path-to-repo/github-downloads/github-downloads-collector/downloads-collector.js -u github_username -r github_repo -a http_api_user_agent >> /path-to-repo/github-downloads/github-downloads-collector/cron.log 2>&1
```

You can place the repo and log where ever you like. I use my home directory for convenience. Be sure to have your permissions in order for crontab to successfully access the node script.

`downloads-collector.js` options:
* `-u user-name` or `--user=user-name` - GitHub user name or organization name that owns the repository you would like to track asset downloads of.
* `-r repo-name` or `--repo=repo-name` - GitHub repository that has releases with assets you would like to track the download counts of.
* `-a api-user-agent` or `--user_agent=api-user-agent` - The GitHub API has a required header of "user_agent". Please specify a name to use in this field.
* `-v` or `--verbose` - Very loud mode. Extra goodies will show up in your standard output and/or cron.log.

###`/TBD-analytics-app`

TBD
