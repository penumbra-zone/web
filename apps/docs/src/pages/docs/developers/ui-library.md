# UI Library

### Tailwind

[Tailwind CSS](https://tailwindcss.com/) is a CSS framework that provides a set of pre-designed and customizable utility classes. It allows for rapid UI development by composing classes directly in the HTML markup.

### Radix-UI

[Radix UI](https://www.radix-ui.com/) is a collection of low-level UI primitives for building high-quality, accessible user interfaces. These primitives include components like tooltips, modals, popovers, and more.

### shadcdn/ui

[shadcdn/ui](https://ui.shadcn.com/) is a set of ui components built on top of Tailwind CSS and Radix UI. It aims to simplify UI development by providing styled components that are easy to integrate into the project.

Whenever you are looking for a new component, I recommend looking first in `shadcdn/ui` and then `radix ui`.

In the `ui` package, to install a new component, the command looks like:

```bash
npx shadcn-ui@latest add badge
```

Go to the website to get them.

If you are getting stuck with turborepo config with this library, [check out this starter](https://github.com/dan5py/turborepo-shadcn-ui.git) for inspiration.
