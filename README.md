<img src='https://raw.githubusercontent.com/kethinov/1ADownloader/master/images/icon.png' alt='1A Downloader' width='128' height='128'> 

[The 1A Show](http://the1a.org/)'s website doesn't let you download episodes (easily) and their podcast feed frequently is stale.

This app will let you download the episodes directly to your computer rather than having to listen to them on the website or via the podcast feed.

Download
===

- [Windows 64-bit](https://github.com/kethinov/1ADownloader/releases/download/1.0.1/1A.Downloader-win32-x64.zip)
- [Windows 32-bit](https://github.com/kethinov/1ADownloader/releases/download/1.0.1/1A.Downloader-win32-ia32.zip)
- [Linux 64-bit](https://github.com/kethinov/1ADownloader/releases/download/1.0.1/1A.Downloader-linux-x64.zip)
- [Linux 32-bit](https://github.com/kethinov/1ADownloader/releases/download/1.0.1/1A.Downloader-linux-ia32.zip)
- [macOS 64-bit](https://github.com/kethinov/1ADownloader/releases/download/1.0.1/1A.Downloader-darwin-x64.zip)

Run from source
===

First install [Node.js](https://nodejs.org) and [git](https://git-scm.com).

Then:

```
git clone https://github.com/kethinov/1ADownloader.git
cd 1ADownloader
npm i
electron .
```

Build
===

Builds are constructed with [electron-packager](https://github.com/maxogden/electron-packager).

Be sure to have [Node.js](https://nodejs.org) and [git](https://git-scm.com) installed. The build commands presume bash and zip are installed as well, so a Linux or Mac build environment is recommended, although it's probably possible to get a sane build environment set up in Windows too.

Set up the repo:

```
git clone https://github.com/kethinov/1ADownloader.git
cd 1ADownloader
npm i
```

Do builds for:

- All platforms: `npm run build`
- All 64-bit platforms: `npm run build-64`
- Windows 64-bit: `npm run build-win`
- Windows 32-bit: `npm run build-win32`
- Linux 64-bit: `npm run build-linux`
- Linux 32-bit: `npm run build-linux32`
- macOS: `npm run build-mac`
