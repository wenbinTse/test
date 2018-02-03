import GlobalLoadingIndicator from './components/shared/global-loading-indicator';

export default class HttpRequestDelegate {

  private static loadingIndicator: GlobalLoadingIndicator;

  public static bindLoadingIndicator(indicator: GlobalLoadingIndicator) {
    this.loadingIndicator = indicator;
  }

  public static get(
    url: string,
    showLoading: boolean,
    successCallback?: (data: any) => void,
    errorCallback?: () => void,
    finallyCallback?: () => void
  ) {
    this.request(url, {}, showLoading, successCallback, errorCallback, finallyCallback);
  }

  public static postJson(
    url: string,
    value: object,
    showLoading: boolean,
    successCallback?: (data: any) => void,
    errorCallback?: () => void,
    finallyCallback?: () => void
  ) {
    this.request(
      url,
      {
        body: JSON.stringify(value),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
      },
      showLoading,
      successCallback,
      errorCallback,
      finallyCallback
    );
  }

  public static postFormDate(
    url: string,
    value: FormData,
    showLoading: boolean,
    successCallback?: (data: any) => void,
    errorCallback?: () => void,
    finallyCallback?: () => void
  ) {
    this.request(
      url,
      {
        body: value,
        method: 'POST',
      },
      showLoading,
      successCallback,
      errorCallback,
      finallyCallback
    );
  }

  private static request(
    url: string,
    params: any,
    showLoading: boolean,
    successCallback?: (data: any) => void,
    errorCallback?: () => void,
    finallyCallback?: () => void
  ): void {
    if (showLoading) {
      this.loadingIndicator.start();
    }
    params.credentials = 'include';
    fetch(url, params).then((res: Response) => res.json())
      .then((data) => {
        if (successCallback) {
          successCallback(data);
        }
      })
      .catch(() => {
        if (errorCallback) {
          errorCallback();
        }
      })
      .then(() => {
        if (showLoading) {
          this.loadingIndicator.stop();
        }
        if (finallyCallback) {
          finallyCallback();
        }
      });
  }
}
