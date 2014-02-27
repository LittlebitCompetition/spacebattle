module Vector.Common where

type Radian = Double
type Degree = Double

toRad :: Degree -> Radian
toRad = (*(pi/180))

toDeg :: Radian -> Degree
toDeg = (*(180/pi))
