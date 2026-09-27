(() => {
  const root = document.querySelector('[data-tool="openvpn-config-checker"]');
  if (!root) return;
  const en = root.dataset.lang === 'en';
  const output = root.querySelector('[data-config-result]');
  const fileInput = root.querySelector('[data-ovpn-file]');
  const say = (english, dutch) => en ? english : dutch;

  function inspect(source) {
    const lines = source.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#') && !line.startsWith(';'));
    const directives = lines.filter(line => !line.startsWith('<') && !line.startsWith('</'));
    const has = name => directives.some(line => new RegExp('^' + name + '(?:\\s|$)', 'i').test(line));
    const value = name => directives.find(line => new RegExp('^' + name + '\\s+', 'i').test(line))?.split(/\s+/).slice(1).join(' ');
    const issues = [];
    if (!has('remote')) issues.push(say('No remote server address found.', 'Geen serveradres (remote) gevonden.'));
    if (!has('client') && !has('pull')) issues.push(say('Client/pull directive missing; check whether this is a client profile.', 'Client/pull ontbreekt; controleer of dit een clientprofiel is.'));
    if (has('comp-lzo') || has('compress')) issues.push(say('Compression is enabled. Avoid it unless your server explicitly requires it.', 'Compressie staat aan. Gebruik dit alleen als de server het vereist.'));
    if (has('auth-user-pass') && value('auth-user-pass')) issues.push(say('Authentication points to a separate credentials file. Keep that file private.', 'Aanmelding verwijst naar een apart wachtwoordbestand. Houd dit bestand privé.'));
    const ca = has('ca') || /<ca>[\s\S]*?<\/ca>/i.test(source);
    if (!ca && !has('peer-fingerprint')) issues.push(say('No CA certificate or peer fingerprint found.', 'Geen CA-certificaat of peer-fingerprint gevonden.'));
    const cert = has('cert') || /<cert>[\s\S]*?<\/cert>/i.test(source);
    const key = has('key') || /<key>[\s\S]*?<\/key>/i.test(source);
    if (cert !== key) issues.push(say('Client certificate and private key are not both present.', 'Clientcertificaat en privésleutel zijn niet allebei aanwezig.'));
    if (!cert && !has('auth-user-pass')) issues.push(say('No client certificate or username/password authentication found.', 'Geen clientcertificaat of gebruikersnaam/wachtwoordaanmelding gevonden.'));
    const remote = value('remote')?.split(/\s+/).slice(0, 2).join(' ') || '—';
    const protocol = value('proto') || say('not specified (OpenVPN default applies)', 'niet opgegeven (OpenVPN-standaard geldt)');
    const device = value('dev') || '—';
    output.replaceChildren();
    const summary = document.createElement('p');
    summary.textContent = `${say('Server','Server')}: ${remote} · ${say('Protocol','Protocol')}: ${protocol} · ${say('Device','Type')}: ${device}`;
    output.append(summary);
    const heading = document.createElement('strong');
    heading.textContent = issues.length ? say('Things to review:', 'Controleer dit:') : say('No common issues found. This does not guarantee the profile will connect.', 'Geen veelvoorkomende problemen gevonden. Dit garandeert geen werkende verbinding.');
    output.append(heading);
    if (issues.length) {
      const list = document.createElement('ul');
      for (const issue of issues) { const item = document.createElement('li'); item.textContent = issue; list.append(item); }
      output.append(list);
    }
  }
  fileInput.addEventListener('change', async () => {
    output.textContent = '';
    const file = fileInput.files?.[0];
    if (!file) return;
    if (file.size > 256 * 1024 || !/\.(ovpn|conf)$/i.test(file.name)) {
      output.textContent = say('Choose an .ovpn or .conf file under 256 KB.', 'Kies een .ovpn- of .conf-bestand kleiner dan 256 KB.');
      return;
    }
    try { inspect(await file.text()); }
    catch (_) { output.textContent = say('The file could not be read.', 'Het bestand kon niet worden gelezen.'); }
  });
})();
