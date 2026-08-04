// Allow importing stylesheet side-effects and CSS modules (handled by Metro on web).
declare module '*.css';

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
