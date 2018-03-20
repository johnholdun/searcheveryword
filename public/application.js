addEventListener('load', function () {
  var get = function (url, callback) {
    var request = new XMLHttpRequest();

    request.open('GET', url, true);

    request.onload = function() {
      callback(
        (request.status >= 200 && request.status < 400),
        JSON.parse(request.responseText)
      );
    };

    request.onerror = function() {
      callback(false, JSON.parse(request.responseText));
    };

    request.send();
  };

  var form = document.querySelector('form');
  var query = document.querySelector('#query');
  var container = document.querySelector('#sentence');

  // 'Testing: a totally Javascript solution for all your éclair needs!'
  if (/^\/for-sentences\/?$/.exec(location.pathname.toString())) {
    query.focus();
    return;
  }

  var words = location.pathname.replace(/\/$/, '').split('/').pop().split('-');

  query.setAttribute('value', words.join(' '));

  if (!container) {
    container = document.createElement('div');
    container.setAttribute('id', 'sentence');
    form.parentNode.insertBefore(container, form);
  }

  container.innerHTML = '';

  words.forEach(function (word) {
    var wrapper = document.createElement('div');
    var el = document.createElement('blockquote');
    var link = document.createElement('a');

    el.setAttribute('class', 'twitter-tweet--loading');
    el.setAttribute('align', 'center');
    el.setAttribute('data-word', word);

    link.setAttribute('href', '/' + word);
    link.textContent = word;

    el.appendChild(link);
    wrapper.appendChild(el);
    sentence.appendChild(wrapper);

    get('/' + word + '.json', function (success, data) {
      if (!success || !data.url) {
        wrapper.innerHTML = '<p class="orphan">' + word + '</p>';
        return;
      }

      el.setAttribute('class', 'twitter-tweet');
      link.setAttribute('href', data.url);
      twttr.widgets.load(wrapper);
    });
  });
});
