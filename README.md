# VPNNu OpenVPN config checker

Inspect common settings in an `.ovpn` or `.conf` client profile. [Use the live tool on VPNNu.nl](https://vpnnu.nl/tools/openvpn-config-checker/).

Open `index.html` in a browser or host these files as a static site. The file is read with the browser File API and its contents are **never uploaded**. The checker reports the remote address, protocol, connection type, missing common directives, mismatched client certificate/key, and compression. It deliberately does not display private key material.

This is a static check. It cannot validate certificates, passwords, server reachability, or all OpenVPN versions and directives. Keep `.ovpn` files private. `tool.js` is the same source used by the VPNNu page.

MIT license.
