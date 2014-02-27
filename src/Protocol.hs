{-# LANGUAGE OverloadedStrings #-}
module Protocol where

import Haste.Serialize
import Haste.JSON

data PlayerAction = Pause
                  | StartTurnLeft
                  | StopTurnLeft
                  | StartTurnRight
                  | StopTurnRight
                  | StartFire
                  | StopFire
                  | StartAfterburner
                  | StopAfterburner
                  deriving (Eq, Show, Enum, Read)

instance Serialize PlayerAction where
  toJSON act = Dict [("player_action", toJSON $ show act)]
  parseJSON obj = do
    act <- obj .: "player_action"
    return $ read act
