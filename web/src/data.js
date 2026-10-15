// Curated best-of from README.md — easy-reading picks per topic.
// Full list lives in the repo root README.md.
export const CATEGORIES = [
  {
    id: 'start',
    title: 'Start here',
    blurb: 'New to the book? These six teach you the fastest habits.',
    picks: ['tldr', 'explainshell', 'shellcheck', 'fzf', 'httpie', 'ssllabs-test'],
  },
  { id: 'cli', title: 'CLI essentials', blurb: 'Shell, prompt, multiplexer, finder.' },
  { id: 'network', title: 'Network', blurb: 'Scan it, capture it, debug it.' },
  { id: 'ssl', title: 'SSL & security', blurb: 'Check TLS before your users do.' },
  { id: 'web', title: 'Web tools', blurb: 'Headers, DNS, speed — paste a URL, get answers.' },
  { id: 'sys', title: 'Systems & logs', blurb: 'What is the machine doing right now?' },
  { id: 'containers', title: 'Containers', blurb: 'Lint the Dockerfile, learn K8s the hard way.' },
  { id: 'pentest', title: 'Pentest & recon', blurb: 'Subdomains, devices, certs exposed on the internet.' },
]

export const ITEMS = [
  // start-here + cli
  { id: 'tldr', cat: 'cli', name: 'tldr', url: 'https://github.com/tldr-pages/tldr', desc: 'Simplified man pages with practical examples first.' },
  { id: 'explainshell', cat: 'cli', name: 'explainshell', url: 'https://explainshell.com/', desc: 'Paste a shell command, see what each flag does.' },
  { id: 'shellcheck', cat: 'cli', name: 'ShellCheck', url: 'https://www.shellcheck.net/', desc: 'Finds bugs in your shell scripts. Paste and fix.' },
  { id: 'fzf', cat: 'cli', name: 'fzf', url: 'https://github.com/junegunn/fzf', desc: 'Fuzzy finder for history, files, processes.' },
  { id: 'zsh', cat: 'cli', name: 'Zsh + Oh My Zsh', url: 'https://ohmyz.sh/', desc: 'Friendly interactive shell with a huge plugin library.' },
  { id: 'starship', cat: 'cli', name: 'Starship', url: 'https://github.com/starship/starship', desc: 'Fast cross-shell prompt written in Rust.' },
  { id: 'tmux', cat: 'cli', name: 'tmux', url: 'https://github.com/tmux/tmux/wiki', desc: 'Terminal multiplexer: sessions survive disconnects.' },
  { id: 'vim', cat: 'cli', name: 'Vim / Neovim', url: 'https://neovim.io/', desc: 'Modal editing that pays off on every remote box.' },
  // network
  { id: 'curl', cat: 'network', name: 'curl', url: 'https://curl.se/', desc: 'Transfer data with URLs; the debugging lingua franca.' },
  { id: 'httpie', cat: 'network', name: 'HTTPie', url: 'https://github.com/httpie/httpie', desc: 'Human-friendly HTTP client for APIs.' },
  { id: 'nmap', cat: 'network', name: 'nmap', url: 'https://nmap.org/', desc: 'Network discovery and security auditing standard.' },
  { id: 'mtr', cat: 'network', name: 'mtr', url: 'https://github.com/traviscross/mtr', desc: 'ping + traceroute in one live view.' },
  { id: 'wireshark', cat: 'network', name: 'Wireshark', url: 'https://www.wireshark.org/', desc: 'The network protocol analyzer. Capture, filter, understand.' },
  { id: 'termshark', cat: 'network', name: 'Termshark', url: 'https://termshark.io/', desc: 'Wireshark-like TUI for terminal-only boxes.' },
  { id: 'dog', cat: 'network', name: 'dog / dig', url: 'https://github.com/ogham/dog', desc: 'Modern DNS lookup when dig output hurts your eyes.' },
  // ssl
  { id: 'testssl', cat: 'ssl', name: 'testssl.sh', url: 'https://github.com/drwetter/testssl.sh', desc: 'Test TLS/SSL on any port from one script.' },
  { id: 'sslyze', cat: 'ssl', name: 'SSLyze', url: 'https://github.com/nabla-c0d3/sslyze', desc: 'Fast Python TLS scanner with clean output.' },
  { id: 'mkcert', cat: 'ssl', name: 'mkcert', url: 'https://github.com/FiloSottile/mkcert', desc: 'Locally-trusted dev certificates with zero config.' },
  { id: 'certbot', cat: 'ssl', name: 'Certbot', url: 'https://github.com/certbot/certbot', desc: "EFF's tool for free Let's Encrypt certificates." },
  { id: 'ssl-cert-check', cat: 'ssl', name: 'ssl-cert-check', url: 'https://github.com/Matty9191/ssl-cert-check', desc: 'Get warned before a certificate expires.' },
  // web
  { id: 'ssllabs-test', cat: 'web', name: 'SSL Labs Server Test', url: 'https://www.ssllabs.com/ssltest/', desc: 'Deep analysis of any public HTTPS server. Start here.' },
  { id: 'securityheaders', cat: 'web', name: 'Security Headers', url: 'https://securityheaders.com/', desc: 'Grades your HTTP response headers in seconds.' },
  { id: 'moz-observatory', cat: 'web', name: 'Mozilla Observatory', url: 'https://observatory.mozilla.org/', desc: 'Website security checklist with how-to-fix guidance.' },
  { id: 'urlscan', cat: 'web', name: 'urlscan.io', url: 'https://urlscan.io/', desc: 'Scan a URL like a sandbox and see what it really loads.' },
  { id: 'regex101', cat: 'web', name: 'Regex101', url: 'https://regex101.com/', desc: 'Test and debug regex with live explanation.' },
  { id: 'cyberchef', cat: 'web', name: 'CyberChef', url: 'https://gchq.github.io/CyberChef/', desc: 'Encode, decode, decrypt — the Swiss army knife.' },
  { id: 'pagespeed', cat: 'web', name: 'PageSpeed Insights', url: 'https://developers.google.com/speed/pagespeed/insights/', desc: 'Why your page is slow and what to fix first.' },
  // systems
  { id: 'htop', cat: 'sys', name: 'htop', url: 'https://github.com/htop-dev/htop', desc: 'Interactive process viewer. Better top.' },
  { id: 'ncdu', cat: 'sys', name: 'ncdu', url: 'https://dev.yorhel.nl/ncdu', desc: 'Find what is eating your disk in seconds.' },
  { id: 'lnav', cat: 'sys', name: 'lnav', url: 'https://lnav.org/', desc: 'Log navigator with search and auto-refresh.' },
  { id: 'goaccess', cat: 'sys', name: 'GoAccess', url: 'https://goaccess.io/', desc: 'Real-time web log analyzer in the terminal.' },
  { id: 'strace', cat: 'sys', name: 'strace', url: 'https://github.com/strace/strace', desc: 'See the syscalls a process actually makes.' },
  { id: 'lynis', cat: 'sys', name: 'Lynis', url: 'https://cisofy.com/lynis/', desc: 'Battle-tested Unix security auditing.' },
  // containers
  { id: 'hadolint', cat: 'containers', name: 'hadolint', url: 'https://github.com/hadolint/hadolint', desc: 'Dockerfile linter that teaches best practices.' },
  { id: 'dive', cat: 'containers', name: 'dive', url: 'https://github.com/wagoodman/dive', desc: 'Explore image layers and waste, layer by layer.' },
  { id: 'k9s', cat: 'containers', name: 'k9s', url: 'https://github.com/derailed/k9s', desc: 'Terminal UI for Kubernetes clusters.' },
  { id: 'k8s-hard-way', cat: 'containers', name: 'K8s the Hard Way', url: 'https://github.com/kelseyhightower/kubernetes-the-hard-way', desc: 'Bootstrap Kubernetes by hand once; understand it forever.' },
  // pentest
  { id: 'shodan', cat: 'pentest', name: 'Shodan', url: 'https://www.shodan.io/', desc: 'Search engine for internet-connected devices.' },
  { id: 'censys', cat: 'pentest', name: 'Censys', url: 'https://censys.io/', desc: 'Discover and monitor internet-wide assets.' },
  { id: 'subfinder', cat: 'pentest', name: 'subfinder', url: 'https://github.com/projectdiscovery/subfinder', desc: 'Fast passive subdomain enumeration.' },
  { id: 'amass', cat: 'pentest', name: 'Amass', url: 'https://github.com/owasp-amass/amass', desc: 'Deep subdomain and asset discovery via OWASP.' },
  { id: 'gobuster', cat: 'pentest', name: 'gobuster', url: 'https://github.com/OJ/gobuster', desc: 'Directory, file and DNS busting in Go.' },
  { id: 'crtsh', cat: 'pentest', name: 'crt.sh', url: 'https://crt.sh/', desc: 'Certificate transparency search — free subdomain intel.' },
  { id: 'virustotal', cat: 'pentest', name: 'VirusTotal', url: 'https://www.virustotal.com/', desc: 'Check a suspicious file or URL against many engines.' },
]

export const byId = Object.fromEntries(ITEMS.map((i) => [i.id, i]))
