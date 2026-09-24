# Theme hero images

Place hand-picked, production-ready hero images for custom themes in this directory.

Reference each asset from `src/brandThemes.ts`:

```ts
heroImage: {
  alt: 'A descriptive alt text for the image',
  url: '/theme-heroes/northstar.webp',
},
```

The stock Payload preset intentionally leaves `heroImage` set to `null`, so it continues to use the
hero media selected on the homepage document.
