# Rise Installer (Electron) E2E tests

### Set up

1. Install gcloud 

2. Add the following to login script

```bash
export E2E_SCREENSHOT_SIGNED_URL=[signedurl]
export MESSAGING_SERVERKEY=[serverkey]
```

3. Configure the rest of the secrets

```bash
gcould auth activate-service-account --key-file [keyfile]
npm install
echo -n [displayidtext] > displayid.txt
echo -n [secret] > secret.txt
node main.js --debug --port=[port]  #optionally add a shortcut to autostart
```

*signedurl*  a signed PUT url for the screenshot test `gsutil signurl ...`

*keyfile* service account file for gsutil (e2e-testing-machine.json in private-keys)

*displayidtext* contains the display id:  eg `"displayid=AAAAAAAA"`

*secret* is the HMAC key used by the E2E runner to authenticate requests

4. Create expected screenshot
On Windows `node screenshot-test.js' then `copy screenshot.png expected-screenshot.png`

On Linux `scrot -d 5` then `cp 2[tab] expected-screenshot.png`

### Test download, install, and upgrade using a specific version

```bash
VERSION=2016.12.12.12.12
curl -vv localhost:9950/install-and-upgrade/$VERSION
```

### Automatically pulling in new tests

To allow a machine to automatically pull new tests when they're
merged:

- the test runner directory needs to be on the master branch
- the files in the directory can not have outstanding modifications
  that are not in the git tree
- a webhook needs to be set up on github to contact the test runner
  when a push event occurs
