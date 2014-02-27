{-# LANGUAGE RecordWildCards #-}
{-# LANGUAGE TypeSynonymInstances, FlexibleInstances, OverloadedStrings #-}
import Haste.App
import qualified Haste.App.Concurrent as H
import qualified Control.Concurrent as C
import qualified Data.Set as S
import Data.List (lookup, delete)
import Control.Applicative
import Control.Monad
import Data.IORef
import Haste.Serialize
import Haste.JSON
import Haste.Graphics.Canvas

import Keys.KeyCodes

type State = (IORef [(SessionID, C.MVar GameState)], IORef GameState)

type V2 = (Double,Double)

data Player = Player{ playerName  :: String
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
--defaultPlayer = Player "noName" 0 0 0 0 0

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

data GameState = GameState { gsPaused       :: Bool
                           , players        :: [Player]
                           }
                 deriving (Eq, Show)

instance Serialize GameState where
  toJSON GameState{..} = Dict [("gsPaused", toJSON gsPaused),("players", Arr $ map toJSON players)]
  parseJSON obj = do
    gsPaused <- obj .: "gsPaused"
    players <- obj .: "players"
    return $ GameState gsPaused players

--type GameState = (Bool)

data API = API {
  apiHello       :: Export (Server GameState),
  apiCommand     :: Export (PlayerAction -> Server ()),
  apiState       :: Export (Server GameState),
  apiAwait       :: Export (Server GameState)
  }

getState :: Useless State -> Server GameState
getState state = do
  (clients, gameState) <- mkUseful state
  liftIO $ readIORef gameState

hello :: Useless State -> Server GameState
hello state = do
  sid <- getSessionID
  active <- getActiveSessions
  (clients, gameState) <- mkUseful state
  liftIO $ do
    v <- C.newEmptyMVar
    atomicModifyIORef clients $ \cs ->
      ((sid, v) : filter (\(sess, _) -> sess `S.member` active) cs, ())
    atomicModifyIORef gameState $ \st ->
      let newPlayers = (defaultPlayer{playerName = show sid}) : (players st)
      in (st{players=newPlayers}, ())
    readIORef gameState

command :: Useless State -> PlayerAction -> Server ()
command state act = do
  (clients, gameState) <- mkUseful state
  sid <- getSessionID
  gs <- liftIO $ readIORef gameState
  let player = head $ filter (\p -> (playerName p) == (show sid)) $ players gs
  liftIO $ do
    cs <- readIORef clients
    st <- readIORef gameState
    let st' = case act of
          Pause -> st{gsPaused=(not $ gsPaused st)}
          StartTurnLeft -> let (a,b) = playerDir player
                               newDir = (a+0.1,b+0.1)
                               newPlayers = player{playerDir=newDir} : (delete player (players gs))
                           in st{players=newPlayers} 
          StartAfterburner -> st
          _ -> st

    atomicModifyIORef gameState $ \_ -> (st', ())
    newState <- readIORef gameState
    forM_ cs $ \(_, v) -> C.forkIO $ C.putMVar v newState

await :: Useless State -> Server GameState
await state = do
  sid <- getSessionID
  (clients, gameState) <- mkUseful state
  liftIO $ readIORef gameState >>= \st -> return st
--  liftIO $ readIORef clients >>= maybe (gameState) C.takeMVar . lookup sid
    
clientMain :: API -> Client ()
clientMain api = withElems ["sceneCanvas", "hudCanvas"] $ \[cSceneElem, cHudElem] -> do
  state <- onServer $ apiHello api
  Just cScene <- getCanvas cSceneElem

  H.fork $ let awaitLoop st = do
                 renderScene st cScene
                 st' <- onServer $ apiAwait api
                 setTimeout 20 $ awaitLoop st'
           in awaitLoop state

  cSceneElem `onEvent` OnKeyDown $ \k -> do
    case fromKeyCode k of
      KeyP -> do
        onServer $ apiCommand api <.> Pause
      UpArrow -> do
        onServer $ apiCommand api <.> StartAfterburner
      LeftArrow -> do
        onServer $ apiCommand api <.> StartTurnLeft
      RightArrow -> do
        onServer $ apiCommand api <.> StartTurnRight
      Space -> do
        onServer $ apiCommand api <.> StartFire
      _  -> return ()

  return ()

renderScene :: GameState -> Canvas -> Client ()
renderScene gameState sc = do
  render sc $ do
    colorBlack $ fill $ rect (0,0) (800,600)
    renderPlayers $ players gameState
    translate (100,100) $ colorWhite $ text (0,0) $ "gsPaused: " ++ (show $ gsPaused gameState)

shipShape = [ ( 0.00, 0.50)
            , (-0.25,-0.50)
            , ( 0.25,-0.50)
            , ( 0.00, 0.50)]
            
renderPlayers :: [Player] -> Picture ()
renderPlayers players = do
  translate (400,300) $ rotate (dir2ang dir) $ colorWhite $ stroke $ path $ rescale 20 shipShape
  where dir = playerDir (head players)

len :: V2 -> Double
len (a,b) = sqrt (a*a + b*b)

norm :: V2 -> V2
norm v@(a,b) = (a/l,b/l) where l = len v

dir2ang :: V2 -> Angle
dir2ang v = atan2 x y where (x,y) = norm v 

ang2dir :: Angle -> V2
ang2dir a = (cos(a), sin(a)) 

rescale :: Double -> [Point] -> [Point]
rescale sf ps = map (\(x,y) -> (x*sf,y*sf)) ps

colorBlack = color $ RGBA 0 0 0 1.0
colorWhite = color $ RGBA 255 255 255 1.0

main :: IO ()
main = do
  runApp (defaultConfig "ws://localhost:3712" 3712) $ do
    state <- liftServerIO $ do
      clients <- newIORef []
      gameState <- newIORef $ GameState False []
      return (clients, gameState)

    api <- API
           <$> export (hello state)
           <*> export (command state)
           <*> export (getState state)
           <*> export (await state)

    runClient $ clientMain api
