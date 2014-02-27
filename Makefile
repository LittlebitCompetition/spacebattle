all: server client

server:
	cabal build

client:
	hastec src/Game.hs src/Keys/KeyCodes.hs src/Vector.hs src/Vector/Common.hs src/Vector/V2.hs
