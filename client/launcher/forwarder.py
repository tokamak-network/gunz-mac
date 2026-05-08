#!/usr/bin/env python3
"""
Bidirectional TCP forwarder for the GunZ client.

The RefinedGunz client hardcodes 127.0.0.1 as the MatchServer host. To support
remote servers without binary-patching the executable, this script listens on
127.0.0.1 and proxies all bytes to/from the configured upstream server.

Usage:
    forwarder.py --listen 127.0.0.1:6000 --upstream <SERVER_IP>:6000
"""
from __future__ import annotations

import argparse
import logging
import socket
import sys
import threading


def parse_addr(value: str) -> tuple[str, int]:
    host, _, port = value.rpartition(":")
    if not host:
        raise argparse.ArgumentTypeError(f"address must be host:port, got {value!r}")
    return host, int(port)


def pump(src: socket.socket, dst: socket.socket, label: str) -> None:
    try:
        while True:
            chunk = src.recv(65536)
            if not chunk:
                break
            dst.sendall(chunk)
    except OSError as exc:
        logging.debug("%s closed: %s", label, exc)
    finally:
        for s in (src, dst):
            try:
                s.shutdown(socket.SHUT_RDWR)
            except OSError:
                pass
            try:
                s.close()
            except OSError:
                pass


def handle(client: socket.socket, addr: tuple, upstream: tuple[str, int]) -> None:
    logging.info("client %s connected, dialing upstream %s:%d", addr, *upstream)
    try:
        server = socket.create_connection(upstream, timeout=10)
    except OSError as exc:
        logging.error("dial upstream failed: %s", exc)
        client.close()
        return
    threading.Thread(target=pump, args=(client, server, "c->s"), daemon=True).start()
    threading.Thread(target=pump, args=(server, client, "s->c"), daemon=True).start()


def main() -> int:
    parser = argparse.ArgumentParser(description="GunZ TCP forwarder")
    parser.add_argument("--listen", required=True, type=parse_addr,
                        help="bind address as host:port (typically 127.0.0.1:6000)")
    parser.add_argument("--upstream", required=True, type=parse_addr,
                        help="upstream server as host:port")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s [forwarder] %(message)s",
    )

    listen_host, listen_port = args.listen
    upstream_host, upstream_port = args.upstream

    listener = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    listener.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    listener.bind((listen_host, listen_port))
    listener.listen(64)
    logging.info("listening on %s:%d -> %s:%d", listen_host, listen_port,
                 upstream_host, upstream_port)

    try:
        while True:
            client, addr = listener.accept()
            threading.Thread(
                target=handle, args=(client, addr, (upstream_host, upstream_port)),
                daemon=True,
            ).start()
    except KeyboardInterrupt:
        return 0
    finally:
        listener.close()


if __name__ == "__main__":
    sys.exit(main())
