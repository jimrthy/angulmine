(ns scrabbletris.system
  (:require [ring.adapter.jetty :as jetty]
            [scrabbletris.server :as srvr]))

(defn init []
  {:server (atom nil)})

(defn start [system]
  ;; It's probably overkill to totally create a new server each time
  ;; here. Could very reasonable just handle this once in init.
  ;; Or maybe not. Think about it.
  (swap! (:server system) (fn [_]
                            (jetty/run-jetty srvr/app {:port 8080 :join? false})))
  (.start @(:server system)))

(defn stop [system]
  (.stop @(:server system))
  (reset! (:server system) nil))
