#!/usr/bin/env python3
"""
Bidirectional TCP/UDP forwarder for the GunZ client.

The RefinedGunz client hardcodes 127.0.0.1 as the MatchServer host. To support
remote servers without binary-patching the executable, this script listens on
127.0.0.1 and proxies all bytes to/from the configured upstream server.

The client uses TCP for the MatchServer (port 6000) and UDP for the Locator
(port 8900). Pass --proto tcp or --proto udp.

Usage:
    forwarder.py --proto tcp --listen 127.0.0.1:6000 --upstream <IP>:6000
    forwarder.py --proto udp --listen 127.0.0.1:8900 --upstream <IP>:8900
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


def run_tcp(listen: tuple[str, int], upstream: tuple[str, int]) -> int:
    listener = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    listener.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    listener.bind(listen)
    listener.listen(64)
    logging.info("TCP listening on %s:%d -> %s:%d", *listen, *upstream)
    try:
        while True:
            client, addr = listener.accept()
            threading.Thread(
                target=handle, args=(client, addr, upstream), daemon=True
            ).start()
    except KeyboardInterrupt:
        return 0
    finally:
        listener.close()


def run_udp(listen: tuple[str, int], upstream: tuple[str, int]) -> int:
    """Connection-less UDP relay.

    Maintains a per-client outbound socket so replies from upstream go back to
    the right local sender.
    """
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(listen)
    logging.info("UDP listening on %s:%d -> %s:%d", *listen, *upstream)

    clients: dict[tuple[str, int], socket.socket] = {}
    lock = threading.Lock()

    def relay_replies(client_addr: tuple[str, int], up_sock: socket.socket) -> None:
        try:
            while True:
                data, _ = up_sock.recvfrom(65535)
                sock.sendto(data, client_addr)
        except OSError:
            pass
        finally:
            with lock:
                clients.pop(client_addr, None)
            up_sock.close()

    try:
        while True:
            data, client_addr = sock.recvfrom(65535)
            with lock:
                up_sock = clients.get(client_addr)
                if up_sock is None:
                    up_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
                    up_sock.connect(upstream)
                    clients[client_addr] = up_sock
                    threading.Thread(
                        target=relay_replies, args=(client_addr, up_sock), daemon=True
                    ).start()
            try:
                up_sock.send(data)
            except OSError as exc:
                logging.warning("UDP send to upstream failed: %s", exc)
    except KeyboardInterrupt:
        return 0
    finally:
        sock.close()


def main() -> int:
    parser = argparse.ArgumentParser(description="GunZ TCP/UDP forwarder")
    parser.add_argument("--proto", choices=["tcp", "udp"], default="tcp")
    parser.add_argument("--listen", required=True, type=parse_addr,
                        help="bind address as host:port")
    parser.add_argument("--upstream", required=True, type=parse_addr,
                        help="upstream server as host:port")
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s [forwarder] %(message)s",
    )

    if args.proto == "udp":
        return run_udp(args.listen, args.upstream)
    return run_tcp(args.listen, args.upstream)


if __name__ == "__main__":
    sys.exit(main())
