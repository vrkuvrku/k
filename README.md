
k - 2048 game variation
=======================

1. Preact CLI App
2. src/index.js

DEPLOY
------

yarn build && rm -f build.zip && zip -r build.zip build && scp build.zip server:

ssh server # cd www && unzip -o k.zip

BUGS
----

- player can continue even after 'Game over'
- '1024' tile overflows

