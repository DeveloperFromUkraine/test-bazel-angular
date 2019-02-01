# Untitled

##### To start this app, run:
#### Install dependency
```bash
$ yarn
```
#### For build start
```bash
$ yarn builded
```

####Error after start build
```bash
ERROR: /Users/vladimir/WebstormProjects/untitled/src/lib/messages/BUILD.bazel:12:1: Compiling TypeScript (ES5 with ES Modules) //src/lib/messages:messages failed (Exit 1) ngc-wrapped failed: error executing command bazel-out/host/bin/external/angular/packages/bazel/src/ngc-wrapped/ngc-wrapped bazel-out/darwin-fastbuild/bin/src/lib/messages/messages_esm5.tsconfig.json

Use --sandbox_debug to see verbose messages from the sandbox

Asset not found:
  ./messages.component.scss
Check that it's included in the `assets` attribute of the `ng_module` rule.

: Couldn't resolve resource ./messages.component.scss relative to /private/var/tmp/_bazel_vladimir/048e00b5f94f4645c1274f04c0bd3d6d/sandbox/darwin-sandbox/140/execroot/untitled/src/lib/messages/messages.component.ts

```
