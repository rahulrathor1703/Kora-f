declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: {
          clientId: string;
          scope: string;
          redirectURI: string;
          usePopup: boolean;
        }) => void;
        signIn: () => Promise<{
          authorization: {
            id_token: string;
            code: string;
          };
        }>;
      };
    };
  }
}

const APPLE_SCRIPT_SRC =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';

let appleScriptPromise: Promise<void> | null = null;

function loadAppleScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Apple Sign In is only available in the browser'));
  }

  if (window.AppleID) {
    return Promise.resolve();
  }

  if (appleScriptPromise) {
    return appleScriptPromise;
  }

  appleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${APPLE_SCRIPT_SRC}"]`,
    );

    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Failed to load Apple Sign In')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = APPLE_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Apple Sign In'));
    document.head.appendChild(script);
  });

  return appleScriptPromise;
}

export async function signInWithApple(clientId: string): Promise<string> {
  await loadAppleScript();

  if (!window.AppleID) {
    throw new Error('Apple Sign In is unavailable');
  }

  window.AppleID.auth.init({
    clientId,
    scope: 'name email',
    redirectURI: window.location.origin,
    usePopup: true,
  });

  const response = await window.AppleID.auth.signIn();
  const idToken = response.authorization.id_token;

  if (!idToken) {
    throw new Error('Apple Sign In did not return an identity token');
  }

  return idToken;
}
