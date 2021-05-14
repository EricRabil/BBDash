async function getCookies() {
  const cookies: chrome.cookies.Cookie[] = await new Promise(resolve => chrome.cookies.getAll({
    url: `https://learn.dcollege.net/learn/api`
  }, cookies => resolve(cookies)));

  return cookies.reduce((acc, cookie) => {
      acc[cookie.name] = cookie.value;
      return acc;
  }, {} as Record<string, string>);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "api-cookies") {
    getCookies().then(cookies => {
      console.log(cookies);
      sendResponse(cookies);
    });

    return true;
  }
})

export const x = true;