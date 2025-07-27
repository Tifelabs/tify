module Main where

import Web.Scotty
import Data.IORef
import Text.Blaze.Html5 as H
import Text.Blaze.Html5.Attributes as A
import Text.Blaze.Html.Renderer.Text (renderHtml)
import Control.Monad.IO.Class (liftIO)

main :: IO ()
main = do

    counter <- newIORef (0 :: Int)
    scotty 3000 $ do
        get "/" $ do

            count <- liftIO $ atomicModifyIORef' counter (\c -> (c + 1, c + 1))
            -- Render HTML
            html $ renderHtml $ do
                docType
                html_ $ do
                    head_ $ do
                        meta_ ! charset "UTF-8"
                        meta_ ! name "viewport" ! content "width=device-width, initial-scale=1.0"
                        title_ "Retro Square"
                        style_ $ toHtml $ unlines
                            [ "body {"
                            , "  margin: 0;"
                            , "  padding: 0;"
                            , "  background-color: #0f380f;"
                            , "  display: flex;"
                            , "  justify-content: center;"
                            , "  align-items: center;"
                            , "  min-height: 100vh;"
                            , "  font-family: 'Courier New', Courier, monospace;"
                            , "}"
                            , ".container {"
                            , "  width: 500px;"
                            , "  height: 500px;"
                            , "  background-color: #8bac0f;"
                            , "  border: 10px solid #306230;"
                            , "  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);"
                            , "  display: flex;"
                            , "  flex-direction: column;"
                            , "  align-items: center;"
                            , "  justify-content: center;"
                            , "  text-align: center;"
                            , "  color: #9bbc0f;"
                            , "}"
                            , "h1 {"
                            , "  font-size: 24px;"
                            , "  text-shadow: 2px 2px #306230;"
                            , "  margin: 10px 0;"
                            , "  animation: blink 1s step-end infinite;"
                            , "}"
                            , "p {"
                            , "  font-size: 16px;"
                            , "  margin: 5px 0;"
                            , "}"
                            , ".pixel-button {"
                            , "  background-color: #306230;"
                            , "  color: #9bbc0f;"
                            , "  border: 3px solid #9bbc0f;"
                            , "  padding: 10px 20px;"
                            , "  font-size: 14px;"
                            , "  cursor: pointer;"
                            , "  text-decoration: none;"
                            , "  margin-top: 20px;"
                            , "  transition: all 0.2s ease;"
                            , "}"
                            , ".pixel-button:hover {"
                            , "  background-color: #9bbc0f;"
                            , "  color: #306230;"
                            , "}"
                            , "@keyframes blink {"
                            , "  50% { opacity: 0; }"
                            , "}"
                            , ".pixel-text {"
                            , "  image-rendering: pixelated;"
                            , "  font-weight: bold;"
                            , "}"
                            ]
                    body_ $ do
                        div_ ! class_ "container" $ do
                            h1_ ! class_ "pixel-text" $ "Welcome to Retro Square!"
                            p_ ! class_ "pixel-text" $ toHtml $ "Visitor #" ++ show count
                            p_ ! class_ "pixel-text" $ "A Totally Radical Haskell Page!"
                            a_ ! class_ "pixel-button" ! href "#" $ "Click Me!"