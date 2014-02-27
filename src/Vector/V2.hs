module Vector.V2 where

import Vector.Common

type V2 = (Double,Double)

-- length of vector
len :: V2 -> Double
len (a,b) = sqrt (a*a + b*b)

-- normalize vector
norm :: V2 -> V2
norm v@(a,b) = (a/l,b/l) where l = len v

-- direction vector to angle
dir2ang :: V2 -> Radian
dir2ang v = atan2 x y where (x,y) = norm v 

-- angle to direction vector
ang2dir :: Radian -> V2
ang2dir a = (cos(a), sin(a)) 

