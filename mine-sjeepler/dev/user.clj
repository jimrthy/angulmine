(ns user
  (:require [clojure.java.io :as io]
            [clojure.string :as str]
            [clojure.pprint :refer (pprint)]
            [clojure.repl :refer :all]
            [clojure.test :as test]
            [clojure.tools.namespace.repl :refer (refresh refresh-all)]
            [figwheel-sidecar.repl :as r]
            [figwheel-sidecar.repl-api :as ra]
            [mine-sjeepler.system :as sys]
            [spyscope.core]))

(def system nil)

(defn init []
  (alter-var-root #'system (constantly (sys/init))))

(defn start []
  (alter-var-root #'system sys/start))

(defn switch-to-cljs []
  (cemerick.austin.repls/cljs-repl @(:repl-env system)))

(defn stop []
  (alter-var-root #'system
                  (fn [s]
                    (when s (sys/stop s)))))

(defn go
  []
  (init)
  (start))

(defn reset []
  (stop)
  (refresh :after 'user/go))

(defn start-cljs!
  ([config]
   (ra/start-figwheel!
    {:figwheel-options {}
     :build-ids ["dev"]
     :all-builds [{:id "dev"
                   :figwheel true
                   :source-paths ["src/cljs"]
                   ;; Note that these really need to match what I have in project.clj
                   :compiler {:main 'mine-sjeepler.core
                              :asset-path "js"
                              :output-to "resources/public/js/main.js"
                              :output-dir "resources/public/js"
                              :verbose true}}]})
   (ra/cljs-repl)))
