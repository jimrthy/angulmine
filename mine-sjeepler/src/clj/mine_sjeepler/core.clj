(ns mine-sjeepler.core
  (:require [scrabbletris.system :as sys]))

(defn -main []
  ;; Actually, I do want to join on this. But it shouldn't matter.
  (sys/start (sys/init)))
