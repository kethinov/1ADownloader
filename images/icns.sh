mkdir appicon.iconset
sips -z 16 16     appicon.png --out appicon.iconset/icon_16x16.png
sips -z 32 32     appicon.png --out appicon.iconset/icon_16x16@2x.png
sips -z 32 32     appicon.png --out appicon.iconset/icon_32x32.png
sips -z 64 64     appicon.png --out appicon.iconset/icon_32x32@2x.png
sips -z 128 128   appicon.png --out appicon.iconset/icon_128x128.png
sips -z 256 256   appicon.png --out appicon.iconset/icon_128x128@2x.png
sips -z 256 256   appicon.png --out appicon.iconset/icon_256x256.png
sips -z 512 512   appicon.png --out appicon.iconset/icon_256x256@2x.png
sips -z 512 512   appicon.png --out appicon.iconset/icon_512x512.png
cp appicon.png appicon.iconset/icon_512x512@2x.png
iconutil -c icns appicon.iconset
rm -R appicon.iconset
