;; SPDX-License-Identifier: PMPL-1.0-or-later
;; PLAYBOOK.scm - Operational runbook for nafa-app

(define playbook
  `((version . "1.0.0")
    (procedures
      ((deploy . (("build" . "just build")
                  ("test" . "just test")
                  ("demo" . "just mvp-demo")
                  ("server" . "just mvp-server")
                  ("release" . "just release")))
       (rollback . ())
       (debug . (("check" . "just mvp-check")))))
    (alerts . ())
    (contacts
      ((maintainer . "Jonathan D.A. Jewell <j.d.a.jewell@open.ac.uk>")
       (github . "https://github.com/hyperpolymath/nafa-app")))))
