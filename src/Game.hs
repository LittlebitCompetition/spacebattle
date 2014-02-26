{-# LANGUAGE RecordWildCards #-}
{-# LANGUAGE TypeSynonymInstances, FlexibleInstances, OverloadedStrings #-}
import Haste.App
import qualified Haste.App.Concurrent as H
import qualified Control.Concurrent as C
import qualified Data.Set as S
import Data.List (lookup)
import Control.Applicative
import Control.Monad
import Data.IORef
import Haste.Serialize
import Haste.JSON
import Haste.Graphics.Canvas

type State = (IORef [(SessionID, C.MVar GameState)], IORef GameState)

data PlayerAction = Pause
                  | TurnLeft
                  | TurnRight
                  | Fire
                  | Afterburner
                  deriving (Eq, Show, Enum, Read)

instance Serialize PlayerAction where
  toJSON act = Dict [("player_action", toJSON $ show act)]
  parseJSON obj = do
    act <- obj .: "player_action"
    return $ read act

data GameState = GameState {
  gsPaused       :: Bool
  }

instance Serialize GameState where
  toJSON GameState{..} = Dict [("gsPaused", toJSON gsPaused)]
  parseJSON obj = do
    gsPaused <- obj .: "gsPaused"
    return $ GameState gsPaused

--type GameState = (Bool)

data API = API {
  apiHello       :: Export (Server GameState),
  apiCommand     :: Export (PlayerAction -> Server ()),
  apiState       :: Export (Server GameState),
  apiAwait       :: Export (Server GameState)
--  apiPause       :: Export (Server [Message]),
--  apiTurnRight   :: Export (String -> String -> Server ()),
--  apiTurnLeft    :: Export (Server Message),
--  apiFire        :: Export (Server Message),
--  apiAfterburner :: Export (Server Message)
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
    readIORef gameState

command :: Useless State -> PlayerAction -> Server ()
command state act = do
  (clients, gameState) <- mkUseful state
  liftIO $ do
    cs <- readIORef clients
    st <- readIORef gameState
    atomicModifyIORef gameState $ \_ -> (st{gsPaused=(not $ gsPaused st)}, ())
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
{-
  cSceneElem `onEvent` OnKeyDown $ \k -> do
    case k of
      13 -> do
        alert "Clicked!"
        --onServer $ apiCommand api <.> Pause
      _  -> return ()
-}

  cSceneElem `onEvent` OnClick $ \_ _ -> do
--    alert "Clicked!"
    onServer $ apiCommand api <.> Pause

  return ()

renderScene :: GameState -> Canvas -> Client ()
renderScene gs sc = do
  render sc $ do
    colorBlack $ fill $ rect (0,0) (800,600)
    translate (100,100) $ colorWhite $ text (0,0) $ "gsPaused: " ++ (show $ gsPaused gs)

colorBlack = color $ RGBA 0 0 0 1.0
colorWhite = color $ RGBA 255 255 255 1.0

main :: IO ()
main = do
  runApp (defaultConfig "ws://localhost:3712" 3712) $ do
    state <- liftServerIO $ do
      clients <- newIORef []
      gameState <- newIORef $ GameState False
      return (clients, gameState)

    api <- API
           <$> export (hello state)
           <*> export (command state)
           <*> export (getState state)
           <*> export (await state)

    runClient $ clientMain api
