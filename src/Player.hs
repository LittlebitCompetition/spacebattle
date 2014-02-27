{-# LANGUAGE OverloadedStrings #-}
module Player where

import Haste.Serialize
import Haste.JSON
import Vector

data Player
  = Player{ playerName  :: String
          , playerDies  :: Int
          , playerKills :: Int
          , playerPos   :: V2
          , playerDir   :: V2
          , playerVel   :: V2
          }
  deriving (Eq, Show, Read)

instance Serialize Player where
  toJSON p = Dict [("playerName",  toJSON $ playerName  p)
                  ,("playerDies",  toJSON $ playerDies  p)
                  ,("playerKills", toJSON $ playerKills p)
                  ,("playerPos",   toJSON $ playerPos   p)
                  ,("playerDir",   toJSON $ playerDir   p)
                  ,("playerVel",   toJSON $ playerVel   p)]
  parseJSON obj = do
    n   <- obj .: "playerName"
    ds  <- obj .: "playerDies"
    ks  <- obj .: "playerKills"
    pos <- obj .: "playerPos"
    dir <- obj .: "playerDir"
    vel <- obj .: "playerVel"
    return $ Player n ds ks pos dir vel

defaultPlayer = Player "noName" 0 0 (0,0) (0,0) (0,0)
