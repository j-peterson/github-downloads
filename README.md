# GitHub 'Release-Assets' Download Count Tracker

*A script for collecting daily statistics for release assets from the GitHub API.*

###Rationale
We switched to GitHub and weren't satisfied with the temporal resolution of the 'release assets' download counters. The API and UI seem to only provide a gross total of downloads per file while we would prefer daily download numbers. To remedy this situation, there is a simple node.js script which is run daily with crontab to collect data and write the data to a text file for our website to consume.

This repo has been reduced to one script: `downloads-collector.js`. This node script queries the GitHub API and saves a copy of all of a repo's asset information, including download counts, to a local Mongo database. The script also writes a JSON formatted plain text file to a separate location (our websites file location) to be downloaded for visualization (with D3 :).

###Getting Started
Install with:
```bash
git clone https://github.com/j-peterson/github-downloads.git
cd github-downloads/
npm i
```

The node.js script `downloads-collector.js` does the work. I run it with a midnight cron job to collect daily downloads data:

```bash
0 0 * * * node /path-to-repo/github-downloads/downloads-collector.js -u github_username -r github_repo -a http_api_user_agent -f /filepath-to-save-text/ >> /path-to-repo/github-downloads/cron.log 2>&1
```

You can point the repo, log, and filepath to where ever you like. I use our website's user and home directory for the filepath to enable web access. Be sure to have your permissions in order for crontab to successfully access the node script and filepath.

`downloads-collector.js` options:
* `-u user-name` or `--user=user-name` - GitHub user name or organization name that owns the repository you would like to track asset downloads of.
* `-r repo-name` or `--repo=repo-name` - GitHub repository that has releases with assets you would like to track the download counts of.
* `-a api-user-agent` or `--user_agent=api-user-agent` - The GitHub API has a required header of "user_agent". Please specify a name to use in this field.
* `-f` or `--filepath=/filepath-to-save-text/` - [Optional] The file system location to save a JSON formatted text file containing the github-downloads MongoDB collection. Intended use is to save to the file directory of a website to allow web-based visualization. `-f` alone will write to working directory. Omit flag to not write a file.
* `-v` or `--verbose` - Very loud mode. Extra goodies will show up in your standard output and/or cron.log.

<br><br>
Once you have gathered your data, check out the `/examples` directory for a basic example visualization using D3.js.
![screenshot](/examples/example-screenshot.png?raw=true "Screenshot")
