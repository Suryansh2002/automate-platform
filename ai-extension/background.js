chrome.runtime.onMessageExternal.addListener((message,sender, sendResponse) => {
  console.log(message.action);
  if (message.action === "GET_TOKEN") {
    chrome.cookies.get({ url: "https://www.instagram.com", name: "sessionid" }, (cookie) => {
      if (cookie) {
        sendResponse({ success: true, token: cookie.value });
      } else {
        sendResponse({ success: false, error: "Not logged into Instagram" });
      }
    });
    return true; // Keeps the channel open for the async cookie fetch
  }
  if (message.action == "PING") {
    sendResponse({ success: true, message: "PONG" });
    console.log("returning PONG");
    return true;
  }
});