module.exports = {
  apps : [{
    script    : "worker.js",
    instances : "max",
    node_args : "--max-old-space-size=256",
    log_file : "__LOG_PATH__/__HOSTNAME__.log",
    error_file : "__LOG_PATH__/__HOSTNAME__.err",
    out_file : "__LOG_PATH__/__HOSTNAME__.out",
    pid_file : "__LOG_PATH__/__HOSTNAME__.pid",
    exec_mode : "cluster"
  }]
}
