// 新增文件：统一请求封装
export async function requestJson(url, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    timeoutMs = 10000,
    retries = 0,
    retryDelayBaseMs = 400,
    signal,
    credentials = 'same-origin',
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const finalSignal = mergeSignals(signal, controller.signal);

  const isFormData =
    typeof FormData !== 'undefined' && body instanceof FormData;

  const reqHeaders = {
    Accept: 'application/json',
    ...(!isFormData && body ? { 'Content-Type': 'application/json' } : {}),
    ...headers,
  };

  const reqInit = {
    method,
    headers: reqHeaders,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    credentials,
    signal: finalSignal,
  };

  try {
    const res = await fetch(url, reqInit);
    if (!res.ok) {
      // 优先解析后端的错误结构
      let message = `HTTP ${res.status}`;
      try {
        const errJson = await res.json();
        message = errJson.message || message;
      } catch (_) {
        // ignore
      }
      const err = new Error(message);
      err.status = res.status;
      throw err;
    }
    // 尝试解析 JSON
    return await res.json();
  } catch (err) {
    if (shouldRetry(err) && retries > 0) {
      await sleep(retryDelayBaseMs);
      return requestJson(url, {
        ...options,
        retries: retries - 1,
        retryDelayBaseMs: retryDelayBaseMs * 2,
      });
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetry(err) {
  if (err?.name === 'AbortError') return false; // 超时不重试（可按需开启）
  // 针对网络错误或服务端暂时性错误进行重试
  const transientStatuses = [502, 503, 504];
  return (
    err?.status ? transientStatuses.includes(err.status) : true
  );
}

function mergeSignals(signalA, signalB) {
  if (!signalA) return signalB;
  if (!signalB) return signalA;

  const controller = new AbortController();
  const onAbort = () => controller.abort();

  if (signalA.aborted || signalB.aborted) {
    controller.abort();
  } else {
    signalA.addEventListener('abort', onAbort);
    signalB.addEventListener('abort', onAbort);
  }
  return controller.signal;
}