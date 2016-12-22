# Rise Installer (Electron) E2E tests

### Set up

```bash
npm install
echo -n [displayidtext] > displayid.txt
echo -n [md5] > expected-md5.txt
echo -n [secret] > secret.txt
node main.js --debug --port=[port]  #optionally add a shortcut to autostart
```

*displayidtext* contains the display id:  eg `"displayid=AAAAAAAA"`

*md5* contains the expected md5 result of the display's presentation screenshot:  eg `"e1 db 21 c2 16 ea bf 6b 11 84 bd 8d 0a 3d d9 5d"`

*secret* is the HMAC key used by the E2E runner to authenticate requests

On Windows an md5 can be generated via `node screenshot-test.js`

On Linux `scrot -d 5` and `md5sum` can be used.

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
