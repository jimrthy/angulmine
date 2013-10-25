(ns mine-sjeepler.server
  (:require [cemerick.austin.repls :refer (browser-connected-repl-js)]
            [clojure.java.io :as io]
            [compojure.core :refer (GET defroutes)]
            [compojure.route :refer (resources)]
            [net.cgrand.enlive-html :as enlive]
            [ring.middleware.resource :as resources]
            [ring.util.response :as response])
  (:gen-class))

(enlive/deftemplate page
  (io/resource "index.html")
  []
  [:body] (enlive/append
           (enlive/html [:script (browser-connected-repl-js)])))

(defroutes site
  (resources "/")
  (GET "/*" req (page)))

(comment (defn render-app []
           {:status 200
            :headers {"Content-Type" "text/html"}
            :body
            (str "<!DOCTYPE html>"
                 "<html>"
                 "<head>"
                 "<link rel=\"stylesheet\" href=\"css/page.css\" />"
                 "</head>"
                 "<body>"
                 "<div>"
                 "<p id=\"clickable\">Click me!</p>"
                 "</div>"
                 "<script src=\"js/cljs.js\"></script>"
                 "</body>"
                 "</html>")}))

(comment
  ;; FIXME: Switch to compojure
  ;; Interesting note: going to a the URL of a page with a template under
  ;; public seems to bypass this.
  ;; Probably because of wrap-resource below.
  (defn handler [request]
    (if (= "/" (:uri request))
      (response/redirect "/help.html")
      (render-app))))

;;; TODO: This doesn't particularly belong in here.
;;; Or maybe this is the absolute perfect place for it.  
(def app 
  (-> site
      ;; This seems to get tricksy:
      ;; I think I want to append the script associated with
      ;; (browser-connected-repl-js) into the body of the HTML
      ;; of any page that I want to be able to connect to using
      ;; Austin.
      ;; https://github.com/cemerick/austin/blob/master/browser-connected-repl-sample/src/clj/cemerick/austin/bcrepl_sample.clj
      ;; seems to have an example of doing that via enlive.
      ;; TODO: How do I skip that particular middle-man?
      (resources/wrap-resource "public")))

