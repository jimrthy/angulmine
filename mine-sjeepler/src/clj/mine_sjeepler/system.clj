(ns mine-sjeepler.system
  (:require [ring.adapter.jetty :as jetty]
            [mine-sjeepler.server :as srvr]))

(defn init []
  {:server (atom nil)
   :repl-env (atom nil)})

(defn start [system]
  ;; It's probably overkill to totally create a new server each time
  ;; here. Could very reasonable just handle this once in init.
  ;; Or maybe not. Think about it.
  (swap! (:server system) (fn [_]
                            (jetty/run-jetty srvr/app {:port 8080 :join? false})))
  (.start @(:server system))

  ;; Set up to have a REPL connected to the browser.
  ;; FIXME: This absolutely should not make it into anything like a production
  ;; system.
  ;; Well, unless there's some sort of point to making hacking easier on the client side
  ;; Honestly, this almost seems to belong strictly in user.clj in the dev profile.
  (swap! (:repl-env system) (fn [_]
                              (reset! cemerick.austin.repls/browser-repl-env
                                      (cemerick.austin/repl-env))))

  system)

(defn stop [system]
  (when-let [server-atom (:server system)]
    (when-let [server @server-atom]
      (.stop server)
      (reset! (:server system) nil)))

  (reset! cemerick.austin.repls/browser-repl-env nil)
  (reset! (:repl-env system) nil)

  system)
