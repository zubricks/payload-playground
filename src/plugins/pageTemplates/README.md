# Page Templates plugin prototype

This prototype lets Site Admins build reusable Page Templates with the same fields and blocks used
by Pages. A Content Editor can choose a template and edit its content, but cannot change the parts
of the document that the project declares as structural.

## Configuration

```ts
pageTemplatesPlugin({
  collection: 'pages',
  templateFields: ['hero', 'layout', 'meta'],
  structuralFields: [
    'hero.type',
    'layout',
    'layout.content.columns',
    'layout.content.columns.*.size',
  ],
})
```

`templateFields` are the top-level fields copied into a template and exposed in its editor.

`structuralFields` are schema-aware paths. Use a block slug after a blocks field and `*` for an
array row. Registering a blocks or array field locks its row count and order; registering a select,
radio, or checkbox locks its value. All other values inside the template remain editable.

For example, a custom `featureGrid` block could use:

```ts
structuralFields: ['layout', 'layout.featureGrid.cards', 'layout.featureGrid.cards.*.width']
```

The registry drives both the Admin UI and the server-side structure fingerprint. An editor cannot
bypass a disabled control by submitting a modified request directly. Invalid or unsupported paths
fail during Payload configuration so a project cannot silently ship a partially locked template.

## Current prototype boundary

Structural controls currently support blocks, arrays, selects, radios, and checkboxes. Supporting
another field type means adding its generic locked field wrapper; it does not require adding
knowledge of a particular community block to the plugin.
