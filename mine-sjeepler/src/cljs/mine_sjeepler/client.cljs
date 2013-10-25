(ns hello-clojurescript
  ;; Actually, this probably doesn't make a whole lot of sense in
  ;; a cljs file.
  ;;(:require [spyscope.core])
  )

(defn build-playing-field
  "Return an empty seq of seqs, representing a w by h grid"
  [w h]
  (take h (take w (repeat :empty))))

;; This seems like a poor way to handle this

;; FIXME: Game state should be a parameter into here.
;; Set it up as a clojure (or partial) to handle the javascript
;; API
;; Q: Does that API really require a function without parameters here?
(defn next-frame [previous-state]
  (let [updater (:updater previous-state)
        next-state (updater previous-state)
        drawer (:drawer next-state)]
    (drawer next-state)

    ;; Request another frame
    (letfn [(recurse []
              (next-frame next-state))]
      (.requestAnimationFrame js/window recurse))))

;; TODO: Failing here
;; Q: Do I want to handle these via core.async?
(.addEventListener js/window "keydown" (fn [e]
                                         (let [code (or (.-which e)
                                                        (.-keyCode e)
                                                        (.-key e))]
                                           ;; FIXME: Save that value somewhere...if I care
                                           )))

(let [canvas (.createElement js/document "canvas")]
  ;; Set up basic drawing destination
  ;; TODO: Don't use magic numbers/strings
  (set! (.-width canvas) 640)
  (set! (.-height canvas) 480)
  (set! (.-backgroundColor (.-style canvas)) "black")
  (.appendChild (.-body js/document) canvas)
  
  ;; Build Initial State
  (let [initial-state {
                       :drawer (fn [state]
                                 (if (:running state)
                                   (let [canvas (:canvas state)
                                         ctx (:ctx state)]
                                     ;; Clear.
                                     ;; FIXME: Do I really want to do this every frame? It's pretty wasteful.
                                     (.clearRect ctx 0 0 (.-width canvas) (.-height canvas))
                                     (.save ctx)

                                     ;; Actual rendering goes here
                                     (set! (.-lineWidth ctx) 4)
                                     (let [originalStrokeStyle (.-strokeStyle ctx)]
                                       (.beginPath ctx)
                                       (.moveTo ctx 0 0)
                                       (.lineTo ctx 640 480)
                                       (set! (.-strokeStyle ctx) "#0f0")
                                       (.stroke ctx)

                                       (set! (.-strokeStyle ctx) originalStrokeStyle))

                                     ;; Pop context mods ... whatever that means
                                     (.restore ctx))))
                       :updater (fn [old-state]
                                  (into old-state {:last-time (:current-time old-state)
                                                   :current-time (.now js/Date)}))
                       :current-time (.now js/Date)
                       :last-time nil
                       :running (atom true)

                       :canvas canvas
                       :ctx (.getContext canvas "2d")

                       :keycodes {:enter 13
                                  :space 32
                                  :left 37
                                  :up 38
                                  :right 39
                                  :down 40}

                       :game-state {:current-block nil
                                    :next-block nil
                                    :playing-field (build-playing-field 10 20)}}]

    ;; Start game
    (next-frame initial-state)))


;;; Initial pieces that were auto-genned

(defn handle-click []
  (js/alert "Hello!"))

(def clickable (.getElementById js/document "clickable"))
(.addEventListener clickable "click" handle-click)
