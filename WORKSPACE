# The WORKSPACE file tells Bazel that this directory is a "workspace", which is like a project root.
# The content of this file specifies all the external dependencies Bazel needs to perform a build.

workspace(name = "untitled")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")
load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")

# GO
# https://github.com/bazelbuild/rules_go
#http_archive(
#    name = "io_bazel_rules_go",
#    url = "https://github.com/bazelbuild/rules_go/releases/download/0.16.5/rules_go-0.16.5.tar.gz",
#    sha256 = "7be7dc01f1e0afdba6c8eb2b43d2fa01c743be1b9273ab1eaf6c233df078d705"
#)
git_repository(
  name = "my_test_rules",
  remote = "git@github.com:DeveloperFromUkraine/rules_nodejs.git",
  commit = "vk-test-branch"
)

http_archive(
  name = "bazel_skylib",
  url = "https://github.com/bazelbuild/bazel-skylib/archive/0.6.0.zip",
  strip_prefix = "bazel-skylib-0.6.0",
  sha256 = "54ee22e5b9f0dd2b42eb8a6c1878dee592cfe8eb33223a7dbbc583a383f6ee1a",
)

http_archive(
 name = "bazel_toolchains",
 sha256 = "109a99384f9d08f9e75136d218ebaebc68cc810c56897aea2224c57932052d30",
 strip_prefix = "bazel-toolchains-94d31935a2c94fe7e7c7379a0f3393e181928ff7",
 urls = [
   "https://mirror.bazel.build/github.com/bazelbuild/bazel-toolchains/archive/94d31935a2c94fe7e7c7379a0f3393e181928ff7.tar.gz",
   "https://github.com/bazelbuild/bazel-toolchains/archive/94d31935a2c94fe7e7c7379a0f3393e181928ff7.tar.gz",
 ],
)

# The @angular repo contains rule for building Angular applications
ANGULAR_VERSION = "7.1.3"
http_archive(
    name = "angular",
    strip_prefix = "angular-%s" % ANGULAR_VERSION,
    url = "https://github.com/angular/angular/archive/%s.zip" % ANGULAR_VERSION,
)

# The @rxjs repo contains targets for building rxjs with bazel
RXJS_VERSION = "6.3.3"
http_archive(
    name = "rxjs",
    strip_prefix = "package/src",
    url = "https://registry.npmjs.com/rxjs/-/rxjs-%s.tgz" % RXJS_VERSION,
)

# Angular material
# NOTE: using a `7.1.1-compat-ng-7.1.3` branch of material2 on a fork here
# since Angular and rules_typescript version under Bazel checking is too strict
# at the moment.
# https://github.com/gregmagolan/material2/commit/e2090864cddf926445eefd39c7e90eada107013d
# TODO(gregmagolan): update the next release of material that is compatible with
#   Angular 7.1.3 under Bazel
http_archive(
    name = "angular_material",
    sha256 = "75bec457885ddf084219a9da152ff79831d84909bb036552141ca3aadee64a04",
    strip_prefix = "material2-7.1.1-compat-ng-7.1.3",
    url = "https://github.com/gregmagolan/material2/archive/7.1.1-compat-ng-7.1.3.zip",
)

# Rules for compiling sass
RULES_SASS_VERSION = "1.15.2"
http_archive(
    name = "io_bazel_rules_sass",
    url = "https://github.com/bazelbuild/rules_sass/archive/%s.zip" % RULES_SASS_VERSION,
    strip_prefix = "rules_sass-%s" % RULES_SASS_VERSION,
)

####################################
# Load and install our dependencies downloaded above.

load("@angular//packages/bazel:package.bzl", "rules_angular_dependencies")
rules_angular_dependencies()

load("@build_bazel_rules_typescript//:package.bzl", "rules_typescript_dependencies")
rules_typescript_dependencies()
# build_bazel_rules_nodejs is loaded transitively through rules_typescript_dependencies.

load("@my_test_rules//:package.bzl", "rules_nodejs_dependencies")
rules_nodejs_dependencies()

load("@my_test_rules//:defs.bzl", "check_bazel_version", "node_repositories", "npm_install")
# 0.18.0 is needed for .bazelignore
check_bazel_version("0.22.0")

node_repositories()

npm_install(
    name = "npm",
    package_json = "//:package.json",
#    yarn_lock = "//:yarn.lock",
    package_lock_json="//:package-lock.json"
)

#load("@io_bazel_rules_go//go:def.bzl", "go_rules_dependencies", "go_register_toolchains")
#go_rules_dependencies()
#go_register_toolchains()

#load("@io_bazel_rules_webtesting//web:repositories.bzl", "browser_repositories", "web_test_repositories")
#web_test_repositories()
#browser_repositories(chromium = True, firefox = True)

load("@build_bazel_rules_typescript//:defs.bzl", "ts_setup_workspace", "check_rules_typescript_version")
ts_setup_workspace()

load("@io_bazel_rules_sass//sass:sass_repositories.bzl", "sass_repositories")
sass_repositories()

#Angular workspace
load("@angular//:index.bzl", "ng_setup_workspace")
ng_setup_workspace()

load("@angular_material//:index.bzl", "angular_material_setup_workspace")
angular_material_setup_workspace()
