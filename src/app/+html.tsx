import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Root HTML document for web. `interactive-widget=resizes-content` makes mobile
 * browsers shrink the viewport when the on-screen keyboard opens, so bottom-
 * anchored inputs (chat composer, forms) stay visible instead of being covered.
 * Desktop layout is unaffected.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
        />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `html, body, #root { height: 100%; } #root { display: flex; }`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
