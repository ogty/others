function syntaxHighlight(json: string) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
    let className = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        className = 'key';
      } else {
        className = 'string';
      }
    } else if (/true|false/.test(match)) {
      className = 'boolean';
    } else if (/null/.test(match)) {
      className = 'null';
    }
    if (/:/.test(match)) {
      return `<span class="${className}">${match.replace(':', '')}</span>:`;
    }
    return `<span class="${className}">${match}</span>`;
  });
}
