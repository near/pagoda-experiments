export async function botCheck() {
  let bot = true;
  const botURL = 'https://api.shard.dog/check-bot';

  const base64Info = await fetchIPDetails('8d3N9kjvn8BeUIs');

  const xhrPromise = new Promise<boolean>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', botURL, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('x-device-fingerprint', base64Info);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const responseContent = JSON.parse(xhr.responseText);
          bot = responseContent.body;
          resolve(bot);
        } else {
          reject(new Error('Error sending data to the server'));
        }
      }
    };
    const payload = JSON.stringify({});
    xhr.send(payload);
  });

  try {
    bot = await xhrPromise;
  } catch (error) {
    console.error(error);
  }

  return bot;
}

async function fetchIPDetails(apiKey: string) {
  const url = `https://pro.ip-api.com/json/?fields=17035263&key=${String(apiKey)}`;

  const response = await fetch(url);
  const data = await response.json();
  const browserInfo = getBrowserInfo();
  const osInfo = getOSVersion();
  const info = {
    browserDetails: {
      browserName: browserInfo.name,
      browserMajorVersion: browserInfo.version.split('.')[0],
      browserFullVersion: browserInfo.version,
      os: osInfo.os,
      osVersion: osInfo.osVersion,
      userAgent: navigator.userAgent,
    },
    ip: data.query,
    mobile: data.mobile,
    proxy: data.proxy,
    hosting: data.hosting,
    ipLocation: {
      timezone: data.timezone,
      city: {
        name: data.city,
      },
      country: {
        code: data.countryCode,
        name: data.country,
      },
      continent: {
        code: data.continentCode,
      },
    },
  };
  return btoa(JSON.stringify(info));
}

function getOSVersion() {
  const userAgent = window.navigator.userAgent;
  const platform = window.navigator.platform;
  let os = null;
  let osVersion = null;

  if (/Mac/.test(platform)) {
    os = 'Mac';
    osVersion = /Mac OS X ([._\d]+)/.exec(userAgent)?.[1]?.replace('_', '.');
  } else if (/Win/.test(platform)) {
    os = 'Windows';
    osVersion = /Windows NT ([._\d]+)/.exec(userAgent)?.[1];
  } else if (/Linux/.test(platform)) {
    os = 'Linux';
    osVersion = '';
  } else {
    os = 'Unknown';
    osVersion = '';
  }

  return { os, osVersion };
}

function getBrowserInfo() {
  const ua = navigator.userAgent;
  let tem;
  let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1] ?? '')) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return { name: 'IE', version: tem[1] || '' };
  }
  if (M[1] === 'Chrome') {
    tem = ua.match(/\bOPR|Edge\/(\d+)/);
    if (tem != null) {
      return { name: 'Opera', version: tem[1] || '' };
    }
  }
  M = M[2] ? [M[1] ?? '', M[2] ?? ''] : [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i)) != null) {
    M.splice(1, 1, tem[1] ?? '');
  }
  return { name: M[0], version: M[1] || '' };
}
