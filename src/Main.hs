{-# LANGUAGE RecordWildCards #-}
module Main where

import Haste
import Haste.Graphics.Canvas
import Data.IORef
--import Linear

data V2 a = V2 a a

data State
  = State {isPaused :: Bool
          ,frame    :: Int
          }

class RigidBody a where
  bounds :: a -> BodyBound
  mass   :: a -> BodyMass

type Position = V2 Double
type Velocity = V2 Double

data Ship
  = Ship{ shipPos :: Position
        , shipVel :: Velocity
        , shipShape :: [Point]
        }
instance Renderable Ship where
  toPicture (Ship p v sh) = stroke . path $ rescale 20 sh

rescale :: Double -> [Point] -> [Point]
rescale sf ps = map (\(x,y) -> (x*sf,y*sf)) ps

ship1 = Ship{ shipPos   = V2 0 0
            , shipVel   = V2 0 0
            , shipShape = [ ( 0.00, 0.50)
                          , (-0.25,-0.50)
                          , ( 0.25,-0.50)
                          , ( 0.00, 0.50)]
            }

data Bullet
  = Bullet{ bulletPos :: Position
          , bulletVel :: Velocity
          }

data BodyBound
  = BoundSphere Double
  | BoundBox Double Double

type BodyMass = Double

class Renderable a where
  toPicture :: a -> Picture ()

singularity :: Picture ()
singularity = fill $ circle (0,0) 20

main :: IO ()
main = do
  Just scElem        <- elemById "sceneCanvas"
  Just sceneCanvas   <- getCanvas scElem
  Just hudCanvasElem <- elemById "hudCanvas"
  Just hudCanvas     <- getCanvas hudCanvasElem
  state <- newIORef $ State False 0

  gameLoop state sceneCanvas hudCanvas


gameLoop :: IORef State  -- game state
         -> Canvas       -- scene canvas
         -> Canvas       -- hud canvas
         -> IO ()
gameLoop st scene hud = do
  state <- readIORef st
  drawScene scene hud state
  -- update game state
  let state' = state{frame=frame'+1}
      frame' = frame state
  writeIORef st $ state'
  setTimeout 20 $ gameLoop st scene hud

drawHud :: Canvas -> State -> IO ()
drawHud hud st = do
  render hud $
    color (RGBA 0 0 255 0.8) . font "20px Bitstream Vera" $ do
      text (0, 16) $ "Frame: " ++ (show $ frame st)

drawScene :: Canvas -> Canvas -> State -> IO ()
drawScene sc hud st@State{..} = do
  render sc $ do
    let sx = fromIntegral $ frame `mod` 800
        sy = 100 * (sin $ (fromIntegral frame) / 100)
    color black $ fill $ rect (0,0) (800,600)
    color green $ translate (sx,300+sy) $ singularity
    color yellow $ translate (400,300) $ toPicture ship1
  drawHud hud st

white = RGBA 255 255 255 1.0
black = RGBA   0   0   0 1.0
green = RGBA   0 255   0 1.0
yellow = RGBA 255 255  0 1.0
