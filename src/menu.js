if (!localStorage.getItem('CurrentJiraUrl') || !localStorage.getItem('CurrentUserId')) { document.location.href = '/menu.min.html'; }
var isFirefox = typeof InstallTrigger !== 'undefined';
var isChrome = !!chrome && (!!chrome.webstore || !!chrome.identity) && !isFirefox;

function menuClicked(event) {
  openUrl(event.currentTarget.getAttribute('s-href'));
}
var replacePattern = ['chrome://newtab/', 'chrome://tabs', 'about:newtab', 'about:tabs', 'about:blank'];

var useNewUI = localStorage.getItem('useNewUI');
if (useNewUI) {
  try {
    useNewUI = JSON.parse(useNewUI).value;
  } catch (err) { useNewUI = true; }
}

function openUrl(url) {
  url = '/index' + (useNewUI ? '' : '.min') + '.html#' + (useNewUI ? '' : '!') + url;
  if (!useNewUI) { url = url.replace('sprint', 'sprintreport').replace('/settings/general', '/settings'); }

  chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
    if (tabs && tabs[0] && tabs[0].url) {
      var tab = tabs[0];
      var curUrl = tab.url;

      if (!curUrl || replacePattern.indexOf(curUrl.toLowerCase()) > -1) {
        chrome.tabs.update(tab.id, { url: url });
        window.close();
        return;
      }
    }
    if (isChrome) {
      window.open(url);
    }
    else {
      browser.tabs.create({ url: url });
    }
    window.close();
  });
}
function bindEvents() {
  var links = document.getElementsByTagName("a");
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', menuClicked);
  }
}
var menu = localStorage.getItem('menuAction');
if (menu && useNewUI) {
  try {
    menu = JSON.parse(menu);
    switch (menu.action || 1) {
      case 1:
        if (menu.menus && menu.menus.length > 0 && Array.isArray(menu.menus)) {
          var menus = document.getElementById('menus');
          var html = '';
          for (var i = 0; i < menu.menus.length; i++) {
            let m = menu.menus[i];
            html += '<li><a s-href="' + m.url + '">' + m.name + '</a></li>';
          }
          menus.innerHTML = html;
        }
      default:
        bindEvents();
        break;
      case 2: openUrl(menu.url || '/dashboard/0'); break;
      case 3:
        document.location.href = '/index.html?quick=true#/dashboard/' + (menu.index || 0) + '/1';
        break;
    }
  } catch (err) { console.error(err); bindEvents(); }
} else { bindEvents(); }
