import ChromeAPIProvider from "./api-clients/chrome";
import RestAPIProvider from "./api-clients/rest";

const apiClient = typeof chrome !== "undefined" ? ChromeAPIProvider : new RestAPIProvider();

export default apiClient;