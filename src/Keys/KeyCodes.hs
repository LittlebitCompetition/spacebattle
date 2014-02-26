module Keys.KeyCodes (
  Key(..),
  fromKeyCode,
  toKeyCode
  ) where

type KeyCode = Int

data Key = Backspace
         | Tab
         | Enter
         | Shift
         | Ctrl
         | Alt
         | Break
         | CapsLock
         | Escape
         | Space
         | PageUp
         | DageDown
         | End
         | Home
         | LeftArrow
         | UpArrow
         | RightArrow
         | DownArrow
         | Insert
         | Delete
         | Key0
         | Key1
         | Key2
         | Key3
         | Key4
         | Key5
         | Key6
         | Key7
         | Key8
         | Key9
         | KeyA
         | KeyB
         | KeyC
         | KeyD
         | KeyE
         | KeyF
         | KeyG
         | KeyH
         | KeyI
         | KeyJ
         | KeyK
         | KeyL
         | KeyM
         | KeyN
         | KeyO
         | KeyP
         | KeyQ
         | KeyR
         | KeyS
         | KeyT
         | KeyU
         | KeyV
         | KeyW
         | KeyX
         | KeyY
         | KeyZ
         | LeftWindowKey
         | RightWindowKey
         | SelectKey
         | Numpad0
         | Numpad1
         | Numpad2
         | Numpad3
         | Numpad4
         | Numpad5
         | Numpad6
         | Numpad7
         | Numpad8
         | Numpad9
         | Multiply
         | Add
         | Subtract
         | DecimalPoint
         | Divide
         | F1
         | F2
         | F3
         | F4
         | F5
         | F6
         | F7
         | F8
         | F9
         | F10
         | F11
         | F12
         | NumLock
         | ScrollLock
         | SemiColon
         | EqualSign
         | Comma
         | Dash
         | Period
         | ForwardSlash
         | GraveAccent
         | OpenBracket
         | BackSlash
         | CloseBraket
         | SingleQuote
         deriving (Eq, Enum, Show)

type KeyCodes = [(Key, KeyCode)]

toKeyCode :: Key -> KeyCode
toKeyCode k = snd . head $ dropWhile ((/=k) . fst) allKeys

fromKeyCode :: KeyCode -> Key
fromKeyCode c = fst . head $ dropWhile ((/=c) . snd) allKeys

allKeys =
  [(Backspace,8)
  ,(Tab,9)
  ,(Enter,13)
  ,(Shift,16)
  ,(Ctrl,17)
  ,(Alt,18)
  ,(Break,19)
  ,(CapsLock,20)
  ,(Escape,27)
  ,(Space,32)
  ,(PageUp,33)
  ,(DageDown,34)
  ,(End,35)
  ,(Home,36)
  ,(LeftArrow,37)
  ,(UpArrow,38)
  ,(RightArrow,39)
  ,(DownArrow,40)
  ,(Insert,45)
  ,(Delete,46)
  ,(Key0,48)
  ,(Key1,49)
  ,(Key2,50)
  ,(Key3,51)
  ,(Key4,52)
  ,(Key5,53)
  ,(Key6,54)
  ,(Key7,55)
  ,(Key8,56)
  ,(Key9,57)
  ,(KeyA,65)
  ,(KeyB,66)
  ,(KeyC,67)
  ,(KeyD,68)
  ,(KeyE,69)
  ,(KeyF,70)
  ,(KeyG,71)
  ,(KeyH,72)
  ,(KeyI,73)
  ,(KeyJ,74)
  ,(KeyK,75)
  ,(KeyL,76)
  ,(KeyM,77)
  ,(KeyN,78)
  ,(KeyO,79)
  ,(KeyP,80)
  ,(KeyQ,81)
  ,(KeyR,82)
  ,(KeyS,83)
  ,(KeyT,84)
  ,(KeyU,85)
  ,(KeyV,86)
  ,(KeyW,87)
  ,(KeyX,88)
  ,(KeyY,89)
  ,(KeyZ,90)
  ,(LeftWindowKey,91)
  ,(RightWindowKey,92)
  ,(SelectKey,93)
  ,(Numpad0,96)
  ,(Numpad1,97)
  ,(Numpad2,98)
  ,(Numpad3,99)
  ,(Numpad4,100)
  ,(Numpad5,101)
  ,(Numpad6,102)
  ,(Numpad7,103)
  ,(Numpad8,104)
  ,(Numpad9,105)
  ,(Multiply,106)
  ,(Add,107)
  ,(Subtract,109)
  ,(DecimalPoint,110)
  ,(Divide,111)
  ,(F1,112)
  ,(F2,113)
  ,(F3,114)
  ,(F4,115)
  ,(F5,116)
  ,(F6,117)
  ,(F7,118)
  ,(F8,119)
  ,(F9,120)
  ,(F10,121)
  ,(F11,122)
  ,(F12,123)
  ,(NumLock,144)
  ,(ScrollLock,145)
  ,(SemiColon,186)
  ,(EqualSign,187)
  ,(Comma,188)
  ,(Dash,189)
  ,(Period,190)
  ,(ForwardSlash,191)
  ,(GraveAccent,192)
  ,(OpenBracket,219)
  ,(BackSlash,220)
  ,(CloseBraket,221)
  ,(SingleQuote,222)]
