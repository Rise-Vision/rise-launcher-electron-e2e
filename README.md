# Rise Installer (Electron) E2E tests

### Set up

```bash
npm install
echo [displayidtext] > displayid.txt
echo [md5] > expected-md5.txt
npm start
```

*displayidtext* contains the display id:  eg `"displayid=AAAAAAAA"`

*md5* contains the expected md5 result of the display's presentation screenshot:  eg `"e1 db 21 c2 16 ea bf 6b 11 84 bd 8d 0a 3d d9 5d"`

an md5 can be generated via `node screenshot-test.js`

### Test download, install, and upgrade using a specific version

```bash
VERSION=2016.12.12.12.12
curl -vv localhost:9950/install-and-upgrade/$VERSION
```
