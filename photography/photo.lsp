;;;;  Photography 
(defpackage :photography
  (:use :cl)
  (:export #:photo
           #:make-photo
           #:photo-title
           #:photo-file
           #:photo-date
           #:photo-camera
           #:photo-tags
           #:photo-rating
           #:collection
           #:make-collection
           #:add-photo
           #:find-by-tag
           #:find-by-rating
           #:print-collection))

(in-package :photography)


;;; Photo object

(defclass photo ()
  ((title   :initarg :title   :accessor photo-title   :type string)
   (file    :initarg :file    :accessor photo-file    :type string)
   (date    :initarg :date    :accessor photo-date    :type string) ; "YYYY-MM-DD"
   (camera  :initarg :camera  :accessor photo-camera  :type string)
   (tags    :initarg :tags    :accessor photo-tags    :initform nil :type list)
   (rating  :initarg :rating  :accessor photo-rating  :initform 0   :type (integer 0 5))))

(defun make-photo (&key title file date camera tags (rating 0))
  (make-instance 'photo
                 :title title
                 :file file
                 :date date
                 :camera camera
                 :tags tags
                 :rating rating))

;;; ------------------------------------------------------------
;;; Collection
;;; ------------------------------------------------------------

(defclass collection ()
  ((name   :initarg :name   :accessor collection-name)
   (photos :initarg :photos :accessor collection-photos :initform nil)))

(defun make-collection (name)
  (make-instance 'collection :name name))

(defun add-photo (collection photo)
  (push photo (collection-photos collection))
  collection)

;;; Queries

(defun find-by-tag (collection tag)
  (remove-if-not (lambda (p) (member tag (photo-tags p) :test #'string-equal))
                 (collection-photos collection)))

(defun find-by-rating (collection min-rating)
  (remove-if-not (lambda (p) (>= (photo-rating p) min-rating))
                 (collection-photos collection)))


;;; Pretty print


(defmethod print-object ((p photo) stream)
  (format stream "#<PHOTO \"~A\" (~A) rating:~A tags:~A>"
          (photo-title p)
          (photo-date p)
          (photo-rating p)
          (photo-tags p)))

(defun print-collection (collection)
  (format t "~%Collection: ~A (~D photos)~%"
          (collection-name collection)
          (length (collection-photos collection)))
  (dolist (p (reverse (collection-photos collection))) ; keep insertion order
    (format t "  • ~A  [~A]  ★~A  ~{~A~^, ~}~%"
            (photo-title p)
            (photo-camera p)
            (photo-rating p)
            (photo-tags p))))


;;; Gallery



(defparameter *portfolio* (make-collection "Street & Landscape"))

(add-photo *portfolio*
           (make-photo :title "Morning Fog"
                       :file "../assets/low_res/castle_canyon.webp"
                       :date "2025-11-12"
                       :camera "Fuji X-T5"
                       :tags '("landscape" "fog" "morning")
                       :rating 5))

(add-photo *portfolio*
           (make-photo :title "Neon Alley"
                       :file "neon-03.jpg"
                       :date "2026-02-28"
                       :camera "Sony A7IV"
                       :tags '("street" "night" "neon")
                       :rating 4))

(add-photo *portfolio*
           (make-photo :title "Quiet Harbor"
                       :file "harbor-07.jpg"
                       :date "2026-04-03"
                       :camera "Fuji X-T5"
                       :tags '("landscape" "water" "boats")
                       :rating 5))

(print-collection *portfolio*)

; ;; Find only street photos
; (find-by-tag *portfolio* "street")

; ;; Find only 5-star photos
; (find-by-rating *portfolio* 5)
; |#