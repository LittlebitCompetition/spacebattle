{-# LANGUAGE RecordWildCards #-}
{-# LANGUAGE TypeSynonymInstances, FlexibleInstances, OverloadedStrings #-}
import Haste.App
import qualified Haste.App.Concurrent as H
import qualified Control.Concurrent as C
import qualified Data.Set as S
import Control.Applicative
import Control.Monad
import Data.IORef
import Haste.Serialize
import Haste.JSON
import Haste.Graphics.Canvas

type State = (IORef [(SessionID, C.MVar PlayerAction)], IORef GameState)

data PlayerAction = Pause
                  | TurnLeft
                  | TurnRight
                  | Fire
                  | Afterburner
                  deriving (Eq, Show, Enum)

instance Serialize PlayerAction where
  toJSON act = Dict [("player_action", toJSON $ show act)]
  parseJSON obj = do
    act <- obj .: "player_action"
    return act

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
  apiCommand     :: Export (PlayerAction -> Server ())
--  apiPause       :: Export (Server [Message]),
--  apiTurnRight   :: Export (String -> String -> Server ()),
--  apiTurnLeft    :: Export (Server Message),
--  apiFire        :: Export (Server Message),
--  apiAfterburner :: Export (Server Message)
  }

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
    atomicModifyIORef gameState $ \_ -> (GameState True, ())
    newState <- readIORef gameState
    forM_ cs $ \(_, v) -> C.forkIO $ C.putMVar v act
    
clientMain :: API -> Client ()
clientMain api = withElems ["sceneCanvas", "hudCanvas"] $ \[cSceneElem, cHudElem] -> do
  state <- onServer $ apiHello api
  Just cScene <- getCanvas cSceneElem
  cSceneElem `onEvent` OnKeyDown $ \k -> do
    case k of
      13 -> do
        onServer $ apiCommand api <.> Pause
      _  -> return ()

  renderScene state cScene
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

    api <- API <$> export (hello state)
               <*> export (command state)

    runClient $ clientMain api
{-
data AppState = AppState{ isPaused :: Bool }
instance Serialize AppState where
  toJSON AppState{..} = Dict [("isPaused", toJSON isPaused)]
  parseJSON obj = do
    isPaused <- obj .: "isPaused"
    return $ AppState isPaused

main :: IO ()
main = do
  runApp (defaultConfig "ws://localhost:24601" 24601) $ do
    state <- liftServerIO $ C.newMVar $ AppState False

    getState <-export $ \_ -> do
      state <- mkUseful state
      liftIO $ do oldState <- C.takeMVar state
                  return oldState

    trade <- export $ \newState -> do
      state <- mkUseful state
      liftIO $ do oldState <- C.takeMVar state
                  C.putMVar state newState
                  return oldState

    runClient $ withElem "sceneCanvas" $ \sc -> do
      sc `onEvent` OnClick $ \_ _ -> do
        oldState' <- onServer $ getState <.> ()
        let newState = AppState False --(not $ isPaused oldState')
        oldState <- onServer $ trade <.> newState
        alert $ "The old state was: " ++ (show $ isPaused oldState)
-}
