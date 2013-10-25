(defproject scrabbletris "0.1.0-SNAPSHOT"
  :description "FIXME: write this!"
  :url "http://example.com/FIXME"
  :dependencies [[org.clojure/clojure "1.5.1"]
                 [org.clojure/clojurescript "0.0-1934"]
                 [ring "1.1.8"]
                 [spyscope "0.1.3"]]
  :plugins []
  :hooks [leiningen.cljsbuild]
  :source-paths ["src/clj"]
  :cljsbuild { 
    :builds {
      :dev {
        :source-paths ["src/cljs"]
        :compiler {:output-to "resources/public/js/game.js"
                   :optimizations :simple
                   :pretty-print true}
        :jar true}
             :stage {
        :source-paths ["src/cljs"]
        :compiler {:output-to "resources/public/js/game-stage.js"
                   :optimizations :whitespace
                   :pretty-print true}
        :jar true}
             :main  {
        :source-paths ["src/cljs"]
        :compiler {:output-to "resources/public/js/game-prod.js"
                   :optimizations :advanced
                   :pretty-print true}
        :jar true}}}
  :main scrabbletris.core
  :profiles {:dev {:plugins [[com.cemerick/austin "0.1.1"]
                             [lein-cljsbuild "0.3.2"]
                             [lein-ring "0.8.3"]]
                   :source-paths ["dev"]
                   :dependencies [[org.clojure/tools.namespace "0.2.3"]
                                  [org.clojure/java.classpath "0.2.0"]]}}
  :ring {:handler scrabbletris.server/app})

