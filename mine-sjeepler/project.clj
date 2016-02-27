(defproject mine-sjeepler "0.1.0-SNAPSHOT"
  :description "Minesweeper clone, to experiment w/ om-next"
  :url "http://example.com/FIXME"
  :dependencies [[compojure "1.4.0"]  ; TODO: Probably don't need
                 [devcards "0.2.1-6"]
                 [enlive "1.1.6"]  ; TODO: also probably don't need
                 [figwheel-sidecar "0.5.0-6" :scope "test"]
                 [org.clojure/clojure "1.8.0"]
                 [org.clojure/clojurescript "1.7.228"]
                 [org.omcljs/om "1.0.0-alpha22"]
                 [ring "1.4.0"]  ; another good deletion candidate
                 [spyscope "0.1.5"]]  ; probably not a lot of use for this one, either
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
  :main mine-sjeepler.core
  :profiles {:dev {:plugins [#_[com.cemerick/austin "0.1.1"]
                             #_[lein-cljsbuild "0.3.2"]
                             #_[lein-ring "0.8.3"]]
                   :source-paths ["dev"]
                   :dependencies [[org.clojure/tools.namespace "0.2.10"]
                                  [org.clojure/java.classpath "0.2.3"]]}}
  :plugins []
  :ring {:handler scrabbletris.server/app}
  :source-paths ["src/clj"])
