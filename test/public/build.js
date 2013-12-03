
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("microjs-q/q.js", Function("exports, require, module",
"// vim:ts=4:sts=4:sw=4:\n\
/*!\n\
 *\n\
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT\n\
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE\n\
 *\n\
 * With parts by Tyler Close\n\
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found\n\
 * at http://www.opensource.org/licenses/mit-license.html\n\
 * Forked at ref_send.js version: 2009-05-11\n\
 *\n\
 * With parts by Mark Miller\n\
 * Copyright (C) 2011 Google Inc.\n\
 *\n\
 * Licensed under the Apache License, Version 2.0 (the \"License\");\n\
 * you may not use this file except in compliance with the License.\n\
 * You may obtain a copy of the License at\n\
 *\n\
 * http://www.apache.org/licenses/LICENSE-2.0\n\
 *\n\
 * Unless required by applicable law or agreed to in writing, software\n\
 * distributed under the License is distributed on an \"AS IS\" BASIS,\n\
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n\
 * See the License for the specific language governing permissions and\n\
 * limitations under the License.\n\
 *\n\
 */\n\
\n\
(function (definition) {\n\
    // Turn off strict mode for this function so we can assign to global.Q\n\
    /*jshint strict: false*/\n\
\n\
    // This file will function properly as a <script> tag, or a module\n\
    // using CommonJS and NodeJS or RequireJS module formats.  In\n\
    // Common/Node/RequireJS, the module exports the Q API and when\n\
    // executed as a simple <script>, it creates a Q global instead.\n\
\n\
    // Montage Require\n\
    if (typeof bootstrap === \"function\") {\n\
        bootstrap(\"promise\", definition);\n\
\n\
    // CommonJS\n\
    } else if (typeof exports === \"object\") {\n\
        module.exports = definition();\n\
\n\
    // RequireJS\n\
    } else if (typeof define === \"function\") {\n\
        define(definition);\n\
\n\
    // SES (Secure EcmaScript)\n\
    } else if (typeof ses !== \"undefined\") {\n\
        if (!ses.ok()) {\n\
            return;\n\
        } else {\n\
            ses.makeQ = definition;\n\
        }\n\
\n\
    // <script>\n\
    } else {\n\
        Q = definition();\n\
    }\n\
\n\
})(function () {\n\
\"use strict\";\n\
\n\
// All code after this point will be filtered from stack traces reported\n\
// by Q.\n\
var qStartingLine = captureLine();\n\
var qFileName;\n\
\n\
// shims\n\
\n\
// used for fallback \"defend\" and in \"allResolved\"\n\
var noop = function () {};\n\
\n\
// for the security conscious, defend may be a deep freeze as provided\n\
// by cajaVM.  Otherwise we try to provide a shallow freeze just to\n\
// discourage promise changes that are not compatible with secure\n\
// usage.  If Object.freeze does not exist, fall back to doing nothing\n\
// (no op).\n\
var defend = Object.freeze || noop;\n\
if (typeof cajaVM !== \"undefined\") {\n\
    defend = cajaVM.def;\n\
}\n\
\n\
// use the fastest possible means to execute a task in a future turn\n\
// of the event loop.\n\
var nextTick;\n\
if (typeof process !== \"undefined\") {\n\
    // node\n\
    nextTick = process.nextTick;\n\
} else if (typeof setImmediate === \"function\") {\n\
    // In IE10, or use https://github.com/NobleJS/setImmediate\n\
    nextTick = setImmediate;\n\
} else if (typeof MessageChannel !== \"undefined\") {\n\
    // modern browsers\n\
    // http://www.nonblocking.io/2011/06/windownexttick.html\n\
    var channel = new MessageChannel();\n\
    // linked list of tasks (single, with head node)\n\
    var head = {}, tail = head;\n\
    channel.port1.onmessage = function () {\n\
        head = head.next;\n\
        var task = head.task;\n\
        delete head.task;\n\
        task();\n\
    };\n\
    nextTick = function (task) {\n\
        tail = tail.next = {task: task};\n\
        channel.port2.postMessage(0);\n\
    };\n\
} else {\n\
    // old browsers\n\
    nextTick = function (task) {\n\
        setTimeout(task, 0);\n\
    };\n\
}\n\
\n\
// Attempt to make generics safe in the face of downstream\n\
// modifications.\n\
// There is no situation where this is necessary.\n\
// If you need a security guarantee, these primordials need to be\n\
// deeply frozen anyway, and if you don’t need a security guarantee,\n\
// this is just plain paranoid.\n\
// However, this does have the nice side-effect of reducing the size\n\
// of the code by reducing x.call() to merely x(), eliminating many\n\
// hard-to-minify characters.\n\
// See Mark Miller’s explanation of what this does.\n\
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming\n\
var uncurryThis;\n\
// I have kept both variations because the first is theoretically\n\
// faster, if bind is available.\n\
if (Function.prototype.bind) {\n\
    var Function_bind = Function.prototype.bind;\n\
    uncurryThis = Function_bind.bind(Function_bind.call);\n\
} else {\n\
    uncurryThis = function (f) {\n\
        return function () {\n\
            return f.call.apply(f, arguments);\n\
        };\n\
    };\n\
}\n\
\n\
var array_slice = uncurryThis(Array.prototype.slice);\n\
\n\
var array_reduce = uncurryThis(\n\
    Array.prototype.reduce || function (callback, basis) {\n\
        var index = 0,\n\
            length = this.length;\n\
        // concerning the initial value, if one is not provided\n\
        if (arguments.length === 1) {\n\
            // seek to the first value in the array, accounting\n\
            // for the possibility that is is a sparse array\n\
            do {\n\
                if (index in this) {\n\
                    basis = this[index++];\n\
                    break;\n\
                }\n\
                if (++index >= length) {\n\
                    throw new TypeError();\n\
                }\n\
            } while (1);\n\
        }\n\
        // reduce\n\
        for (; index < length; index++) {\n\
            // account for the possibility that the array is sparse\n\
            if (index in this) {\n\
                basis = callback(basis, this[index], index);\n\
            }\n\
        }\n\
        return basis;\n\
    }\n\
);\n\
\n\
var array_indexOf = uncurryThis(\n\
    Array.prototype.indexOf || function (value) {\n\
        // not a very good shim, but good enough for our one use of it\n\
        for (var i = 0; i < this.length; i++) {\n\
            if (this[i] === value) {\n\
                return i;\n\
            }\n\
        }\n\
        return -1;\n\
    }\n\
);\n\
\n\
var array_map = uncurryThis(\n\
    Array.prototype.map || function (callback, thisp) {\n\
        var self = this;\n\
        var collect = [];\n\
        array_reduce(self, function (undefined, value, index) {\n\
            collect.push(callback.call(thisp, value, index, self));\n\
        }, void 0);\n\
        return collect;\n\
    }\n\
);\n\
\n\
var object_create = Object.create || function (prototype) {\n\
    function Type() { }\n\
    Type.prototype = prototype;\n\
    return new Type();\n\
};\n\
\n\
var object_keys = Object.keys || function (object) {\n\
    var keys = [];\n\
    for (var key in object) {\n\
        keys.push(key);\n\
    }\n\
    return keys;\n\
};\n\
\n\
var object_toString = Object.prototype.toString;\n\
\n\
// generator related shims\n\
\n\
function isStopIteration(exception) {\n\
    return (\n\
        object_toString(exception) === \"[object StopIteration]\" ||\n\
        exception instanceof QReturnValue\n\
    );\n\
}\n\
\n\
var QReturnValue;\n\
if (typeof ReturnValue !== \"undefined\") {\n\
    QReturnValue = ReturnValue;\n\
} else {\n\
    QReturnValue = function (value) {\n\
        this.value = value;\n\
    };\n\
}\n\
\n\
// long stack traces\n\
\n\
var STACK_JUMP_SEPARATOR = \"From previous event:\";\n\
\n\
function makeStackTraceLong(error, promise) {\n\
    // If possible (that is, if in V8), transform the error stack\n\
    // trace by removing Node and Q cruft, then concatenating with\n\
    // the stack trace of the promise we are ``done``ing. See #57.\n\
    if (promise.stack &&\n\
        typeof error === \"object\" &&\n\
        error !== null &&\n\
        error.stack &&\n\
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1\n\
    ) {\n\
        error.stack = filterStackString(error.stack) +\n\
            \"\\n\
\" + STACK_JUMP_SEPARATOR + \"\\n\
\" +\n\
            filterStackString(promise.stack);\n\
    }\n\
}\n\
\n\
function filterStackString(stackString) {\n\
    var lines = stackString.split(\"\\n\
\");\n\
    var desiredLines = [];\n\
    for (var i = 0; i < lines.length; ++i) {\n\
        var line = lines[i];\n\
\n\
        if (!isInternalFrame(line) && !isNodeFrame(line)) {\n\
            desiredLines.push(line);\n\
        }\n\
    }\n\
    return desiredLines.join(\"\\n\
\");\n\
}\n\
\n\
function isNodeFrame(stackLine) {\n\
    return stackLine.indexOf(\"(module.js:\") !== -1 ||\n\
           stackLine.indexOf(\"(node.js:\") !== -1;\n\
}\n\
\n\
function isInternalFrame(stackLine) {\n\
    var pieces = /at .+ \\((.*):(\\d+):\\d+\\)/.exec(stackLine);\n\
\n\
    if (!pieces) {\n\
        return false;\n\
    }\n\
\n\
    var fileName = pieces[1];\n\
    var lineNumber = pieces[2];\n\
\n\
    return fileName === qFileName &&\n\
        lineNumber >= qStartingLine &&\n\
        lineNumber <= qEndingLine;\n\
}\n\
\n\
// discover own file name and line number range for filtering stack\n\
// traces\n\
function captureLine() {\n\
    if (Error.captureStackTrace) {\n\
        var fileName, lineNumber;\n\
\n\
        var oldPrepareStackTrace = Error.prepareStackTrace;\n\
\n\
        Error.prepareStackTrace = function (error, frames) {\n\
            fileName = frames[1].getFileName();\n\
            lineNumber = frames[1].getLineNumber();\n\
        };\n\
\n\
        // teases call of temporary prepareStackTrace\n\
        // JSHint and Closure Compiler generate known warnings here\n\
        /*jshint expr: true */\n\
        new Error().stack;\n\
\n\
        Error.prepareStackTrace = oldPrepareStackTrace;\n\
        qFileName = fileName;\n\
        return lineNumber;\n\
    }\n\
}\n\
\n\
function deprecate(callback, name, alternative) {\n\
    return function () {\n\
        if (typeof console !== \"undefined\" && typeof console.warn === \"function\") {\n\
            console.warn(name + \" is deprecated, use \" + alternative + \" instead.\", new Error(\"\").stack);\n\
        }\n\
        return callback.apply(callback, arguments);\n\
    };\n\
}\n\
\n\
// end of shims\n\
// beginning of real work\n\
\n\
/**\n\
 * Creates fulfilled promises from non-promises,\n\
 * Passes Q promises through,\n\
 * Coerces CommonJS/Promises/A+ promises to Q promises.\n\
 */\n\
function Q(value) {\n\
    return resolve(value);\n\
}\n\
\n\
/**\n\
 * Performs a task in a future turn of the event loop.\n\
 * @param {Function} task\n\
 */\n\
Q.nextTick = nextTick;\n\
\n\
/**\n\
 * Constructs a {promise, resolve} object.\n\
 *\n\
 * The resolver is a callback to invoke with a more resolved value for the\n\
 * promise. To fulfill the promise, invoke the resolver with any value that is\n\
 * not a function. To reject the promise, invoke the resolver with a rejection\n\
 * object. To put the promise in the same state as another promise, invoke the\n\
 * resolver with that other promise.\n\
 */\n\
Q.defer = defer;\n\
function defer() {\n\
    // if \"pending\" is an \"Array\", that indicates that the promise has not yet\n\
    // been resolved.  If it is \"undefined\", it has been resolved.  Each\n\
    // element of the pending array is itself an array of complete arguments to\n\
    // forward to the resolved promise.  We coerce the resolution value to a\n\
    // promise using the ref promise because it handles both fully\n\
    // resolved values and other promises gracefully.\n\
    var pending = [], progressListeners = [], value;\n\
\n\
    var deferred = object_create(defer.prototype);\n\
    var promise = object_create(makePromise.prototype);\n\
\n\
    promise.promiseDispatch = function (resolve, op, operands) {\n\
        var args = array_slice(arguments);\n\
        if (pending) {\n\
            pending.push(args);\n\
            if (op === \"when\" && operands[1]) { // progress operand\n\
                progressListeners.push(operands[1]);\n\
            }\n\
        } else {\n\
            nextTick(function () {\n\
                value.promiseDispatch.apply(value, args);\n\
            });\n\
        }\n\
    };\n\
\n\
    promise.valueOf = function () {\n\
        if (pending) {\n\
            return promise;\n\
        }\n\
        return value.valueOf();\n\
    };\n\
\n\
    if (Error.captureStackTrace) {\n\
        Error.captureStackTrace(promise, defer);\n\
\n\
        // Reify the stack into a string by using the accessor; this prevents\n\
        // memory leaks as per GH-111. At the same time, cut off the first line;\n\
        // it's always just \"[object Promise]\\n\
\", as per the `toString`.\n\
        promise.stack = promise.stack.substring(promise.stack.indexOf(\"\\n\
\") + 1);\n\
    }\n\
\n\
    function become(resolvedValue) {\n\
        if (!pending) {\n\
            return;\n\
        }\n\
        value = resolve(resolvedValue);\n\
        array_reduce(pending, function (undefined, pending) {\n\
            nextTick(function () {\n\
                value.promiseDispatch.apply(value, pending);\n\
            });\n\
        }, void 0);\n\
        pending = void 0;\n\
        progressListeners = void 0;\n\
    }\n\
\n\
    defend(promise);\n\
\n\
    deferred.promise = promise;\n\
    deferred.resolve = become;\n\
    deferred.fulfill = function (value) {\n\
        become(fulfill(value));\n\
    };\n\
    deferred.reject = function (exception) {\n\
        become(reject(exception));\n\
    };\n\
    deferred.notify = function (progress) {\n\
        if (pending) {\n\
            array_reduce(progressListeners, function (undefined, progressListener) {\n\
                nextTick(function () {\n\
                    progressListener(progress);\n\
                });\n\
            }, void 0);\n\
        }\n\
    };\n\
\n\
    return deferred;\n\
}\n\
\n\
/**\n\
 * Creates a Node-style callback that will resolve or reject the deferred\n\
 * promise.\n\
 * @returns a nodeback\n\
 */\n\
defer.prototype.makeNodeResolver = function () {\n\
    var self = this;\n\
    return function (error, value) {\n\
        if (error) {\n\
            self.reject(error);\n\
        } else if (arguments.length > 2) {\n\
            self.resolve(array_slice(arguments, 1));\n\
        } else {\n\
            self.resolve(value);\n\
        }\n\
    };\n\
};\n\
\n\
/**\n\
 * @param makePromise {Function} a function that returns nothing and accepts\n\
 * the resolve, reject, and notify functions for a deferred.\n\
 * @returns a promise that may be resolved with the given resolve and reject\n\
 * functions, or rejected by a thrown exception in makePromise\n\
 */\n\
Q.promise = promise;\n\
function promise(makePromise) {\n\
    var deferred = defer();\n\
    fcall(\n\
        makePromise,\n\
        deferred.resolve,\n\
        deferred.reject,\n\
        deferred.notify\n\
    ).fail(deferred.reject);\n\
    return deferred.promise;\n\
}\n\
\n\
/**\n\
 * Constructs a Promise with a promise descriptor object and optional fallback\n\
 * function.  The descriptor contains methods like when(rejected), get(name),\n\
 * put(name, value), post(name, args), and delete(name), which all\n\
 * return either a value, a promise for a value, or a rejection.  The fallback\n\
 * accepts the operation name, a resolver, and any further arguments that would\n\
 * have been forwarded to the appropriate method above had a method been\n\
 * provided with the proper name.  The API makes no guarantees about the nature\n\
 * of the returned object, apart from that it is usable whereever promises are\n\
 * bought and sold.\n\
 */\n\
Q.makePromise = makePromise;\n\
function makePromise(descriptor, fallback, valueOf, exception) {\n\
    if (fallback === void 0) {\n\
        fallback = function (op) {\n\
            return reject(new Error(\"Promise does not support operation: \" + op));\n\
        };\n\
    }\n\
\n\
    var promise = object_create(makePromise.prototype);\n\
\n\
    promise.promiseDispatch = function (resolve, op, args) {\n\
        var result;\n\
        try {\n\
            if (descriptor[op]) {\n\
                result = descriptor[op].apply(promise, args);\n\
            } else {\n\
                result = fallback.call(promise, op, args);\n\
            }\n\
        } catch (exception) {\n\
            result = reject(exception);\n\
        }\n\
        if (resolve) {\n\
            resolve(result);\n\
        }\n\
    };\n\
\n\
    if (valueOf) {\n\
        promise.valueOf = valueOf;\n\
    }\n\
\n\
    if (exception) {\n\
        promise.exception = exception;\n\
    }\n\
\n\
    defend(promise);\n\
\n\
    return promise;\n\
}\n\
\n\
// provide thenables, CommonJS/Promises/A\n\
makePromise.prototype.then = function (fulfilled, rejected, progressed) {\n\
    return when(this, fulfilled, rejected, progressed);\n\
};\n\
\n\
makePromise.prototype.thenResolve = function (value) {\n\
    return when(this, function () { return value; });\n\
};\n\
\n\
// Chainable methods\n\
array_reduce(\n\
    [\n\
        \"isResolved\", \"isFulfilled\", \"isRejected\",\n\
        \"dispatch\",\n\
        \"when\", \"spread\",\n\
        \"get\", \"put\", \"set\", \"del\", \"delete\",\n\
        \"post\", \"send\",\n\
        \"invoke\", // XXX deprecated\n\
        \"keys\",\n\
        \"fapply\", \"fcall\", \"fbind\",\n\
        \"all\", \"allResolved\",\n\
        \"timeout\", \"delay\",\n\
        \"catch\", \"finally\", \"fail\", \"fin\", \"progress\", \"done\",\n\
        \"nfcall\", \"nfapply\", \"nfbind\",\n\
        \"ncall\", \"napply\", \"nbind\",\n\
        \"npost\", \"nsend\",\n\
        \"ninvoke\", // XXX deprecated\n\
        \"nodeify\"\n\
    ],\n\
    function (undefined, name) {\n\
        makePromise.prototype[name] = function () {\n\
            return Q[name].apply(\n\
                Q,\n\
                [this].concat(array_slice(arguments))\n\
            );\n\
        };\n\
    },\n\
    void 0\n\
);\n\
\n\
makePromise.prototype.toSource = function () {\n\
    return this.toString();\n\
};\n\
\n\
makePromise.prototype.toString = function () {\n\
    return \"[object Promise]\";\n\
};\n\
\n\
defend(makePromise.prototype);\n\
\n\
/**\n\
 * If an object is not a promise, it is as \"near\" as possible.\n\
 * If a promise is rejected, it is as \"near\" as possible too.\n\
 * If it’s a fulfilled promise, the fulfillment value is nearer.\n\
 * If it’s a deferred promise and the deferred has been resolved, the\n\
 * resolution is \"nearer\".\n\
 * @param object\n\
 * @returns most resolved (nearest) form of the object\n\
 */\n\
Q.nearer = valueOf;\n\
function valueOf(value) {\n\
    if (isPromise(value)) {\n\
        return value.valueOf();\n\
    }\n\
    return value;\n\
}\n\
\n\
/**\n\
 * @returns whether the given object is a promise.\n\
 * Otherwise it is a fulfilled value.\n\
 */\n\
Q.isPromise = isPromise;\n\
function isPromise(object) {\n\
    return object && typeof object.promiseDispatch === \"function\";\n\
}\n\
\n\
Q.isPromiseAlike = isPromiseAlike;\n\
function isPromiseAlike(object) {\n\
    return object && typeof object.then === \"function\";\n\
}\n\
\n\
/**\n\
 * @returns whether the given object is a resolved promise.\n\
 */\n\
Q.isResolved = isResolved;\n\
function isResolved(object) {\n\
    return isFulfilled(object) || isRejected(object);\n\
}\n\
\n\
/**\n\
 * @returns whether the given object is a value or fulfilled\n\
 * promise.\n\
 */\n\
Q.isFulfilled = isFulfilled;\n\
function isFulfilled(object) {\n\
    return !isPromiseAlike(valueOf(object));\n\
}\n\
\n\
/**\n\
 * @returns whether the given object is a rejected promise.\n\
 */\n\
Q.isRejected = isRejected;\n\
function isRejected(object) {\n\
    object = valueOf(object);\n\
    return isPromise(object) && 'exception' in object;\n\
}\n\
\n\
var rejections = [];\n\
var errors = [];\n\
var errorsDisplayed;\n\
function displayErrors() {\n\
    if (\n\
        !errorsDisplayed &&\n\
        typeof window !== \"undefined\" &&\n\
        !window.Touch &&\n\
        window.console\n\
    ) {\n\
        // This promise library consumes exceptions thrown in handlers so\n\
        // they can be handled by a subsequent promise.  The rejected\n\
        // promises get added to this array when they are created, and\n\
        // removed when they are handled.\n\
        console.log(\"Should be empty:\", errors);\n\
    }\n\
    errorsDisplayed = true;\n\
}\n\
\n\
/**\n\
 * Constructs a rejected promise.\n\
 * @param exception value describing the failure\n\
 */\n\
Q.reject = reject;\n\
function reject(exception) {\n\
    var rejection = makePromise({\n\
        \"when\": function (rejected) {\n\
            // note that the error has been handled\n\
            if (rejected) {\n\
                var at = array_indexOf(rejections, this);\n\
                if (at !== -1) {\n\
                    errors.splice(at, 1);\n\
                    rejections.splice(at, 1);\n\
                }\n\
            }\n\
            return rejected ? rejected(exception) : reject(exception);\n\
        }\n\
    }, function fallback() {\n\
        return reject(exception);\n\
    }, function valueOf() {\n\
        return this;\n\
    }, exception);\n\
    // note that the error has not been handled\n\
    displayErrors();\n\
    rejections.push(rejection);\n\
    errors.push(exception);\n\
    return rejection;\n\
}\n\
\n\
/**\n\
 * Constructs a fulfilled promise for an immediate reference.\n\
 * @param value immediate reference\n\
 */\n\
Q.fulfill = fulfill;\n\
function fulfill(object) {\n\
    return makePromise({\n\
        \"when\": function () {\n\
            return object;\n\
        },\n\
        \"get\": function (name) {\n\
            return object[name];\n\
        },\n\
        \"set\": function (name, value) {\n\
            object[name] = value;\n\
            return object;\n\
        },\n\
        \"delete\": function (name) {\n\
            delete object[name];\n\
            return object;\n\
        },\n\
        \"post\": function (name, value) {\n\
            return object[name].apply(object, value);\n\
        },\n\
        \"apply\": function (args) {\n\
            return object.apply(void 0, args);\n\
        },\n\
        \"keys\": function () {\n\
            return object_keys(object);\n\
        }\n\
    }, void 0, function valueOf() {\n\
        return object;\n\
    });\n\
}\n\
\n\
/**\n\
 * Constructs a promise for an immediate reference, passes promises through, or\n\
 * coerces promises from different systems.\n\
 * @param value immediate reference or promise\n\
 */\n\
Q.resolve = resolve;\n\
function resolve(value) {\n\
    // If the object is already a Promise, return it directly.  This enables\n\
    // the resolve function to both be used to created references from objects,\n\
    // but to tolerably coerce non-promises to promises.\n\
    if (isPromise(value)) {\n\
        return value;\n\
    }\n\
    // In order to break infinite recursion or loops between `then` and\n\
    // `resolve`, it is necessary to attempt to extract fulfilled values\n\
    // out of foreign promise implementations before attempting to wrap\n\
    // them as unresolved promises.  It is my hope that other\n\
    // implementations will implement `valueOf` to synchronously extract\n\
    // the fulfillment value from their fulfilled promises.  If the\n\
    // other promise library does not implement `valueOf`, the\n\
    // implementations on primordial prototypes are harmless.\n\
    value = valueOf(value);\n\
    // assimilate thenables, CommonJS/Promises/A+\n\
    if (isPromiseAlike(value)) {\n\
        return coerce(value);\n\
    } else {\n\
        return fulfill(value);\n\
    }\n\
}\n\
\n\
/**\n\
 * Converts thenables to Q promises.\n\
 * @param promise thenable promise\n\
 * @returns a Q promise\n\
 */\n\
function coerce(promise) {\n\
    var deferred = defer();\n\
    promise.then(deferred.resolve, deferred.reject, deferred.notify);\n\
    return deferred.promise;\n\
}\n\
\n\
/**\n\
 * Annotates an object such that it will never be\n\
 * transferred away from this process over any promise\n\
 * communication channel.\n\
 * @param object\n\
 * @returns promise a wrapping of that object that\n\
 * additionally responds to the \"isDef\" message\n\
 * without a rejection.\n\
 */\n\
Q.master = master;\n\
function master(object) {\n\
    return makePromise({\n\
        \"isDef\": function () {}\n\
    }, function fallback(op, args) {\n\
        return dispatch(object, op, args);\n\
    }, function () {\n\
        return valueOf(object);\n\
    });\n\
}\n\
\n\
/**\n\
 * Registers an observer on a promise.\n\
 *\n\
 * Guarantees:\n\
 *\n\
 * 1. that fulfilled and rejected will be called only once.\n\
 * 2. that either the fulfilled callback or the rejected callback will be\n\
 *    called, but not both.\n\
 * 3. that fulfilled and rejected will not be called in this turn.\n\
 *\n\
 * @param value      promise or immediate reference to observe\n\
 * @param fulfilled  function to be called with the fulfilled value\n\
 * @param rejected   function to be called with the rejection exception\n\
 * @param progressed function to be called on any progress notifications\n\
 * @return promise for the return value from the invoked callback\n\
 */\n\
Q.when = when;\n\
function when(value, fulfilled, rejected, progressed) {\n\
    var deferred = defer();\n\
    var done = false;   // ensure the untrusted promise makes at most a\n\
                        // single call to one of the callbacks\n\
\n\
    function _fulfilled(value) {\n\
        try {\n\
            return typeof fulfilled === \"function\" ? fulfilled(value) : value;\n\
        } catch (exception) {\n\
            return reject(exception);\n\
        }\n\
    }\n\
\n\
    function _rejected(exception) {\n\
        if (typeof rejected === \"function\") {\n\
            makeStackTraceLong(exception, resolvedValue);\n\
            try {\n\
                return rejected(exception);\n\
            } catch (newException) {\n\
                return reject(newException);\n\
            }\n\
        }\n\
        return reject(exception);\n\
    }\n\
\n\
    function _progressed(value) {\n\
        return typeof progressed === \"function\" ? progressed(value) : value;\n\
    }\n\
\n\
    var resolvedValue = resolve(value);\n\
    nextTick(function () {\n\
        resolvedValue.promiseDispatch(function (value) {\n\
            if (done) {\n\
                return;\n\
            }\n\
            done = true;\n\
\n\
            deferred.resolve(_fulfilled(value));\n\
        }, \"when\", [function (exception) {\n\
            if (done) {\n\
                return;\n\
            }\n\
            done = true;\n\
\n\
            deferred.resolve(_rejected(exception));\n\
        }]);\n\
    });\n\
\n\
    // Progress propagator need to be attached in the current tick.\n\
    resolvedValue.promiseDispatch(void 0, \"when\", [void 0, function (value) {\n\
        var newValue;\n\
        var threw = false;\n\
        try {\n\
            newValue = _progressed(value);\n\
        } catch (e) {\n\
            threw = true;\n\
            if (Q.onerror) {\n\
                Q.onerror(e);\n\
            } else {\n\
                throw e;\n\
            }\n\
        }\n\
\n\
        if (!threw) {\n\
            deferred.notify(newValue);\n\
        }\n\
    }]);\n\
\n\
    return deferred.promise;\n\
}\n\
\n\
/**\n\
 * Spreads the values of a promised array of arguments into the\n\
 * fulfillment callback.\n\
 * @param fulfilled callback that receives variadic arguments from the\n\
 * promised array\n\
 * @param rejected callback that receives the exception if the promise\n\
 * is rejected.\n\
 * @returns a promise for the return value or thrown exception of\n\
 * either callback.\n\
 */\n\
Q.spread = spread;\n\
function spread(promise, fulfilled, rejected) {\n\
    return when(promise, function (valuesOrPromises) {\n\
        return all(valuesOrPromises).then(function (values) {\n\
            return fulfilled.apply(void 0, values);\n\
        }, rejected);\n\
    }, rejected);\n\
}\n\
\n\
/**\n\
 * The async function is a decorator for generator functions, turning\n\
 * them into asynchronous generators.  This presently only works in\n\
 * Firefox/Spidermonkey, however, this code does not cause syntax\n\
 * errors in older engines.  This code should continue to work and\n\
 * will in fact improve over time as the language improves.\n\
 *\n\
 * Decorates a generator function such that:\n\
 *  - it may yield promises\n\
 *  - execution will continue when that promise is fulfilled\n\
 *  - the value of the yield expression will be the fulfilled value\n\
 *  - it returns a promise for the return value (when the generator\n\
 *    stops iterating)\n\
 *  - the decorated function returns a promise for the return value\n\
 *    of the generator or the first rejected promise among those\n\
 *    yielded.\n\
 *  - if an error is thrown in the generator, it propagates through\n\
 *    every following yield until it is caught, or until it escapes\n\
 *    the generator function altogether, and is translated into a\n\
 *    rejection for the promise returned by the decorated generator.\n\
 *  - in present implementations of generators, when a generator\n\
 *    function is complete, it throws ``StopIteration``, ``return`` is\n\
 *    a syntax error in the presence of ``yield``, so there is no\n\
 *    observable return value. There is a proposal[1] to add support\n\
 *    for ``return``, which would permit the value to be carried by a\n\
 *    ``StopIteration`` instance, in which case it would fulfill the\n\
 *    promise returned by the asynchronous generator.  This can be\n\
 *    emulated today by throwing StopIteration explicitly with a value\n\
 *    property.\n\
 *\n\
 *  [1]: http://wiki.ecmascript.org/doku.php?id=strawman:async_functions#reference_implementation\n\
 *\n\
 */\n\
Q.async = async;\n\
function async(makeGenerator) {\n\
    return function () {\n\
        // when verb is \"send\", arg is a value\n\
        // when verb is \"throw\", arg is an exception\n\
        function continuer(verb, arg) {\n\
            var result;\n\
            try {\n\
                result = generator[verb](arg);\n\
            } catch (exception) {\n\
                if (isStopIteration(exception)) {\n\
                    return exception.value;\n\
                } else {\n\
                    return reject(exception);\n\
                }\n\
            }\n\
            return when(result, callback, errback);\n\
        }\n\
        var generator = makeGenerator.apply(this, arguments);\n\
        var callback = continuer.bind(continuer, \"send\");\n\
        var errback = continuer.bind(continuer, \"throw\");\n\
        return callback();\n\
    };\n\
}\n\
\n\
/**\n\
 * Throws a ReturnValue exception to stop an asynchronous generator.\n\
 * Only useful presently in Firefox/SpiderMonkey since generators are\n\
 * implemented.\n\
 * @param value the return value for the surrounding generator\n\
 * @throws ReturnValue exception with the value.\n\
 * @example\n\
 * Q.async(function () {\n\
 *      var foo = yield getFooPromise();\n\
 *      var bar = yield getBarPromise();\n\
 *      Q.return(foo + bar);\n\
 * })\n\
 */\n\
Q['return'] = _return;\n\
function _return(value) {\n\
    throw new QReturnValue(value);\n\
}\n\
\n\
/**\n\
 * The promised function decorator ensures that any promise arguments\n\
 * are resolved and passed as values (`this` is also resolved and passed\n\
 * as a value).  It will also ensure that the result of a function is\n\
 * always a promise.\n\
 *\n\
 * @example\n\
 * var add = Q.promised(function (a, b) {\n\
 *     return a + b;\n\
 * });\n\
 * add(Q.resolve(a), Q.resolve(B));\n\
 *\n\
 * @param {function} callback The function to decorate\n\
 * @returns {function} a function that has been decorated.\n\
 */\n\
Q.promised = promised;\n\
function promised(callback) {\n\
    return function () {\n\
        return spread([this, all(arguments)], function (self, args) {\n\
            return callback.apply(self, args);\n\
        });\n\
    };\n\
}\n\
\n\
/**\n\
 * sends a message to a value in a future turn\n\
 * @param object* the recipient\n\
 * @param op the name of the message operation, e.g., \"when\",\n\
 * @param args further arguments to be forwarded to the operation\n\
 * @returns result {Promise} a promise for the result of the operation\n\
 */\n\
Q.dispatch = dispatch;\n\
function dispatch(object, op, args) {\n\
    var deferred = defer();\n\
    nextTick(function () {\n\
        resolve(object).promiseDispatch(deferred.resolve, op, args);\n\
    });\n\
    return deferred.promise;\n\
}\n\
\n\
/**\n\
 * Constructs a promise method that can be used to safely observe resolution of\n\
 * a promise for an arbitrarily named method like \"propfind\" in a future turn.\n\
 *\n\
 * \"dispatcher\" constructs methods like \"get(promise, name)\" and \"put(promise)\".\n\
 */\n\
Q.dispatcher = dispatcher;\n\
function dispatcher(op) {\n\
    return function (object) {\n\
        var args = array_slice(arguments, 1);\n\
        return dispatch(object, op, args);\n\
    };\n\
}\n\
\n\
/**\n\
 * Gets the value of a property in a future turn.\n\
 * @param object    promise or immediate reference for target object\n\
 * @param name      name of property to get\n\
 * @return promise for the property value\n\
 */\n\
Q.get = dispatcher(\"get\");\n\
\n\
/**\n\
 * Sets the value of a property in a future turn.\n\
 * @param object    promise or immediate reference for object object\n\
 * @param name      name of property to set\n\
 * @param value     new value of property\n\
 * @return promise for the return value\n\
 */\n\
Q.put = // XXX deprecated\n\
Q.set = dispatcher(\"set\");\n\
\n\
/**\n\
 * Deletes a property in a future turn.\n\
 * @param object    promise or immediate reference for target object\n\
 * @param name      name of property to delete\n\
 * @return promise for the return value\n\
 */\n\
Q[\"delete\"] = // XXX experimental\n\
Q.del = dispatcher(\"delete\");\n\
\n\
/**\n\
 * Invokes a method in a future turn.\n\
 * @param object    promise or immediate reference for target object\n\
 * @param name      name of method to invoke\n\
 * @param value     a value to post, typically an array of\n\
 *                  invocation arguments for promises that\n\
 *                  are ultimately backed with `resolve` values,\n\
 *                  as opposed to those backed with URLs\n\
 *                  wherein the posted value can be any\n\
 *                  JSON serializable object.\n\
 * @return promise for the return value\n\
 */\n\
// bound locally because it is used by other methods\n\
var post = Q.post = dispatcher(\"post\");\n\
\n\
/**\n\
 * Invokes a method in a future turn.\n\
 * @param object    promise or immediate reference for target object\n\
 * @param name      name of method to invoke\n\
 * @param ...args   array of invocation arguments\n\
 * @return promise for the return value\n\
 */\n\
Q.send = function (value, name) {\n\
    var args = array_slice(arguments, 2);\n\
    return post(value, name, args);\n\
};\n\
// XXX deprecated\n\
Q.invoke = deprecate(Q.send, \"invoke\", \"send\");\n\
\n\
/**\n\
 * Applies the promised function in a future turn.\n\
 * @param object    promise or immediate reference for target function\n\
 * @param args      array of application arguments\n\
 */\n\
var fapply = Q.fapply = dispatcher(\"apply\");\n\
\n\
/**\n\
 * Calls the promised function in a future turn.\n\
 * @param object    promise or immediate reference for target function\n\
 * @param ...args   array of application arguments\n\
 */\n\
Q[\"try\"] = fcall; // XXX experimental\n\
Q.fcall = fcall;\n\
function fcall(value) {\n\
    var args = array_slice(arguments, 1);\n\
    return fapply(value, args);\n\
}\n\
\n\
/**\n\
 * Binds the promised function, transforming return values into a fulfilled\n\
 * promise and thrown errors into a rejected one.\n\
 * @param object    promise or immediate reference for target function\n\
 * @param ...args   array of application arguments\n\
 */\n\
Q.fbind = fbind;\n\
function fbind(value) {\n\
    var args = array_slice(arguments, 1);\n\
    return function fbound() {\n\
        var allArgs = args.concat(array_slice(arguments));\n\
        return fapply(value, allArgs);\n\
    };\n\
}\n\
\n\
/**\n\
 * Requests the names of the owned properties of a promised\n\
 * object in a future turn.\n\
 * @param object    promise or immediate reference for target object\n\
 * @return promise for the keys of the eventually resolved object\n\
 */\n\
Q.keys = dispatcher(\"keys\");\n\
\n\
/**\n\
 * Turns an array of promises into a promise for an array.  If any of\n\
 * the promises gets rejected, the whole array is rejected immediately.\n\
 * @param {Array*} an array (or promise for an array) of values (or\n\
 * promises for values)\n\
 * @returns a promise for an array of the corresponding values\n\
 */\n\
// By Mark Miller\n\
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled\n\
Q.all = all;\n\
function all(promises) {\n\
    return when(promises, function (promises) {\n\
        var countDown = promises.length;\n\
        if (countDown === 0) {\n\
            return resolve(promises);\n\
        }\n\
        var deferred = defer();\n\
        array_reduce(promises, function (undefined, promise, index) {\n\
            if (isFulfilled(promise)) {\n\
                promises[index] = valueOf(promise);\n\
                if (--countDown === 0) {\n\
                    deferred.resolve(promises);\n\
                }\n\
            } else {\n\
                when(promise, function (value) {\n\
                    promises[index] = value;\n\
                    if (--countDown === 0) {\n\
                        deferred.resolve(promises);\n\
                    }\n\
                })\n\
                .fail(deferred.reject);\n\
            }\n\
        }, void 0);\n\
        return deferred.promise;\n\
    });\n\
}\n\
\n\
/**\n\
 * Waits for all promises to be resolved, either fulfilled or\n\
 * rejected.  This is distinct from `all` since that would stop\n\
 * waiting at the first rejection.  The promise returned by\n\
 * `allResolved` will never be rejected.\n\
 * @param promises a promise for an array (or an array) of promises\n\
 * (or values)\n\
 * @return a promise for an array of promises\n\
 */\n\
Q.allResolved = allResolved;\n\
function allResolved(promises) {\n\
    return when(promises, function (promises) {\n\
        return when(all(array_map(promises, function (promise) {\n\
            return when(promise, noop, noop);\n\
        })), function () {\n\
            return array_map(promises, resolve);\n\
        });\n\
    });\n\
}\n\
\n\
/**\n\
 * Captures the failure of a promise, giving an oportunity to recover\n\
 * with a callback.  If the given promise is fulfilled, the returned\n\
 * promise is fulfilled.\n\
 * @param {Any*} promise for something\n\
 * @param {Function} callback to fulfill the returned promise if the\n\
 * given promise is rejected\n\
 * @returns a promise for the return value of the callback\n\
 */\n\
Q[\"catch\"] = // XXX experimental\n\
Q.fail = fail;\n\
function fail(promise, rejected) {\n\
    return when(promise, void 0, rejected);\n\
}\n\
\n\
/**\n\
 * Attaches a listener that can respond to progress notifications from a\n\
 * promise's originating deferred. This listener receives the exact arguments\n\
 * passed to ``deferred.notify``.\n\
 * @param {Any*} promise for something\n\
 * @param {Function} callback to receive any progress notifications\n\
 * @returns the given promise, unchanged\n\
 */\n\
Q.progress = progress;\n\
function progress(promise, progressed) {\n\
    return when(promise, void 0, void 0, progressed);\n\
}\n\
\n\
/**\n\
 * Provides an opportunity to observe the rejection of a promise,\n\
 * regardless of whether the promise is fulfilled or rejected.  Forwards\n\
 * the resolution to the returned promise when the callback is done.\n\
 * The callback can return a promise to defer completion.\n\
 * @param {Any*} promise\n\
 * @param {Function} callback to observe the resolution of the given\n\
 * promise, takes no arguments.\n\
 * @returns a promise for the resolution of the given promise when\n\
 * ``fin`` is done.\n\
 */\n\
Q[\"finally\"] = // XXX experimental\n\
Q.fin = fin;\n\
function fin(promise, callback) {\n\
    return when(promise, function (value) {\n\
        return when(callback(), function () {\n\
            return value;\n\
        });\n\
    }, function (exception) {\n\
        return when(callback(), function () {\n\
            return reject(exception);\n\
        });\n\
    });\n\
}\n\
\n\
/**\n\
 * Terminates a chain of promises, forcing rejections to be\n\
 * thrown as exceptions.\n\
 * @param {Any*} promise at the end of a chain of promises\n\
 * @returns nothing\n\
 */\n\
Q.done = done;\n\
function done(promise, fulfilled, rejected, progress) {\n\
    var onUnhandledError = function (error) {\n\
        // forward to a future turn so that ``when``\n\
        // does not catch it and turn it into a rejection.\n\
        nextTick(function () {\n\
            makeStackTraceLong(error, promise);\n\
\n\
            if (Q.onerror) {\n\
                Q.onerror(error);\n\
            } else {\n\
                throw error;\n\
            }\n\
        });\n\
    };\n\
\n\
    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.\n\
    var promiseToHandle = fulfilled || rejected || progress ?\n\
        when(promise, fulfilled, rejected, progress) :\n\
        promise;\n\
\n\
    if (typeof process === \"object\" && process && process.domain) {\n\
        onUnhandledError = process.domain.bind(onUnhandledError);\n\
    }\n\
    fail(promiseToHandle, onUnhandledError);\n\
}\n\
\n\
/**\n\
 * Causes a promise to be rejected if it does not get fulfilled before\n\
 * some milliseconds time out.\n\
 * @param {Any*} promise\n\
 * @param {Number} milliseconds timeout\n\
 * @returns a promise for the resolution of the given promise if it is\n\
 * fulfilled before the timeout, otherwise rejected.\n\
 */\n\
Q.timeout = timeout;\n\
function timeout(promise, ms) {\n\
    var deferred = defer();\n\
    var timeoutId = setTimeout(function () {\n\
        deferred.reject(new Error(\"Timed out after \" + ms + \" ms\"));\n\
    }, ms);\n\
\n\
    when(promise, function (value) {\n\
        clearTimeout(timeoutId);\n\
        deferred.resolve(value);\n\
    }, function (exception) {\n\
        clearTimeout(timeoutId);\n\
        deferred.reject(exception);\n\
    });\n\
\n\
    return deferred.promise;\n\
}\n\
\n\
/**\n\
 * Returns a promise for the given value (or promised value) after some\n\
 * milliseconds.\n\
 * @param {Any*} promise\n\
 * @param {Number} milliseconds\n\
 * @returns a promise for the resolution of the given promise after some\n\
 * time has elapsed.\n\
 */\n\
Q.delay = delay;\n\
function delay(promise, timeout) {\n\
    if (timeout === void 0) {\n\
        timeout = promise;\n\
        promise = void 0;\n\
    }\n\
    var deferred = defer();\n\
    setTimeout(function () {\n\
        deferred.resolve(promise);\n\
    }, timeout);\n\
    return deferred.promise;\n\
}\n\
\n\
/**\n\
 * Passes a continuation to a Node function, which is called with the given\n\
 * arguments provided as an array, and returns a promise.\n\
 *\n\
 *      Q.nfapply(FS.readFile, [__filename])\n\
 *      .then(function (content) {\n\
 *      })\n\
 *\n\
 */\n\
Q.nfapply = nfapply;\n\
function nfapply(callback, args) {\n\
    var nodeArgs = array_slice(args);\n\
    var deferred = defer();\n\
    nodeArgs.push(deferred.makeNodeResolver());\n\
\n\
    fapply(callback, nodeArgs).fail(deferred.reject);\n\
    return deferred.promise;\n\
}\n\
\n\
/**\n\
 * Passes a continuation to a Node function, which is called with the given\n\
 * arguments provided individually, and returns a promise.\n\
 *\n\
 *      Q.nfcall(FS.readFile, __filename)\n\
 *      .then(function (content) {\n\
 *      })\n\
 *\n\
 */\n\
Q.nfcall = nfcall;\n\
function nfcall(callback/*, ...args */) {\n\
    var nodeArgs = array_slice(arguments, 1);\n\
    var deferred = defer();\n\
    nodeArgs.push(deferred.makeNodeResolver());\n\
\n\
    fapply(callback, nodeArgs).fail(deferred.reject);\n\
    return deferred.promise;\n\
}\n\
\n\
/**\n\
 * Wraps a NodeJS continuation passing function and returns an equivalent\n\
 * version that returns a promise.\n\
 *\n\
 *      Q.nfbind(FS.readFile, __filename)(\"utf-8\")\n\
 *      .then(console.log)\n\
 *      .done()\n\
 *\n\
 */\n\
Q.nfbind = nfbind;\n\
function nfbind(callback/*, ...args */) {\n\
    var baseArgs = array_slice(arguments, 1);\n\
    return function () {\n\
        var nodeArgs = baseArgs.concat(array_slice(arguments));\n\
        var deferred = defer();\n\
        nodeArgs.push(deferred.makeNodeResolver());\n\
\n\
        fapply(callback, nodeArgs).fail(deferred.reject);\n\
        return deferred.promise;\n\
    };\n\
}\n\
\n\
/**\n\
 * Calls a method of a Node-style object that accepts a Node-style\n\
 * callback with a given array of arguments, plus a provided callback.\n\
 * @param object an object that has the named method\n\
 * @param {String} name name of the method of object\n\
 * @param {Array} args arguments to pass to the method; the callback\n\
 * will be provided by Q and appended to these arguments.\n\
 * @returns a promise for the value or error\n\
 */\n\
Q.npost = npost;\n\
function npost(object, name, args) {\n\
    var nodeArgs = array_slice(args);\n\
    var deferred = defer();\n\
    nodeArgs.push(deferred.makeNodeResolver());\n\
\n\
    post(object, name, nodeArgs).fail(deferred.reject);\n\
    return deferred.promise;\n\
}\n\
\n\
/**\n\
 * Calls a method of a Node-style object that accepts a Node-style\n\
 * callback, forwarding the given variadic arguments, plus a provided\n\
 * callback argument.\n\
 * @param object an object that has the named method\n\
 * @param {String} name name of the method of object\n\
 * @param ...args arguments to pass to the method; the callback will\n\
 * be provided by Q and appended to these arguments.\n\
 * @returns a promise for the value or error\n\
 */\n\
Q.nsend = nsend;\n\
function nsend(object, name /*, ...args*/) {\n\
    var nodeArgs = array_slice(arguments, 2);\n\
    var deferred = defer();\n\
    nodeArgs.push(deferred.makeNodeResolver());\n\
    post(object, name, nodeArgs).fail(deferred.reject);\n\
    return deferred.promise;\n\
}\n\
// XXX deprecated\n\
Q.ninvoke = deprecate(nsend, \"ninvoke\", \"nsend\");\n\
\n\
Q.nodeify = nodeify;\n\
function nodeify(promise, nodeback) {\n\
    if (nodeback) {\n\
        promise.then(function (value) {\n\
            nextTick(function () {\n\
                nodeback(null, value);\n\
            });\n\
        }, function (error) {\n\
            nextTick(function () {\n\
                nodeback(error);\n\
            });\n\
        });\n\
    } else {\n\
        return promise;\n\
    }\n\
}\n\
\n\
// All code before this point will be filtered from stack traces.\n\
var qEndingLine = captureLine();\n\
\n\
return Q;\n\
\n\
});\n\
//@ sourceURL=microjs-q/q.js"
));
require.register("visionmedia-mocha/mocha.js", Function("exports, require, module",
";(function(){\n\
\n\
// CommonJS require()\n\
\n\
function require(p){\n\
    var path = require.resolve(p)\n\
      , mod = require.modules[path];\n\
    if (!mod) throw new Error('failed to require \"' + p + '\"');\n\
    if (!mod.exports) {\n\
      mod.exports = {};\n\
      mod.call(mod.exports, mod, mod.exports, require.relative(path));\n\
    }\n\
    return mod.exports;\n\
  }\n\
\n\
require.modules = {};\n\
\n\
require.resolve = function (path){\n\
    var orig = path\n\
      , reg = path + '.js'\n\
      , index = path + '/index.js';\n\
    return require.modules[reg] && reg\n\
      || require.modules[index] && index\n\
      || orig;\n\
  };\n\
\n\
require.register = function (path, fn){\n\
    require.modules[path] = fn;\n\
  };\n\
\n\
require.relative = function (parent) {\n\
    return function(p){\n\
      if ('.' != p.charAt(0)) return require(p);\n\
\n\
      var path = parent.split('/')\n\
        , segs = p.split('/');\n\
      path.pop();\n\
\n\
      for (var i = 0; i < segs.length; i++) {\n\
        var seg = segs[i];\n\
        if ('..' == seg) path.pop();\n\
        else if ('.' != seg) path.push(seg);\n\
      }\n\
\n\
      return require(path.join('/'));\n\
    };\n\
  };\n\
\n\
\n\
require.register(\"browser/debug.js\", function(module, exports, require){\n\
\n\
module.exports = function(type){\n\
  return function(){\n\
  }\n\
};\n\
\n\
}); // module: browser/debug.js\n\
\n\
require.register(\"browser/diff.js\", function(module, exports, require){\n\
/* See LICENSE file for terms of use */\n\
\n\
/*\n\
 * Text diff implementation.\n\
 *\n\
 * This library supports the following APIS:\n\
 * JsDiff.diffChars: Character by character diff\n\
 * JsDiff.diffWords: Word (as defined by \\b regex) diff which ignores whitespace\n\
 * JsDiff.diffLines: Line based diff\n\
 *\n\
 * JsDiff.diffCss: Diff targeted at CSS content\n\
 *\n\
 * These methods are based on the implementation proposed in\n\
 * \"An O(ND) Difference Algorithm and its Variations\" (Myers, 1986).\n\
 * http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6927\n\
 */\n\
var JsDiff = (function() {\n\
  /*jshint maxparams: 5*/\n\
  function clonePath(path) {\n\
    return { newPos: path.newPos, components: path.components.slice(0) };\n\
  }\n\
  function removeEmpty(array) {\n\
    var ret = [];\n\
    for (var i = 0; i < array.length; i++) {\n\
      if (array[i]) {\n\
        ret.push(array[i]);\n\
      }\n\
    }\n\
    return ret;\n\
  }\n\
  function escapeHTML(s) {\n\
    var n = s;\n\
    n = n.replace(/&/g, '&amp;');\n\
    n = n.replace(/</g, '&lt;');\n\
    n = n.replace(/>/g, '&gt;');\n\
    n = n.replace(/\"/g, '&quot;');\n\
\n\
    return n;\n\
  }\n\
\n\
  var Diff = function(ignoreWhitespace) {\n\
    this.ignoreWhitespace = ignoreWhitespace;\n\
  };\n\
  Diff.prototype = {\n\
      diff: function(oldString, newString) {\n\
        // Handle the identity case (this is due to unrolling editLength == 0\n\
        if (newString === oldString) {\n\
          return [{ value: newString }];\n\
        }\n\
        if (!newString) {\n\
          return [{ value: oldString, removed: true }];\n\
        }\n\
        if (!oldString) {\n\
          return [{ value: newString, added: true }];\n\
        }\n\
\n\
        newString = this.tokenize(newString);\n\
        oldString = this.tokenize(oldString);\n\
\n\
        var newLen = newString.length, oldLen = oldString.length;\n\
        var maxEditLength = newLen + oldLen;\n\
        var bestPath = [{ newPos: -1, components: [] }];\n\
\n\
        // Seed editLength = 0\n\
        var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);\n\
        if (bestPath[0].newPos+1 >= newLen && oldPos+1 >= oldLen) {\n\
          return bestPath[0].components;\n\
        }\n\
\n\
        for (var editLength = 1; editLength <= maxEditLength; editLength++) {\n\
          for (var diagonalPath = -1*editLength; diagonalPath <= editLength; diagonalPath+=2) {\n\
            var basePath;\n\
            var addPath = bestPath[diagonalPath-1],\n\
                removePath = bestPath[diagonalPath+1];\n\
            oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;\n\
            if (addPath) {\n\
              // No one else is going to attempt to use this value, clear it\n\
              bestPath[diagonalPath-1] = undefined;\n\
            }\n\
\n\
            var canAdd = addPath && addPath.newPos+1 < newLen;\n\
            var canRemove = removePath && 0 <= oldPos && oldPos < oldLen;\n\
            if (!canAdd && !canRemove) {\n\
              bestPath[diagonalPath] = undefined;\n\
              continue;\n\
            }\n\
\n\
            // Select the diagonal that we want to branch from. We select the prior\n\
            // path whose position in the new string is the farthest from the origin\n\
            // and does not pass the bounds of the diff graph\n\
            if (!canAdd || (canRemove && addPath.newPos < removePath.newPos)) {\n\
              basePath = clonePath(removePath);\n\
              this.pushComponent(basePath.components, oldString[oldPos], undefined, true);\n\
            } else {\n\
              basePath = clonePath(addPath);\n\
              basePath.newPos++;\n\
              this.pushComponent(basePath.components, newString[basePath.newPos], true, undefined);\n\
            }\n\
\n\
            var oldPos = this.extractCommon(basePath, newString, oldString, diagonalPath);\n\
\n\
            if (basePath.newPos+1 >= newLen && oldPos+1 >= oldLen) {\n\
              return basePath.components;\n\
            } else {\n\
              bestPath[diagonalPath] = basePath;\n\
            }\n\
          }\n\
        }\n\
      },\n\
\n\
      pushComponent: function(components, value, added, removed) {\n\
        var last = components[components.length-1];\n\
        if (last && last.added === added && last.removed === removed) {\n\
          // We need to clone here as the component clone operation is just\n\
          // as shallow array clone\n\
          components[components.length-1] =\n\
            {value: this.join(last.value, value), added: added, removed: removed };\n\
        } else {\n\
          components.push({value: value, added: added, removed: removed });\n\
        }\n\
      },\n\
      extractCommon: function(basePath, newString, oldString, diagonalPath) {\n\
        var newLen = newString.length,\n\
            oldLen = oldString.length,\n\
            newPos = basePath.newPos,\n\
            oldPos = newPos - diagonalPath;\n\
        while (newPos+1 < newLen && oldPos+1 < oldLen && this.equals(newString[newPos+1], oldString[oldPos+1])) {\n\
          newPos++;\n\
          oldPos++;\n\
\n\
          this.pushComponent(basePath.components, newString[newPos], undefined, undefined);\n\
        }\n\
        basePath.newPos = newPos;\n\
        return oldPos;\n\
      },\n\
\n\
      equals: function(left, right) {\n\
        var reWhitespace = /\\S/;\n\
        if (this.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right)) {\n\
          return true;\n\
        } else {\n\
          return left === right;\n\
        }\n\
      },\n\
      join: function(left, right) {\n\
        return left + right;\n\
      },\n\
      tokenize: function(value) {\n\
        return value;\n\
      }\n\
  };\n\
\n\
  var CharDiff = new Diff();\n\
\n\
  var WordDiff = new Diff(true);\n\
  var WordWithSpaceDiff = new Diff();\n\
  WordDiff.tokenize = WordWithSpaceDiff.tokenize = function(value) {\n\
    return removeEmpty(value.split(/(\\s+|\\b)/));\n\
  };\n\
\n\
  var CssDiff = new Diff(true);\n\
  CssDiff.tokenize = function(value) {\n\
    return removeEmpty(value.split(/([{}:;,]|\\s+)/));\n\
  };\n\
\n\
  var LineDiff = new Diff();\n\
  LineDiff.tokenize = function(value) {\n\
    return value.split(/^/m);\n\
  };\n\
\n\
  return {\n\
    Diff: Diff,\n\
\n\
    diffChars: function(oldStr, newStr) { return CharDiff.diff(oldStr, newStr); },\n\
    diffWords: function(oldStr, newStr) { return WordDiff.diff(oldStr, newStr); },\n\
    diffWordsWithSpace: function(oldStr, newStr) { return WordWithSpaceDiff.diff(oldStr, newStr); },\n\
    diffLines: function(oldStr, newStr) { return LineDiff.diff(oldStr, newStr); },\n\
\n\
    diffCss: function(oldStr, newStr) { return CssDiff.diff(oldStr, newStr); },\n\
\n\
    createPatch: function(fileName, oldStr, newStr, oldHeader, newHeader) {\n\
      var ret = [];\n\
\n\
      ret.push('Index: ' + fileName);\n\
      ret.push('===================================================================');\n\
      ret.push('--- ' + fileName + (typeof oldHeader === 'undefined' ? '' : '\\t' + oldHeader));\n\
      ret.push('+++ ' + fileName + (typeof newHeader === 'undefined' ? '' : '\\t' + newHeader));\n\
\n\
      var diff = LineDiff.diff(oldStr, newStr);\n\
      if (!diff[diff.length-1].value) {\n\
        diff.pop();   // Remove trailing newline add\n\
      }\n\
      diff.push({value: '', lines: []});   // Append an empty value to make cleanup easier\n\
\n\
      function contextLines(lines) {\n\
        return lines.map(function(entry) { return ' ' + entry; });\n\
      }\n\
      function eofNL(curRange, i, current) {\n\
        var last = diff[diff.length-2],\n\
            isLast = i === diff.length-2,\n\
            isLastOfType = i === diff.length-3 && (current.added !== last.added || current.removed !== last.removed);\n\
\n\
        // Figure out if this is the last line for the given file and missing NL\n\
        if (!/\\n\
$/.test(current.value) && (isLast || isLastOfType)) {\n\
          curRange.push('\\\\ No newline at end of file');\n\
        }\n\
      }\n\
\n\
      var oldRangeStart = 0, newRangeStart = 0, curRange = [],\n\
          oldLine = 1, newLine = 1;\n\
      for (var i = 0; i < diff.length; i++) {\n\
        var current = diff[i],\n\
            lines = current.lines || current.value.replace(/\\n\
$/, '').split('\\n\
');\n\
        current.lines = lines;\n\
\n\
        if (current.added || current.removed) {\n\
          if (!oldRangeStart) {\n\
            var prev = diff[i-1];\n\
            oldRangeStart = oldLine;\n\
            newRangeStart = newLine;\n\
\n\
            if (prev) {\n\
              curRange = contextLines(prev.lines.slice(-4));\n\
              oldRangeStart -= curRange.length;\n\
              newRangeStart -= curRange.length;\n\
            }\n\
          }\n\
          curRange.push.apply(curRange, lines.map(function(entry) { return (current.added?'+':'-') + entry; }));\n\
          eofNL(curRange, i, current);\n\
\n\
          if (current.added) {\n\
            newLine += lines.length;\n\
          } else {\n\
            oldLine += lines.length;\n\
          }\n\
        } else {\n\
          if (oldRangeStart) {\n\
            // Close out any changes that have been output (or join overlapping)\n\
            if (lines.length <= 8 && i < diff.length-2) {\n\
              // Overlapping\n\
              curRange.push.apply(curRange, contextLines(lines));\n\
            } else {\n\
              // end the range and output\n\
              var contextSize = Math.min(lines.length, 4);\n\
              ret.push(\n\
                  '@@ -' + oldRangeStart + ',' + (oldLine-oldRangeStart+contextSize)\n\
                  + ' +' + newRangeStart + ',' + (newLine-newRangeStart+contextSize)\n\
                  + ' @@');\n\
              ret.push.apply(ret, curRange);\n\
              ret.push.apply(ret, contextLines(lines.slice(0, contextSize)));\n\
              if (lines.length <= 4) {\n\
                eofNL(ret, i, current);\n\
              }\n\
\n\
              oldRangeStart = 0;  newRangeStart = 0; curRange = [];\n\
            }\n\
          }\n\
          oldLine += lines.length;\n\
          newLine += lines.length;\n\
        }\n\
      }\n\
\n\
      return ret.join('\\n\
') + '\\n\
';\n\
    },\n\
\n\
    applyPatch: function(oldStr, uniDiff) {\n\
      var diffstr = uniDiff.split('\\n\
');\n\
      var diff = [];\n\
      var remEOFNL = false,\n\
          addEOFNL = false;\n\
\n\
      for (var i = (diffstr[0][0]==='I'?4:0); i < diffstr.length; i++) {\n\
        if(diffstr[i][0] === '@') {\n\
          var meh = diffstr[i].split(/@@ -(\\d+),(\\d+) \\+(\\d+),(\\d+) @@/);\n\
          diff.unshift({\n\
            start:meh[3],\n\
            oldlength:meh[2],\n\
            oldlines:[],\n\
            newlength:meh[4],\n\
            newlines:[]\n\
          });\n\
        } else if(diffstr[i][0] === '+') {\n\
          diff[0].newlines.push(diffstr[i].substr(1));\n\
        } else if(diffstr[i][0] === '-') {\n\
          diff[0].oldlines.push(diffstr[i].substr(1));\n\
        } else if(diffstr[i][0] === ' ') {\n\
          diff[0].newlines.push(diffstr[i].substr(1));\n\
          diff[0].oldlines.push(diffstr[i].substr(1));\n\
        } else if(diffstr[i][0] === '\\\\') {\n\
          if (diffstr[i-1][0] === '+') {\n\
            remEOFNL = true;\n\
          } else if(diffstr[i-1][0] === '-') {\n\
            addEOFNL = true;\n\
          }\n\
        }\n\
      }\n\
\n\
      var str = oldStr.split('\\n\
');\n\
      for (var i = diff.length - 1; i >= 0; i--) {\n\
        var d = diff[i];\n\
        for (var j = 0; j < d.oldlength; j++) {\n\
          if(str[d.start-1+j] !== d.oldlines[j]) {\n\
            return false;\n\
          }\n\
        }\n\
        Array.prototype.splice.apply(str,[d.start-1,+d.oldlength].concat(d.newlines));\n\
      }\n\
\n\
      if (remEOFNL) {\n\
        while (!str[str.length-1]) {\n\
          str.pop();\n\
        }\n\
      } else if (addEOFNL) {\n\
        str.push('');\n\
      }\n\
      return str.join('\\n\
');\n\
    },\n\
\n\
    convertChangesToXML: function(changes){\n\
      var ret = [];\n\
      for ( var i = 0; i < changes.length; i++) {\n\
        var change = changes[i];\n\
        if (change.added) {\n\
          ret.push('<ins>');\n\
        } else if (change.removed) {\n\
          ret.push('<del>');\n\
        }\n\
\n\
        ret.push(escapeHTML(change.value));\n\
\n\
        if (change.added) {\n\
          ret.push('</ins>');\n\
        } else if (change.removed) {\n\
          ret.push('</del>');\n\
        }\n\
      }\n\
      return ret.join('');\n\
    },\n\
\n\
    // See: http://code.google.com/p/google-diff-match-patch/wiki/API\n\
    convertChangesToDMP: function(changes){\n\
      var ret = [], change;\n\
      for ( var i = 0; i < changes.length; i++) {\n\
        change = changes[i];\n\
        ret.push([(change.added ? 1 : change.removed ? -1 : 0), change.value]);\n\
      }\n\
      return ret;\n\
    }\n\
  };\n\
})();\n\
\n\
if (typeof module !== 'undefined') {\n\
    module.exports = JsDiff;\n\
}\n\
\n\
}); // module: browser/diff.js\n\
\n\
require.register(\"browser/events.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module exports.\n\
 */\n\
\n\
exports.EventEmitter = EventEmitter;\n\
\n\
/**\n\
 * Check if `obj` is an array.\n\
 */\n\
\n\
function isArray(obj) {\n\
  return '[object Array]' == {}.toString.call(obj);\n\
}\n\
\n\
/**\n\
 * Event emitter constructor.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function EventEmitter(){};\n\
\n\
/**\n\
 * Adds a listener.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
EventEmitter.prototype.on = function (name, fn) {\n\
  if (!this.$events) {\n\
    this.$events = {};\n\
  }\n\
\n\
  if (!this.$events[name]) {\n\
    this.$events[name] = fn;\n\
  } else if (isArray(this.$events[name])) {\n\
    this.$events[name].push(fn);\n\
  } else {\n\
    this.$events[name] = [this.$events[name], fn];\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
EventEmitter.prototype.addListener = EventEmitter.prototype.on;\n\
\n\
/**\n\
 * Adds a volatile listener.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
EventEmitter.prototype.once = function (name, fn) {\n\
  var self = this;\n\
\n\
  function on () {\n\
    self.removeListener(name, on);\n\
    fn.apply(this, arguments);\n\
  };\n\
\n\
  on.listener = fn;\n\
  this.on(name, on);\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Removes a listener.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
EventEmitter.prototype.removeListener = function (name, fn) {\n\
  if (this.$events && this.$events[name]) {\n\
    var list = this.$events[name];\n\
\n\
    if (isArray(list)) {\n\
      var pos = -1;\n\
\n\
      for (var i = 0, l = list.length; i < l; i++) {\n\
        if (list[i] === fn || (list[i].listener && list[i].listener === fn)) {\n\
          pos = i;\n\
          break;\n\
        }\n\
      }\n\
\n\
      if (pos < 0) {\n\
        return this;\n\
      }\n\
\n\
      list.splice(pos, 1);\n\
\n\
      if (!list.length) {\n\
        delete this.$events[name];\n\
      }\n\
    } else if (list === fn || (list.listener && list.listener === fn)) {\n\
      delete this.$events[name];\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Removes all listeners for an event.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
EventEmitter.prototype.removeAllListeners = function (name) {\n\
  if (name === undefined) {\n\
    this.$events = {};\n\
    return this;\n\
  }\n\
\n\
  if (this.$events && this.$events[name]) {\n\
    this.$events[name] = null;\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Gets all listeners for a certain event.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
EventEmitter.prototype.listeners = function (name) {\n\
  if (!this.$events) {\n\
    this.$events = {};\n\
  }\n\
\n\
  if (!this.$events[name]) {\n\
    this.$events[name] = [];\n\
  }\n\
\n\
  if (!isArray(this.$events[name])) {\n\
    this.$events[name] = [this.$events[name]];\n\
  }\n\
\n\
  return this.$events[name];\n\
};\n\
\n\
/**\n\
 * Emits an event.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
EventEmitter.prototype.emit = function (name) {\n\
  if (!this.$events) {\n\
    return false;\n\
  }\n\
\n\
  var handler = this.$events[name];\n\
\n\
  if (!handler) {\n\
    return false;\n\
  }\n\
\n\
  var args = [].slice.call(arguments, 1);\n\
\n\
  if ('function' == typeof handler) {\n\
    handler.apply(this, args);\n\
  } else if (isArray(handler)) {\n\
    var listeners = handler.slice();\n\
\n\
    for (var i = 0, l = listeners.length; i < l; i++) {\n\
      listeners[i].apply(this, args);\n\
    }\n\
  } else {\n\
    return false;\n\
  }\n\
\n\
  return true;\n\
};\n\
}); // module: browser/events.js\n\
\n\
require.register(\"browser/fs.js\", function(module, exports, require){\n\
\n\
}); // module: browser/fs.js\n\
\n\
require.register(\"browser/path.js\", function(module, exports, require){\n\
\n\
}); // module: browser/path.js\n\
\n\
require.register(\"browser/progress.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Expose `Progress`.\n\
 */\n\
\n\
module.exports = Progress;\n\
\n\
/**\n\
 * Initialize a new `Progress` indicator.\n\
 */\n\
\n\
function Progress() {\n\
  this.percent = 0;\n\
  this.size(0);\n\
  this.fontSize(11);\n\
  this.font('helvetica, arial, sans-serif');\n\
}\n\
\n\
/**\n\
 * Set progress size to `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Progress} for chaining\n\
 * @api public\n\
 */\n\
\n\
Progress.prototype.size = function(n){\n\
  this._size = n;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set text to `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Progress} for chaining\n\
 * @api public\n\
 */\n\
\n\
Progress.prototype.text = function(str){\n\
  this._text = str;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set font size to `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Progress} for chaining\n\
 * @api public\n\
 */\n\
\n\
Progress.prototype.fontSize = function(n){\n\
  this._fontSize = n;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set font `family`.\n\
 *\n\
 * @param {String} family\n\
 * @return {Progress} for chaining\n\
 */\n\
\n\
Progress.prototype.font = function(family){\n\
  this._font = family;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Update percentage to `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @return {Progress} for chaining\n\
 */\n\
\n\
Progress.prototype.update = function(n){\n\
  this.percent = n;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Draw on `ctx`.\n\
 *\n\
 * @param {CanvasRenderingContext2d} ctx\n\
 * @return {Progress} for chaining\n\
 */\n\
\n\
Progress.prototype.draw = function(ctx){\n\
  var percent = Math.min(this.percent, 100)\n\
    , size = this._size\n\
    , half = size / 2\n\
    , x = half\n\
    , y = half\n\
    , rad = half - 1\n\
    , fontSize = this._fontSize;\n\
\n\
  ctx.font = fontSize + 'px ' + this._font;\n\
\n\
  var angle = Math.PI * 2 * (percent / 100);\n\
  ctx.clearRect(0, 0, size, size);\n\
\n\
  // outer circle\n\
  ctx.strokeStyle = '#9f9f9f';\n\
  ctx.beginPath();\n\
  ctx.arc(x, y, rad, 0, angle, false);\n\
  ctx.stroke();\n\
\n\
  // inner circle\n\
  ctx.strokeStyle = '#eee';\n\
  ctx.beginPath();\n\
  ctx.arc(x, y, rad - 1, 0, angle, true);\n\
  ctx.stroke();\n\
\n\
  // text\n\
  var text = this._text || (percent | 0) + '%'\n\
    , w = ctx.measureText(text).width;\n\
\n\
  ctx.fillText(\n\
      text\n\
    , x - w / 2 + 1\n\
    , y + fontSize / 2 - 1);\n\
\n\
  return this;\n\
};\n\
\n\
}); // module: browser/progress.js\n\
\n\
require.register(\"browser/tty.js\", function(module, exports, require){\n\
\n\
exports.isatty = function(){\n\
  return true;\n\
};\n\
\n\
exports.getWindowSize = function(){\n\
  if ('innerHeight' in global) {\n\
    return [global.innerHeight, global.innerWidth];\n\
  } else {\n\
    // In a Web Worker, the DOM Window is not available.\n\
    return [640, 480];\n\
  }\n\
};\n\
\n\
}); // module: browser/tty.js\n\
\n\
require.register(\"context.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Expose `Context`.\n\
 */\n\
\n\
module.exports = Context;\n\
\n\
/**\n\
 * Initialize a new `Context`.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
function Context(){}\n\
\n\
/**\n\
 * Set or get the context `Runnable` to `runnable`.\n\
 *\n\
 * @param {Runnable} runnable\n\
 * @return {Context}\n\
 * @api private\n\
 */\n\
\n\
Context.prototype.runnable = function(runnable){\n\
  if (0 == arguments.length) return this._runnable;\n\
  this.test = this._runnable = runnable;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set test timeout `ms`.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {Context} self\n\
 * @api private\n\
 */\n\
\n\
Context.prototype.timeout = function(ms){\n\
  this.runnable().timeout(ms);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set test slowness threshold `ms`.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {Context} self\n\
 * @api private\n\
 */\n\
\n\
Context.prototype.slow = function(ms){\n\
  this.runnable().slow(ms);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Inspect the context void of `._runnable`.\n\
 *\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
Context.prototype.inspect = function(){\n\
  return JSON.stringify(this, function(key, val){\n\
    if ('_runnable' == key) return;\n\
    if ('test' == key) return;\n\
    return val;\n\
  }, 2);\n\
};\n\
\n\
}); // module: context.js\n\
\n\
require.register(\"hook.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Runnable = require('./runnable');\n\
\n\
/**\n\
 * Expose `Hook`.\n\
 */\n\
\n\
module.exports = Hook;\n\
\n\
/**\n\
 * Initialize a new `Hook` with the given `title` and callback `fn`.\n\
 *\n\
 * @param {String} title\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function Hook(title, fn) {\n\
  Runnable.call(this, title, fn);\n\
  this.type = 'hook';\n\
}\n\
\n\
/**\n\
 * Inherit from `Runnable.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Runnable.prototype;\n\
Hook.prototype = new F;\n\
Hook.prototype.constructor = Hook;\n\
\n\
\n\
/**\n\
 * Get or set the test `err`.\n\
 *\n\
 * @param {Error} err\n\
 * @return {Error}\n\
 * @api public\n\
 */\n\
\n\
Hook.prototype.error = function(err){\n\
  if (0 == arguments.length) {\n\
    var err = this._error;\n\
    this._error = null;\n\
    return err;\n\
  }\n\
\n\
  this._error = err;\n\
};\n\
\n\
}); // module: hook.js\n\
\n\
require.register(\"interfaces/bdd.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Suite = require('../suite')\n\
  , Test = require('../test')\n\
  , utils = require('../utils');\n\
\n\
/**\n\
 * BDD-style interface:\n\
 *\n\
 *      describe('Array', function(){\n\
 *        describe('#indexOf()', function(){\n\
 *          it('should return -1 when not present', function(){\n\
 *\n\
 *          });\n\
 *\n\
 *          it('should return the index when present', function(){\n\
 *\n\
 *          });\n\
 *        });\n\
 *      });\n\
 *\n\
 */\n\
\n\
module.exports = function(suite){\n\
  var suites = [suite];\n\
\n\
  suite.on('pre-require', function(context, file, mocha){\n\
\n\
    /**\n\
     * Execute before running tests.\n\
     */\n\
\n\
    context.before = function(fn){\n\
      suites[0].beforeAll(fn);\n\
    };\n\
\n\
    /**\n\
     * Execute after running tests.\n\
     */\n\
\n\
    context.after = function(fn){\n\
      suites[0].afterAll(fn);\n\
    };\n\
\n\
    /**\n\
     * Execute before each test case.\n\
     */\n\
\n\
    context.beforeEach = function(fn){\n\
      suites[0].beforeEach(fn);\n\
    };\n\
\n\
    /**\n\
     * Execute after each test case.\n\
     */\n\
\n\
    context.afterEach = function(fn){\n\
      suites[0].afterEach(fn);\n\
    };\n\
\n\
    /**\n\
     * Describe a \"suite\" with the given `title`\n\
     * and callback `fn` containing nested suites\n\
     * and/or tests.\n\
     */\n\
\n\
    context.describe = context.context = function(title, fn){\n\
      var suite = Suite.create(suites[0], title);\n\
      suites.unshift(suite);\n\
      fn.call(suite);\n\
      suites.shift();\n\
      return suite;\n\
    };\n\
\n\
    /**\n\
     * Pending describe.\n\
     */\n\
\n\
    context.xdescribe =\n\
    context.xcontext =\n\
    context.describe.skip = function(title, fn){\n\
      var suite = Suite.create(suites[0], title);\n\
      suite.pending = true;\n\
      suites.unshift(suite);\n\
      fn.call(suite);\n\
      suites.shift();\n\
    };\n\
\n\
    /**\n\
     * Exclusive suite.\n\
     */\n\
\n\
    context.describe.only = function(title, fn){\n\
      var suite = context.describe(title, fn);\n\
      mocha.grep(suite.fullTitle());\n\
      return suite;\n\
    };\n\
\n\
    /**\n\
     * Describe a specification or test-case\n\
     * with the given `title` and callback `fn`\n\
     * acting as a thunk.\n\
     */\n\
\n\
    context.it = context.specify = function(title, fn){\n\
      var suite = suites[0];\n\
      if (suite.pending) var fn = null;\n\
      var test = new Test(title, fn);\n\
      suite.addTest(test);\n\
      return test;\n\
    };\n\
\n\
    /**\n\
     * Exclusive test-case.\n\
     */\n\
\n\
    context.it.only = function(title, fn){\n\
      var test = context.it(title, fn);\n\
      var reString = '^' + utils.escapeRegexp(test.fullTitle()) + '$';\n\
      mocha.grep(new RegExp(reString));\n\
      return test;\n\
    };\n\
\n\
    /**\n\
     * Pending test case.\n\
     */\n\
\n\
    context.xit =\n\
    context.xspecify =\n\
    context.it.skip = function(title){\n\
      context.it(title);\n\
    };\n\
  });\n\
};\n\
\n\
}); // module: interfaces/bdd.js\n\
\n\
require.register(\"interfaces/exports.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Suite = require('../suite')\n\
  , Test = require('../test');\n\
\n\
/**\n\
 * TDD-style interface:\n\
 *\n\
 *     exports.Array = {\n\
 *       '#indexOf()': {\n\
 *         'should return -1 when the value is not present': function(){\n\
 *\n\
 *         },\n\
 *\n\
 *         'should return the correct index when the value is present': function(){\n\
 *\n\
 *         }\n\
 *       }\n\
 *     };\n\
 *\n\
 */\n\
\n\
module.exports = function(suite){\n\
  var suites = [suite];\n\
\n\
  suite.on('require', visit);\n\
\n\
  function visit(obj) {\n\
    var suite;\n\
    for (var key in obj) {\n\
      if ('function' == typeof obj[key]) {\n\
        var fn = obj[key];\n\
        switch (key) {\n\
          case 'before':\n\
            suites[0].beforeAll(fn);\n\
            break;\n\
          case 'after':\n\
            suites[0].afterAll(fn);\n\
            break;\n\
          case 'beforeEach':\n\
            suites[0].beforeEach(fn);\n\
            break;\n\
          case 'afterEach':\n\
            suites[0].afterEach(fn);\n\
            break;\n\
          default:\n\
            suites[0].addTest(new Test(key, fn));\n\
        }\n\
      } else {\n\
        var suite = Suite.create(suites[0], key);\n\
        suites.unshift(suite);\n\
        visit(obj[key]);\n\
        suites.shift();\n\
      }\n\
    }\n\
  }\n\
};\n\
\n\
}); // module: interfaces/exports.js\n\
\n\
require.register(\"interfaces/index.js\", function(module, exports, require){\n\
\n\
exports.bdd = require('./bdd');\n\
exports.tdd = require('./tdd');\n\
exports.qunit = require('./qunit');\n\
exports.exports = require('./exports');\n\
\n\
}); // module: interfaces/index.js\n\
\n\
require.register(\"interfaces/qunit.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Suite = require('../suite')\n\
  , Test = require('../test')\n\
  , utils = require('../utils');\n\
\n\
/**\n\
 * QUnit-style interface:\n\
 *\n\
 *     suite('Array');\n\
 *\n\
 *     test('#length', function(){\n\
 *       var arr = [1,2,3];\n\
 *       ok(arr.length == 3);\n\
 *     });\n\
 *\n\
 *     test('#indexOf()', function(){\n\
 *       var arr = [1,2,3];\n\
 *       ok(arr.indexOf(1) == 0);\n\
 *       ok(arr.indexOf(2) == 1);\n\
 *       ok(arr.indexOf(3) == 2);\n\
 *     });\n\
 *\n\
 *     suite('String');\n\
 *\n\
 *     test('#length', function(){\n\
 *       ok('foo'.length == 3);\n\
 *     });\n\
 *\n\
 */\n\
\n\
module.exports = function(suite){\n\
  var suites = [suite];\n\
\n\
  suite.on('pre-require', function(context, file, mocha){\n\
\n\
    /**\n\
     * Execute before running tests.\n\
     */\n\
\n\
    context.before = function(fn){\n\
      suites[0].beforeAll(fn);\n\
    };\n\
\n\
    /**\n\
     * Execute after running tests.\n\
     */\n\
\n\
    context.after = function(fn){\n\
      suites[0].afterAll(fn);\n\
    };\n\
\n\
    /**\n\
     * Execute before each test case.\n\
     */\n\
\n\
    context.beforeEach = function(fn){\n\
      suites[0].beforeEach(fn);\n\
    };\n\
\n\
    /**\n\
     * Execute after each test case.\n\
     */\n\
\n\
    context.afterEach = function(fn){\n\
      suites[0].afterEach(fn);\n\
    };\n\
\n\
    /**\n\
     * Describe a \"suite\" with the given `title`.\n\
     */\n\
\n\
    context.suite = function(title){\n\
      if (suites.length > 1) suites.shift();\n\
      var suite = Suite.create(suites[0], title);\n\
      suites.unshift(suite);\n\
      return suite;\n\
    };\n\
\n\
    /**\n\
     * Exclusive test-case.\n\
     */\n\
\n\
    context.suite.only = function(title, fn){\n\
      var suite = context.suite(title, fn);\n\
      mocha.grep(suite.fullTitle());\n\
    };\n\
\n\
    /**\n\
     * Describe a specification or test-case\n\
     * with the given `title` and callback `fn`\n\
     * acting as a thunk.\n\
     */\n\
\n\
    context.test = function(title, fn){\n\
      var test = new Test(title, fn);\n\
      suites[0].addTest(test);\n\
      return test;\n\
    };\n\
\n\
    /**\n\
     * Exclusive test-case.\n\
     */\n\
\n\
    context.test.only = function(title, fn){\n\
      var test = context.test(title, fn);\n\
      var reString = '^' + utils.escapeRegexp(test.fullTitle()) + '$';\n\
      mocha.grep(new RegExp(reString));\n\
    };\n\
\n\
    /**\n\
     * Pending test case.\n\
     */\n\
\n\
    context.test.skip = function(title){\n\
      context.test(title);\n\
    };\n\
  });\n\
};\n\
\n\
}); // module: interfaces/qunit.js\n\
\n\
require.register(\"interfaces/tdd.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Suite = require('../suite')\n\
  , Test = require('../test')\n\
  , utils = require('../utils');;\n\
\n\
/**\n\
 * TDD-style interface:\n\
 *\n\
 *      suite('Array', function(){\n\
 *        suite('#indexOf()', function(){\n\
 *          suiteSetup(function(){\n\
 *\n\
 *          });\n\
 *\n\
 *          test('should return -1 when not present', function(){\n\
 *\n\
 *          });\n\
 *\n\
 *          test('should return the index when present', function(){\n\
 *\n\
 *          });\n\
 *\n\
 *          suiteTeardown(function(){\n\
 *\n\
 *          });\n\
 *        });\n\
 *      });\n\
 *\n\
 */\n\
\n\
module.exports = function(suite){\n\
  var suites = [suite];\n\
\n\
  suite.on('pre-require', function(context, file, mocha){\n\
\n\
    /**\n\
     * Execute before each test case.\n\
     */\n\
\n\
    context.setup = function(fn){\n\
      suites[0].beforeEach(fn);\n\
    };\n\
\n\
    /**\n\
     * Execute after each test case.\n\
     */\n\
\n\
    context.teardown = function(fn){\n\
      suites[0].afterEach(fn);\n\
    };\n\
\n\
    /**\n\
     * Execute before the suite.\n\
     */\n\
\n\
    context.suiteSetup = function(fn){\n\
      suites[0].beforeAll(fn);\n\
    };\n\
\n\
    /**\n\
     * Execute after the suite.\n\
     */\n\
\n\
    context.suiteTeardown = function(fn){\n\
      suites[0].afterAll(fn);\n\
    };\n\
\n\
    /**\n\
     * Describe a \"suite\" with the given `title`\n\
     * and callback `fn` containing nested suites\n\
     * and/or tests.\n\
     */\n\
\n\
    context.suite = function(title, fn){\n\
      var suite = Suite.create(suites[0], title);\n\
      suites.unshift(suite);\n\
      fn.call(suite);\n\
      suites.shift();\n\
      return suite;\n\
    };\n\
\n\
    /**\n\
     * Pending suite.\n\
     */\n\
    context.suite.skip = function(title, fn) {\n\
      var suite = Suite.create(suites[0], title);\n\
      suite.pending = true;\n\
      suites.unshift(suite);\n\
      fn.call(suite);\n\
      suites.shift();\n\
    };\n\
\n\
    /**\n\
     * Exclusive test-case.\n\
     */\n\
\n\
    context.suite.only = function(title, fn){\n\
      var suite = context.suite(title, fn);\n\
      mocha.grep(suite.fullTitle());\n\
    };\n\
\n\
    /**\n\
     * Describe a specification or test-case\n\
     * with the given `title` and callback `fn`\n\
     * acting as a thunk.\n\
     */\n\
\n\
    context.test = function(title, fn){\n\
      var suite = suites[0];\n\
      if (suite.pending) var fn = null;\n\
      var test = new Test(title, fn);\n\
      suite.addTest(test);\n\
      return test;\n\
    };\n\
\n\
    /**\n\
     * Exclusive test-case.\n\
     */\n\
\n\
    context.test.only = function(title, fn){\n\
      var test = context.test(title, fn);\n\
      var reString = '^' + utils.escapeRegexp(test.fullTitle()) + '$';\n\
      mocha.grep(new RegExp(reString));\n\
    };\n\
\n\
    /**\n\
     * Pending test case.\n\
     */\n\
\n\
    context.test.skip = function(title){\n\
      context.test(title);\n\
    };\n\
  });\n\
};\n\
\n\
}); // module: interfaces/tdd.js\n\
\n\
require.register(\"mocha.js\", function(module, exports, require){\n\
/*!\n\
 * mocha\n\
 * Copyright(c) 2011 TJ Holowaychuk <tj@vision-media.ca>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var path = require('browser/path')\n\
  , utils = require('./utils');\n\
\n\
/**\n\
 * Expose `Mocha`.\n\
 */\n\
\n\
exports = module.exports = Mocha;\n\
\n\
/**\n\
 * Expose internals.\n\
 */\n\
\n\
exports.utils = utils;\n\
exports.interfaces = require('./interfaces');\n\
exports.reporters = require('./reporters');\n\
exports.Runnable = require('./runnable');\n\
exports.Context = require('./context');\n\
exports.Runner = require('./runner');\n\
exports.Suite = require('./suite');\n\
exports.Hook = require('./hook');\n\
exports.Test = require('./test');\n\
\n\
/**\n\
 * Return image `name` path.\n\
 *\n\
 * @param {String} name\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function image(name) {\n\
  return __dirname + '/../images/' + name + '.png';\n\
}\n\
\n\
/**\n\
 * Setup mocha with `options`.\n\
 *\n\
 * Options:\n\
 *\n\
 *   - `ui` name \"bdd\", \"tdd\", \"exports\" etc\n\
 *   - `reporter` reporter instance, defaults to `mocha.reporters.Dot`\n\
 *   - `globals` array of accepted globals\n\
 *   - `timeout` timeout in milliseconds\n\
 *   - `bail` bail on the first test failure\n\
 *   - `slow` milliseconds to wait before considering a test slow\n\
 *   - `ignoreLeaks` ignore global leaks\n\
 *   - `grep` string or regexp to filter tests with\n\
 *\n\
 * @param {Object} options\n\
 * @api public\n\
 */\n\
\n\
function Mocha(options) {\n\
  options = options || {};\n\
  this.files = [];\n\
  this.options = options;\n\
  this.grep(options.grep);\n\
  this.suite = new exports.Suite('', new exports.Context);\n\
  this.ui(options.ui);\n\
  this.bail(options.bail);\n\
  this.reporter(options.reporter);\n\
  if (null != options.timeout) this.timeout(options.timeout);\n\
  this.useColors(options.useColors)\n\
  if (options.slow) this.slow(options.slow);\n\
}\n\
\n\
/**\n\
 * Enable or disable bailing on the first failure.\n\
 *\n\
 * @param {Boolean} [bail]\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.bail = function(bail){\n\
  if (0 == arguments.length) bail = true;\n\
  this.suite.bail(bail);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Add test `file`.\n\
 *\n\
 * @param {String} file\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.addFile = function(file){\n\
  this.files.push(file);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set reporter to `reporter`, defaults to \"dot\".\n\
 *\n\
 * @param {String|Function} reporter name or constructor\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.reporter = function(reporter){\n\
  if ('function' == typeof reporter) {\n\
    this._reporter = reporter;\n\
  } else {\n\
    reporter = reporter || 'dot';\n\
    var _reporter;\n\
    try { _reporter = require('./reporters/' + reporter); } catch (err) {};\n\
    if (!_reporter) try { _reporter = require(reporter); } catch (err) {};\n\
    if (!_reporter && reporter === 'teamcity')\n\
      console.warn('The Teamcity reporter was moved to a package named ' +\n\
        'mocha-teamcity-reporter ' +\n\
        '(https://npmjs.org/package/mocha-teamcity-reporter).');\n\
    if (!_reporter) throw new Error('invalid reporter \"' + reporter + '\"');\n\
    this._reporter = _reporter;\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set test UI `name`, defaults to \"bdd\".\n\
 *\n\
 * @param {String} bdd\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.ui = function(name){\n\
  name = name || 'bdd';\n\
  this._ui = exports.interfaces[name];\n\
  if (!this._ui) try { this._ui = require(name); } catch (err) {};\n\
  if (!this._ui) throw new Error('invalid interface \"' + name + '\"');\n\
  this._ui = this._ui(this.suite);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Load registered files.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Mocha.prototype.loadFiles = function(fn){\n\
  var self = this;\n\
  var suite = this.suite;\n\
  var pending = this.files.length;\n\
  this.files.forEach(function(file){\n\
    file = path.resolve(file);\n\
    suite.emit('pre-require', global, file, self);\n\
    suite.emit('require', require(file), file, self);\n\
    suite.emit('post-require', global, file, self);\n\
    --pending || (fn && fn());\n\
  });\n\
};\n\
\n\
/**\n\
 * Enable growl support.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Mocha.prototype._growl = function(runner, reporter) {\n\
  var notify = require('growl');\n\
\n\
  runner.on('end', function(){\n\
    var stats = reporter.stats;\n\
    if (stats.failures) {\n\
      var msg = stats.failures + ' of ' + runner.total + ' tests failed';\n\
      notify(msg, { name: 'mocha', title: 'Failed', image: image('error') });\n\
    } else {\n\
      notify(stats.passes + ' tests passed in ' + stats.duration + 'ms', {\n\
          name: 'mocha'\n\
        , title: 'Passed'\n\
        , image: image('ok')\n\
      });\n\
    }\n\
  });\n\
};\n\
\n\
/**\n\
 * Add regexp to grep, if `re` is a string it is escaped.\n\
 *\n\
 * @param {RegExp|String} re\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.grep = function(re){\n\
  this.options.grep = 'string' == typeof re\n\
    ? new RegExp(utils.escapeRegexp(re))\n\
    : re;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Invert `.grep()` matches.\n\
 *\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.invert = function(){\n\
  this.options.invert = true;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Ignore global leaks.\n\
 *\n\
 * @param {Boolean} ignore\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.ignoreLeaks = function(ignore){\n\
  this.options.ignoreLeaks = !!ignore;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Enable global leak checking.\n\
 *\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.checkLeaks = function(){\n\
  this.options.ignoreLeaks = false;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Enable growl support.\n\
 *\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.growl = function(){\n\
  this.options.growl = true;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Ignore `globals` array or string.\n\
 *\n\
 * @param {Array|String} globals\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.globals = function(globals){\n\
  this.options.globals = (this.options.globals || []).concat(globals);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit color output.\n\
 *\n\
 * @param {Boolean} colors\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.useColors = function(colors){\n\
  this.options.useColors = arguments.length && colors != undefined\n\
    ? colors\n\
    : true;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set the timeout in milliseconds.\n\
 *\n\
 * @param {Number} timeout\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.timeout = function(timeout){\n\
  this.suite.timeout(timeout);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set slowness threshold in milliseconds.\n\
 *\n\
 * @param {Number} slow\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.slow = function(slow){\n\
  this.suite.slow(slow);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Makes all tests async (accepting a callback)\n\
 *\n\
 * @return {Mocha}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.asyncOnly = function(){\n\
  this.options.asyncOnly = true;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Run tests and invoke `fn()` when complete.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Runner}\n\
 * @api public\n\
 */\n\
\n\
Mocha.prototype.run = function(fn){\n\
  if (this.files.length) this.loadFiles();\n\
  var suite = this.suite;\n\
  var options = this.options;\n\
  var runner = new exports.Runner(suite);\n\
  var reporter = new this._reporter(runner);\n\
  runner.ignoreLeaks = false !== options.ignoreLeaks;\n\
  runner.asyncOnly = options.asyncOnly;\n\
  if (options.grep) runner.grep(options.grep, options.invert);\n\
  if (options.globals) runner.globals(options.globals);\n\
  if (options.growl) this._growl(runner, reporter);\n\
  exports.reporters.Base.useColors = options.useColors;\n\
  return runner.run(fn);\n\
};\n\
\n\
}); // module: mocha.js\n\
\n\
require.register(\"ms.js\", function(module, exports, require){\n\
/**\n\
 * Helpers.\n\
 */\n\
\n\
var s = 1000;\n\
var m = s * 60;\n\
var h = m * 60;\n\
var d = h * 24;\n\
var y = d * 365.25;\n\
\n\
/**\n\
 * Parse or format the given `val`.\n\
 *\n\
 * Options:\n\
 *\n\
 *  - `long` verbose formatting [false]\n\
 *\n\
 * @param {String|Number} val\n\
 * @param {Object} options\n\
 * @return {String|Number}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(val, options){\n\
  options = options || {};\n\
  if ('string' == typeof val) return parse(val);\n\
  return options.long\n\
    ? long(val)\n\
    : short(val);\n\
};\n\
\n\
/**\n\
 * Parse the given `str` and return milliseconds.\n\
 *\n\
 * @param {String} str\n\
 * @return {Number}\n\
 * @api private\n\
 */\n\
\n\
function parse(str) {\n\
  var match = /^((?:\\d+)?\\.?\\d+) *(ms|seconds?|s|minutes?|m|hours?|h|days?|d|years?|y)?$/i.exec(str);\n\
  if (!match) return;\n\
  var n = parseFloat(match[1]);\n\
  var type = (match[2] || 'ms').toLowerCase();\n\
  switch (type) {\n\
    case 'years':\n\
    case 'year':\n\
    case 'y':\n\
      return n * y;\n\
    case 'days':\n\
    case 'day':\n\
    case 'd':\n\
      return n * d;\n\
    case 'hours':\n\
    case 'hour':\n\
    case 'h':\n\
      return n * h;\n\
    case 'minutes':\n\
    case 'minute':\n\
    case 'm':\n\
      return n * m;\n\
    case 'seconds':\n\
    case 'second':\n\
    case 's':\n\
      return n * s;\n\
    case 'ms':\n\
      return n;\n\
  }\n\
}\n\
\n\
/**\n\
 * Short format for `ms`.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function short(ms) {\n\
  if (ms >= d) return Math.round(ms / d) + 'd';\n\
  if (ms >= h) return Math.round(ms / h) + 'h';\n\
  if (ms >= m) return Math.round(ms / m) + 'm';\n\
  if (ms >= s) return Math.round(ms / s) + 's';\n\
  return ms + 'ms';\n\
}\n\
\n\
/**\n\
 * Long format for `ms`.\n\
 *\n\
 * @param {Number} ms\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function long(ms) {\n\
  return plural(ms, d, 'day')\n\
    || plural(ms, h, 'hour')\n\
    || plural(ms, m, 'minute')\n\
    || plural(ms, s, 'second')\n\
    || ms + ' ms';\n\
}\n\
\n\
/**\n\
 * Pluralization helper.\n\
 */\n\
\n\
function plural(ms, n, name) {\n\
  if (ms < n) return;\n\
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;\n\
  return Math.ceil(ms / n) + ' ' + name + 's';\n\
}\n\
\n\
}); // module: ms.js\n\
\n\
require.register(\"reporters/base.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var tty = require('browser/tty')\n\
  , diff = require('browser/diff')\n\
  , ms = require('../ms');\n\
\n\
/**\n\
 * Save timer references to avoid Sinon interfering (see GH-237).\n\
 */\n\
\n\
var Date = global.Date\n\
  , setTimeout = global.setTimeout\n\
  , setInterval = global.setInterval\n\
  , clearTimeout = global.clearTimeout\n\
  , clearInterval = global.clearInterval;\n\
\n\
/**\n\
 * Check if both stdio streams are associated with a tty.\n\
 */\n\
\n\
var isatty = tty.isatty(1) && tty.isatty(2);\n\
\n\
/**\n\
 * Expose `Base`.\n\
 */\n\
\n\
exports = module.exports = Base;\n\
\n\
/**\n\
 * Enable coloring by default.\n\
 */\n\
\n\
exports.useColors = isatty || (process.env.MOCHA_COLORS !== undefined);\n\
\n\
/**\n\
 * Inline diffs instead of +/-\n\
 */\n\
\n\
exports.inlineDiffs = false;\n\
\n\
/**\n\
 * Default color map.\n\
 */\n\
\n\
exports.colors = {\n\
    'pass': 90\n\
  , 'fail': 31\n\
  , 'bright pass': 92\n\
  , 'bright fail': 91\n\
  , 'bright yellow': 93\n\
  , 'pending': 36\n\
  , 'suite': 0\n\
  , 'error title': 0\n\
  , 'error message': 31\n\
  , 'error stack': 90\n\
  , 'checkmark': 32\n\
  , 'fast': 90\n\
  , 'medium': 33\n\
  , 'slow': 31\n\
  , 'green': 32\n\
  , 'light': 90\n\
  , 'diff gutter': 90\n\
  , 'diff added': 42\n\
  , 'diff removed': 41\n\
};\n\
\n\
/**\n\
 * Default symbol map.\n\
 */\n\
\n\
exports.symbols = {\n\
  ok: '✓',\n\
  err: '✖',\n\
  dot: '․'\n\
};\n\
\n\
// With node.js on Windows: use symbols available in terminal default fonts\n\
if ('win32' == process.platform) {\n\
  exports.symbols.ok = '\\u221A';\n\
  exports.symbols.err = '\\u00D7';\n\
  exports.symbols.dot = '.';\n\
}\n\
\n\
/**\n\
 * Color `str` with the given `type`,\n\
 * allowing colors to be disabled,\n\
 * as well as user-defined color\n\
 * schemes.\n\
 *\n\
 * @param {String} type\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
var color = exports.color = function(type, str) {\n\
  if (!exports.useColors) return str;\n\
  return '\\u001b[' + exports.colors[type] + 'm' + str + '\\u001b[0m';\n\
};\n\
\n\
/**\n\
 * Expose term window size, with some\n\
 * defaults for when stderr is not a tty.\n\
 */\n\
\n\
exports.window = {\n\
  width: isatty\n\
    ? process.stdout.getWindowSize\n\
      ? process.stdout.getWindowSize(1)[0]\n\
      : tty.getWindowSize()[1]\n\
    : 75\n\
};\n\
\n\
/**\n\
 * Expose some basic cursor interactions\n\
 * that are common among reporters.\n\
 */\n\
\n\
exports.cursor = {\n\
  hide: function(){\n\
    isatty && process.stdout.write('\\u001b[?25l');\n\
  },\n\
\n\
  show: function(){\n\
    isatty && process.stdout.write('\\u001b[?25h');\n\
  },\n\
\n\
  deleteLine: function(){\n\
    isatty && process.stdout.write('\\u001b[2K');\n\
  },\n\
\n\
  beginningOfLine: function(){\n\
    isatty && process.stdout.write('\\u001b[0G');\n\
  },\n\
\n\
  CR: function(){\n\
    if (isatty) {\n\
      exports.cursor.deleteLine();\n\
      exports.cursor.beginningOfLine();\n\
    } else {\n\
      process.stdout.write('\\n\
');\n\
    }\n\
  }\n\
};\n\
\n\
/**\n\
 * Outut the given `failures` as a list.\n\
 *\n\
 * @param {Array} failures\n\
 * @api public\n\
 */\n\
\n\
exports.list = function(failures){\n\
  console.error();\n\
  failures.forEach(function(test, i){\n\
    // format\n\
    var fmt = color('error title', '  %s) %s:\\n\
')\n\
      + color('error message', '     %s')\n\
      + color('error stack', '\\n\
%s\\n\
');\n\
\n\
    // msg\n\
    var err = test.err\n\
      , message = err.message || ''\n\
      , stack = err.stack || message\n\
      , index = stack.indexOf(message) + message.length\n\
      , msg = stack.slice(0, index)\n\
      , actual = err.actual\n\
      , expected = err.expected\n\
      , escape = true;\n\
\n\
    // uncaught\n\
    if (err.uncaught) {\n\
      msg = 'Uncaught ' + msg;\n\
    }\n\
\n\
    // explicitly show diff\n\
    if (err.showDiff && sameType(actual, expected)) {\n\
      escape = false;\n\
      err.actual = actual = stringify(actual);\n\
      err.expected = expected = stringify(expected);\n\
    }\n\
\n\
    // actual / expected diff\n\
    if ('string' == typeof actual && 'string' == typeof expected) {\n\
      fmt = color('error title', '  %s) %s:\\n\
%s') + color('error stack', '\\n\
%s\\n\
');\n\
      var match = message.match(/^([^:]+): expected/);\n\
      msg = match ? '\\n\
      ' + color('error message', match[1]) : '';\n\
\n\
      if (exports.inlineDiffs) {\n\
        msg += inlineDiff(err, escape);\n\
      } else {\n\
        msg += unifiedDiff(err, escape);\n\
      }\n\
    }\n\
\n\
    // indent stack trace without msg\n\
    stack = stack.slice(index ? index + 1 : index)\n\
      .replace(/^/gm, '  ');\n\
\n\
    console.error(fmt, (i + 1), test.fullTitle(), msg, stack);\n\
  });\n\
};\n\
\n\
/**\n\
 * Initialize a new `Base` reporter.\n\
 *\n\
 * All other reporters generally\n\
 * inherit from this reporter, providing\n\
 * stats such as test duration, number\n\
 * of tests passed / failed etc.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function Base(runner) {\n\
  var self = this\n\
    , stats = this.stats = { suites: 0, tests: 0, passes: 0, pending: 0, failures: 0 }\n\
    , failures = this.failures = [];\n\
\n\
  if (!runner) return;\n\
  this.runner = runner;\n\
\n\
  runner.stats = stats;\n\
\n\
  runner.on('start', function(){\n\
    stats.start = new Date;\n\
  });\n\
\n\
  runner.on('suite', function(suite){\n\
    stats.suites = stats.suites || 0;\n\
    suite.root || stats.suites++;\n\
  });\n\
\n\
  runner.on('test end', function(test){\n\
    stats.tests = stats.tests || 0;\n\
    stats.tests++;\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    stats.passes = stats.passes || 0;\n\
\n\
    var medium = test.slow() / 2;\n\
    test.speed = test.duration > test.slow()\n\
      ? 'slow'\n\
      : test.duration > medium\n\
        ? 'medium'\n\
        : 'fast';\n\
\n\
    stats.passes++;\n\
  });\n\
\n\
  runner.on('fail', function(test, err){\n\
    stats.failures = stats.failures || 0;\n\
    stats.failures++;\n\
    test.err = err;\n\
    failures.push(test);\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    stats.end = new Date;\n\
    stats.duration = new Date - stats.start;\n\
  });\n\
\n\
  runner.on('pending', function(){\n\
    stats.pending++;\n\
  });\n\
}\n\
\n\
/**\n\
 * Output common epilogue used by many of\n\
 * the bundled reporters.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
Base.prototype.epilogue = function(){\n\
  var stats = this.stats;\n\
  var tests;\n\
  var fmt;\n\
\n\
  console.log();\n\
\n\
  // passes\n\
  fmt = color('bright pass', ' ')\n\
    + color('green', ' %d passing')\n\
    + color('light', ' (%s)');\n\
\n\
  console.log(fmt,\n\
    stats.passes || 0,\n\
    ms(stats.duration));\n\
\n\
  // pending\n\
  if (stats.pending) {\n\
    fmt = color('pending', ' ')\n\
      + color('pending', ' %d pending');\n\
\n\
    console.log(fmt, stats.pending);\n\
  }\n\
\n\
  // failures\n\
  if (stats.failures) {\n\
    fmt = color('fail', '  %d failing');\n\
\n\
    console.error(fmt,\n\
      stats.failures);\n\
\n\
    Base.list(this.failures);\n\
    console.error();\n\
  }\n\
\n\
  console.log();\n\
};\n\
\n\
/**\n\
 * Pad the given `str` to `len`.\n\
 *\n\
 * @param {String} str\n\
 * @param {String} len\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function pad(str, len) {\n\
  str = String(str);\n\
  return Array(len - str.length + 1).join(' ') + str;\n\
}\n\
\n\
\n\
/**\n\
 * Returns an inline diff between 2 strings with coloured ANSI output\n\
 *\n\
 * @param {Error} Error with actual/expected\n\
 * @return {String} Diff\n\
 * @api private\n\
 */\n\
\n\
function inlineDiff(err, escape) {\n\
  var msg = errorDiff(err, 'WordsWithSpace', escape);\n\
\n\
  // linenos\n\
  var lines = msg.split('\\n\
');\n\
  if (lines.length > 4) {\n\
    var width = String(lines.length).length;\n\
    msg = lines.map(function(str, i){\n\
      return pad(++i, width) + ' |' + ' ' + str;\n\
    }).join('\\n\
');\n\
  }\n\
\n\
  // legend\n\
  msg = '\\n\
'\n\
    + color('diff removed', 'actual')\n\
    + ' '\n\
    + color('diff added', 'expected')\n\
    + '\\n\
\\n\
'\n\
    + msg\n\
    + '\\n\
';\n\
\n\
  // indent\n\
  msg = msg.replace(/^/gm, '      ');\n\
  return msg;\n\
}\n\
\n\
/**\n\
 * Returns a unified diff between 2 strings\n\
 *\n\
 * @param {Error} Error with actual/expected\n\
 * @return {String} Diff\n\
 * @api private\n\
 */\n\
\n\
function unifiedDiff(err, escape) {\n\
  var indent = '      ';\n\
  function cleanUp(line) {\n\
    if (escape) {\n\
      line = escapeInvisibles(line);\n\
    }\n\
    if (line[0] === '+') return indent + colorLines('diff added', line);\n\
    if (line[0] === '-') return indent + colorLines('diff removed', line);\n\
    if (line.match(/\\@\\@/)) return null;\n\
    if (line.match(/\\\\ No newline/)) return null;\n\
    else return indent + line;\n\
  }\n\
  function notBlank(line) {\n\
    return line != null;\n\
  }\n\
  msg = diff.createPatch('string', err.actual, err.expected);\n\
  var lines = msg.split('\\n\
').splice(4);\n\
  return '\\n\
      '\n\
         + colorLines('diff added',   '+ expected') + ' '\n\
         + colorLines('diff removed', '- actual')\n\
         + '\\n\
\\n\
'\n\
         + lines.map(cleanUp).filter(notBlank).join('\\n\
');\n\
}\n\
\n\
/**\n\
 * Return a character diff for `err`.\n\
 *\n\
 * @param {Error} err\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function errorDiff(err, type, escape) {\n\
  var actual   = escape ? escapeInvisibles(err.actual)   : err.actual;\n\
  var expected = escape ? escapeInvisibles(err.expected) : err.expected;\n\
  return diff['diff' + type](actual, expected).map(function(str){\n\
    if (str.added) return colorLines('diff added', str.value);\n\
    if (str.removed) return colorLines('diff removed', str.value);\n\
    return str.value;\n\
  }).join('');\n\
}\n\
\n\
/**\n\
 * Returns a string with all invisible characters in plain text\n\
 *\n\
 * @param {String} line\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
function escapeInvisibles(line) {\n\
    return line.replace(/\\t/g, '<tab>')\n\
               .replace(/\\r/g, '<CR>')\n\
               .replace(/\\n\
/g, '<LF>\\n\
');\n\
}\n\
\n\
/**\n\
 * Color lines for `str`, using the color `name`.\n\
 *\n\
 * @param {String} name\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function colorLines(name, str) {\n\
  return str.split('\\n\
').map(function(str){\n\
    return color(name, str);\n\
  }).join('\\n\
');\n\
}\n\
\n\
/**\n\
 * Stringify `obj`.\n\
 *\n\
 * @param {Mixed} obj\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function stringify(obj) {\n\
  if (obj instanceof RegExp) return obj.toString();\n\
  return JSON.stringify(obj, null, 2);\n\
}\n\
\n\
/**\n\
 * Check that a / b have the same type.\n\
 *\n\
 * @param {Object} a\n\
 * @param {Object} b\n\
 * @return {Boolean}\n\
 * @api private\n\
 */\n\
\n\
function sameType(a, b) {\n\
  a = Object.prototype.toString.call(a);\n\
  b = Object.prototype.toString.call(b);\n\
  return a == b;\n\
}\n\
\n\
\n\
\n\
}); // module: reporters/base.js\n\
\n\
require.register(\"reporters/doc.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , utils = require('../utils');\n\
\n\
/**\n\
 * Expose `Doc`.\n\
 */\n\
\n\
exports = module.exports = Doc;\n\
\n\
/**\n\
 * Initialize a new `Doc` reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function Doc(runner) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , stats = this.stats\n\
    , total = runner.total\n\
    , indents = 2;\n\
\n\
  function indent() {\n\
    return Array(indents).join('  ');\n\
  }\n\
\n\
  runner.on('suite', function(suite){\n\
    if (suite.root) return;\n\
    ++indents;\n\
    console.log('%s<section class=\"suite\">', indent());\n\
    ++indents;\n\
    console.log('%s<h1>%s</h1>', indent(), utils.escape(suite.title));\n\
    console.log('%s<dl>', indent());\n\
  });\n\
\n\
  runner.on('suite end', function(suite){\n\
    if (suite.root) return;\n\
    console.log('%s</dl>', indent());\n\
    --indents;\n\
    console.log('%s</section>', indent());\n\
    --indents;\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    console.log('%s  <dt>%s</dt>', indent(), utils.escape(test.title));\n\
    var code = utils.escape(utils.clean(test.fn.toString()));\n\
    console.log('%s  <dd><pre><code>%s</code></pre></dd>', indent(), code);\n\
  });\n\
}\n\
\n\
}); // module: reporters/doc.js\n\
\n\
require.register(\"reporters/dot.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , color = Base.color;\n\
\n\
/**\n\
 * Expose `Dot`.\n\
 */\n\
\n\
exports = module.exports = Dot;\n\
\n\
/**\n\
 * Initialize a new `Dot` matrix test reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function Dot(runner) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , stats = this.stats\n\
    , width = Base.window.width * .75 | 0\n\
    , n = 0;\n\
\n\
  runner.on('start', function(){\n\
    process.stdout.write('\\n\
  ');\n\
  });\n\
\n\
  runner.on('pending', function(test){\n\
    process.stdout.write(color('pending', Base.symbols.dot));\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    if (++n % width == 0) process.stdout.write('\\n\
  ');\n\
    if ('slow' == test.speed) {\n\
      process.stdout.write(color('bright yellow', Base.symbols.dot));\n\
    } else {\n\
      process.stdout.write(color(test.speed, Base.symbols.dot));\n\
    }\n\
  });\n\
\n\
  runner.on('fail', function(test, err){\n\
    if (++n % width == 0) process.stdout.write('\\n\
  ');\n\
    process.stdout.write(color('fail', Base.symbols.dot));\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    console.log();\n\
    self.epilogue();\n\
  });\n\
}\n\
\n\
/**\n\
 * Inherit from `Base.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Base.prototype;\n\
Dot.prototype = new F;\n\
Dot.prototype.constructor = Dot;\n\
\n\
}); // module: reporters/dot.js\n\
\n\
require.register(\"reporters/html-cov.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var JSONCov = require('./json-cov')\n\
  , fs = require('browser/fs');\n\
\n\
/**\n\
 * Expose `HTMLCov`.\n\
 */\n\
\n\
exports = module.exports = HTMLCov;\n\
\n\
/**\n\
 * Initialize a new `JsCoverage` reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function HTMLCov(runner) {\n\
  var jade = require('jade')\n\
    , file = __dirname + '/templates/coverage.jade'\n\
    , str = fs.readFileSync(file, 'utf8')\n\
    , fn = jade.compile(str, { filename: file })\n\
    , self = this;\n\
\n\
  JSONCov.call(this, runner, false);\n\
\n\
  runner.on('end', function(){\n\
    process.stdout.write(fn({\n\
        cov: self.cov\n\
      , coverageClass: coverageClass\n\
    }));\n\
  });\n\
}\n\
\n\
/**\n\
 * Return coverage class for `n`.\n\
 *\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function coverageClass(n) {\n\
  if (n >= 75) return 'high';\n\
  if (n >= 50) return 'medium';\n\
  if (n >= 25) return 'low';\n\
  return 'terrible';\n\
}\n\
}); // module: reporters/html-cov.js\n\
\n\
require.register(\"reporters/html.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , utils = require('../utils')\n\
  , Progress = require('../browser/progress')\n\
  , escape = utils.escape;\n\
\n\
/**\n\
 * Save timer references to avoid Sinon interfering (see GH-237).\n\
 */\n\
\n\
var Date = global.Date\n\
  , setTimeout = global.setTimeout\n\
  , setInterval = global.setInterval\n\
  , clearTimeout = global.clearTimeout\n\
  , clearInterval = global.clearInterval;\n\
\n\
/**\n\
 * Expose `HTML`.\n\
 */\n\
\n\
exports = module.exports = HTML;\n\
\n\
/**\n\
 * Stats template.\n\
 */\n\
\n\
var statsTemplate = '<ul id=\"mocha-stats\">'\n\
  + '<li class=\"progress\"><canvas width=\"40\" height=\"40\"></canvas></li>'\n\
  + '<li class=\"passes\"><a href=\"#\">passes:</a> <em>0</em></li>'\n\
  + '<li class=\"failures\"><a href=\"#\">failures:</a> <em>0</em></li>'\n\
  + '<li class=\"duration\">duration: <em>0</em>s</li>'\n\
  + '</ul>';\n\
\n\
/**\n\
 * Initialize a new `HTML` reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function HTML(runner, root) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , stats = this.stats\n\
    , total = runner.total\n\
    , stat = fragment(statsTemplate)\n\
    , items = stat.getElementsByTagName('li')\n\
    , passes = items[1].getElementsByTagName('em')[0]\n\
    , passesLink = items[1].getElementsByTagName('a')[0]\n\
    , failures = items[2].getElementsByTagName('em')[0]\n\
    , failuresLink = items[2].getElementsByTagName('a')[0]\n\
    , duration = items[3].getElementsByTagName('em')[0]\n\
    , canvas = stat.getElementsByTagName('canvas')[0]\n\
    , report = fragment('<ul id=\"mocha-report\"></ul>')\n\
    , stack = [report]\n\
    , progress\n\
    , ctx\n\
\n\
  root = root || document.getElementById('mocha');\n\
\n\
  if (canvas.getContext) {\n\
    var ratio = window.devicePixelRatio || 1;\n\
    canvas.style.width = canvas.width;\n\
    canvas.style.height = canvas.height;\n\
    canvas.width *= ratio;\n\
    canvas.height *= ratio;\n\
    ctx = canvas.getContext('2d');\n\
    ctx.scale(ratio, ratio);\n\
    progress = new Progress;\n\
  }\n\
\n\
  if (!root) return error('#mocha div missing, add it to your document');\n\
\n\
  // pass toggle\n\
  on(passesLink, 'click', function(){\n\
    unhide();\n\
    var name = /pass/.test(report.className) ? '' : ' pass';\n\
    report.className = report.className.replace(/fail|pass/g, '') + name;\n\
    if (report.className.trim()) hideSuitesWithout('test pass');\n\
  });\n\
\n\
  // failure toggle\n\
  on(failuresLink, 'click', function(){\n\
    unhide();\n\
    var name = /fail/.test(report.className) ? '' : ' fail';\n\
    report.className = report.className.replace(/fail|pass/g, '') + name;\n\
    if (report.className.trim()) hideSuitesWithout('test fail');\n\
  });\n\
\n\
  root.appendChild(stat);\n\
  root.appendChild(report);\n\
\n\
  if (progress) progress.size(40);\n\
\n\
  runner.on('suite', function(suite){\n\
    if (suite.root) return;\n\
\n\
    // suite\n\
    var url = self.suiteURL(suite);\n\
    var el = fragment('<li class=\"suite\"><h1><a href=\"%s\">%s</a></h1></li>', url, escape(suite.title));\n\
\n\
    // container\n\
    stack[0].appendChild(el);\n\
    stack.unshift(document.createElement('ul'));\n\
    el.appendChild(stack[0]);\n\
  });\n\
\n\
  runner.on('suite end', function(suite){\n\
    if (suite.root) return;\n\
    stack.shift();\n\
  });\n\
\n\
  runner.on('fail', function(test, err){\n\
    if ('hook' == test.type) runner.emit('test end', test);\n\
  });\n\
\n\
  runner.on('test end', function(test){\n\
    // TODO: add to stats\n\
    var percent = stats.tests / this.total * 100 | 0;\n\
    if (progress) progress.update(percent).draw(ctx);\n\
\n\
    // update stats\n\
    var ms = new Date - stats.start;\n\
    text(passes, stats.passes);\n\
    text(failures, stats.failures);\n\
    text(duration, (ms / 1000).toFixed(2));\n\
\n\
    // test\n\
    if ('passed' == test.state) {\n\
      var url = self.testURL(test);\n\
      var el = fragment('<li class=\"test pass %e\"><h2>%e<span class=\"duration\">%ems</span> <a href=\"%s\" class=\"replay\">‣</a></h2></li>', test.speed, test.title, test.duration, url);\n\
    } else if (test.pending) {\n\
      var el = fragment('<li class=\"test pass pending\"><h2>%e</h2></li>', test.title);\n\
    } else {\n\
      var el = fragment('<li class=\"test fail\"><h2>%e <a href=\"?grep=%e\" class=\"replay\">‣</a></h2></li>', test.title, encodeURIComponent(test.fullTitle()));\n\
      var str = test.err.stack || test.err.toString();\n\
\n\
      // FF / Opera do not add the message\n\
      if (!~str.indexOf(test.err.message)) {\n\
        str = test.err.message + '\\n\
' + str;\n\
      }\n\
\n\
      // <=IE7 stringifies to [Object Error]. Since it can be overloaded, we\n\
      // check for the result of the stringifying.\n\
      if ('[object Error]' == str) str = test.err.message;\n\
\n\
      // Safari doesn't give you a stack. Let's at least provide a source line.\n\
      if (!test.err.stack && test.err.sourceURL && test.err.line !== undefined) {\n\
        str += \"\\n\
(\" + test.err.sourceURL + \":\" + test.err.line + \")\";\n\
      }\n\
\n\
      el.appendChild(fragment('<pre class=\"error\">%e</pre>', str));\n\
    }\n\
\n\
    // toggle code\n\
    // TODO: defer\n\
    if (!test.pending) {\n\
      var h2 = el.getElementsByTagName('h2')[0];\n\
\n\
      on(h2, 'click', function(){\n\
        pre.style.display = 'none' == pre.style.display\n\
          ? 'block'\n\
          : 'none';\n\
      });\n\
\n\
      var pre = fragment('<pre><code>%e</code></pre>', utils.clean(test.fn.toString()));\n\
      el.appendChild(pre);\n\
      pre.style.display = 'none';\n\
    }\n\
\n\
    // Don't call .appendChild if #mocha-report was already .shift()'ed off the stack.\n\
    if (stack[0]) stack[0].appendChild(el);\n\
  });\n\
}\n\
\n\
/**\n\
 * Provide suite URL\n\
 *\n\
 * @param {Object} [suite]\n\
 */\n\
\n\
HTML.prototype.suiteURL = function(suite){\n\
  return '?grep=' + encodeURIComponent(suite.fullTitle());\n\
};\n\
\n\
/**\n\
 * Provide test URL\n\
 *\n\
 * @param {Object} [test]\n\
 */\n\
\n\
HTML.prototype.testURL = function(test){\n\
  return '?grep=' + encodeURIComponent(test.fullTitle());\n\
};\n\
\n\
/**\n\
 * Display error `msg`.\n\
 */\n\
\n\
function error(msg) {\n\
  document.body.appendChild(fragment('<div id=\"mocha-error\">%s</div>', msg));\n\
}\n\
\n\
/**\n\
 * Return a DOM fragment from `html`.\n\
 */\n\
\n\
function fragment(html) {\n\
  var args = arguments\n\
    , div = document.createElement('div')\n\
    , i = 1;\n\
\n\
  div.innerHTML = html.replace(/%([se])/g, function(_, type){\n\
    switch (type) {\n\
      case 's': return String(args[i++]);\n\
      case 'e': return escape(args[i++]);\n\
    }\n\
  });\n\
\n\
  return div.firstChild;\n\
}\n\
\n\
/**\n\
 * Check for suites that do not have elements\n\
 * with `classname`, and hide them.\n\
 */\n\
\n\
function hideSuitesWithout(classname) {\n\
  var suites = document.getElementsByClassName('suite');\n\
  for (var i = 0; i < suites.length; i++) {\n\
    var els = suites[i].getElementsByClassName(classname);\n\
    if (0 == els.length) suites[i].className += ' hidden';\n\
  }\n\
}\n\
\n\
/**\n\
 * Unhide .hidden suites.\n\
 */\n\
\n\
function unhide() {\n\
  var els = document.getElementsByClassName('suite hidden');\n\
  for (var i = 0; i < els.length; ++i) {\n\
    els[i].className = els[i].className.replace('suite hidden', 'suite');\n\
  }\n\
}\n\
\n\
/**\n\
 * Set `el` text to `str`.\n\
 */\n\
\n\
function text(el, str) {\n\
  if (el.textContent) {\n\
    el.textContent = str;\n\
  } else {\n\
    el.innerText = str;\n\
  }\n\
}\n\
\n\
/**\n\
 * Listen on `event` with callback `fn`.\n\
 */\n\
\n\
function on(el, event, fn) {\n\
  if (el.addEventListener) {\n\
    el.addEventListener(event, fn, false);\n\
  } else {\n\
    el.attachEvent('on' + event, fn);\n\
  }\n\
}\n\
\n\
}); // module: reporters/html.js\n\
\n\
require.register(\"reporters/index.js\", function(module, exports, require){\n\
\n\
exports.Base = require('./base');\n\
exports.Dot = require('./dot');\n\
exports.Doc = require('./doc');\n\
exports.TAP = require('./tap');\n\
exports.JSON = require('./json');\n\
exports.HTML = require('./html');\n\
exports.List = require('./list');\n\
exports.Min = require('./min');\n\
exports.Spec = require('./spec');\n\
exports.Nyan = require('./nyan');\n\
exports.XUnit = require('./xunit');\n\
exports.Markdown = require('./markdown');\n\
exports.Progress = require('./progress');\n\
exports.Landing = require('./landing');\n\
exports.JSONCov = require('./json-cov');\n\
exports.HTMLCov = require('./html-cov');\n\
exports.JSONStream = require('./json-stream');\n\
\n\
}); // module: reporters/index.js\n\
\n\
require.register(\"reporters/json-cov.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base');\n\
\n\
/**\n\
 * Expose `JSONCov`.\n\
 */\n\
\n\
exports = module.exports = JSONCov;\n\
\n\
/**\n\
 * Initialize a new `JsCoverage` reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @param {Boolean} output\n\
 * @api public\n\
 */\n\
\n\
function JSONCov(runner, output) {\n\
  var self = this\n\
    , output = 1 == arguments.length ? true : output;\n\
\n\
  Base.call(this, runner);\n\
\n\
  var tests = []\n\
    , failures = []\n\
    , passes = [];\n\
\n\
  runner.on('test end', function(test){\n\
    tests.push(test);\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    passes.push(test);\n\
  });\n\
\n\
  runner.on('fail', function(test){\n\
    failures.push(test);\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    var cov = global._$jscoverage || {};\n\
    var result = self.cov = map(cov);\n\
    result.stats = self.stats;\n\
    result.tests = tests.map(clean);\n\
    result.failures = failures.map(clean);\n\
    result.passes = passes.map(clean);\n\
    if (!output) return;\n\
    process.stdout.write(JSON.stringify(result, null, 2 ));\n\
  });\n\
}\n\
\n\
/**\n\
 * Map jscoverage data to a JSON structure\n\
 * suitable for reporting.\n\
 *\n\
 * @param {Object} cov\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function map(cov) {\n\
  var ret = {\n\
      instrumentation: 'node-jscoverage'\n\
    , sloc: 0\n\
    , hits: 0\n\
    , misses: 0\n\
    , coverage: 0\n\
    , files: []\n\
  };\n\
\n\
  for (var filename in cov) {\n\
    var data = coverage(filename, cov[filename]);\n\
    ret.files.push(data);\n\
    ret.hits += data.hits;\n\
    ret.misses += data.misses;\n\
    ret.sloc += data.sloc;\n\
  }\n\
\n\
  ret.files.sort(function(a, b) {\n\
    return a.filename.localeCompare(b.filename);\n\
  });\n\
\n\
  if (ret.sloc > 0) {\n\
    ret.coverage = (ret.hits / ret.sloc) * 100;\n\
  }\n\
\n\
  return ret;\n\
};\n\
\n\
/**\n\
 * Map jscoverage data for a single source file\n\
 * to a JSON structure suitable for reporting.\n\
 *\n\
 * @param {String} filename name of the source file\n\
 * @param {Object} data jscoverage coverage data\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function coverage(filename, data) {\n\
  var ret = {\n\
    filename: filename,\n\
    coverage: 0,\n\
    hits: 0,\n\
    misses: 0,\n\
    sloc: 0,\n\
    source: {}\n\
  };\n\
\n\
  data.source.forEach(function(line, num){\n\
    num++;\n\
\n\
    if (data[num] === 0) {\n\
      ret.misses++;\n\
      ret.sloc++;\n\
    } else if (data[num] !== undefined) {\n\
      ret.hits++;\n\
      ret.sloc++;\n\
    }\n\
\n\
    ret.source[num] = {\n\
        source: line\n\
      , coverage: data[num] === undefined\n\
        ? ''\n\
        : data[num]\n\
    };\n\
  });\n\
\n\
  ret.coverage = ret.hits / ret.sloc * 100;\n\
\n\
  return ret;\n\
}\n\
\n\
/**\n\
 * Return a plain-object representation of `test`\n\
 * free of cyclic properties etc.\n\
 *\n\
 * @param {Object} test\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function clean(test) {\n\
  return {\n\
      title: test.title\n\
    , fullTitle: test.fullTitle()\n\
    , duration: test.duration\n\
  }\n\
}\n\
\n\
}); // module: reporters/json-cov.js\n\
\n\
require.register(\"reporters/json-stream.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , color = Base.color;\n\
\n\
/**\n\
 * Expose `List`.\n\
 */\n\
\n\
exports = module.exports = List;\n\
\n\
/**\n\
 * Initialize a new `List` test reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function List(runner) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , stats = this.stats\n\
    , total = runner.total;\n\
\n\
  runner.on('start', function(){\n\
    console.log(JSON.stringify(['start', { total: total }]));\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    console.log(JSON.stringify(['pass', clean(test)]));\n\
  });\n\
\n\
  runner.on('fail', function(test, err){\n\
    console.log(JSON.stringify(['fail', clean(test)]));\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    process.stdout.write(JSON.stringify(['end', self.stats]));\n\
  });\n\
}\n\
\n\
/**\n\
 * Return a plain-object representation of `test`\n\
 * free of cyclic properties etc.\n\
 *\n\
 * @param {Object} test\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function clean(test) {\n\
  return {\n\
      title: test.title\n\
    , fullTitle: test.fullTitle()\n\
    , duration: test.duration\n\
  }\n\
}\n\
}); // module: reporters/json-stream.js\n\
\n\
require.register(\"reporters/json.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , cursor = Base.cursor\n\
  , color = Base.color;\n\
\n\
/**\n\
 * Expose `JSON`.\n\
 */\n\
\n\
exports = module.exports = JSONReporter;\n\
\n\
/**\n\
 * Initialize a new `JSON` reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function JSONReporter(runner) {\n\
  var self = this;\n\
  Base.call(this, runner);\n\
\n\
  var tests = []\n\
    , failures = []\n\
    , passes = [];\n\
\n\
  runner.on('test end', function(test){\n\
    tests.push(test);\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    passes.push(test);\n\
  });\n\
\n\
  runner.on('fail', function(test){\n\
    failures.push(test);\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    var obj = {\n\
        stats: self.stats\n\
      , tests: tests.map(clean)\n\
      , failures: failures.map(clean)\n\
      , passes: passes.map(clean)\n\
    };\n\
\n\
    process.stdout.write(JSON.stringify(obj, null, 2));\n\
  });\n\
}\n\
\n\
/**\n\
 * Return a plain-object representation of `test`\n\
 * free of cyclic properties etc.\n\
 *\n\
 * @param {Object} test\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function clean(test) {\n\
  return {\n\
      title: test.title\n\
    , fullTitle: test.fullTitle()\n\
    , duration: test.duration\n\
  }\n\
}\n\
}); // module: reporters/json.js\n\
\n\
require.register(\"reporters/landing.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , cursor = Base.cursor\n\
  , color = Base.color;\n\
\n\
/**\n\
 * Expose `Landing`.\n\
 */\n\
\n\
exports = module.exports = Landing;\n\
\n\
/**\n\
 * Airplane color.\n\
 */\n\
\n\
Base.colors.plane = 0;\n\
\n\
/**\n\
 * Airplane crash color.\n\
 */\n\
\n\
Base.colors['plane crash'] = 31;\n\
\n\
/**\n\
 * Runway color.\n\
 */\n\
\n\
Base.colors.runway = 90;\n\
\n\
/**\n\
 * Initialize a new `Landing` reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function Landing(runner) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , stats = this.stats\n\
    , width = Base.window.width * .75 | 0\n\
    , total = runner.total\n\
    , stream = process.stdout\n\
    , plane = color('plane', '✈')\n\
    , crashed = -1\n\
    , n = 0;\n\
\n\
  function runway() {\n\
    var buf = Array(width).join('-');\n\
    return '  ' + color('runway', buf);\n\
  }\n\
\n\
  runner.on('start', function(){\n\
    stream.write('\\n\
  ');\n\
    cursor.hide();\n\
  });\n\
\n\
  runner.on('test end', function(test){\n\
    // check if the plane crashed\n\
    var col = -1 == crashed\n\
      ? width * ++n / total | 0\n\
      : crashed;\n\
\n\
    // show the crash\n\
    if ('failed' == test.state) {\n\
      plane = color('plane crash', '✈');\n\
      crashed = col;\n\
    }\n\
\n\
    // render landing strip\n\
    stream.write('\\u001b[4F\\n\
\\n\
');\n\
    stream.write(runway());\n\
    stream.write('\\n\
  ');\n\
    stream.write(color('runway', Array(col).join('⋅')));\n\
    stream.write(plane)\n\
    stream.write(color('runway', Array(width - col).join('⋅') + '\\n\
'));\n\
    stream.write(runway());\n\
    stream.write('\\u001b[0m');\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    cursor.show();\n\
    console.log();\n\
    self.epilogue();\n\
  });\n\
}\n\
\n\
/**\n\
 * Inherit from `Base.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Base.prototype;\n\
Landing.prototype = new F;\n\
Landing.prototype.constructor = Landing;\n\
\n\
}); // module: reporters/landing.js\n\
\n\
require.register(\"reporters/list.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , cursor = Base.cursor\n\
  , color = Base.color;\n\
\n\
/**\n\
 * Expose `List`.\n\
 */\n\
\n\
exports = module.exports = List;\n\
\n\
/**\n\
 * Initialize a new `List` test reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function List(runner) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , stats = this.stats\n\
    , n = 0;\n\
\n\
  runner.on('start', function(){\n\
    console.log();\n\
  });\n\
\n\
  runner.on('test', function(test){\n\
    process.stdout.write(color('pass', '    ' + test.fullTitle() + ': '));\n\
  });\n\
\n\
  runner.on('pending', function(test){\n\
    var fmt = color('checkmark', '  -')\n\
      + color('pending', ' %s');\n\
    console.log(fmt, test.fullTitle());\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    var fmt = color('checkmark', '  '+Base.symbols.dot)\n\
      + color('pass', ' %s: ')\n\
      + color(test.speed, '%dms');\n\
    cursor.CR();\n\
    console.log(fmt, test.fullTitle(), test.duration);\n\
  });\n\
\n\
  runner.on('fail', function(test, err){\n\
    cursor.CR();\n\
    console.log(color('fail', '  %d) %s'), ++n, test.fullTitle());\n\
  });\n\
\n\
  runner.on('end', self.epilogue.bind(self));\n\
}\n\
\n\
/**\n\
 * Inherit from `Base.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Base.prototype;\n\
List.prototype = new F;\n\
List.prototype.constructor = List;\n\
\n\
\n\
}); // module: reporters/list.js\n\
\n\
require.register(\"reporters/markdown.js\", function(module, exports, require){\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , utils = require('../utils');\n\
\n\
/**\n\
 * Expose `Markdown`.\n\
 */\n\
\n\
exports = module.exports = Markdown;\n\
\n\
/**\n\
 * Initialize a new `Markdown` reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function Markdown(runner) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , stats = this.stats\n\
    , level = 0\n\
    , buf = '';\n\
\n\
  function title(str) {\n\
    return Array(level).join('#') + ' ' + str;\n\
  }\n\
\n\
  function indent() {\n\
    return Array(level).join('  ');\n\
  }\n\
\n\
  function mapTOC(suite, obj) {\n\
    var ret = obj;\n\
    obj = obj[suite.title] = obj[suite.title] || { suite: suite };\n\
    suite.suites.forEach(function(suite){\n\
      mapTOC(suite, obj);\n\
    });\n\
    return ret;\n\
  }\n\
\n\
  function stringifyTOC(obj, level) {\n\
    ++level;\n\
    var buf = '';\n\
    var link;\n\
    for (var key in obj) {\n\
      if ('suite' == key) continue;\n\
      if (key) link = ' - [' + key + '](#' + utils.slug(obj[key].suite.fullTitle()) + ')\\n\
';\n\
      if (key) buf += Array(level).join('  ') + link;\n\
      buf += stringifyTOC(obj[key], level);\n\
    }\n\
    --level;\n\
    return buf;\n\
  }\n\
\n\
  function generateTOC(suite) {\n\
    var obj = mapTOC(suite, {});\n\
    return stringifyTOC(obj, 0);\n\
  }\n\
\n\
  generateTOC(runner.suite);\n\
\n\
  runner.on('suite', function(suite){\n\
    ++level;\n\
    var slug = utils.slug(suite.fullTitle());\n\
    buf += '<a name=\"' + slug + '\"></a>' + '\\n\
';\n\
    buf += title(suite.title) + '\\n\
';\n\
  });\n\
\n\
  runner.on('suite end', function(suite){\n\
    --level;\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    var code = utils.clean(test.fn.toString());\n\
    buf += test.title + '.\\n\
';\n\
    buf += '\\n\
```js\\n\
';\n\
    buf += code + '\\n\
';\n\
    buf += '```\\n\
\\n\
';\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    process.stdout.write('# TOC\\n\
');\n\
    process.stdout.write(generateTOC(runner.suite));\n\
    process.stdout.write(buf);\n\
  });\n\
}\n\
}); // module: reporters/markdown.js\n\
\n\
require.register(\"reporters/min.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base');\n\
\n\
/**\n\
 * Expose `Min`.\n\
 */\n\
\n\
exports = module.exports = Min;\n\
\n\
/**\n\
 * Initialize a new `Min` minimal test reporter (best used with --watch).\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function Min(runner) {\n\
  Base.call(this, runner);\n\
\n\
  runner.on('start', function(){\n\
    // clear screen\n\
    process.stdout.write('\\u001b[2J');\n\
    // set cursor position\n\
    process.stdout.write('\\u001b[1;3H');\n\
  });\n\
\n\
  runner.on('end', this.epilogue.bind(this));\n\
}\n\
\n\
/**\n\
 * Inherit from `Base.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Base.prototype;\n\
Min.prototype = new F;\n\
Min.prototype.constructor = Min;\n\
\n\
\n\
}); // module: reporters/min.js\n\
\n\
require.register(\"reporters/nyan.js\", function(module, exports, require){\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , color = Base.color;\n\
\n\
/**\n\
 * Expose `Dot`.\n\
 */\n\
\n\
exports = module.exports = NyanCat;\n\
\n\
/**\n\
 * Initialize a new `Dot` matrix test reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function NyanCat(runner) {\n\
  Base.call(this, runner);\n\
  var self = this\n\
    , stats = this.stats\n\
    , width = Base.window.width * .75 | 0\n\
    , rainbowColors = this.rainbowColors = self.generateColors()\n\
    , colorIndex = this.colorIndex = 0\n\
    , numerOfLines = this.numberOfLines = 4\n\
    , trajectories = this.trajectories = [[], [], [], []]\n\
    , nyanCatWidth = this.nyanCatWidth = 11\n\
    , trajectoryWidthMax = this.trajectoryWidthMax = (width - nyanCatWidth)\n\
    , scoreboardWidth = this.scoreboardWidth = 5\n\
    , tick = this.tick = 0\n\
    , n = 0;\n\
\n\
  runner.on('start', function(){\n\
    Base.cursor.hide();\n\
    self.draw();\n\
  });\n\
\n\
  runner.on('pending', function(test){\n\
    self.draw();\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    self.draw();\n\
  });\n\
\n\
  runner.on('fail', function(test, err){\n\
    self.draw();\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    Base.cursor.show();\n\
    for (var i = 0; i < self.numberOfLines; i++) write('\\n\
');\n\
    self.epilogue();\n\
  });\n\
}\n\
\n\
/**\n\
 * Draw the nyan cat\n\
 *\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.draw = function(){\n\
  this.appendRainbow();\n\
  this.drawScoreboard();\n\
  this.drawRainbow();\n\
  this.drawNyanCat();\n\
  this.tick = !this.tick;\n\
};\n\
\n\
/**\n\
 * Draw the \"scoreboard\" showing the number\n\
 * of passes, failures and pending tests.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.drawScoreboard = function(){\n\
  var stats = this.stats;\n\
  var colors = Base.colors;\n\
\n\
  function draw(color, n) {\n\
    write(' ');\n\
    write('\\u001b[' + color + 'm' + n + '\\u001b[0m');\n\
    write('\\n\
');\n\
  }\n\
\n\
  draw(colors.green, stats.passes);\n\
  draw(colors.fail, stats.failures);\n\
  draw(colors.pending, stats.pending);\n\
  write('\\n\
');\n\
\n\
  this.cursorUp(this.numberOfLines);\n\
};\n\
\n\
/**\n\
 * Append the rainbow.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.appendRainbow = function(){\n\
  var segment = this.tick ? '_' : '-';\n\
  var rainbowified = this.rainbowify(segment);\n\
\n\
  for (var index = 0; index < this.numberOfLines; index++) {\n\
    var trajectory = this.trajectories[index];\n\
    if (trajectory.length >= this.trajectoryWidthMax) trajectory.shift();\n\
    trajectory.push(rainbowified);\n\
  }\n\
};\n\
\n\
/**\n\
 * Draw the rainbow.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.drawRainbow = function(){\n\
  var self = this;\n\
\n\
  this.trajectories.forEach(function(line, index) {\n\
    write('\\u001b[' + self.scoreboardWidth + 'C');\n\
    write(line.join(''));\n\
    write('\\n\
');\n\
  });\n\
\n\
  this.cursorUp(this.numberOfLines);\n\
};\n\
\n\
/**\n\
 * Draw the nyan cat\n\
 *\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.drawNyanCat = function() {\n\
  var self = this;\n\
  var startWidth = this.scoreboardWidth + this.trajectories[0].length;\n\
  var color = '\\u001b[' + startWidth + 'C';\n\
  var padding = '';\n\
\n\
  write(color);\n\
  write('_,------,');\n\
  write('\\n\
');\n\
\n\
  write(color);\n\
  padding = self.tick ? '  ' : '   ';\n\
  write('_|' + padding + '/\\\\_/\\\\ ');\n\
  write('\\n\
');\n\
\n\
  write(color);\n\
  padding = self.tick ? '_' : '__';\n\
  var tail = self.tick ? '~' : '^';\n\
  var face;\n\
  write(tail + '|' + padding + this.face() + ' ');\n\
  write('\\n\
');\n\
\n\
  write(color);\n\
  padding = self.tick ? ' ' : '  ';\n\
  write(padding + '\"\"  \"\" ');\n\
  write('\\n\
');\n\
\n\
  this.cursorUp(this.numberOfLines);\n\
};\n\
\n\
/**\n\
 * Draw nyan cat face.\n\
 *\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.face = function() {\n\
  var stats = this.stats;\n\
  if (stats.failures) {\n\
    return '( x .x)';\n\
  } else if (stats.pending) {\n\
    return '( o .o)';\n\
  } else if(stats.passes) {\n\
    return '( ^ .^)';\n\
  } else {\n\
    return '( - .-)';\n\
  }\n\
}\n\
\n\
/**\n\
 * Move cursor up `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.cursorUp = function(n) {\n\
  write('\\u001b[' + n + 'A');\n\
};\n\
\n\
/**\n\
 * Move cursor down `n`.\n\
 *\n\
 * @param {Number} n\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.cursorDown = function(n) {\n\
  write('\\u001b[' + n + 'B');\n\
};\n\
\n\
/**\n\
 * Generate rainbow colors.\n\
 *\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.generateColors = function(){\n\
  var colors = [];\n\
\n\
  for (var i = 0; i < (6 * 7); i++) {\n\
    var pi3 = Math.floor(Math.PI / 3);\n\
    var n = (i * (1.0 / 6));\n\
    var r = Math.floor(3 * Math.sin(n) + 3);\n\
    var g = Math.floor(3 * Math.sin(n + 2 * pi3) + 3);\n\
    var b = Math.floor(3 * Math.sin(n + 4 * pi3) + 3);\n\
    colors.push(36 * r + 6 * g + b + 16);\n\
  }\n\
\n\
  return colors;\n\
};\n\
\n\
/**\n\
 * Apply rainbow to the given `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
NyanCat.prototype.rainbowify = function(str){\n\
  var color = this.rainbowColors[this.colorIndex % this.rainbowColors.length];\n\
  this.colorIndex += 1;\n\
  return '\\u001b[38;5;' + color + 'm' + str + '\\u001b[0m';\n\
};\n\
\n\
/**\n\
 * Stdout helper.\n\
 */\n\
\n\
function write(string) {\n\
  process.stdout.write(string);\n\
}\n\
\n\
/**\n\
 * Inherit from `Base.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Base.prototype;\n\
NyanCat.prototype = new F;\n\
NyanCat.prototype.constructor = NyanCat;\n\
\n\
\n\
}); // module: reporters/nyan.js\n\
\n\
require.register(\"reporters/progress.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , cursor = Base.cursor\n\
  , color = Base.color;\n\
\n\
/**\n\
 * Expose `Progress`.\n\
 */\n\
\n\
exports = module.exports = Progress;\n\
\n\
/**\n\
 * General progress bar color.\n\
 */\n\
\n\
Base.colors.progress = 90;\n\
\n\
/**\n\
 * Initialize a new `Progress` bar test reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @param {Object} options\n\
 * @api public\n\
 */\n\
\n\
function Progress(runner, options) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , options = options || {}\n\
    , stats = this.stats\n\
    , width = Base.window.width * .50 | 0\n\
    , total = runner.total\n\
    , complete = 0\n\
    , max = Math.max;\n\
\n\
  // default chars\n\
  options.open = options.open || '[';\n\
  options.complete = options.complete || '▬';\n\
  options.incomplete = options.incomplete || Base.symbols.dot;\n\
  options.close = options.close || ']';\n\
  options.verbose = false;\n\
\n\
  // tests started\n\
  runner.on('start', function(){\n\
    console.log();\n\
    cursor.hide();\n\
  });\n\
\n\
  // tests complete\n\
  runner.on('test end', function(){\n\
    complete++;\n\
    var incomplete = total - complete\n\
      , percent = complete / total\n\
      , n = width * percent | 0\n\
      , i = width - n;\n\
\n\
    cursor.CR();\n\
    process.stdout.write('\\u001b[J');\n\
    process.stdout.write(color('progress', '  ' + options.open));\n\
    process.stdout.write(Array(n).join(options.complete));\n\
    process.stdout.write(Array(i).join(options.incomplete));\n\
    process.stdout.write(color('progress', options.close));\n\
    if (options.verbose) {\n\
      process.stdout.write(color('progress', ' ' + complete + ' of ' + total));\n\
    }\n\
  });\n\
\n\
  // tests are complete, output some stats\n\
  // and the failures if any\n\
  runner.on('end', function(){\n\
    cursor.show();\n\
    console.log();\n\
    self.epilogue();\n\
  });\n\
}\n\
\n\
/**\n\
 * Inherit from `Base.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Base.prototype;\n\
Progress.prototype = new F;\n\
Progress.prototype.constructor = Progress;\n\
\n\
\n\
}); // module: reporters/progress.js\n\
\n\
require.register(\"reporters/spec.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , cursor = Base.cursor\n\
  , color = Base.color;\n\
\n\
/**\n\
 * Expose `Spec`.\n\
 */\n\
\n\
exports = module.exports = Spec;\n\
\n\
/**\n\
 * Initialize a new `Spec` test reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function Spec(runner) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , stats = this.stats\n\
    , indents = 0\n\
    , n = 0;\n\
\n\
  function indent() {\n\
    return Array(indents).join('  ')\n\
  }\n\
\n\
  runner.on('start', function(){\n\
    console.log();\n\
  });\n\
\n\
  runner.on('suite', function(suite){\n\
    ++indents;\n\
    console.log(color('suite', '%s%s'), indent(), suite.title);\n\
  });\n\
\n\
  runner.on('suite end', function(suite){\n\
    --indents;\n\
    if (1 == indents) console.log();\n\
  });\n\
\n\
  runner.on('test', function(test){\n\
    process.stdout.write(indent() + color('pass', '  ◦ ' + test.title + ': '));\n\
  });\n\
\n\
  runner.on('pending', function(test){\n\
    var fmt = indent() + color('pending', '  - %s');\n\
    console.log(fmt, test.title);\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    if ('fast' == test.speed) {\n\
      var fmt = indent()\n\
        + color('checkmark', '  ' + Base.symbols.ok)\n\
        + color('pass', ' %s ');\n\
      cursor.CR();\n\
      console.log(fmt, test.title);\n\
    } else {\n\
      var fmt = indent()\n\
        + color('checkmark', '  ' + Base.symbols.ok)\n\
        + color('pass', ' %s ')\n\
        + color(test.speed, '(%dms)');\n\
      cursor.CR();\n\
      console.log(fmt, test.title, test.duration);\n\
    }\n\
  });\n\
\n\
  runner.on('fail', function(test, err){\n\
    cursor.CR();\n\
    console.log(indent() + color('fail', '  %d) %s'), ++n, test.title);\n\
  });\n\
\n\
  runner.on('end', self.epilogue.bind(self));\n\
}\n\
\n\
/**\n\
 * Inherit from `Base.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Base.prototype;\n\
Spec.prototype = new F;\n\
Spec.prototype.constructor = Spec;\n\
\n\
\n\
}); // module: reporters/spec.js\n\
\n\
require.register(\"reporters/tap.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , cursor = Base.cursor\n\
  , color = Base.color;\n\
\n\
/**\n\
 * Expose `TAP`.\n\
 */\n\
\n\
exports = module.exports = TAP;\n\
\n\
/**\n\
 * Initialize a new `TAP` reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function TAP(runner) {\n\
  Base.call(this, runner);\n\
\n\
  var self = this\n\
    , stats = this.stats\n\
    , n = 1\n\
    , passes = 0\n\
    , failures = 0;\n\
\n\
  runner.on('start', function(){\n\
    var total = runner.grepTotal(runner.suite);\n\
    console.log('%d..%d', 1, total);\n\
  });\n\
\n\
  runner.on('test end', function(){\n\
    ++n;\n\
  });\n\
\n\
  runner.on('pending', function(test){\n\
    console.log('ok %d %s # SKIP -', n, title(test));\n\
  });\n\
\n\
  runner.on('pass', function(test){\n\
    passes++;\n\
    console.log('ok %d %s', n, title(test));\n\
  });\n\
\n\
  runner.on('fail', function(test, err){\n\
    failures++;\n\
    console.log('not ok %d %s', n, title(test));\n\
    if (err.stack) console.log(err.stack.replace(/^/gm, '  '));\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    console.log('# tests ' + (passes + failures));\n\
    console.log('# pass ' + passes);\n\
    console.log('# fail ' + failures);\n\
  });\n\
}\n\
\n\
/**\n\
 * Return a TAP-safe title of `test`\n\
 *\n\
 * @param {Object} test\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function title(test) {\n\
  return test.fullTitle().replace(/#/g, '');\n\
}\n\
\n\
}); // module: reporters/tap.js\n\
\n\
require.register(\"reporters/xunit.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Base = require('./base')\n\
  , utils = require('../utils')\n\
  , escape = utils.escape;\n\
\n\
/**\n\
 * Save timer references to avoid Sinon interfering (see GH-237).\n\
 */\n\
\n\
var Date = global.Date\n\
  , setTimeout = global.setTimeout\n\
  , setInterval = global.setInterval\n\
  , clearTimeout = global.clearTimeout\n\
  , clearInterval = global.clearInterval;\n\
\n\
/**\n\
 * Expose `XUnit`.\n\
 */\n\
\n\
exports = module.exports = XUnit;\n\
\n\
/**\n\
 * Initialize a new `XUnit` reporter.\n\
 *\n\
 * @param {Runner} runner\n\
 * @api public\n\
 */\n\
\n\
function XUnit(runner) {\n\
  Base.call(this, runner);\n\
  var stats = this.stats\n\
    , tests = []\n\
    , self = this;\n\
\n\
  runner.on('pass', function(test){\n\
    tests.push(test);\n\
  });\n\
\n\
  runner.on('fail', function(test){\n\
    tests.push(test);\n\
  });\n\
\n\
  runner.on('end', function(){\n\
    console.log(tag('testsuite', {\n\
        name: 'Mocha Tests'\n\
      , tests: stats.tests\n\
      , failures: stats.failures\n\
      , errors: stats.failures\n\
      , skipped: stats.tests - stats.failures - stats.passes\n\
      , timestamp: (new Date).toUTCString()\n\
      , time: (stats.duration / 1000) || 0\n\
    }, false));\n\
\n\
    tests.forEach(test);\n\
    console.log('</testsuite>');\n\
  });\n\
}\n\
\n\
/**\n\
 * Inherit from `Base.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Base.prototype;\n\
XUnit.prototype = new F;\n\
XUnit.prototype.constructor = XUnit;\n\
\n\
\n\
/**\n\
 * Output tag for the given `test.`\n\
 */\n\
\n\
function test(test) {\n\
  var attrs = {\n\
      classname: test.parent.fullTitle()\n\
    , name: test.title\n\
    , time: test.duration / 1000\n\
  };\n\
\n\
  if ('failed' == test.state) {\n\
    var err = test.err;\n\
    attrs.message = escape(err.message);\n\
    console.log(tag('testcase', attrs, false, tag('failure', attrs, false, cdata(err.stack))));\n\
  } else if (test.pending) {\n\
    console.log(tag('testcase', attrs, false, tag('skipped', {}, true)));\n\
  } else {\n\
    console.log(tag('testcase', attrs, true) );\n\
  }\n\
}\n\
\n\
/**\n\
 * HTML tag helper.\n\
 */\n\
\n\
function tag(name, attrs, close, content) {\n\
  var end = close ? '/>' : '>'\n\
    , pairs = []\n\
    , tag;\n\
\n\
  for (var key in attrs) {\n\
    pairs.push(key + '=\"' + escape(attrs[key]) + '\"');\n\
  }\n\
\n\
  tag = '<' + name + (pairs.length ? ' ' + pairs.join(' ') : '') + end;\n\
  if (content) tag += content + '</' + name + end;\n\
  return tag;\n\
}\n\
\n\
/**\n\
 * Return cdata escaped CDATA `str`.\n\
 */\n\
\n\
function cdata(str) {\n\
  return '<![CDATA[' + escape(str) + ']]>';\n\
}\n\
\n\
}); // module: reporters/xunit.js\n\
\n\
require.register(\"runnable.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var EventEmitter = require('browser/events').EventEmitter\n\
  , debug = require('browser/debug')('mocha:runnable')\n\
  , milliseconds = require('./ms');\n\
\n\
/**\n\
 * Save timer references to avoid Sinon interfering (see GH-237).\n\
 */\n\
\n\
var Date = global.Date\n\
  , setTimeout = global.setTimeout\n\
  , setInterval = global.setInterval\n\
  , clearTimeout = global.clearTimeout\n\
  , clearInterval = global.clearInterval;\n\
\n\
/**\n\
 * Object#toString().\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Expose `Runnable`.\n\
 */\n\
\n\
module.exports = Runnable;\n\
\n\
/**\n\
 * Initialize a new `Runnable` with the given `title` and callback `fn`.\n\
 *\n\
 * @param {String} title\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function Runnable(title, fn) {\n\
  this.title = title;\n\
  this.fn = fn;\n\
  this.async = fn && fn.length;\n\
  this.sync = ! this.async;\n\
  this._timeout = 2000;\n\
  this._slow = 75;\n\
  this.timedOut = false;\n\
}\n\
\n\
/**\n\
 * Inherit from `EventEmitter.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = EventEmitter.prototype;\n\
Runnable.prototype = new F;\n\
Runnable.prototype.constructor = Runnable;\n\
\n\
\n\
/**\n\
 * Set & get timeout `ms`.\n\
 *\n\
 * @param {Number|String} ms\n\
 * @return {Runnable|Number} ms or self\n\
 * @api private\n\
 */\n\
\n\
Runnable.prototype.timeout = function(ms){\n\
  if (0 == arguments.length) return this._timeout;\n\
  if ('string' == typeof ms) ms = milliseconds(ms);\n\
  debug('timeout %d', ms);\n\
  this._timeout = ms;\n\
  if (this.timer) this.resetTimeout();\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set & get slow `ms`.\n\
 *\n\
 * @param {Number|String} ms\n\
 * @return {Runnable|Number} ms or self\n\
 * @api private\n\
 */\n\
\n\
Runnable.prototype.slow = function(ms){\n\
  if (0 === arguments.length) return this._slow;\n\
  if ('string' == typeof ms) ms = milliseconds(ms);\n\
  debug('timeout %d', ms);\n\
  this._slow = ms;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return the full title generated by recursively\n\
 * concatenating the parent's full title.\n\
 *\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
Runnable.prototype.fullTitle = function(){\n\
  return this.parent.fullTitle() + ' ' + this.title;\n\
};\n\
\n\
/**\n\
 * Clear the timeout.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Runnable.prototype.clearTimeout = function(){\n\
  clearTimeout(this.timer);\n\
};\n\
\n\
/**\n\
 * Inspect the runnable void of private properties.\n\
 *\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
Runnable.prototype.inspect = function(){\n\
  return JSON.stringify(this, function(key, val){\n\
    if ('_' == key[0]) return;\n\
    if ('parent' == key) return '#<Suite>';\n\
    if ('ctx' == key) return '#<Context>';\n\
    return val;\n\
  }, 2);\n\
};\n\
\n\
/**\n\
 * Reset the timeout.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Runnable.prototype.resetTimeout = function(){\n\
  var self = this;\n\
  var ms = this.timeout() || 1e9;\n\
\n\
  this.clearTimeout();\n\
  this.timer = setTimeout(function(){\n\
    self.callback(new Error('timeout of ' + ms + 'ms exceeded'));\n\
    self.timedOut = true;\n\
  }, ms);\n\
};\n\
\n\
/**\n\
 * Run the test and invoke `fn(err)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
Runnable.prototype.run = function(fn){\n\
  var self = this\n\
    , ms = this.timeout()\n\
    , start = new Date\n\
    , ctx = this.ctx\n\
    , finished\n\
    , emitted;\n\
\n\
  if (ctx) ctx.runnable(this);\n\
\n\
  // timeout\n\
  if (this.async) {\n\
    if (ms) {\n\
      this.timer = setTimeout(function(){\n\
        done(new Error('timeout of ' + ms + 'ms exceeded'));\n\
        self.timedOut = true;\n\
      }, ms);\n\
    }\n\
  }\n\
\n\
  // called multiple times\n\
  function multiple(err) {\n\
    if (emitted) return;\n\
    emitted = true;\n\
    self.emit('error', err || new Error('done() called multiple times'));\n\
  }\n\
\n\
  // finished\n\
  function done(err) {\n\
    if (self.timedOut) return;\n\
    if (finished) return multiple(err);\n\
    self.clearTimeout();\n\
    self.duration = new Date - start;\n\
    finished = true;\n\
    fn(err);\n\
  }\n\
\n\
  // for .resetTimeout()\n\
  this.callback = done;\n\
\n\
  // async\n\
  if (this.async) {\n\
    try {\n\
      this.fn.call(ctx, function(err){\n\
        if (err instanceof Error || toString.call(err) === \"[object Error]\") return done(err);\n\
        if (null != err) return done(new Error('done() invoked with non-Error: ' + err));\n\
        done();\n\
      });\n\
    } catch (err) {\n\
      done(err);\n\
    }\n\
    return;\n\
  }\n\
\n\
  if (this.asyncOnly) {\n\
    return done(new Error('--async-only option in use without declaring `done()`'));\n\
  }\n\
\n\
  // sync\n\
  try {\n\
    if (!this.pending) this.fn.call(ctx);\n\
    this.duration = new Date - start;\n\
    fn();\n\
  } catch (err) {\n\
    fn(err);\n\
  }\n\
};\n\
\n\
}); // module: runnable.js\n\
\n\
require.register(\"runner.js\", function(module, exports, require){\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var EventEmitter = require('browser/events').EventEmitter\n\
  , debug = require('browser/debug')('mocha:runner')\n\
  , Test = require('./test')\n\
  , utils = require('./utils')\n\
  , filter = utils.filter\n\
  , keys = utils.keys;\n\
\n\
/**\n\
 * Non-enumerable globals.\n\
 */\n\
\n\
var globals = [\n\
  'setTimeout',\n\
  'clearTimeout',\n\
  'setInterval',\n\
  'clearInterval',\n\
  'XMLHttpRequest',\n\
  'Date'\n\
];\n\
\n\
/**\n\
 * Expose `Runner`.\n\
 */\n\
\n\
module.exports = Runner;\n\
\n\
/**\n\
 * Initialize a `Runner` for the given `suite`.\n\
 *\n\
 * Events:\n\
 *\n\
 *   - `start`  execution started\n\
 *   - `end`  execution complete\n\
 *   - `suite`  (suite) test suite execution started\n\
 *   - `suite end`  (suite) all tests (and sub-suites) have finished\n\
 *   - `test`  (test) test execution started\n\
 *   - `test end`  (test) test completed\n\
 *   - `hook`  (hook) hook execution started\n\
 *   - `hook end`  (hook) hook complete\n\
 *   - `pass`  (test) test passed\n\
 *   - `fail`  (test, err) test failed\n\
 *   - `pending`  (test) test pending\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Runner(suite) {\n\
  var self = this;\n\
  this._globals = [];\n\
  this.suite = suite;\n\
  this.total = suite.total();\n\
  this.failures = 0;\n\
  this.on('test end', function(test){ self.checkGlobals(test); });\n\
  this.on('hook end', function(hook){ self.checkGlobals(hook); });\n\
  this.grep(/.*/);\n\
  this.globals(this.globalProps().concat(['errno']));\n\
}\n\
\n\
/**\n\
 * Wrapper for setImmediate, process.nextTick, or browser polyfill.\n\
 *\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
Runner.immediately = global.setImmediate || process.nextTick;\n\
\n\
/**\n\
 * Inherit from `EventEmitter.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = EventEmitter.prototype;\n\
Runner.prototype = new F;\n\
Runner.prototype.constructor = Runner;\n\
\n\
\n\
/**\n\
 * Run tests with full titles matching `re`. Updates runner.total\n\
 * with number of tests matched.\n\
 *\n\
 * @param {RegExp} re\n\
 * @param {Boolean} invert\n\
 * @return {Runner} for chaining\n\
 * @api public\n\
 */\n\
\n\
Runner.prototype.grep = function(re, invert){\n\
  debug('grep %s', re);\n\
  this._grep = re;\n\
  this._invert = invert;\n\
  this.total = this.grepTotal(this.suite);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Returns the number of tests matching the grep search for the\n\
 * given suite.\n\
 *\n\
 * @param {Suite} suite\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
Runner.prototype.grepTotal = function(suite) {\n\
  var self = this;\n\
  var total = 0;\n\
\n\
  suite.eachTest(function(test){\n\
    var match = self._grep.test(test.fullTitle());\n\
    if (self._invert) match = !match;\n\
    if (match) total++;\n\
  });\n\
\n\
  return total;\n\
};\n\
\n\
/**\n\
 * Return a list of global properties.\n\
 *\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.globalProps = function() {\n\
  var props = utils.keys(global);\n\
\n\
  // non-enumerables\n\
  for (var i = 0; i < globals.length; ++i) {\n\
    if (~utils.indexOf(props, globals[i])) continue;\n\
    props.push(globals[i]);\n\
  }\n\
\n\
  return props;\n\
};\n\
\n\
/**\n\
 * Allow the given `arr` of globals.\n\
 *\n\
 * @param {Array} arr\n\
 * @return {Runner} for chaining\n\
 * @api public\n\
 */\n\
\n\
Runner.prototype.globals = function(arr){\n\
  if (0 == arguments.length) return this._globals;\n\
  debug('globals %j', arr);\n\
  utils.forEach(arr, function(arr){\n\
    this._globals.push(arr);\n\
  }, this);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Check for global variable leaks.\n\
 *\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.checkGlobals = function(test){\n\
  if (this.ignoreLeaks) return;\n\
  var ok = this._globals;\n\
  var globals = this.globalProps();\n\
  var isNode = process.kill;\n\
  var leaks;\n\
\n\
  // check length - 2 ('errno' and 'location' globals)\n\
  if (isNode && 1 == ok.length - globals.length) return;\n\
  else if (2 == ok.length - globals.length) return;\n\
\n\
  if(this.prevGlobalsLength == globals.length) return;\n\
  this.prevGlobalsLength = globals.length;\n\
\n\
  leaks = filterLeaks(ok, globals);\n\
  this._globals = this._globals.concat(leaks);\n\
\n\
  if (leaks.length > 1) {\n\
    this.fail(test, new Error('global leaks detected: ' + leaks.join(', ') + ''));\n\
  } else if (leaks.length) {\n\
    this.fail(test, new Error('global leak detected: ' + leaks[0]));\n\
  }\n\
};\n\
\n\
/**\n\
 * Fail the given `test`.\n\
 *\n\
 * @param {Test} test\n\
 * @param {Error} err\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.fail = function(test, err){\n\
  ++this.failures;\n\
  test.state = 'failed';\n\
\n\
  if ('string' == typeof err) {\n\
    err = new Error('the string \"' + err + '\" was thrown, throw an Error :)');\n\
  }\n\
\n\
  this.emit('fail', test, err);\n\
};\n\
\n\
/**\n\
 * Fail the given `hook` with `err`.\n\
 *\n\
 * Hook failures (currently) hard-end due\n\
 * to that fact that a failing hook will\n\
 * surely cause subsequent tests to fail,\n\
 * causing jumbled reporting.\n\
 *\n\
 * @param {Hook} hook\n\
 * @param {Error} err\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.failHook = function(hook, err){\n\
  this.fail(hook, err);\n\
  this.emit('end');\n\
};\n\
\n\
/**\n\
 * Run hook `name` callbacks and then invoke `fn()`.\n\
 *\n\
 * @param {String} name\n\
 * @param {Function} function\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.hook = function(name, fn){\n\
  var suite = this.suite\n\
    , hooks = suite['_' + name]\n\
    , self = this\n\
    , timer;\n\
\n\
  function next(i) {\n\
    var hook = hooks[i];\n\
    if (!hook) return fn();\n\
    if (self.failures && suite.bail()) return fn();\n\
    self.currentRunnable = hook;\n\
\n\
    hook.ctx.currentTest = self.test;\n\
\n\
    self.emit('hook', hook);\n\
\n\
    hook.on('error', function(err){\n\
      self.failHook(hook, err);\n\
    });\n\
\n\
    hook.run(function(err){\n\
      hook.removeAllListeners('error');\n\
      var testError = hook.error();\n\
      if (testError) self.fail(self.test, testError);\n\
      if (err) return self.failHook(hook, err);\n\
      self.emit('hook end', hook);\n\
      delete hook.ctx.currentTest;\n\
      next(++i);\n\
    });\n\
  }\n\
\n\
  Runner.immediately(function(){\n\
    next(0);\n\
  });\n\
};\n\
\n\
/**\n\
 * Run hook `name` for the given array of `suites`\n\
 * in order, and callback `fn(err)`.\n\
 *\n\
 * @param {String} name\n\
 * @param {Array} suites\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.hooks = function(name, suites, fn){\n\
  var self = this\n\
    , orig = this.suite;\n\
\n\
  function next(suite) {\n\
    self.suite = suite;\n\
\n\
    if (!suite) {\n\
      self.suite = orig;\n\
      return fn();\n\
    }\n\
\n\
    self.hook(name, function(err){\n\
      if (err) {\n\
        self.suite = orig;\n\
        return fn(err);\n\
      }\n\
\n\
      next(suites.pop());\n\
    });\n\
  }\n\
\n\
  next(suites.pop());\n\
};\n\
\n\
/**\n\
 * Run hooks from the top level down.\n\
 *\n\
 * @param {String} name\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.hookUp = function(name, fn){\n\
  var suites = [this.suite].concat(this.parents()).reverse();\n\
  this.hooks(name, suites, fn);\n\
};\n\
\n\
/**\n\
 * Run hooks from the bottom up.\n\
 *\n\
 * @param {String} name\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.hookDown = function(name, fn){\n\
  var suites = [this.suite].concat(this.parents());\n\
  this.hooks(name, suites, fn);\n\
};\n\
\n\
/**\n\
 * Return an array of parent Suites from\n\
 * closest to furthest.\n\
 *\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.parents = function(){\n\
  var suite = this.suite\n\
    , suites = [];\n\
  while (suite = suite.parent) suites.push(suite);\n\
  return suites;\n\
};\n\
\n\
/**\n\
 * Run the current test and callback `fn(err)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.runTest = function(fn){\n\
  var test = this.test\n\
    , self = this;\n\
\n\
  if (this.asyncOnly) test.asyncOnly = true;\n\
\n\
  try {\n\
    test.on('error', function(err){\n\
      self.fail(test, err);\n\
    });\n\
    test.run(fn);\n\
  } catch (err) {\n\
    fn(err);\n\
  }\n\
};\n\
\n\
/**\n\
 * Run tests in the given `suite` and invoke\n\
 * the callback `fn()` when complete.\n\
 *\n\
 * @param {Suite} suite\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.runTests = function(suite, fn){\n\
  var self = this\n\
    , tests = suite.tests.slice()\n\
    , test;\n\
\n\
  function next(err) {\n\
    // if we bail after first err\n\
    if (self.failures && suite._bail) return fn();\n\
\n\
    // next test\n\
    test = tests.shift();\n\
\n\
    // all done\n\
    if (!test) return fn();\n\
\n\
    // grep\n\
    var match = self._grep.test(test.fullTitle());\n\
    if (self._invert) match = !match;\n\
    if (!match) return next();\n\
\n\
    // pending\n\
    if (test.pending) {\n\
      self.emit('pending', test);\n\
      self.emit('test end', test);\n\
      return next();\n\
    }\n\
\n\
    // execute test and hook(s)\n\
    self.emit('test', self.test = test);\n\
    self.hookDown('beforeEach', function(){\n\
      self.currentRunnable = self.test;\n\
      self.runTest(function(err){\n\
        test = self.test;\n\
\n\
        if (err) {\n\
          self.fail(test, err);\n\
          self.emit('test end', test);\n\
          return self.hookUp('afterEach', next);\n\
        }\n\
\n\
        test.state = 'passed';\n\
        self.emit('pass', test);\n\
        self.emit('test end', test);\n\
        self.hookUp('afterEach', next);\n\
      });\n\
    });\n\
  }\n\
\n\
  this.next = next;\n\
  next();\n\
};\n\
\n\
/**\n\
 * Run the given `suite` and invoke the\n\
 * callback `fn()` when complete.\n\
 *\n\
 * @param {Suite} suite\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.runSuite = function(suite, fn){\n\
  var total = this.grepTotal(suite)\n\
    , self = this\n\
    , i = 0;\n\
\n\
  debug('run suite %s', suite.fullTitle());\n\
\n\
  if (!total) return fn();\n\
\n\
  this.emit('suite', this.suite = suite);\n\
\n\
  function next() {\n\
    var curr = suite.suites[i++];\n\
    if (!curr) return done();\n\
    self.runSuite(curr, next);\n\
  }\n\
\n\
  function done() {\n\
    self.suite = suite;\n\
    self.hook('afterAll', function(){\n\
      self.emit('suite end', suite);\n\
      fn();\n\
    });\n\
  }\n\
\n\
  this.hook('beforeAll', function(){\n\
    self.runTests(suite, next);\n\
  });\n\
};\n\
\n\
/**\n\
 * Handle uncaught exceptions.\n\
 *\n\
 * @param {Error} err\n\
 * @api private\n\
 */\n\
\n\
Runner.prototype.uncaught = function(err){\n\
  debug('uncaught exception %s', err.message);\n\
  var runnable = this.currentRunnable;\n\
  if (!runnable || 'failed' == runnable.state) return;\n\
  runnable.clearTimeout();\n\
  err.uncaught = true;\n\
  this.fail(runnable, err);\n\
\n\
  // recover from test\n\
  if ('test' == runnable.type) {\n\
    this.emit('test end', runnable);\n\
    this.hookUp('afterEach', this.next);\n\
    return;\n\
  }\n\
\n\
  // bail on hooks\n\
  this.emit('end');\n\
};\n\
\n\
/**\n\
 * Run the root suite and invoke `fn(failures)`\n\
 * on completion.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Runner} for chaining\n\
 * @api public\n\
 */\n\
\n\
Runner.prototype.run = function(fn){\n\
  var self = this\n\
    , fn = fn || function(){};\n\
\n\
  function uncaught(err){\n\
    self.uncaught(err);\n\
  }\n\
\n\
  debug('start');\n\
\n\
  // callback\n\
  this.on('end', function(){\n\
    debug('end');\n\
    process.removeListener('uncaughtException', uncaught);\n\
    fn(self.failures);\n\
  });\n\
\n\
  // run suites\n\
  this.emit('start');\n\
  this.runSuite(this.suite, function(){\n\
    debug('finished running');\n\
    self.emit('end');\n\
  });\n\
\n\
  // uncaught exception\n\
  process.on('uncaughtException', uncaught);\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Filter leaks with the given globals flagged as `ok`.\n\
 *\n\
 * @param {Array} ok\n\
 * @param {Array} globals\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function filterLeaks(ok, globals) {\n\
  return filter(globals, function(key){\n\
    // Firefox and Chrome exposes iframes as index inside the window object\n\
    if (/^d+/.test(key)) return false;\n\
\n\
    // in firefox\n\
    // if runner runs in an iframe, this iframe's window.getInterface method not init at first\n\
    // it is assigned in some seconds\n\
    if (global.navigator && /^getInterface/.test(key)) return false;\n\
\n\
    // an iframe could be approached by window[iframeIndex]\n\
    // in ie6,7,8 and opera, iframeIndex is enumerable, this could cause leak\n\
    if (global.navigator && /^\\d+/.test(key)) return false;\n\
\n\
    // Opera and IE expose global variables for HTML element IDs (issue #243)\n\
    if (/^mocha-/.test(key)) return false;\n\
\n\
    var matched = filter(ok, function(ok){\n\
      if (~ok.indexOf('*')) return 0 == key.indexOf(ok.split('*')[0]);\n\
      return key == ok;\n\
    });\n\
    return matched.length == 0 && (!global.navigator || 'onerror' !== key);\n\
  });\n\
}\n\
\n\
}); // module: runner.js\n\
\n\
require.register(\"suite.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var EventEmitter = require('browser/events').EventEmitter\n\
  , debug = require('browser/debug')('mocha:suite')\n\
  , milliseconds = require('./ms')\n\
  , utils = require('./utils')\n\
  , Hook = require('./hook');\n\
\n\
/**\n\
 * Expose `Suite`.\n\
 */\n\
\n\
exports = module.exports = Suite;\n\
\n\
/**\n\
 * Create a new `Suite` with the given `title`\n\
 * and parent `Suite`. When a suite with the\n\
 * same title is already present, that suite\n\
 * is returned to provide nicer reporter\n\
 * and more flexible meta-testing.\n\
 *\n\
 * @param {Suite} parent\n\
 * @param {String} title\n\
 * @return {Suite}\n\
 * @api public\n\
 */\n\
\n\
exports.create = function(parent, title){\n\
  var suite = new Suite(title, parent.ctx);\n\
  suite.parent = parent;\n\
  if (parent.pending) suite.pending = true;\n\
  title = suite.fullTitle();\n\
  parent.addSuite(suite);\n\
  return suite;\n\
};\n\
\n\
/**\n\
 * Initialize a new `Suite` with the given\n\
 * `title` and `ctx`.\n\
 *\n\
 * @param {String} title\n\
 * @param {Context} ctx\n\
 * @api private\n\
 */\n\
\n\
function Suite(title, ctx) {\n\
  this.title = title;\n\
  this.ctx = ctx;\n\
  this.suites = [];\n\
  this.tests = [];\n\
  this.pending = false;\n\
  this._beforeEach = [];\n\
  this._beforeAll = [];\n\
  this._afterEach = [];\n\
  this._afterAll = [];\n\
  this.root = !title;\n\
  this._timeout = 2000;\n\
  this._slow = 75;\n\
  this._bail = false;\n\
}\n\
\n\
/**\n\
 * Inherit from `EventEmitter.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = EventEmitter.prototype;\n\
Suite.prototype = new F;\n\
Suite.prototype.constructor = Suite;\n\
\n\
\n\
/**\n\
 * Return a clone of this `Suite`.\n\
 *\n\
 * @return {Suite}\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.clone = function(){\n\
  var suite = new Suite(this.title);\n\
  debug('clone');\n\
  suite.ctx = this.ctx;\n\
  suite.timeout(this.timeout());\n\
  suite.slow(this.slow());\n\
  suite.bail(this.bail());\n\
  return suite;\n\
};\n\
\n\
/**\n\
 * Set timeout `ms` or short-hand such as \"2s\".\n\
 *\n\
 * @param {Number|String} ms\n\
 * @return {Suite|Number} for chaining\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.timeout = function(ms){\n\
  if (0 == arguments.length) return this._timeout;\n\
  if ('string' == typeof ms) ms = milliseconds(ms);\n\
  debug('timeout %d', ms);\n\
  this._timeout = parseInt(ms, 10);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Set slow `ms` or short-hand such as \"2s\".\n\
 *\n\
 * @param {Number|String} ms\n\
 * @return {Suite|Number} for chaining\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.slow = function(ms){\n\
  if (0 === arguments.length) return this._slow;\n\
  if ('string' == typeof ms) ms = milliseconds(ms);\n\
  debug('slow %d', ms);\n\
  this._slow = ms;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Sets whether to bail after first error.\n\
 *\n\
 * @parma {Boolean} bail\n\
 * @return {Suite|Number} for chaining\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.bail = function(bail){\n\
  if (0 == arguments.length) return this._bail;\n\
  debug('bail %s', bail);\n\
  this._bail = bail;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Run `fn(test[, done])` before running tests.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Suite} for chaining\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.beforeAll = function(fn){\n\
  if (this.pending) return this;\n\
  var hook = new Hook('\"before all\" hook', fn);\n\
  hook.parent = this;\n\
  hook.timeout(this.timeout());\n\
  hook.slow(this.slow());\n\
  hook.ctx = this.ctx;\n\
  this._beforeAll.push(hook);\n\
  this.emit('beforeAll', hook);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Run `fn(test[, done])` after running tests.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Suite} for chaining\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.afterAll = function(fn){\n\
  if (this.pending) return this;\n\
  var hook = new Hook('\"after all\" hook', fn);\n\
  hook.parent = this;\n\
  hook.timeout(this.timeout());\n\
  hook.slow(this.slow());\n\
  hook.ctx = this.ctx;\n\
  this._afterAll.push(hook);\n\
  this.emit('afterAll', hook);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Run `fn(test[, done])` before each test case.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Suite} for chaining\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.beforeEach = function(fn){\n\
  if (this.pending) return this;\n\
  var hook = new Hook('\"before each\" hook', fn);\n\
  hook.parent = this;\n\
  hook.timeout(this.timeout());\n\
  hook.slow(this.slow());\n\
  hook.ctx = this.ctx;\n\
  this._beforeEach.push(hook);\n\
  this.emit('beforeEach', hook);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Run `fn(test[, done])` after each test case.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Suite} for chaining\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.afterEach = function(fn){\n\
  if (this.pending) return this;\n\
  var hook = new Hook('\"after each\" hook', fn);\n\
  hook.parent = this;\n\
  hook.timeout(this.timeout());\n\
  hook.slow(this.slow());\n\
  hook.ctx = this.ctx;\n\
  this._afterEach.push(hook);\n\
  this.emit('afterEach', hook);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Add a test `suite`.\n\
 *\n\
 * @param {Suite} suite\n\
 * @return {Suite} for chaining\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.addSuite = function(suite){\n\
  suite.parent = this;\n\
  suite.timeout(this.timeout());\n\
  suite.slow(this.slow());\n\
  suite.bail(this.bail());\n\
  this.suites.push(suite);\n\
  this.emit('suite', suite);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Add a `test` to this suite.\n\
 *\n\
 * @param {Test} test\n\
 * @return {Suite} for chaining\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.addTest = function(test){\n\
  test.parent = this;\n\
  test.timeout(this.timeout());\n\
  test.slow(this.slow());\n\
  test.ctx = this.ctx;\n\
  this.tests.push(test);\n\
  this.emit('test', test);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return the full title generated by recursively\n\
 * concatenating the parent's full title.\n\
 *\n\
 * @return {String}\n\
 * @api public\n\
 */\n\
\n\
Suite.prototype.fullTitle = function(){\n\
  if (this.parent) {\n\
    var full = this.parent.fullTitle();\n\
    if (full) return full + ' ' + this.title;\n\
  }\n\
  return this.title;\n\
};\n\
\n\
/**\n\
 * Return the total number of tests.\n\
 *\n\
 * @return {Number}\n\
 * @api public\n\
 */\n\
\n\
Suite.prototype.total = function(){\n\
  return utils.reduce(this.suites, function(sum, suite){\n\
    return sum + suite.total();\n\
  }, 0) + this.tests.length;\n\
};\n\
\n\
/**\n\
 * Iterates through each suite recursively to find\n\
 * all tests. Applies a function in the format\n\
 * `fn(test)`.\n\
 *\n\
 * @param {Function} fn\n\
 * @return {Suite}\n\
 * @api private\n\
 */\n\
\n\
Suite.prototype.eachTest = function(fn){\n\
  utils.forEach(this.tests, fn);\n\
  utils.forEach(this.suites, function(suite){\n\
    suite.eachTest(fn);\n\
  });\n\
  return this;\n\
};\n\
\n\
}); // module: suite.js\n\
\n\
require.register(\"test.js\", function(module, exports, require){\n\
\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var Runnable = require('./runnable');\n\
\n\
/**\n\
 * Expose `Test`.\n\
 */\n\
\n\
module.exports = Test;\n\
\n\
/**\n\
 * Initialize a new `Test` with the given `title` and callback `fn`.\n\
 *\n\
 * @param {String} title\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
function Test(title, fn) {\n\
  Runnable.call(this, title, fn);\n\
  this.pending = !fn;\n\
  this.type = 'test';\n\
}\n\
\n\
/**\n\
 * Inherit from `Runnable.prototype`.\n\
 */\n\
\n\
function F(){};\n\
F.prototype = Runnable.prototype;\n\
Test.prototype = new F;\n\
Test.prototype.constructor = Test;\n\
\n\
\n\
}); // module: test.js\n\
\n\
require.register(\"utils.js\", function(module, exports, require){\n\
/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var fs = require('browser/fs')\n\
  , path = require('browser/path')\n\
  , join = path.join\n\
  , debug = require('browser/debug')('mocha:watch');\n\
\n\
/**\n\
 * Ignored directories.\n\
 */\n\
\n\
var ignore = ['node_modules', '.git'];\n\
\n\
/**\n\
 * Escape special characters in the given string of html.\n\
 *\n\
 * @param  {String} html\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
exports.escape = function(html){\n\
  return String(html)\n\
    .replace(/&/g, '&amp;')\n\
    .replace(/\"/g, '&quot;')\n\
    .replace(/</g, '&lt;')\n\
    .replace(/>/g, '&gt;');\n\
};\n\
\n\
/**\n\
 * Array#forEach (<=IE8)\n\
 *\n\
 * @param {Array} array\n\
 * @param {Function} fn\n\
 * @param {Object} scope\n\
 * @api private\n\
 */\n\
\n\
exports.forEach = function(arr, fn, scope){\n\
  for (var i = 0, l = arr.length; i < l; i++)\n\
    fn.call(scope, arr[i], i);\n\
};\n\
\n\
/**\n\
 * Array#indexOf (<=IE8)\n\
 *\n\
 * @parma {Array} arr\n\
 * @param {Object} obj to find index of\n\
 * @param {Number} start\n\
 * @api private\n\
 */\n\
\n\
exports.indexOf = function(arr, obj, start){\n\
  for (var i = start || 0, l = arr.length; i < l; i++) {\n\
    if (arr[i] === obj)\n\
      return i;\n\
  }\n\
  return -1;\n\
};\n\
\n\
/**\n\
 * Array#reduce (<=IE8)\n\
 *\n\
 * @param {Array} array\n\
 * @param {Function} fn\n\
 * @param {Object} initial value\n\
 * @api private\n\
 */\n\
\n\
exports.reduce = function(arr, fn, val){\n\
  var rval = val;\n\
\n\
  for (var i = 0, l = arr.length; i < l; i++) {\n\
    rval = fn(rval, arr[i], i, arr);\n\
  }\n\
\n\
  return rval;\n\
};\n\
\n\
/**\n\
 * Array#filter (<=IE8)\n\
 *\n\
 * @param {Array} array\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
exports.filter = function(arr, fn){\n\
  var ret = [];\n\
\n\
  for (var i = 0, l = arr.length; i < l; i++) {\n\
    var val = arr[i];\n\
    if (fn(val, i, arr)) ret.push(val);\n\
  }\n\
\n\
  return ret;\n\
};\n\
\n\
/**\n\
 * Object.keys (<=IE8)\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Array} keys\n\
 * @api private\n\
 */\n\
\n\
exports.keys = Object.keys || function(obj) {\n\
  var keys = []\n\
    , has = Object.prototype.hasOwnProperty // for `window` on <=IE8\n\
\n\
  for (var key in obj) {\n\
    if (has.call(obj, key)) {\n\
      keys.push(key);\n\
    }\n\
  }\n\
\n\
  return keys;\n\
};\n\
\n\
/**\n\
 * Watch the given `files` for changes\n\
 * and invoke `fn(file)` on modification.\n\
 *\n\
 * @param {Array} files\n\
 * @param {Function} fn\n\
 * @api private\n\
 */\n\
\n\
exports.watch = function(files, fn){\n\
  var options = { interval: 100 };\n\
  files.forEach(function(file){\n\
    debug('file %s', file);\n\
    fs.watchFile(file, options, function(curr, prev){\n\
      if (prev.mtime < curr.mtime) fn(file);\n\
    });\n\
  });\n\
};\n\
\n\
/**\n\
 * Ignored files.\n\
 */\n\
\n\
function ignored(path){\n\
  return !~ignore.indexOf(path);\n\
}\n\
\n\
/**\n\
 * Lookup files in the given `dir`.\n\
 *\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
exports.files = function(dir, ret){\n\
  ret = ret || [];\n\
\n\
  fs.readdirSync(dir)\n\
  .filter(ignored)\n\
  .forEach(function(path){\n\
    path = join(dir, path);\n\
    if (fs.statSync(path).isDirectory()) {\n\
      exports.files(path, ret);\n\
    } else if (path.match(/\\.(js|coffee|litcoffee|coffee.md)$/)) {\n\
      ret.push(path);\n\
    }\n\
  });\n\
\n\
  return ret;\n\
};\n\
\n\
/**\n\
 * Compute a slug from the given `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
exports.slug = function(str){\n\
  return str\n\
    .toLowerCase()\n\
    .replace(/ +/g, '-')\n\
    .replace(/[^-\\w]/g, '');\n\
};\n\
\n\
/**\n\
 * Strip the function definition from `str`,\n\
 * and re-indent for pre whitespace.\n\
 */\n\
\n\
exports.clean = function(str) {\n\
  str = str\n\
    .replace(/^function *\\(.*\\) *{/, '')\n\
    .replace(/\\s+\\}$/, '');\n\
\n\
  var whitespace = str.match(/^\\n\
?(\\s*)/)[1]\n\
    , re = new RegExp('^' + whitespace, 'gm');\n\
\n\
  str = str.replace(re, '');\n\
\n\
  return exports.trim(str);\n\
};\n\
\n\
/**\n\
 * Escape regular expression characters in `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
exports.escapeRegexp = function(str){\n\
  return str.replace(/[-\\\\^$*+?.()|[\\]{}]/g, \"\\\\$&\");\n\
};\n\
\n\
/**\n\
 * Trim the given `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
exports.trim = function(str){\n\
  return str.replace(/^\\s+|\\s+$/g, '');\n\
};\n\
\n\
/**\n\
 * Parse the given `qs`.\n\
 *\n\
 * @param {String} qs\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
exports.parseQuery = function(qs){\n\
  return exports.reduce(qs.replace('?', '').split('&'), function(obj, pair){\n\
    var i = pair.indexOf('=')\n\
      , key = pair.slice(0, i)\n\
      , val = pair.slice(++i);\n\
\n\
    obj[key] = decodeURIComponent(val);\n\
    return obj;\n\
  }, {});\n\
};\n\
\n\
/**\n\
 * Highlight the given string of `js`.\n\
 *\n\
 * @param {String} js\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function highlight(js) {\n\
  return js\n\
    .replace(/</g, '&lt;')\n\
    .replace(/>/g, '&gt;')\n\
    .replace(/\\/\\/(.*)/gm, '<span class=\"comment\">//$1</span>')\n\
    .replace(/('.*?')/gm, '<span class=\"string\">$1</span>')\n\
    .replace(/(\\d+\\.\\d+)/gm, '<span class=\"number\">$1</span>')\n\
    .replace(/(\\d+)/gm, '<span class=\"number\">$1</span>')\n\
    .replace(/\\bnew *(\\w+)/gm, '<span class=\"keyword\">new</span> <span class=\"init\">$1</span>')\n\
    .replace(/\\b(function|new|throw|return|var|if|else)\\b/gm, '<span class=\"keyword\">$1</span>')\n\
}\n\
\n\
/**\n\
 * Highlight the contents of tag `name`.\n\
 *\n\
 * @param {String} name\n\
 * @api private\n\
 */\n\
\n\
exports.highlightTags = function(name) {\n\
  var code = document.getElementsByTagName(name);\n\
  for (var i = 0, len = code.length; i < len; ++i) {\n\
    code[i].innerHTML = highlight(code[i].innerHTML);\n\
  }\n\
};\n\
\n\
}); // module: utils.js\n\
// The global object is \"self\" in Web Workers.\n\
global = (function() { return this; })();\n\
\n\
/**\n\
 * Save timer references to avoid Sinon interfering (see GH-237).\n\
 */\n\
\n\
var Date = global.Date;\n\
var setTimeout = global.setTimeout;\n\
var setInterval = global.setInterval;\n\
var clearTimeout = global.clearTimeout;\n\
var clearInterval = global.clearInterval;\n\
\n\
/**\n\
 * Node shims.\n\
 *\n\
 * These are meant only to allow\n\
 * mocha.js to run untouched, not\n\
 * to allow running node code in\n\
 * the browser.\n\
 */\n\
\n\
var process = {};\n\
process.exit = function(status){};\n\
process.stdout = {};\n\
\n\
/**\n\
 * Remove uncaughtException listener.\n\
 */\n\
\n\
process.removeListener = function(e){\n\
  if ('uncaughtException' == e) {\n\
    global.onerror = function() {};\n\
  }\n\
};\n\
\n\
/**\n\
 * Implements uncaughtException listener.\n\
 */\n\
\n\
process.on = function(e, fn){\n\
  if ('uncaughtException' == e) {\n\
    global.onerror = function(err, url, line){\n\
      fn(new Error(err + ' (' + url + ':' + line + ')'));\n\
    };\n\
  }\n\
};\n\
\n\
/**\n\
 * Expose mocha.\n\
 */\n\
\n\
var Mocha = global.Mocha = require('mocha'),\n\
    mocha = global.mocha = new Mocha({ reporter: 'html' });\n\
\n\
var immediateQueue = []\n\
  , immediateTimeout;\n\
\n\
function timeslice() {\n\
  var immediateStart = new Date().getTime();\n\
  while (immediateQueue.length && (new Date().getTime() - immediateStart) < 100) {\n\
    immediateQueue.shift()();\n\
  }\n\
  if (immediateQueue.length) {\n\
    immediateTimeout = setTimeout(timeslice, 0);\n\
  } else {\n\
    immediateTimeout = null;\n\
  }\n\
}\n\
\n\
/**\n\
 * High-performance override of Runner.immediately.\n\
 */\n\
\n\
Mocha.Runner.immediately = function(callback) {\n\
  immediateQueue.push(callback);\n\
  if (!immediateTimeout) {\n\
    immediateTimeout = setTimeout(timeslice, 0);\n\
  }\n\
};\n\
\n\
/**\n\
 * Override ui to ensure that the ui functions are initialized.\n\
 * Normally this would happen in Mocha.prototype.loadFiles.\n\
 */\n\
\n\
mocha.ui = function(ui){\n\
  Mocha.prototype.ui.call(this, ui);\n\
  this.suite.emit('pre-require', global, null, this);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Setup mocha with the given setting options.\n\
 */\n\
\n\
mocha.setup = function(opts){\n\
  if ('string' == typeof opts) opts = { ui: opts };\n\
  for (var opt in opts) this[opt](opts[opt]);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Run mocha, returning the Runner.\n\
 */\n\
\n\
mocha.run = function(fn){\n\
  var options = mocha.options;\n\
  mocha.globals('location');\n\
\n\
  var query = Mocha.utils.parseQuery(global.location.search || '');\n\
  if (query.grep) mocha.grep(query.grep);\n\
  if (query.invert) mocha.invert();\n\
\n\
  return Mocha.prototype.run.call(mocha, function(){\n\
    // The DOM Document is not available in Web Workers.\n\
    if (global.document) {\n\
      Mocha.utils.highlightTags('code');\n\
    }\n\
    if (fn) fn();\n\
  });\n\
};\n\
\n\
/**\n\
 * Expose the process shim.\n\
 */\n\
\n\
Mocha.process = process;\n\
})();//@ sourceURL=visionmedia-mocha/mocha.js"
));
require.register("chaijs-assertion-error/index.js", Function("exports, require, module",
"/*!\n\
 * assertion-error\n\
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Return a function that will copy properties from\n\
 * one object to another excluding any originally\n\
 * listed. Returned function will create a new `{}`.\n\
 *\n\
 * @param {String} excluded properties ...\n\
 * @return {Function}\n\
 */\n\
\n\
function exclude () {\n\
  var excludes = [].slice.call(arguments);\n\
\n\
  function excludeProps (res, obj) {\n\
    Object.keys(obj).forEach(function (key) {\n\
      if (!~excludes.indexOf(key)) res[key] = obj[key];\n\
    });\n\
  }\n\
\n\
  return function extendExclude () {\n\
    var args = [].slice.call(arguments)\n\
      , i = 0\n\
      , res = {};\n\
\n\
    for (; i < args.length; i++) {\n\
      excludeProps(res, args[i]);\n\
    }\n\
\n\
    return res;\n\
  };\n\
};\n\
\n\
/*!\n\
 * Primary Exports\n\
 */\n\
\n\
module.exports = AssertionError;\n\
\n\
/**\n\
 * ### AssertionError\n\
 *\n\
 * An extension of the JavaScript `Error` constructor for\n\
 * assertion and validation scenarios.\n\
 *\n\
 * @param {String} message\n\
 * @param {Object} properties to include (optional)\n\
 * @param {callee} start stack function (optional)\n\
 */\n\
\n\
function AssertionError (message, _props, ssf) {\n\
  var extend = exclude('name', 'message', 'stack', 'constructor', 'toJSON')\n\
    , props = extend(_props || {});\n\
\n\
  // default values\n\
  this.message = message || 'Unspecified AssertionError';\n\
  this.showDiff = false;\n\
\n\
  // copy from properties\n\
  for (var key in props) {\n\
    this[key] = props[key];\n\
  }\n\
\n\
  // capture stack trace\n\
  ssf = ssf || arguments.callee;\n\
  if (ssf && Error.captureStackTrace) {\n\
    Error.captureStackTrace(this, ssf);\n\
  }\n\
}\n\
\n\
/*!\n\
 * Inherit from Error.prototype\n\
 */\n\
\n\
AssertionError.prototype = Object.create(Error.prototype);\n\
\n\
/*!\n\
 * Statically set name\n\
 */\n\
\n\
AssertionError.prototype.name = 'AssertionError';\n\
\n\
/*!\n\
 * Ensure correct constructor\n\
 */\n\
\n\
AssertionError.prototype.constructor = AssertionError;\n\
\n\
/**\n\
 * Allow errors to be converted to JSON for static transfer.\n\
 *\n\
 * @param {Boolean} include stack (default: `true`)\n\
 * @return {Object} object that can be `JSON.stringify`\n\
 */\n\
\n\
AssertionError.prototype.toJSON = function (stack) {\n\
  var extend = exclude('constructor', 'toJSON', 'stack')\n\
    , props = extend({ name: this.name }, this);\n\
\n\
  // include stack if exists and not turned off\n\
  if (false !== stack && this.stack) {\n\
    props.stack = this.stack;\n\
  }\n\
\n\
  return props;\n\
};\n\
//@ sourceURL=chaijs-assertion-error/index.js"
));
require.register("chaijs-type-detect/lib/type.js", Function("exports, require, module",
"/*!\n\
 * type-detect\n\
 * Copyright(c) 2013 jake luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Primary Exports\n\
 */\n\
\n\
var exports = module.exports = getType;\n\
\n\
/*!\n\
 * Detectable javascript natives\n\
 */\n\
\n\
var natives = {\n\
    '[object Array]': 'array'\n\
  , '[object RegExp]': 'regexp'\n\
  , '[object Function]': 'function'\n\
  , '[object Arguments]': 'arguments'\n\
  , '[object Date]': 'date'\n\
};\n\
\n\
/**\n\
 * ### typeOf (obj)\n\
 *\n\
 * Use several different techniques to determine\n\
 * the type of object being tested.\n\
 *\n\
 *\n\
 * @param {Mixed} object\n\
 * @return {String} object type\n\
 * @api public\n\
 */\n\
\n\
function getType (obj) {\n\
  var str = Object.prototype.toString.call(obj);\n\
  if (natives[str]) return natives[str];\n\
  if (obj === null) return 'null';\n\
  if (obj === undefined) return 'undefined';\n\
  if (obj === Object(obj)) return 'object';\n\
  return typeof obj;\n\
}\n\
\n\
exports.Library = Library;\n\
\n\
/**\n\
 * ### Library\n\
 *\n\
 * Create a repository for custom type detection.\n\
 *\n\
 * ```js\n\
 * var lib = new type.Library;\n\
 * ```\n\
 *\n\
 */\n\
\n\
function Library () {\n\
  this.tests = {};\n\
}\n\
\n\
/**\n\
 * #### .of (obj)\n\
 *\n\
 * Expose replacement `typeof` detection to the library.\n\
 *\n\
 * ```js\n\
 * if ('string' === lib.of('hello world')) {\n\
 *   // ...\n\
 * }\n\
 * ```\n\
 *\n\
 * @param {Mixed} object to test\n\
 * @return {String} type\n\
 */\n\
\n\
Library.prototype.of = getType;\n\
\n\
/**\n\
 * #### .define (type, test)\n\
 *\n\
 * Add a test to for the `.test()` assertion.\n\
 *\n\
 * Can be defined as a regular expression:\n\
 *\n\
 * ```js\n\
 * lib.define('int', /^[0-9]+$/);\n\
 * ```\n\
 *\n\
 * ... or as a function:\n\
 *\n\
 * ```js\n\
 * lib.define('bln', function (obj) {\n\
 *   if ('boolean' === lib.of(obj)) return true;\n\
 *   var blns = [ 'yes', 'no', 'true', 'false', 1, 0 ];\n\
 *   if ('string' === lib.of(obj)) obj = obj.toLowerCase();\n\
 *   return !! ~blns.indexOf(obj);\n\
 * });\n\
 * ```\n\
 *\n\
 * @param {String} type\n\
 * @param {RegExp|Function} test\n\
 * @api public\n\
 */\n\
\n\
Library.prototype.define = function (type, test) {\n\
  if (arguments.length === 1) return this.tests[type];\n\
  this.tests[type] = test;\n\
  return this;\n\
};\n\
\n\
/**\n\
 * #### .test (obj, test)\n\
 *\n\
 * Assert that an object is of type. Will first\n\
 * check natives, and if that does not pass it will\n\
 * use the user defined custom tests.\n\
 *\n\
 * ```js\n\
 * assert(lib.test('1', 'int'));\n\
 * assert(lib.test('yes', 'bln'));\n\
 * ```\n\
 *\n\
 * @param {Mixed} object\n\
 * @param {String} type\n\
 * @return {Boolean} result\n\
 * @api public\n\
 */\n\
\n\
Library.prototype.test = function (obj, type) {\n\
  if (type === getType(obj)) return true;\n\
  var test = this.tests[type];\n\
\n\
  if (test && 'regexp' === getType(test)) {\n\
    return test.test(obj);\n\
  } else if (test && 'function' === getType(test)) {\n\
    return test(obj);\n\
  } else {\n\
    throw new ReferenceError('Type test \"' + type + '\" not defined or invalid.');\n\
  }\n\
};\n\
//@ sourceURL=chaijs-type-detect/lib/type.js"
));
require.register("chaijs-deep-eql/lib/eql.js", Function("exports, require, module",
"/*!\n\
 * deep-eql\n\
 * Copyright(c) 2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Module dependencies\n\
 */\n\
\n\
var type = require('type-detect');\n\
\n\
/*!\n\
 * Buffer.isBuffer browser shim\n\
 */\n\
\n\
var Buffer;\n\
try { Buffer = require('buffer').Buffer; }\n\
catch(ex) {\n\
  Buffer = {};\n\
  Buffer.isBuffer = function() { return false; }\n\
}\n\
\n\
/*!\n\
 * Primary Export\n\
 */\n\
\n\
module.exports = deepEqual;\n\
\n\
/**\n\
 * Assert super-strict (egal) equality between\n\
 * two objects of any type.\n\
 *\n\
 * @param {Mixed} a\n\
 * @param {Mixed} b\n\
 * @param {Array} memoised (optional)\n\
 * @return {Boolean} equal match\n\
 */\n\
\n\
function deepEqual(a, b, m) {\n\
  if (sameValue(a, b)) {\n\
    return true;\n\
  } else if ('date' === type(a)) {\n\
    return dateEqual(a, b);\n\
  } else if ('regexp' === type(a)) {\n\
    return regexpEqual(a, b);\n\
  } else if (Buffer.isBuffer(a)) {\n\
    return bufferEqual(a, b);\n\
  } else if ('arguments' === type(a)) {\n\
    return argumentsEqual(a, b, m);\n\
  } else if (!typeEqual(a, b)) {\n\
    return false;\n\
  } else if (('object' !== type(a) && 'object' !== type(b))\n\
  && ('array' !== type(a) && 'array' !== type(b))) {\n\
    return sameValue(a, b);\n\
  } else {\n\
    return objectEqual(a, b, m);\n\
  }\n\
}\n\
\n\
/*!\n\
 * Strict (egal) equality test. Ensures that NaN always\n\
 * equals NaN and `-0` does not equal `+0`.\n\
 *\n\
 * @param {Mixed} a\n\
 * @param {Mixed} b\n\
 * @return {Boolean} equal match\n\
 */\n\
\n\
function sameValue(a, b) {\n\
  if (a === b) return a !== 0 || 1 / a === 1 / b;\n\
  return a !== a && b !== b;\n\
}\n\
\n\
/*!\n\
 * Compare the types of two given objects and\n\
 * return if they are equal. Note that an Array\n\
 * has a type of `array` (not `object`) and arguments\n\
 * have a type of `arguments` (not `array`/`object`).\n\
 *\n\
 * @param {Mixed} a\n\
 * @param {Mixed} b\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function typeEqual(a, b) {\n\
  return type(a) === type(b);\n\
}\n\
\n\
/*!\n\
 * Compare two Date objects by asserting that\n\
 * the time values are equal using `saveValue`.\n\
 *\n\
 * @param {Date} a\n\
 * @param {Date} b\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function dateEqual(a, b) {\n\
  if ('date' !== type(b)) return false;\n\
  return sameValue(a.getTime(), b.getTime());\n\
}\n\
\n\
/*!\n\
 * Compare two regular expressions by converting them\n\
 * to string and checking for `sameValue`.\n\
 *\n\
 * @param {RegExp} a\n\
 * @param {RegExp} b\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function regexpEqual(a, b) {\n\
  if ('regexp' !== type(b)) return false;\n\
  return sameValue(a.toString(), b.toString());\n\
}\n\
\n\
/*!\n\
 * Assert deep equality of two `arguments` objects.\n\
 * Unfortunately, these must be sliced to arrays\n\
 * prior to test to ensure no bad behavior.\n\
 *\n\
 * @param {Arguments} a\n\
 * @param {Arguments} b\n\
 * @param {Array} memoize (optional)\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function argumentsEqual(a, b, m) {\n\
  if ('arguments' !== type(b)) return false;\n\
  a = [].slice.call(a);\n\
  b = [].slice.call(b);\n\
  return deepEqual(a, b, m);\n\
}\n\
\n\
/*!\n\
 * Get enumerable properties of a given object.\n\
 *\n\
 * @param {Object} a\n\
 * @return {Array} property names\n\
 */\n\
\n\
function enumerable(a) {\n\
  var res = [];\n\
  for (var key in a) res.push(key);\n\
  return res;\n\
}\n\
\n\
/*!\n\
 * Simple equality for flat iterable objects\n\
 * such as Arrays or Node.js buffers.\n\
 *\n\
 * @param {Iterable} a\n\
 * @param {Iterable} b\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function iterableEqual(a, b) {\n\
  if (a.length !==  b.length) return false;\n\
\n\
  var i = 0;\n\
  var match = true;\n\
\n\
  for (; i < a.length; i++) {\n\
    if (a[i] !== b[i]) {\n\
      match = false;\n\
      break;\n\
    }\n\
  }\n\
\n\
  return match;\n\
}\n\
\n\
/*!\n\
 * Extension to `iterableEqual` specifically\n\
 * for Node.js Buffers.\n\
 *\n\
 * @param {Buffer} a\n\
 * @param {Mixed} b\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function bufferEqual(a, b) {\n\
  if (!Buffer.isBuffer(b)) return false;\n\
  return iterableEqual(a, b);\n\
}\n\
\n\
/*!\n\
 * Block for `objectEqual` ensuring non-existing\n\
 * values don't get in.\n\
 *\n\
 * @param {Mixed} object\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function isValue(a) {\n\
  return a !== null && a !== undefined;\n\
}\n\
\n\
/*!\n\
 * Recursively check the equality of two objects.\n\
 * Once basic sameness has been established it will\n\
 * defer to `deepEqual` for each enumerable key\n\
 * in the object.\n\
 *\n\
 * @param {Mixed} a\n\
 * @param {Mixed} b\n\
 * @return {Boolean} result\n\
 */\n\
\n\
function objectEqual(a, b, m) {\n\
  if (!isValue(a) || !isValue(b)) {\n\
    return false;\n\
  }\n\
\n\
  if (a.prototype !== b.prototype) {\n\
    return false;\n\
  }\n\
\n\
  var i;\n\
  if (m) {\n\
    for (i = 0; i < m.length; i++) {\n\
      if ((m[i][0] === a && m[i][1] === b)\n\
      ||  (m[i][0] === b && m[i][1] === a)) {\n\
        return true;\n\
      }\n\
    }\n\
  } else {\n\
    m = [];\n\
  }\n\
\n\
  try {\n\
    var ka = enumerable(a);\n\
    var kb = enumerable(b);\n\
  } catch (ex) {\n\
    return false;\n\
  }\n\
\n\
  ka.sort();\n\
  kb.sort();\n\
\n\
  if (!iterableEqual(ka, kb)) {\n\
    return false;\n\
  }\n\
\n\
  m.push([ a, b ]);\n\
\n\
  var key;\n\
  for (i = ka.length - 1; i >= 0; i--) {\n\
    key = ka[i];\n\
    if (!deepEqual(a[key], b[key], m)) {\n\
      return false;\n\
    }\n\
  }\n\
\n\
  return true;\n\
}\n\
//@ sourceURL=chaijs-deep-eql/lib/eql.js"
));
require.register("chaijs-chai/index.js", Function("exports, require, module",
"module.exports = require('./lib/chai');\n\
//@ sourceURL=chaijs-chai/index.js"
));
require.register("chaijs-chai/lib/chai.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
var used = []\n\
  , exports = module.exports = {};\n\
\n\
/*!\n\
 * Chai version\n\
 */\n\
\n\
exports.version = '1.8.1';\n\
\n\
/*!\n\
 * Assertion Error\n\
 */\n\
\n\
exports.AssertionError = require('assertion-error');\n\
\n\
/*!\n\
 * Utils for plugins (not exported)\n\
 */\n\
\n\
var util = require('./chai/utils');\n\
\n\
/**\n\
 * # .use(function)\n\
 *\n\
 * Provides a way to extend the internals of Chai\n\
 *\n\
 * @param {Function}\n\
 * @returns {this} for chaining\n\
 * @api public\n\
 */\n\
\n\
exports.use = function (fn) {\n\
  if (!~used.indexOf(fn)) {\n\
    fn(this, util);\n\
    used.push(fn);\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/*!\n\
 * Primary `Assertion` prototype\n\
 */\n\
\n\
var assertion = require('./chai/assertion');\n\
exports.use(assertion);\n\
\n\
/*!\n\
 * Core Assertions\n\
 */\n\
\n\
var core = require('./chai/core/assertions');\n\
exports.use(core);\n\
\n\
/*!\n\
 * Expect interface\n\
 */\n\
\n\
var expect = require('./chai/interface/expect');\n\
exports.use(expect);\n\
\n\
/*!\n\
 * Should interface\n\
 */\n\
\n\
var should = require('./chai/interface/should');\n\
exports.use(should);\n\
\n\
/*!\n\
 * Assert interface\n\
 */\n\
\n\
var assert = require('./chai/interface/assert');\n\
exports.use(assert);\n\
//@ sourceURL=chaijs-chai/lib/chai.js"
));
require.register("chaijs-chai/lib/chai/assertion.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * http://chaijs.com\n\
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
module.exports = function (_chai, util) {\n\
  /*!\n\
   * Module dependencies.\n\
   */\n\
\n\
  var AssertionError = _chai.AssertionError\n\
    , flag = util.flag;\n\
\n\
  /*!\n\
   * Module export.\n\
   */\n\
\n\
  _chai.Assertion = Assertion;\n\
\n\
  /*!\n\
   * Assertion Constructor\n\
   *\n\
   * Creates object for chaining.\n\
   *\n\
   * @api private\n\
   */\n\
\n\
  function Assertion (obj, msg, stack) {\n\
    flag(this, 'ssfi', stack || arguments.callee);\n\
    flag(this, 'object', obj);\n\
    flag(this, 'message', msg);\n\
  }\n\
\n\
  /*!\n\
    * ### Assertion.includeStack\n\
    *\n\
    * User configurable property, influences whether stack trace\n\
    * is included in Assertion error message. Default of false\n\
    * suppresses stack trace in the error message\n\
    *\n\
    *     Assertion.includeStack = true;  // enable stack on error\n\
    *\n\
    * @api public\n\
    */\n\
\n\
  Assertion.includeStack = false;\n\
\n\
  /*!\n\
   * ### Assertion.showDiff\n\
   *\n\
   * User configurable property, influences whether or not\n\
   * the `showDiff` flag should be included in the thrown\n\
   * AssertionErrors. `false` will always be `false`; `true`\n\
   * will be true when the assertion has requested a diff\n\
   * be shown.\n\
   *\n\
   * @api public\n\
   */\n\
\n\
  Assertion.showDiff = true;\n\
\n\
  Assertion.addProperty = function (name, fn) {\n\
    util.addProperty(this.prototype, name, fn);\n\
  };\n\
\n\
  Assertion.addMethod = function (name, fn) {\n\
    util.addMethod(this.prototype, name, fn);\n\
  };\n\
\n\
  Assertion.addChainableMethod = function (name, fn, chainingBehavior) {\n\
    util.addChainableMethod(this.prototype, name, fn, chainingBehavior);\n\
  };\n\
\n\
  Assertion.overwriteProperty = function (name, fn) {\n\
    util.overwriteProperty(this.prototype, name, fn);\n\
  };\n\
\n\
  Assertion.overwriteMethod = function (name, fn) {\n\
    util.overwriteMethod(this.prototype, name, fn);\n\
  };\n\
\n\
  /*!\n\
   * ### .assert(expression, message, negateMessage, expected, actual)\n\
   *\n\
   * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.\n\
   *\n\
   * @name assert\n\
   * @param {Philosophical} expression to be tested\n\
   * @param {String} message to display if fails\n\
   * @param {String} negatedMessage to display if negated expression fails\n\
   * @param {Mixed} expected value (remember to check for negation)\n\
   * @param {Mixed} actual (optional) will default to `this.obj`\n\
   * @api private\n\
   */\n\
\n\
  Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual, showDiff) {\n\
    var ok = util.test(this, arguments);\n\
    if (true !== showDiff) showDiff = false;\n\
    if (true !== Assertion.showDiff) showDiff = false;\n\
\n\
    if (!ok) {\n\
      var msg = util.getMessage(this, arguments)\n\
        , actual = util.getActual(this, arguments);\n\
      throw new AssertionError(msg, {\n\
          actual: actual\n\
        , expected: expected\n\
        , showDiff: showDiff\n\
      }, (Assertion.includeStack) ? this.assert : flag(this, 'ssfi'));\n\
    }\n\
  };\n\
\n\
  /*!\n\
   * ### ._obj\n\
   *\n\
   * Quick reference to stored `actual` value for plugin developers.\n\
   *\n\
   * @api private\n\
   */\n\
\n\
  Object.defineProperty(Assertion.prototype, '_obj',\n\
    { get: function () {\n\
        return flag(this, 'object');\n\
      }\n\
    , set: function (val) {\n\
        flag(this, 'object', val);\n\
      }\n\
  });\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/assertion.js"
));
require.register("chaijs-chai/lib/chai/core/assertions.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * http://chaijs.com\n\
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
module.exports = function (chai, _) {\n\
  var Assertion = chai.Assertion\n\
    , toString = Object.prototype.toString\n\
    , flag = _.flag;\n\
\n\
  /**\n\
   * ### Language Chains\n\
   *\n\
   * The following are provide as chainable getters to\n\
   * improve the readability of your assertions. They\n\
   * do not provide an testing capability unless they\n\
   * have been overwritten by a plugin.\n\
   *\n\
   * **Chains**\n\
   *\n\
   * - to\n\
   * - be\n\
   * - been\n\
   * - is\n\
   * - that\n\
   * - and\n\
   * - have\n\
   * - with\n\
   * - at\n\
   * - of\n\
   * - same\n\
   *\n\
   * @name language chains\n\
   * @api public\n\
   */\n\
\n\
  [ 'to', 'be', 'been'\n\
  , 'is', 'and', 'have'\n\
  , 'with', 'that', 'at'\n\
  , 'of', 'same' ].forEach(function (chain) {\n\
    Assertion.addProperty(chain, function () {\n\
      return this;\n\
    });\n\
  });\n\
\n\
  /**\n\
   * ### .not\n\
   *\n\
   * Negates any of assertions following in the chain.\n\
   *\n\
   *     expect(foo).to.not.equal('bar');\n\
   *     expect(goodFn).to.not.throw(Error);\n\
   *     expect({ foo: 'baz' }).to.have.property('foo')\n\
   *       .and.not.equal('bar');\n\
   *\n\
   * @name not\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('not', function () {\n\
    flag(this, 'negate', true);\n\
  });\n\
\n\
  /**\n\
   * ### .deep\n\
   *\n\
   * Sets the `deep` flag, later used by the `equal` and\n\
   * `property` assertions.\n\
   *\n\
   *     expect(foo).to.deep.equal({ bar: 'baz' });\n\
   *     expect({ foo: { bar: { baz: 'quux' } } })\n\
   *       .to.have.deep.property('foo.bar.baz', 'quux');\n\
   *\n\
   * @name deep\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('deep', function () {\n\
    flag(this, 'deep', true);\n\
  });\n\
\n\
  /**\n\
   * ### .a(type)\n\
   *\n\
   * The `a` and `an` assertions are aliases that can be\n\
   * used either as language chains or to assert a value's\n\
   * type.\n\
   *\n\
   *     // typeof\n\
   *     expect('test').to.be.a('string');\n\
   *     expect({ foo: 'bar' }).to.be.an('object');\n\
   *     expect(null).to.be.a('null');\n\
   *     expect(undefined).to.be.an('undefined');\n\
   *\n\
   *     // language chain\n\
   *     expect(foo).to.be.an.instanceof(Foo);\n\
   *\n\
   * @name a\n\
   * @alias an\n\
   * @param {String} type\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function an (type, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    type = type.toLowerCase();\n\
    var obj = flag(this, 'object')\n\
      , article = ~[ 'a', 'e', 'i', 'o', 'u' ].indexOf(type.charAt(0)) ? 'an ' : 'a ';\n\
\n\
    this.assert(\n\
        type === _.type(obj)\n\
      , 'expected #{this} to be ' + article + type\n\
      , 'expected #{this} not to be ' + article + type\n\
    );\n\
  }\n\
\n\
  Assertion.addChainableMethod('an', an);\n\
  Assertion.addChainableMethod('a', an);\n\
\n\
  /**\n\
   * ### .include(value)\n\
   *\n\
   * The `include` and `contain` assertions can be used as either property\n\
   * based language chains or as methods to assert the inclusion of an object\n\
   * in an array or a substring in a string. When used as language chains,\n\
   * they toggle the `contain` flag for the `keys` assertion.\n\
   *\n\
   *     expect([1,2,3]).to.include(2);\n\
   *     expect('foobar').to.contain('foo');\n\
   *     expect({ foo: 'bar', hello: 'universe' }).to.include.keys('foo');\n\
   *\n\
   * @name include\n\
   * @alias contain\n\
   * @param {Object|String|Number} obj\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function includeChainingBehavior () {\n\
    flag(this, 'contains', true);\n\
  }\n\
\n\
  function include (val, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object')\n\
    this.assert(\n\
        ~obj.indexOf(val)\n\
      , 'expected #{this} to include ' + _.inspect(val)\n\
      , 'expected #{this} to not include ' + _.inspect(val));\n\
  }\n\
\n\
  Assertion.addChainableMethod('include', include, includeChainingBehavior);\n\
  Assertion.addChainableMethod('contain', include, includeChainingBehavior);\n\
\n\
  /**\n\
   * ### .ok\n\
   *\n\
   * Asserts that the target is truthy.\n\
   *\n\
   *     expect('everthing').to.be.ok;\n\
   *     expect(1).to.be.ok;\n\
   *     expect(false).to.not.be.ok;\n\
   *     expect(undefined).to.not.be.ok;\n\
   *     expect(null).to.not.be.ok;\n\
   *\n\
   * @name ok\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('ok', function () {\n\
    this.assert(\n\
        flag(this, 'object')\n\
      , 'expected #{this} to be truthy'\n\
      , 'expected #{this} to be falsy');\n\
  });\n\
\n\
  /**\n\
   * ### .true\n\
   *\n\
   * Asserts that the target is `true`.\n\
   *\n\
   *     expect(true).to.be.true;\n\
   *     expect(1).to.not.be.true;\n\
   *\n\
   * @name true\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('true', function () {\n\
    this.assert(\n\
        true === flag(this, 'object')\n\
      , 'expected #{this} to be true'\n\
      , 'expected #{this} to be false'\n\
      , this.negate ? false : true\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .false\n\
   *\n\
   * Asserts that the target is `false`.\n\
   *\n\
   *     expect(false).to.be.false;\n\
   *     expect(0).to.not.be.false;\n\
   *\n\
   * @name false\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('false', function () {\n\
    this.assert(\n\
        false === flag(this, 'object')\n\
      , 'expected #{this} to be false'\n\
      , 'expected #{this} to be true'\n\
      , this.negate ? true : false\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .null\n\
   *\n\
   * Asserts that the target is `null`.\n\
   *\n\
   *     expect(null).to.be.null;\n\
   *     expect(undefined).not.to.be.null;\n\
   *\n\
   * @name null\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('null', function () {\n\
    this.assert(\n\
        null === flag(this, 'object')\n\
      , 'expected #{this} to be null'\n\
      , 'expected #{this} not to be null'\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .undefined\n\
   *\n\
   * Asserts that the target is `undefined`.\n\
   *\n\
   *     expect(undefined).to.be.undefined;\n\
   *     expect(null).to.not.be.undefined;\n\
   *\n\
   * @name undefined\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('undefined', function () {\n\
    this.assert(\n\
        undefined === flag(this, 'object')\n\
      , 'expected #{this} to be undefined'\n\
      , 'expected #{this} not to be undefined'\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .exist\n\
   *\n\
   * Asserts that the target is neither `null` nor `undefined`.\n\
   *\n\
   *     var foo = 'hi'\n\
   *       , bar = null\n\
   *       , baz;\n\
   *\n\
   *     expect(foo).to.exist;\n\
   *     expect(bar).to.not.exist;\n\
   *     expect(baz).to.not.exist;\n\
   *\n\
   * @name exist\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('exist', function () {\n\
    this.assert(\n\
        null != flag(this, 'object')\n\
      , 'expected #{this} to exist'\n\
      , 'expected #{this} to not exist'\n\
    );\n\
  });\n\
\n\
\n\
  /**\n\
   * ### .empty\n\
   *\n\
   * Asserts that the target's length is `0`. For arrays, it checks\n\
   * the `length` property. For objects, it gets the count of\n\
   * enumerable keys.\n\
   *\n\
   *     expect([]).to.be.empty;\n\
   *     expect('').to.be.empty;\n\
   *     expect({}).to.be.empty;\n\
   *\n\
   * @name empty\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('empty', function () {\n\
    var obj = flag(this, 'object')\n\
      , expected = obj;\n\
\n\
    if (Array.isArray(obj) || 'string' === typeof object) {\n\
      expected = obj.length;\n\
    } else if (typeof obj === 'object') {\n\
      expected = Object.keys(obj).length;\n\
    }\n\
\n\
    this.assert(\n\
        !expected\n\
      , 'expected #{this} to be empty'\n\
      , 'expected #{this} not to be empty'\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .arguments\n\
   *\n\
   * Asserts that the target is an arguments object.\n\
   *\n\
   *     function test () {\n\
   *       expect(arguments).to.be.arguments;\n\
   *     }\n\
   *\n\
   * @name arguments\n\
   * @alias Arguments\n\
   * @api public\n\
   */\n\
\n\
  function checkArguments () {\n\
    var obj = flag(this, 'object')\n\
      , type = Object.prototype.toString.call(obj);\n\
    this.assert(\n\
        '[object Arguments]' === type\n\
      , 'expected #{this} to be arguments but got ' + type\n\
      , 'expected #{this} to not be arguments'\n\
    );\n\
  }\n\
\n\
  Assertion.addProperty('arguments', checkArguments);\n\
  Assertion.addProperty('Arguments', checkArguments);\n\
\n\
  /**\n\
   * ### .equal(value)\n\
   *\n\
   * Asserts that the target is strictly equal (`===`) to `value`.\n\
   * Alternately, if the `deep` flag is set, asserts that\n\
   * the target is deeply equal to `value`.\n\
   *\n\
   *     expect('hello').to.equal('hello');\n\
   *     expect(42).to.equal(42);\n\
   *     expect(1).to.not.equal(true);\n\
   *     expect({ foo: 'bar' }).to.not.equal({ foo: 'bar' });\n\
   *     expect({ foo: 'bar' }).to.deep.equal({ foo: 'bar' });\n\
   *\n\
   * @name equal\n\
   * @alias equals\n\
   * @alias eq\n\
   * @alias deep.equal\n\
   * @param {Mixed} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertEqual (val, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'deep')) {\n\
      return this.eql(val);\n\
    } else {\n\
      this.assert(\n\
          val === obj\n\
        , 'expected #{this} to equal #{exp}'\n\
        , 'expected #{this} to not equal #{exp}'\n\
        , val\n\
        , this._obj\n\
        , true\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('equal', assertEqual);\n\
  Assertion.addMethod('equals', assertEqual);\n\
  Assertion.addMethod('eq', assertEqual);\n\
\n\
  /**\n\
   * ### .eql(value)\n\
   *\n\
   * Asserts that the target is deeply equal to `value`.\n\
   *\n\
   *     expect({ foo: 'bar' }).to.eql({ foo: 'bar' });\n\
   *     expect([ 1, 2, 3 ]).to.eql([ 1, 2, 3 ]);\n\
   *\n\
   * @name eql\n\
   * @alias eqls\n\
   * @param {Mixed} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertEql(obj, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    this.assert(\n\
        _.eql(obj, flag(this, 'object'))\n\
      , 'expected #{this} to deeply equal #{exp}'\n\
      , 'expected #{this} to not deeply equal #{exp}'\n\
      , obj\n\
      , this._obj\n\
      , true\n\
    );\n\
  }\n\
\n\
  Assertion.addMethod('eql', assertEql);\n\
  Assertion.addMethod('eqls', assertEql);\n\
\n\
  /**\n\
   * ### .above(value)\n\
   *\n\
   * Asserts that the target is greater than `value`.\n\
   *\n\
   *     expect(10).to.be.above(5);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a minimum length. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.above(2);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);\n\
   *\n\
   * @name above\n\
   * @alias gt\n\
   * @alias greaterThan\n\
   * @param {Number} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertAbove (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len > n\n\
        , 'expected #{this} to have a length above #{exp} but got #{act}'\n\
        , 'expected #{this} to not have a length above #{exp}'\n\
        , n\n\
        , len\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj > n\n\
        , 'expected #{this} to be above ' + n\n\
        , 'expected #{this} to be at most ' + n\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('above', assertAbove);\n\
  Assertion.addMethod('gt', assertAbove);\n\
  Assertion.addMethod('greaterThan', assertAbove);\n\
\n\
  /**\n\
   * ### .least(value)\n\
   *\n\
   * Asserts that the target is greater than or equal to `value`.\n\
   *\n\
   *     expect(10).to.be.at.least(10);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a minimum length. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.of.at.least(2);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.least(3);\n\
   *\n\
   * @name least\n\
   * @alias gte\n\
   * @param {Number} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertLeast (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len >= n\n\
        , 'expected #{this} to have a length at least #{exp} but got #{act}'\n\
        , 'expected #{this} to have a length below #{exp}'\n\
        , n\n\
        , len\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj >= n\n\
        , 'expected #{this} to be at least ' + n\n\
        , 'expected #{this} to be below ' + n\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('least', assertLeast);\n\
  Assertion.addMethod('gte', assertLeast);\n\
\n\
  /**\n\
   * ### .below(value)\n\
   *\n\
   * Asserts that the target is less than `value`.\n\
   *\n\
   *     expect(5).to.be.below(10);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a maximum length. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.below(4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);\n\
   *\n\
   * @name below\n\
   * @alias lt\n\
   * @alias lessThan\n\
   * @param {Number} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertBelow (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len < n\n\
        , 'expected #{this} to have a length below #{exp} but got #{act}'\n\
        , 'expected #{this} to not have a length below #{exp}'\n\
        , n\n\
        , len\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj < n\n\
        , 'expected #{this} to be below ' + n\n\
        , 'expected #{this} to be at least ' + n\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('below', assertBelow);\n\
  Assertion.addMethod('lt', assertBelow);\n\
  Assertion.addMethod('lessThan', assertBelow);\n\
\n\
  /**\n\
   * ### .most(value)\n\
   *\n\
   * Asserts that the target is less than or equal to `value`.\n\
   *\n\
   *     expect(5).to.be.at.most(5);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a maximum length. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.of.at.most(4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.most(3);\n\
   *\n\
   * @name most\n\
   * @alias lte\n\
   * @param {Number} value\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertMost (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len <= n\n\
        , 'expected #{this} to have a length at most #{exp} but got #{act}'\n\
        , 'expected #{this} to have a length above #{exp}'\n\
        , n\n\
        , len\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj <= n\n\
        , 'expected #{this} to be at most ' + n\n\
        , 'expected #{this} to be above ' + n\n\
      );\n\
    }\n\
  }\n\
\n\
  Assertion.addMethod('most', assertMost);\n\
  Assertion.addMethod('lte', assertMost);\n\
\n\
  /**\n\
   * ### .within(start, finish)\n\
   *\n\
   * Asserts that the target is within a range.\n\
   *\n\
   *     expect(7).to.be.within(5,10);\n\
   *\n\
   * Can also be used in conjunction with `length` to\n\
   * assert a length range. The benefit being a\n\
   * more informative error message than if the length\n\
   * was supplied directly.\n\
   *\n\
   *     expect('foo').to.have.length.within(2,4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);\n\
   *\n\
   * @name within\n\
   * @param {Number} start lowerbound inclusive\n\
   * @param {Number} finish upperbound inclusive\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('within', function (start, finish, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object')\n\
      , range = start + '..' + finish;\n\
    if (flag(this, 'doLength')) {\n\
      new Assertion(obj, msg).to.have.property('length');\n\
      var len = obj.length;\n\
      this.assert(\n\
          len >= start && len <= finish\n\
        , 'expected #{this} to have a length within ' + range\n\
        , 'expected #{this} to not have a length within ' + range\n\
      );\n\
    } else {\n\
      this.assert(\n\
          obj >= start && obj <= finish\n\
        , 'expected #{this} to be within ' + range\n\
        , 'expected #{this} to not be within ' + range\n\
      );\n\
    }\n\
  });\n\
\n\
  /**\n\
   * ### .instanceof(constructor)\n\
   *\n\
   * Asserts that the target is an instance of `constructor`.\n\
   *\n\
   *     var Tea = function (name) { this.name = name; }\n\
   *       , Chai = new Tea('chai');\n\
   *\n\
   *     expect(Chai).to.be.an.instanceof(Tea);\n\
   *     expect([ 1, 2, 3 ]).to.be.instanceof(Array);\n\
   *\n\
   * @name instanceof\n\
   * @param {Constructor} constructor\n\
   * @param {String} message _optional_\n\
   * @alias instanceOf\n\
   * @api public\n\
   */\n\
\n\
  function assertInstanceOf (constructor, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var name = _.getName(constructor);\n\
    this.assert(\n\
        flag(this, 'object') instanceof constructor\n\
      , 'expected #{this} to be an instance of ' + name\n\
      , 'expected #{this} to not be an instance of ' + name\n\
    );\n\
  };\n\
\n\
  Assertion.addMethod('instanceof', assertInstanceOf);\n\
  Assertion.addMethod('instanceOf', assertInstanceOf);\n\
\n\
  /**\n\
   * ### .property(name, [value])\n\
   *\n\
   * Asserts that the target has a property `name`, optionally asserting that\n\
   * the value of that property is strictly equal to  `value`.\n\
   * If the `deep` flag is set, you can use dot- and bracket-notation for deep\n\
   * references into objects and arrays.\n\
   *\n\
   *     // simple referencing\n\
   *     var obj = { foo: 'bar' };\n\
   *     expect(obj).to.have.property('foo');\n\
   *     expect(obj).to.have.property('foo', 'bar');\n\
   *\n\
   *     // deep referencing\n\
   *     var deepObj = {\n\
   *         green: { tea: 'matcha' }\n\
   *       , teas: [ 'chai', 'matcha', { tea: 'konacha' } ]\n\
   *     };\n\
\n\
   *     expect(deepObj).to.have.deep.property('green.tea', 'matcha');\n\
   *     expect(deepObj).to.have.deep.property('teas[1]', 'matcha');\n\
   *     expect(deepObj).to.have.deep.property('teas[2].tea', 'konacha');\n\
   *\n\
   * You can also use an array as the starting point of a `deep.property`\n\
   * assertion, or traverse nested arrays.\n\
   *\n\
   *     var arr = [\n\
   *         [ 'chai', 'matcha', 'konacha' ]\n\
   *       , [ { tea: 'chai' }\n\
   *         , { tea: 'matcha' }\n\
   *         , { tea: 'konacha' } ]\n\
   *     ];\n\
   *\n\
   *     expect(arr).to.have.deep.property('[0][1]', 'matcha');\n\
   *     expect(arr).to.have.deep.property('[1][2].tea', 'konacha');\n\
   *\n\
   * Furthermore, `property` changes the subject of the assertion\n\
   * to be the value of that property from the original object. This\n\
   * permits for further chainable assertions on that property.\n\
   *\n\
   *     expect(obj).to.have.property('foo')\n\
   *       .that.is.a('string');\n\
   *     expect(deepObj).to.have.property('green')\n\
   *       .that.is.an('object')\n\
   *       .that.deep.equals({ tea: 'matcha' });\n\
   *     expect(deepObj).to.have.property('teas')\n\
   *       .that.is.an('array')\n\
   *       .with.deep.property('[2]')\n\
   *         .that.deep.equals({ tea: 'konacha' });\n\
   *\n\
   * @name property\n\
   * @alias deep.property\n\
   * @param {String} name\n\
   * @param {Mixed} value (optional)\n\
   * @param {String} message _optional_\n\
   * @returns value of property for chaining\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('property', function (name, val, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
\n\
    var descriptor = flag(this, 'deep') ? 'deep property ' : 'property '\n\
      , negate = flag(this, 'negate')\n\
      , obj = flag(this, 'object')\n\
      , value = flag(this, 'deep')\n\
        ? _.getPathValue(name, obj)\n\
        : obj[name];\n\
\n\
    if (negate && undefined !== val) {\n\
      if (undefined === value) {\n\
        msg = (msg != null) ? msg + ': ' : '';\n\
        throw new Error(msg + _.inspect(obj) + ' has no ' + descriptor + _.inspect(name));\n\
      }\n\
    } else {\n\
      this.assert(\n\
          undefined !== value\n\
        , 'expected #{this} to have a ' + descriptor + _.inspect(name)\n\
        , 'expected #{this} to not have ' + descriptor + _.inspect(name));\n\
    }\n\
\n\
    if (undefined !== val) {\n\
      this.assert(\n\
          val === value\n\
        , 'expected #{this} to have a ' + descriptor + _.inspect(name) + ' of #{exp}, but got #{act}'\n\
        , 'expected #{this} to not have a ' + descriptor + _.inspect(name) + ' of #{act}'\n\
        , val\n\
        , value\n\
      );\n\
    }\n\
\n\
    flag(this, 'object', value);\n\
  });\n\
\n\
\n\
  /**\n\
   * ### .ownProperty(name)\n\
   *\n\
   * Asserts that the target has an own property `name`.\n\
   *\n\
   *     expect('test').to.have.ownProperty('length');\n\
   *\n\
   * @name ownProperty\n\
   * @alias haveOwnProperty\n\
   * @param {String} name\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertOwnProperty (name, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    this.assert(\n\
        obj.hasOwnProperty(name)\n\
      , 'expected #{this} to have own property ' + _.inspect(name)\n\
      , 'expected #{this} to not have own property ' + _.inspect(name)\n\
    );\n\
  }\n\
\n\
  Assertion.addMethod('ownProperty', assertOwnProperty);\n\
  Assertion.addMethod('haveOwnProperty', assertOwnProperty);\n\
\n\
  /**\n\
   * ### .length(value)\n\
   *\n\
   * Asserts that the target's `length` property has\n\
   * the expected value.\n\
   *\n\
   *     expect([ 1, 2, 3]).to.have.length(3);\n\
   *     expect('foobar').to.have.length(6);\n\
   *\n\
   * Can also be used as a chain precursor to a value\n\
   * comparison for the length property.\n\
   *\n\
   *     expect('foo').to.have.length.above(2);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);\n\
   *     expect('foo').to.have.length.below(4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);\n\
   *     expect('foo').to.have.length.within(2,4);\n\
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);\n\
   *\n\
   * @name length\n\
   * @alias lengthOf\n\
   * @param {Number} length\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  function assertLengthChain () {\n\
    flag(this, 'doLength', true);\n\
  }\n\
\n\
  function assertLength (n, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    new Assertion(obj, msg).to.have.property('length');\n\
    var len = obj.length;\n\
\n\
    this.assert(\n\
        len == n\n\
      , 'expected #{this} to have a length of #{exp} but got #{act}'\n\
      , 'expected #{this} to not have a length of #{act}'\n\
      , n\n\
      , len\n\
    );\n\
  }\n\
\n\
  Assertion.addChainableMethod('length', assertLength, assertLengthChain);\n\
  Assertion.addMethod('lengthOf', assertLength, assertLengthChain);\n\
\n\
  /**\n\
   * ### .match(regexp)\n\
   *\n\
   * Asserts that the target matches a regular expression.\n\
   *\n\
   *     expect('foobar').to.match(/^foo/);\n\
   *\n\
   * @name match\n\
   * @param {RegExp} RegularExpression\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('match', function (re, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    this.assert(\n\
        re.exec(obj)\n\
      , 'expected #{this} to match ' + re\n\
      , 'expected #{this} not to match ' + re\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .string(string)\n\
   *\n\
   * Asserts that the string target contains another string.\n\
   *\n\
   *     expect('foobar').to.have.string('bar');\n\
   *\n\
   * @name string\n\
   * @param {String} string\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('string', function (str, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    new Assertion(obj, msg).is.a('string');\n\
\n\
    this.assert(\n\
        ~obj.indexOf(str)\n\
      , 'expected #{this} to contain ' + _.inspect(str)\n\
      , 'expected #{this} to not contain ' + _.inspect(str)\n\
    );\n\
  });\n\
\n\
\n\
  /**\n\
   * ### .keys(key1, [key2], [...])\n\
   *\n\
   * Asserts that the target has exactly the given keys, or\n\
   * asserts the inclusion of some keys when using the\n\
   * `include` or `contain` modifiers.\n\
   *\n\
   *     expect({ foo: 1, bar: 2 }).to.have.keys(['foo', 'bar']);\n\
   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.keys('foo', 'bar');\n\
   *\n\
   * @name keys\n\
   * @alias key\n\
   * @param {String...|Array} keys\n\
   * @api public\n\
   */\n\
\n\
  function assertKeys (keys) {\n\
    var obj = flag(this, 'object')\n\
      , str\n\
      , ok = true;\n\
\n\
    keys = keys instanceof Array\n\
      ? keys\n\
      : Array.prototype.slice.call(arguments);\n\
\n\
    if (!keys.length) throw new Error('keys required');\n\
\n\
    var actual = Object.keys(obj)\n\
      , len = keys.length;\n\
\n\
    // Inclusion\n\
    ok = keys.every(function(key){\n\
      return ~actual.indexOf(key);\n\
    });\n\
\n\
    // Strict\n\
    if (!flag(this, 'negate') && !flag(this, 'contains')) {\n\
      ok = ok && keys.length == actual.length;\n\
    }\n\
\n\
    // Key string\n\
    if (len > 1) {\n\
      keys = keys.map(function(key){\n\
        return _.inspect(key);\n\
      });\n\
      var last = keys.pop();\n\
      str = keys.join(', ') + ', and ' + last;\n\
    } else {\n\
      str = _.inspect(keys[0]);\n\
    }\n\
\n\
    // Form\n\
    str = (len > 1 ? 'keys ' : 'key ') + str;\n\
\n\
    // Have / include\n\
    str = (flag(this, 'contains') ? 'contain ' : 'have ') + str;\n\
\n\
    // Assertion\n\
    this.assert(\n\
        ok\n\
      , 'expected #{this} to ' + str\n\
      , 'expected #{this} to not ' + str\n\
    );\n\
  }\n\
\n\
  Assertion.addMethod('keys', assertKeys);\n\
  Assertion.addMethod('key', assertKeys);\n\
\n\
  /**\n\
   * ### .throw(constructor)\n\
   *\n\
   * Asserts that the function target will throw a specific error, or specific type of error\n\
   * (as determined using `instanceof`), optionally with a RegExp or string inclusion test\n\
   * for the error's message.\n\
   *\n\
   *     var err = new ReferenceError('This is a bad function.');\n\
   *     var fn = function () { throw err; }\n\
   *     expect(fn).to.throw(ReferenceError);\n\
   *     expect(fn).to.throw(Error);\n\
   *     expect(fn).to.throw(/bad function/);\n\
   *     expect(fn).to.not.throw('good function');\n\
   *     expect(fn).to.throw(ReferenceError, /bad function/);\n\
   *     expect(fn).to.throw(err);\n\
   *     expect(fn).to.not.throw(new RangeError('Out of range.'));\n\
   *\n\
   * Please note that when a throw expectation is negated, it will check each\n\
   * parameter independently, starting with error constructor type. The appropriate way\n\
   * to check for the existence of a type of error but for a message that does not match\n\
   * is to use `and`.\n\
   *\n\
   *     expect(fn).to.throw(ReferenceError)\n\
   *        .and.not.throw(/good function/);\n\
   *\n\
   * @name throw\n\
   * @alias throws\n\
   * @alias Throw\n\
   * @param {ErrorConstructor} constructor\n\
   * @param {String|RegExp} expected error message\n\
   * @param {String} message _optional_\n\
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types\n\
   * @api public\n\
   */\n\
\n\
  function assertThrows (constructor, errMsg, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    new Assertion(obj, msg).is.a('function');\n\
\n\
    var thrown = false\n\
      , desiredError = null\n\
      , name = null\n\
      , thrownError = null;\n\
\n\
    if (arguments.length === 0) {\n\
      errMsg = null;\n\
      constructor = null;\n\
    } else if (constructor && (constructor instanceof RegExp || 'string' === typeof constructor)) {\n\
      errMsg = constructor;\n\
      constructor = null;\n\
    } else if (constructor && constructor instanceof Error) {\n\
      desiredError = constructor;\n\
      constructor = null;\n\
      errMsg = null;\n\
    } else if (typeof constructor === 'function') {\n\
      name = (new constructor()).name;\n\
    } else {\n\
      constructor = null;\n\
    }\n\
\n\
    try {\n\
      obj();\n\
    } catch (err) {\n\
      // first, check desired error\n\
      if (desiredError) {\n\
        this.assert(\n\
            err === desiredError\n\
          , 'expected #{this} to throw #{exp} but #{act} was thrown'\n\
          , 'expected #{this} to not throw #{exp}'\n\
          , (desiredError instanceof Error ? desiredError.toString() : desiredError)\n\
          , (err instanceof Error ? err.toString() : err)\n\
        );\n\
\n\
        return this;\n\
      }\n\
      // next, check constructor\n\
      if (constructor) {\n\
        this.assert(\n\
            err instanceof constructor\n\
          , 'expected #{this} to throw #{exp} but #{act} was thrown'\n\
          , 'expected #{this} to not throw #{exp} but #{act} was thrown'\n\
          , name\n\
          , (err instanceof Error ? err.toString() : err)\n\
        );\n\
\n\
        if (!errMsg) return this;\n\
      }\n\
      // next, check message\n\
      var message = 'object' === _.type(err) && \"message\" in err\n\
        ? err.message\n\
        : '' + err;\n\
\n\
      if ((message != null) && errMsg && errMsg instanceof RegExp) {\n\
        this.assert(\n\
            errMsg.exec(message)\n\
          , 'expected #{this} to throw error matching #{exp} but got #{act}'\n\
          , 'expected #{this} to throw error not matching #{exp}'\n\
          , errMsg\n\
          , message\n\
        );\n\
\n\
        return this;\n\
      } else if ((message != null) && errMsg && 'string' === typeof errMsg) {\n\
        this.assert(\n\
            ~message.indexOf(errMsg)\n\
          , 'expected #{this} to throw error including #{exp} but got #{act}'\n\
          , 'expected #{this} to throw error not including #{act}'\n\
          , errMsg\n\
          , message\n\
        );\n\
\n\
        return this;\n\
      } else {\n\
        thrown = true;\n\
        thrownError = err;\n\
      }\n\
    }\n\
\n\
    var actuallyGot = ''\n\
      , expectedThrown = name !== null\n\
        ? name\n\
        : desiredError\n\
          ? '#{exp}' //_.inspect(desiredError)\n\
          : 'an error';\n\
\n\
    if (thrown) {\n\
      actuallyGot = ' but #{act} was thrown'\n\
    }\n\
\n\
    this.assert(\n\
        thrown === true\n\
      , 'expected #{this} to throw ' + expectedThrown + actuallyGot\n\
      , 'expected #{this} to not throw ' + expectedThrown + actuallyGot\n\
      , (desiredError instanceof Error ? desiredError.toString() : desiredError)\n\
      , (thrownError instanceof Error ? thrownError.toString() : thrownError)\n\
    );\n\
  };\n\
\n\
  Assertion.addMethod('throw', assertThrows);\n\
  Assertion.addMethod('throws', assertThrows);\n\
  Assertion.addMethod('Throw', assertThrows);\n\
\n\
  /**\n\
   * ### .respondTo(method)\n\
   *\n\
   * Asserts that the object or class target will respond to a method.\n\
   *\n\
   *     Klass.prototype.bar = function(){};\n\
   *     expect(Klass).to.respondTo('bar');\n\
   *     expect(obj).to.respondTo('bar');\n\
   *\n\
   * To check if a constructor will respond to a static function,\n\
   * set the `itself` flag.\n\
   *\n\
   *     Klass.baz = function(){};\n\
   *     expect(Klass).itself.to.respondTo('baz');\n\
   *\n\
   * @name respondTo\n\
   * @param {String} method\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('respondTo', function (method, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object')\n\
      , itself = flag(this, 'itself')\n\
      , context = ('function' === _.type(obj) && !itself)\n\
        ? obj.prototype[method]\n\
        : obj[method];\n\
\n\
    this.assert(\n\
        'function' === typeof context\n\
      , 'expected #{this} to respond to ' + _.inspect(method)\n\
      , 'expected #{this} to not respond to ' + _.inspect(method)\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .itself\n\
   *\n\
   * Sets the `itself` flag, later used by the `respondTo` assertion.\n\
   *\n\
   *     function Foo() {}\n\
   *     Foo.bar = function() {}\n\
   *     Foo.prototype.baz = function() {}\n\
   *\n\
   *     expect(Foo).itself.to.respondTo('bar');\n\
   *     expect(Foo).itself.not.to.respondTo('baz');\n\
   *\n\
   * @name itself\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addProperty('itself', function () {\n\
    flag(this, 'itself', true);\n\
  });\n\
\n\
  /**\n\
   * ### .satisfy(method)\n\
   *\n\
   * Asserts that the target passes a given truth test.\n\
   *\n\
   *     expect(1).to.satisfy(function(num) { return num > 0; });\n\
   *\n\
   * @name satisfy\n\
   * @param {Function} matcher\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('satisfy', function (matcher, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    this.assert(\n\
        matcher(obj)\n\
      , 'expected #{this} to satisfy ' + _.objDisplay(matcher)\n\
      , 'expected #{this} to not satisfy' + _.objDisplay(matcher)\n\
      , this.negate ? false : true\n\
      , matcher(obj)\n\
    );\n\
  });\n\
\n\
  /**\n\
   * ### .closeTo(expected, delta)\n\
   *\n\
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.\n\
   *\n\
   *     expect(1.5).to.be.closeTo(1, 0.5);\n\
   *\n\
   * @name closeTo\n\
   * @param {Number} expected\n\
   * @param {Number} delta\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('closeTo', function (expected, delta, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
    this.assert(\n\
        Math.abs(obj - expected) <= delta\n\
      , 'expected #{this} to be close to ' + expected + ' +/- ' + delta\n\
      , 'expected #{this} not to be close to ' + expected + ' +/- ' + delta\n\
    );\n\
  });\n\
\n\
  function isSubsetOf(subset, superset) {\n\
    return subset.every(function(elem) {\n\
      return superset.indexOf(elem) !== -1;\n\
    })\n\
  }\n\
\n\
  /**\n\
   * ### .members(set)\n\
   *\n\
   * Asserts that the target is a superset of `set`,\n\
   * or that the target and `set` have the same members.\n\
   *\n\
   *     expect([1, 2, 3]).to.include.members([3, 2]);\n\
   *     expect([1, 2, 3]).to.not.include.members([3, 2, 8]);\n\
   *\n\
   *     expect([4, 2]).to.have.members([2, 4]);\n\
   *     expect([5, 2]).to.not.have.members([5, 2, 1]);\n\
   *\n\
   * @name members\n\
   * @param {Array} set\n\
   * @param {String} message _optional_\n\
   * @api public\n\
   */\n\
\n\
  Assertion.addMethod('members', function (subset, msg) {\n\
    if (msg) flag(this, 'message', msg);\n\
    var obj = flag(this, 'object');\n\
\n\
    new Assertion(obj).to.be.an('array');\n\
    new Assertion(subset).to.be.an('array');\n\
\n\
    if (flag(this, 'contains')) {\n\
      return this.assert(\n\
          isSubsetOf(subset, obj)\n\
        , 'expected #{this} to be a superset of #{act}'\n\
        , 'expected #{this} to not be a superset of #{act}'\n\
        , obj\n\
        , subset\n\
      );\n\
    }\n\
\n\
    this.assert(\n\
        isSubsetOf(obj, subset) && isSubsetOf(subset, obj)\n\
        , 'expected #{this} to have the same members as #{act}'\n\
        , 'expected #{this} to not have the same members as #{act}'\n\
        , obj\n\
        , subset\n\
    );\n\
  });\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/core/assertions.js"
));
require.register("chaijs-chai/lib/chai/interface/assert.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
\n\
module.exports = function (chai, util) {\n\
\n\
  /*!\n\
   * Chai dependencies.\n\
   */\n\
\n\
  var Assertion = chai.Assertion\n\
    , flag = util.flag;\n\
\n\
  /*!\n\
   * Module export.\n\
   */\n\
\n\
  /**\n\
   * ### assert(expression, message)\n\
   *\n\
   * Write your own test expressions.\n\
   *\n\
   *     assert('foo' !== 'bar', 'foo is not bar');\n\
   *     assert(Array.isArray([]), 'empty arrays are arrays');\n\
   *\n\
   * @param {Mixed} expression to test for truthiness\n\
   * @param {String} message to display on error\n\
   * @name assert\n\
   * @api public\n\
   */\n\
\n\
  var assert = chai.assert = function (express, errmsg) {\n\
    var test = new Assertion(null);\n\
    test.assert(\n\
        express\n\
      , errmsg\n\
      , '[ negation message unavailable ]'\n\
    );\n\
  };\n\
\n\
  /**\n\
   * ### .fail(actual, expected, [message], [operator])\n\
   *\n\
   * Throw a failure. Node.js `assert` module-compatible.\n\
   *\n\
   * @name fail\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @param {String} operator\n\
   * @api public\n\
   */\n\
\n\
  assert.fail = function (actual, expected, message, operator) {\n\
    throw new chai.AssertionError({\n\
        actual: actual\n\
      , expected: expected\n\
      , message: message\n\
      , operator: operator\n\
      , stackStartFunction: assert.fail\n\
    });\n\
  };\n\
\n\
  /**\n\
   * ### .ok(object, [message])\n\
   *\n\
   * Asserts that `object` is truthy.\n\
   *\n\
   *     assert.ok('everything', 'everything is ok');\n\
   *     assert.ok(false, 'this will fail');\n\
   *\n\
   * @name ok\n\
   * @param {Mixed} object to test\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.ok = function (val, msg) {\n\
    new Assertion(val, msg).is.ok;\n\
  };\n\
\n\
  /**\n\
   * ### .notOk(object, [message])\n\
   *\n\
   * Asserts that `object` is falsy.\n\
   *\n\
   *     assert.notOk('everything', 'this will fail');\n\
   *     assert.notOk(false, 'this will pass');\n\
   *\n\
   * @name notOk\n\
   * @param {Mixed} object to test\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notOk = function (val, msg) {\n\
    new Assertion(val, msg).is.not.ok;\n\
  };\n\
\n\
  /**\n\
   * ### .equal(actual, expected, [message])\n\
   *\n\
   * Asserts non-strict equality (`==`) of `actual` and `expected`.\n\
   *\n\
   *     assert.equal(3, '3', '== coerces values to strings');\n\
   *\n\
   * @name equal\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.equal = function (act, exp, msg) {\n\
    var test = new Assertion(act, msg);\n\
\n\
    test.assert(\n\
        exp == flag(test, 'object')\n\
      , 'expected #{this} to equal #{exp}'\n\
      , 'expected #{this} to not equal #{act}'\n\
      , exp\n\
      , act\n\
    );\n\
  };\n\
\n\
  /**\n\
   * ### .notEqual(actual, expected, [message])\n\
   *\n\
   * Asserts non-strict inequality (`!=`) of `actual` and `expected`.\n\
   *\n\
   *     assert.notEqual(3, 4, 'these numbers are not equal');\n\
   *\n\
   * @name notEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notEqual = function (act, exp, msg) {\n\
    var test = new Assertion(act, msg);\n\
\n\
    test.assert(\n\
        exp != flag(test, 'object')\n\
      , 'expected #{this} to not equal #{exp}'\n\
      , 'expected #{this} to equal #{act}'\n\
      , exp\n\
      , act\n\
    );\n\
  };\n\
\n\
  /**\n\
   * ### .strictEqual(actual, expected, [message])\n\
   *\n\
   * Asserts strict equality (`===`) of `actual` and `expected`.\n\
   *\n\
   *     assert.strictEqual(true, true, 'these booleans are strictly equal');\n\
   *\n\
   * @name strictEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.strictEqual = function (act, exp, msg) {\n\
    new Assertion(act, msg).to.equal(exp);\n\
  };\n\
\n\
  /**\n\
   * ### .notStrictEqual(actual, expected, [message])\n\
   *\n\
   * Asserts strict inequality (`!==`) of `actual` and `expected`.\n\
   *\n\
   *     assert.notStrictEqual(3, '3', 'no coercion for strict equality');\n\
   *\n\
   * @name notStrictEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notStrictEqual = function (act, exp, msg) {\n\
    new Assertion(act, msg).to.not.equal(exp);\n\
  };\n\
\n\
  /**\n\
   * ### .deepEqual(actual, expected, [message])\n\
   *\n\
   * Asserts that `actual` is deeply equal to `expected`.\n\
   *\n\
   *     assert.deepEqual({ tea: 'green' }, { tea: 'green' });\n\
   *\n\
   * @name deepEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.deepEqual = function (act, exp, msg) {\n\
    new Assertion(act, msg).to.eql(exp);\n\
  };\n\
\n\
  /**\n\
   * ### .notDeepEqual(actual, expected, [message])\n\
   *\n\
   * Assert that `actual` is not deeply equal to `expected`.\n\
   *\n\
   *     assert.notDeepEqual({ tea: 'green' }, { tea: 'jasmine' });\n\
   *\n\
   * @name notDeepEqual\n\
   * @param {Mixed} actual\n\
   * @param {Mixed} expected\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notDeepEqual = function (act, exp, msg) {\n\
    new Assertion(act, msg).to.not.eql(exp);\n\
  };\n\
\n\
  /**\n\
   * ### .isTrue(value, [message])\n\
   *\n\
   * Asserts that `value` is true.\n\
   *\n\
   *     var teaServed = true;\n\
   *     assert.isTrue(teaServed, 'the tea has been served');\n\
   *\n\
   * @name isTrue\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isTrue = function (val, msg) {\n\
    new Assertion(val, msg).is['true'];\n\
  };\n\
\n\
  /**\n\
   * ### .isFalse(value, [message])\n\
   *\n\
   * Asserts that `value` is false.\n\
   *\n\
   *     var teaServed = false;\n\
   *     assert.isFalse(teaServed, 'no tea yet? hmm...');\n\
   *\n\
   * @name isFalse\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isFalse = function (val, msg) {\n\
    new Assertion(val, msg).is['false'];\n\
  };\n\
\n\
  /**\n\
   * ### .isNull(value, [message])\n\
   *\n\
   * Asserts that `value` is null.\n\
   *\n\
   *     assert.isNull(err, 'there was no error');\n\
   *\n\
   * @name isNull\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNull = function (val, msg) {\n\
    new Assertion(val, msg).to.equal(null);\n\
  };\n\
\n\
  /**\n\
   * ### .isNotNull(value, [message])\n\
   *\n\
   * Asserts that `value` is not null.\n\
   *\n\
   *     var tea = 'tasty chai';\n\
   *     assert.isNotNull(tea, 'great, time for tea!');\n\
   *\n\
   * @name isNotNull\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotNull = function (val, msg) {\n\
    new Assertion(val, msg).to.not.equal(null);\n\
  };\n\
\n\
  /**\n\
   * ### .isUndefined(value, [message])\n\
   *\n\
   * Asserts that `value` is `undefined`.\n\
   *\n\
   *     var tea;\n\
   *     assert.isUndefined(tea, 'no tea defined');\n\
   *\n\
   * @name isUndefined\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isUndefined = function (val, msg) {\n\
    new Assertion(val, msg).to.equal(undefined);\n\
  };\n\
\n\
  /**\n\
   * ### .isDefined(value, [message])\n\
   *\n\
   * Asserts that `value` is not `undefined`.\n\
   *\n\
   *     var tea = 'cup of chai';\n\
   *     assert.isDefined(tea, 'tea has been defined');\n\
   *\n\
   * @name isDefined\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isDefined = function (val, msg) {\n\
    new Assertion(val, msg).to.not.equal(undefined);\n\
  };\n\
\n\
  /**\n\
   * ### .isFunction(value, [message])\n\
   *\n\
   * Asserts that `value` is a function.\n\
   *\n\
   *     function serveTea() { return 'cup of tea'; };\n\
   *     assert.isFunction(serveTea, 'great, we can have tea now');\n\
   *\n\
   * @name isFunction\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isFunction = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('function');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotFunction(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ a function.\n\
   *\n\
   *     var serveTea = [ 'heat', 'pour', 'sip' ];\n\
   *     assert.isNotFunction(serveTea, 'great, we have listed the steps');\n\
   *\n\
   * @name isNotFunction\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotFunction = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('function');\n\
  };\n\
\n\
  /**\n\
   * ### .isObject(value, [message])\n\
   *\n\
   * Asserts that `value` is an object (as revealed by\n\
   * `Object.prototype.toString`).\n\
   *\n\
   *     var selection = { name: 'Chai', serve: 'with spices' };\n\
   *     assert.isObject(selection, 'tea selection is an object');\n\
   *\n\
   * @name isObject\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isObject = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('object');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotObject(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ an object.\n\
   *\n\
   *     var selection = 'chai'\n\
   *     assert.isObject(selection, 'tea selection is not an object');\n\
   *     assert.isObject(null, 'null is not an object');\n\
   *\n\
   * @name isNotObject\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotObject = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('object');\n\
  };\n\
\n\
  /**\n\
   * ### .isArray(value, [message])\n\
   *\n\
   * Asserts that `value` is an array.\n\
   *\n\
   *     var menu = [ 'green', 'chai', 'oolong' ];\n\
   *     assert.isArray(menu, 'what kind of tea do we want?');\n\
   *\n\
   * @name isArray\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isArray = function (val, msg) {\n\
    new Assertion(val, msg).to.be.an('array');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotArray(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ an array.\n\
   *\n\
   *     var menu = 'green|chai|oolong';\n\
   *     assert.isNotArray(menu, 'what kind of tea do we want?');\n\
   *\n\
   * @name isNotArray\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotArray = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.an('array');\n\
  };\n\
\n\
  /**\n\
   * ### .isString(value, [message])\n\
   *\n\
   * Asserts that `value` is a string.\n\
   *\n\
   *     var teaOrder = 'chai';\n\
   *     assert.isString(teaOrder, 'order placed');\n\
   *\n\
   * @name isString\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isString = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('string');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotString(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ a string.\n\
   *\n\
   *     var teaOrder = 4;\n\
   *     assert.isNotString(teaOrder, 'order placed');\n\
   *\n\
   * @name isNotString\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotString = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('string');\n\
  };\n\
\n\
  /**\n\
   * ### .isNumber(value, [message])\n\
   *\n\
   * Asserts that `value` is a number.\n\
   *\n\
   *     var cups = 2;\n\
   *     assert.isNumber(cups, 'how many cups');\n\
   *\n\
   * @name isNumber\n\
   * @param {Number} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNumber = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('number');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotNumber(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ a number.\n\
   *\n\
   *     var cups = '2 cups please';\n\
   *     assert.isNotNumber(cups, 'how many cups');\n\
   *\n\
   * @name isNotNumber\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotNumber = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('number');\n\
  };\n\
\n\
  /**\n\
   * ### .isBoolean(value, [message])\n\
   *\n\
   * Asserts that `value` is a boolean.\n\
   *\n\
   *     var teaReady = true\n\
   *       , teaServed = false;\n\
   *\n\
   *     assert.isBoolean(teaReady, 'is the tea ready');\n\
   *     assert.isBoolean(teaServed, 'has tea been served');\n\
   *\n\
   * @name isBoolean\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isBoolean = function (val, msg) {\n\
    new Assertion(val, msg).to.be.a('boolean');\n\
  };\n\
\n\
  /**\n\
   * ### .isNotBoolean(value, [message])\n\
   *\n\
   * Asserts that `value` is _not_ a boolean.\n\
   *\n\
   *     var teaReady = 'yep'\n\
   *       , teaServed = 'nope';\n\
   *\n\
   *     assert.isNotBoolean(teaReady, 'is the tea ready');\n\
   *     assert.isNotBoolean(teaServed, 'has tea been served');\n\
   *\n\
   * @name isNotBoolean\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.isNotBoolean = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.a('boolean');\n\
  };\n\
\n\
  /**\n\
   * ### .typeOf(value, name, [message])\n\
   *\n\
   * Asserts that `value`'s type is `name`, as determined by\n\
   * `Object.prototype.toString`.\n\
   *\n\
   *     assert.typeOf({ tea: 'chai' }, 'object', 'we have an object');\n\
   *     assert.typeOf(['chai', 'jasmine'], 'array', 'we have an array');\n\
   *     assert.typeOf('tea', 'string', 'we have a string');\n\
   *     assert.typeOf(/tea/, 'regexp', 'we have a regular expression');\n\
   *     assert.typeOf(null, 'null', 'we have a null');\n\
   *     assert.typeOf(undefined, 'undefined', 'we have an undefined');\n\
   *\n\
   * @name typeOf\n\
   * @param {Mixed} value\n\
   * @param {String} name\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.typeOf = function (val, type, msg) {\n\
    new Assertion(val, msg).to.be.a(type);\n\
  };\n\
\n\
  /**\n\
   * ### .notTypeOf(value, name, [message])\n\
   *\n\
   * Asserts that `value`'s type is _not_ `name`, as determined by\n\
   * `Object.prototype.toString`.\n\
   *\n\
   *     assert.notTypeOf('tea', 'number', 'strings are not numbers');\n\
   *\n\
   * @name notTypeOf\n\
   * @param {Mixed} value\n\
   * @param {String} typeof name\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notTypeOf = function (val, type, msg) {\n\
    new Assertion(val, msg).to.not.be.a(type);\n\
  };\n\
\n\
  /**\n\
   * ### .instanceOf(object, constructor, [message])\n\
   *\n\
   * Asserts that `value` is an instance of `constructor`.\n\
   *\n\
   *     var Tea = function (name) { this.name = name; }\n\
   *       , chai = new Tea('chai');\n\
   *\n\
   *     assert.instanceOf(chai, Tea, 'chai is an instance of tea');\n\
   *\n\
   * @name instanceOf\n\
   * @param {Object} object\n\
   * @param {Constructor} constructor\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.instanceOf = function (val, type, msg) {\n\
    new Assertion(val, msg).to.be.instanceOf(type);\n\
  };\n\
\n\
  /**\n\
   * ### .notInstanceOf(object, constructor, [message])\n\
   *\n\
   * Asserts `value` is not an instance of `constructor`.\n\
   *\n\
   *     var Tea = function (name) { this.name = name; }\n\
   *       , chai = new String('chai');\n\
   *\n\
   *     assert.notInstanceOf(chai, Tea, 'chai is not an instance of tea');\n\
   *\n\
   * @name notInstanceOf\n\
   * @param {Object} object\n\
   * @param {Constructor} constructor\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notInstanceOf = function (val, type, msg) {\n\
    new Assertion(val, msg).to.not.be.instanceOf(type);\n\
  };\n\
\n\
  /**\n\
   * ### .include(haystack, needle, [message])\n\
   *\n\
   * Asserts that `haystack` includes `needle`. Works\n\
   * for strings and arrays.\n\
   *\n\
   *     assert.include('foobar', 'bar', 'foobar contains string \"bar\"');\n\
   *     assert.include([ 1, 2, 3 ], 3, 'array contains value');\n\
   *\n\
   * @name include\n\
   * @param {Array|String} haystack\n\
   * @param {Mixed} needle\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.include = function (exp, inc, msg) {\n\
    var obj = new Assertion(exp, msg);\n\
\n\
    if (Array.isArray(exp)) {\n\
      obj.to.include(inc);\n\
    } else if ('string' === typeof exp) {\n\
      obj.to.contain.string(inc);\n\
    } else {\n\
      throw new chai.AssertionError(\n\
          'expected an array or string'\n\
        , null\n\
        , assert.include\n\
      );\n\
    }\n\
  };\n\
\n\
  /**\n\
   * ### .notInclude(haystack, needle, [message])\n\
   *\n\
   * Asserts that `haystack` does not include `needle`. Works\n\
   * for strings and arrays.\n\
   *i\n\
   *     assert.notInclude('foobar', 'baz', 'string not include substring');\n\
   *     assert.notInclude([ 1, 2, 3 ], 4, 'array not include contain value');\n\
   *\n\
   * @name notInclude\n\
   * @param {Array|String} haystack\n\
   * @param {Mixed} needle\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notInclude = function (exp, inc, msg) {\n\
    var obj = new Assertion(exp, msg);\n\
\n\
    if (Array.isArray(exp)) {\n\
      obj.to.not.include(inc);\n\
    } else if ('string' === typeof exp) {\n\
      obj.to.not.contain.string(inc);\n\
    } else {\n\
      throw new chai.AssertionError(\n\
          'expected an array or string'\n\
        , null\n\
        , assert.notInclude\n\
      );\n\
    }\n\
  };\n\
\n\
  /**\n\
   * ### .match(value, regexp, [message])\n\
   *\n\
   * Asserts that `value` matches the regular expression `regexp`.\n\
   *\n\
   *     assert.match('foobar', /^foo/, 'regexp matches');\n\
   *\n\
   * @name match\n\
   * @param {Mixed} value\n\
   * @param {RegExp} regexp\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.match = function (exp, re, msg) {\n\
    new Assertion(exp, msg).to.match(re);\n\
  };\n\
\n\
  /**\n\
   * ### .notMatch(value, regexp, [message])\n\
   *\n\
   * Asserts that `value` does not match the regular expression `regexp`.\n\
   *\n\
   *     assert.notMatch('foobar', /^foo/, 'regexp does not match');\n\
   *\n\
   * @name notMatch\n\
   * @param {Mixed} value\n\
   * @param {RegExp} regexp\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notMatch = function (exp, re, msg) {\n\
    new Assertion(exp, msg).to.not.match(re);\n\
  };\n\
\n\
  /**\n\
   * ### .property(object, property, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property`.\n\
   *\n\
   *     assert.property({ tea: { green: 'matcha' }}, 'tea');\n\
   *\n\
   * @name property\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.property = function (obj, prop, msg) {\n\
    new Assertion(obj, msg).to.have.property(prop);\n\
  };\n\
\n\
  /**\n\
   * ### .notProperty(object, property, [message])\n\
   *\n\
   * Asserts that `object` does _not_ have a property named by `property`.\n\
   *\n\
   *     assert.notProperty({ tea: { green: 'matcha' }}, 'coffee');\n\
   *\n\
   * @name notProperty\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notProperty = function (obj, prop, msg) {\n\
    new Assertion(obj, msg).to.not.have.property(prop);\n\
  };\n\
\n\
  /**\n\
   * ### .deepProperty(object, property, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property`, which can be a\n\
   * string using dot- and bracket-notation for deep reference.\n\
   *\n\
   *     assert.deepProperty({ tea: { green: 'matcha' }}, 'tea.green');\n\
   *\n\
   * @name deepProperty\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.deepProperty = function (obj, prop, msg) {\n\
    new Assertion(obj, msg).to.have.deep.property(prop);\n\
  };\n\
\n\
  /**\n\
   * ### .notDeepProperty(object, property, [message])\n\
   *\n\
   * Asserts that `object` does _not_ have a property named by `property`, which\n\
   * can be a string using dot- and bracket-notation for deep reference.\n\
   *\n\
   *     assert.notDeepProperty({ tea: { green: 'matcha' }}, 'tea.oolong');\n\
   *\n\
   * @name notDeepProperty\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.notDeepProperty = function (obj, prop, msg) {\n\
    new Assertion(obj, msg).to.not.have.deep.property(prop);\n\
  };\n\
\n\
  /**\n\
   * ### .propertyVal(object, property, value, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property` with value given\n\
   * by `value`.\n\
   *\n\
   *     assert.propertyVal({ tea: 'is good' }, 'tea', 'is good');\n\
   *\n\
   * @name propertyVal\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.propertyVal = function (obj, prop, val, msg) {\n\
    new Assertion(obj, msg).to.have.property(prop, val);\n\
  };\n\
\n\
  /**\n\
   * ### .propertyNotVal(object, property, value, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property`, but with a value\n\
   * different from that given by `value`.\n\
   *\n\
   *     assert.propertyNotVal({ tea: 'is good' }, 'tea', 'is bad');\n\
   *\n\
   * @name propertyNotVal\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.propertyNotVal = function (obj, prop, val, msg) {\n\
    new Assertion(obj, msg).to.not.have.property(prop, val);\n\
  };\n\
\n\
  /**\n\
   * ### .deepPropertyVal(object, property, value, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property` with value given\n\
   * by `value`. `property` can use dot- and bracket-notation for deep\n\
   * reference.\n\
   *\n\
   *     assert.deepPropertyVal({ tea: { green: 'matcha' }}, 'tea.green', 'matcha');\n\
   *\n\
   * @name deepPropertyVal\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.deepPropertyVal = function (obj, prop, val, msg) {\n\
    new Assertion(obj, msg).to.have.deep.property(prop, val);\n\
  };\n\
\n\
  /**\n\
   * ### .deepPropertyNotVal(object, property, value, [message])\n\
   *\n\
   * Asserts that `object` has a property named by `property`, but with a value\n\
   * different from that given by `value`. `property` can use dot- and\n\
   * bracket-notation for deep reference.\n\
   *\n\
   *     assert.deepPropertyNotVal({ tea: { green: 'matcha' }}, 'tea.green', 'konacha');\n\
   *\n\
   * @name deepPropertyNotVal\n\
   * @param {Object} object\n\
   * @param {String} property\n\
   * @param {Mixed} value\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.deepPropertyNotVal = function (obj, prop, val, msg) {\n\
    new Assertion(obj, msg).to.not.have.deep.property(prop, val);\n\
  };\n\
\n\
  /**\n\
   * ### .lengthOf(object, length, [message])\n\
   *\n\
   * Asserts that `object` has a `length` property with the expected value.\n\
   *\n\
   *     assert.lengthOf([1,2,3], 3, 'array has length of 3');\n\
   *     assert.lengthOf('foobar', 5, 'string has length of 6');\n\
   *\n\
   * @name lengthOf\n\
   * @param {Mixed} object\n\
   * @param {Number} length\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.lengthOf = function (exp, len, msg) {\n\
    new Assertion(exp, msg).to.have.length(len);\n\
  };\n\
\n\
  /**\n\
   * ### .throws(function, [constructor/string/regexp], [string/regexp], [message])\n\
   *\n\
   * Asserts that `function` will throw an error that is an instance of\n\
   * `constructor`, or alternately that it will throw an error with message\n\
   * matching `regexp`.\n\
   *\n\
   *     assert.throw(fn, 'function throws a reference error');\n\
   *     assert.throw(fn, /function throws a reference error/);\n\
   *     assert.throw(fn, ReferenceError);\n\
   *     assert.throw(fn, ReferenceError, 'function throws a reference error');\n\
   *     assert.throw(fn, ReferenceError, /function throws a reference error/);\n\
   *\n\
   * @name throws\n\
   * @alias throw\n\
   * @alias Throw\n\
   * @param {Function} function\n\
   * @param {ErrorConstructor} constructor\n\
   * @param {RegExp} regexp\n\
   * @param {String} message\n\
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types\n\
   * @api public\n\
   */\n\
\n\
  assert.Throw = function (fn, errt, errs, msg) {\n\
    if ('string' === typeof errt || errt instanceof RegExp) {\n\
      errs = errt;\n\
      errt = null;\n\
    }\n\
\n\
    new Assertion(fn, msg).to.Throw(errt, errs);\n\
  };\n\
\n\
  /**\n\
   * ### .doesNotThrow(function, [constructor/regexp], [message])\n\
   *\n\
   * Asserts that `function` will _not_ throw an error that is an instance of\n\
   * `constructor`, or alternately that it will not throw an error with message\n\
   * matching `regexp`.\n\
   *\n\
   *     assert.doesNotThrow(fn, Error, 'function does not throw');\n\
   *\n\
   * @name doesNotThrow\n\
   * @param {Function} function\n\
   * @param {ErrorConstructor} constructor\n\
   * @param {RegExp} regexp\n\
   * @param {String} message\n\
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types\n\
   * @api public\n\
   */\n\
\n\
  assert.doesNotThrow = function (fn, type, msg) {\n\
    if ('string' === typeof type) {\n\
      msg = type;\n\
      type = null;\n\
    }\n\
\n\
    new Assertion(fn, msg).to.not.Throw(type);\n\
  };\n\
\n\
  /**\n\
   * ### .operator(val1, operator, val2, [message])\n\
   *\n\
   * Compares two values using `operator`.\n\
   *\n\
   *     assert.operator(1, '<', 2, 'everything is ok');\n\
   *     assert.operator(1, '>', 2, 'this will fail');\n\
   *\n\
   * @name operator\n\
   * @param {Mixed} val1\n\
   * @param {String} operator\n\
   * @param {Mixed} val2\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.operator = function (val, operator, val2, msg) {\n\
    if (!~['==', '===', '>', '>=', '<', '<=', '!=', '!=='].indexOf(operator)) {\n\
      throw new Error('Invalid operator \"' + operator + '\"');\n\
    }\n\
    var test = new Assertion(eval(val + operator + val2), msg);\n\
    test.assert(\n\
        true === flag(test, 'object')\n\
      , 'expected ' + util.inspect(val) + ' to be ' + operator + ' ' + util.inspect(val2)\n\
      , 'expected ' + util.inspect(val) + ' to not be ' + operator + ' ' + util.inspect(val2) );\n\
  };\n\
\n\
  /**\n\
   * ### .closeTo(actual, expected, delta, [message])\n\
   *\n\
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.\n\
   *\n\
   *     assert.closeTo(1.5, 1, 0.5, 'numbers are close');\n\
   *\n\
   * @name closeTo\n\
   * @param {Number} actual\n\
   * @param {Number} expected\n\
   * @param {Number} delta\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.closeTo = function (act, exp, delta, msg) {\n\
    new Assertion(act, msg).to.be.closeTo(exp, delta);\n\
  };\n\
\n\
  /**\n\
   * ### .sameMembers(set1, set2, [message])\n\
   *\n\
   * Asserts that `set1` and `set2` have the same members.\n\
   * Order is not taken into account.\n\
   *\n\
   *     assert.sameMembers([ 1, 2, 3 ], [ 2, 1, 3 ], 'same members');\n\
   *\n\
   * @name sameMembers\n\
   * @param {Array} superset\n\
   * @param {Array} subset\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.sameMembers = function (set1, set2, msg) {\n\
    new Assertion(set1, msg).to.have.same.members(set2);\n\
  }\n\
\n\
  /**\n\
   * ### .includeMembers(superset, subset, [message])\n\
   *\n\
   * Asserts that `subset` is included in `superset`.\n\
   * Order is not taken into account.\n\
   *\n\
   *     assert.includeMembers([ 1, 2, 3 ], [ 2, 1 ], 'include members');\n\
   *\n\
   * @name includeMembers\n\
   * @param {Array} superset\n\
   * @param {Array} subset\n\
   * @param {String} message\n\
   * @api public\n\
   */\n\
\n\
  assert.includeMembers = function (superset, subset, msg) {\n\
    new Assertion(superset, msg).to.include.members(subset);\n\
  }\n\
\n\
  /*!\n\
   * Undocumented / untested\n\
   */\n\
\n\
  assert.ifError = function (val, msg) {\n\
    new Assertion(val, msg).to.not.be.ok;\n\
  };\n\
\n\
  /*!\n\
   * Aliases.\n\
   */\n\
\n\
  (function alias(name, as){\n\
    assert[as] = assert[name];\n\
    return alias;\n\
  })\n\
  ('Throw', 'throw')\n\
  ('Throw', 'throws');\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/interface/assert.js"
));
require.register("chaijs-chai/lib/chai/interface/expect.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
module.exports = function (chai, util) {\n\
  chai.expect = function (val, message) {\n\
    return new chai.Assertion(val, message);\n\
  };\n\
};\n\
\n\
//@ sourceURL=chaijs-chai/lib/chai/interface/expect.js"
));
require.register("chaijs-chai/lib/chai/interface/should.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
module.exports = function (chai, util) {\n\
  var Assertion = chai.Assertion;\n\
\n\
  function loadShould () {\n\
    // modify Object.prototype to have `should`\n\
    Object.defineProperty(Object.prototype, 'should',\n\
      {\n\
        set: function (value) {\n\
          // See https://github.com/chaijs/chai/issues/86: this makes\n\
          // `whatever.should = someValue` actually set `someValue`, which is\n\
          // especially useful for `global.should = require('chai').should()`.\n\
          //\n\
          // Note that we have to use [[DefineProperty]] instead of [[Put]]\n\
          // since otherwise we would trigger this very setter!\n\
          Object.defineProperty(this, 'should', {\n\
            value: value,\n\
            enumerable: true,\n\
            configurable: true,\n\
            writable: true\n\
          });\n\
        }\n\
      , get: function(){\n\
          if (this instanceof String || this instanceof Number) {\n\
            return new Assertion(this.constructor(this));\n\
          } else if (this instanceof Boolean) {\n\
            return new Assertion(this == true);\n\
          }\n\
          return new Assertion(this);\n\
        }\n\
      , configurable: true\n\
    });\n\
\n\
    var should = {};\n\
\n\
    should.equal = function (val1, val2, msg) {\n\
      new Assertion(val1, msg).to.equal(val2);\n\
    };\n\
\n\
    should.Throw = function (fn, errt, errs, msg) {\n\
      new Assertion(fn, msg).to.Throw(errt, errs);\n\
    };\n\
\n\
    should.exist = function (val, msg) {\n\
      new Assertion(val, msg).to.exist;\n\
    }\n\
\n\
    // negation\n\
    should.not = {}\n\
\n\
    should.not.equal = function (val1, val2, msg) {\n\
      new Assertion(val1, msg).to.not.equal(val2);\n\
    };\n\
\n\
    should.not.Throw = function (fn, errt, errs, msg) {\n\
      new Assertion(fn, msg).to.not.Throw(errt, errs);\n\
    };\n\
\n\
    should.not.exist = function (val, msg) {\n\
      new Assertion(val, msg).to.not.exist;\n\
    }\n\
\n\
    should['throw'] = should['Throw'];\n\
    should.not['throw'] = should.not['Throw'];\n\
\n\
    return should;\n\
  };\n\
\n\
  chai.should = loadShould;\n\
  chai.Should = loadShould;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/interface/should.js"
));
require.register("chaijs-chai/lib/chai/utils/addChainableMethod.js", Function("exports, require, module",
"/*!\n\
 * Chai - addChainingMethod utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Module dependencies\n\
 */\n\
\n\
var transferFlags = require('./transferFlags');\n\
\n\
/*!\n\
 * Module variables\n\
 */\n\
\n\
// Check whether `__proto__` is supported\n\
var hasProtoSupport = '__proto__' in Object;\n\
\n\
// Without `__proto__` support, this module will need to add properties to a function.\n\
// However, some Function.prototype methods cannot be overwritten,\n\
// and there seems no easy cross-platform way to detect them (@see chaijs/chai/issues/69).\n\
var excludeNames = /^(?:length|name|arguments|caller)$/;\n\
\n\
// Cache `Function` properties\n\
var call  = Function.prototype.call,\n\
    apply = Function.prototype.apply;\n\
\n\
/**\n\
 * ### addChainableMethod (ctx, name, method, chainingBehavior)\n\
 *\n\
 * Adds a method to an object, such that the method can also be chained.\n\
 *\n\
 *     utils.addChainableMethod(chai.Assertion.prototype, 'foo', function (str) {\n\
 *       var obj = utils.flag(this, 'object');\n\
 *       new chai.Assertion(obj).to.be.equal(str);\n\
 *     });\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.addChainableMethod('foo', fn, chainingBehavior);\n\
 *\n\
 * The result can then be used as both a method assertion, executing both `method` and\n\
 * `chainingBehavior`, or as a language chain, which only executes `chainingBehavior`.\n\
 *\n\
 *     expect(fooStr).to.be.foo('bar');\n\
 *     expect(fooStr).to.be.foo.equal('foo');\n\
 *\n\
 * @param {Object} ctx object to which the method is added\n\
 * @param {String} name of method to add\n\
 * @param {Function} method function to be used for `name`, when called\n\
 * @param {Function} chainingBehavior function to be called every time the property is accessed\n\
 * @name addChainableMethod\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, method, chainingBehavior) {\n\
  if (typeof chainingBehavior !== 'function')\n\
    chainingBehavior = function () { };\n\
\n\
  Object.defineProperty(ctx, name,\n\
    { get: function () {\n\
        chainingBehavior.call(this);\n\
\n\
        var assert = function () {\n\
          var result = method.apply(this, arguments);\n\
          return result === undefined ? this : result;\n\
        };\n\
\n\
        // Use `__proto__` if available\n\
        if (hasProtoSupport) {\n\
          // Inherit all properties from the object by replacing the `Function` prototype\n\
          var prototype = assert.__proto__ = Object.create(this);\n\
          // Restore the `call` and `apply` methods from `Function`\n\
          prototype.call = call;\n\
          prototype.apply = apply;\n\
        }\n\
        // Otherwise, redefine all properties (slow!)\n\
        else {\n\
          var asserterNames = Object.getOwnPropertyNames(ctx);\n\
          asserterNames.forEach(function (asserterName) {\n\
            if (!excludeNames.test(asserterName)) {\n\
              var pd = Object.getOwnPropertyDescriptor(ctx, asserterName);\n\
              Object.defineProperty(assert, asserterName, pd);\n\
            }\n\
          });\n\
        }\n\
\n\
        transferFlags(this, assert);\n\
        return assert;\n\
      }\n\
    , configurable: true\n\
  });\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/addChainableMethod.js"
));
require.register("chaijs-chai/lib/chai/utils/addMethod.js", Function("exports, require, module",
"/*!\n\
 * Chai - addMethod utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### .addMethod (ctx, name, method)\n\
 *\n\
 * Adds a method to the prototype of an object.\n\
 *\n\
 *     utils.addMethod(chai.Assertion.prototype, 'foo', function (str) {\n\
 *       var obj = utils.flag(this, 'object');\n\
 *       new chai.Assertion(obj).to.be.equal(str);\n\
 *     });\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.addMethod('foo', fn);\n\
 *\n\
 * Then can be used as any other assertion.\n\
 *\n\
 *     expect(fooStr).to.be.foo('bar');\n\
 *\n\
 * @param {Object} ctx object to which the method is added\n\
 * @param {String} name of method to add\n\
 * @param {Function} method function to be used for name\n\
 * @name addMethod\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, method) {\n\
  ctx[name] = function () {\n\
    var result = method.apply(this, arguments);\n\
    return result === undefined ? this : result;\n\
  };\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/addMethod.js"
));
require.register("chaijs-chai/lib/chai/utils/addProperty.js", Function("exports, require, module",
"/*!\n\
 * Chai - addProperty utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### addProperty (ctx, name, getter)\n\
 *\n\
 * Adds a property to the prototype of an object.\n\
 *\n\
 *     utils.addProperty(chai.Assertion.prototype, 'foo', function () {\n\
 *       var obj = utils.flag(this, 'object');\n\
 *       new chai.Assertion(obj).to.be.instanceof(Foo);\n\
 *     });\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.addProperty('foo', fn);\n\
 *\n\
 * Then can be used as any other assertion.\n\
 *\n\
 *     expect(myFoo).to.be.foo;\n\
 *\n\
 * @param {Object} ctx object to which the property is added\n\
 * @param {String} name of property to add\n\
 * @param {Function} getter function to be used for name\n\
 * @name addProperty\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, getter) {\n\
  Object.defineProperty(ctx, name,\n\
    { get: function () {\n\
        var result = getter.call(this);\n\
        return result === undefined ? this : result;\n\
      }\n\
    , configurable: true\n\
  });\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/addProperty.js"
));
require.register("chaijs-chai/lib/chai/utils/flag.js", Function("exports, require, module",
"/*!\n\
 * Chai - flag utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### flag(object ,key, [value])\n\
 *\n\
 * Get or set a flag value on an object. If a\n\
 * value is provided it will be set, else it will\n\
 * return the currently set value or `undefined` if\n\
 * the value is not set.\n\
 *\n\
 *     utils.flag(this, 'foo', 'bar'); // setter\n\
 *     utils.flag(this, 'foo'); // getter, returns `bar`\n\
 *\n\
 * @param {Object} object (constructed Assertion\n\
 * @param {String} key\n\
 * @param {Mixed} value (optional)\n\
 * @name flag\n\
 * @api private\n\
 */\n\
\n\
module.exports = function (obj, key, value) {\n\
  var flags = obj.__flags || (obj.__flags = Object.create(null));\n\
  if (arguments.length === 3) {\n\
    flags[key] = value;\n\
  } else {\n\
    return flags[key];\n\
  }\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/flag.js"
));
require.register("chaijs-chai/lib/chai/utils/getActual.js", Function("exports, require, module",
"/*!\n\
 * Chai - getActual utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * # getActual(object, [actual])\n\
 *\n\
 * Returns the `actual` value for an Assertion\n\
 *\n\
 * @param {Object} object (constructed Assertion)\n\
 * @param {Arguments} chai.Assertion.prototype.assert arguments\n\
 */\n\
\n\
module.exports = function (obj, args) {\n\
  var actual = args[4];\n\
  return 'undefined' !== typeof actual ? actual : obj._obj;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/getActual.js"
));
require.register("chaijs-chai/lib/chai/utils/getEnumerableProperties.js", Function("exports, require, module",
"/*!\n\
 * Chai - getEnumerableProperties utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### .getEnumerableProperties(object)\n\
 *\n\
 * This allows the retrieval of enumerable property names of an object,\n\
 * inherited or not.\n\
 *\n\
 * @param {Object} object\n\
 * @returns {Array}\n\
 * @name getEnumerableProperties\n\
 * @api public\n\
 */\n\
\n\
module.exports = function getEnumerableProperties(object) {\n\
  var result = [];\n\
  for (var name in object) {\n\
    result.push(name);\n\
  }\n\
  return result;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/getEnumerableProperties.js"
));
require.register("chaijs-chai/lib/chai/utils/getMessage.js", Function("exports, require, module",
"/*!\n\
 * Chai - message composition utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Module dependancies\n\
 */\n\
\n\
var flag = require('./flag')\n\
  , getActual = require('./getActual')\n\
  , inspect = require('./inspect')\n\
  , objDisplay = require('./objDisplay');\n\
\n\
/**\n\
 * ### .getMessage(object, message, negateMessage)\n\
 *\n\
 * Construct the error message based on flags\n\
 * and template tags. Template tags will return\n\
 * a stringified inspection of the object referenced.\n\
 *\n\
 * Message template tags:\n\
 * - `#{this}` current asserted object\n\
 * - `#{act}` actual value\n\
 * - `#{exp}` expected value\n\
 *\n\
 * @param {Object} object (constructed Assertion)\n\
 * @param {Arguments} chai.Assertion.prototype.assert arguments\n\
 * @name getMessage\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (obj, args) {\n\
  var negate = flag(obj, 'negate')\n\
    , val = flag(obj, 'object')\n\
    , expected = args[3]\n\
    , actual = getActual(obj, args)\n\
    , msg = negate ? args[2] : args[1]\n\
    , flagMsg = flag(obj, 'message');\n\
\n\
  msg = msg || '';\n\
  msg = msg\n\
    .replace(/#{this}/g, objDisplay(val))\n\
    .replace(/#{act}/g, objDisplay(actual))\n\
    .replace(/#{exp}/g, objDisplay(expected));\n\
\n\
  return flagMsg ? flagMsg + ': ' + msg : msg;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/getMessage.js"
));
require.register("chaijs-chai/lib/chai/utils/getName.js", Function("exports, require, module",
"/*!\n\
 * Chai - getName utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * # getName(func)\n\
 *\n\
 * Gets the name of a function, in a cross-browser way.\n\
 *\n\
 * @param {Function} a function (usually a constructor)\n\
 */\n\
\n\
module.exports = function (func) {\n\
  if (func.name) return func.name;\n\
\n\
  var match = /^\\s?function ([^(]*)\\(/.exec(func);\n\
  return match && match[1] ? match[1] : \"\";\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/getName.js"
));
require.register("chaijs-chai/lib/chai/utils/getPathValue.js", Function("exports, require, module",
"/*!\n\
 * Chai - getPathValue utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * @see https://github.com/logicalparadox/filtr\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### .getPathValue(path, object)\n\
 *\n\
 * This allows the retrieval of values in an\n\
 * object given a string path.\n\
 *\n\
 *     var obj = {\n\
 *         prop1: {\n\
 *             arr: ['a', 'b', 'c']\n\
 *           , str: 'Hello'\n\
 *         }\n\
 *       , prop2: {\n\
 *             arr: [ { nested: 'Universe' } ]\n\
 *           , str: 'Hello again!'\n\
 *         }\n\
 *     }\n\
 *\n\
 * The following would be the results.\n\
 *\n\
 *     getPathValue('prop1.str', obj); // Hello\n\
 *     getPathValue('prop1.att[2]', obj); // b\n\
 *     getPathValue('prop2.arr[0].nested', obj); // Universe\n\
 *\n\
 * @param {String} path\n\
 * @param {Object} object\n\
 * @returns {Object} value or `undefined`\n\
 * @name getPathValue\n\
 * @api public\n\
 */\n\
\n\
var getPathValue = module.exports = function (path, obj) {\n\
  var parsed = parsePath(path);\n\
  return _getPathValue(parsed, obj);\n\
};\n\
\n\
/*!\n\
 * ## parsePath(path)\n\
 *\n\
 * Helper function used to parse string object\n\
 * paths. Use in conjunction with `_getPathValue`.\n\
 *\n\
 *      var parsed = parsePath('myobject.property.subprop');\n\
 *\n\
 * ### Paths:\n\
 *\n\
 * * Can be as near infinitely deep and nested\n\
 * * Arrays are also valid using the formal `myobject.document[3].property`.\n\
 *\n\
 * @param {String} path\n\
 * @returns {Object} parsed\n\
 * @api private\n\
 */\n\
\n\
function parsePath (path) {\n\
  var str = path.replace(/\\[/g, '.[')\n\
    , parts = str.match(/(\\\\\\.|[^.]+?)+/g);\n\
  return parts.map(function (value) {\n\
    var re = /\\[(\\d+)\\]$/\n\
      , mArr = re.exec(value)\n\
    if (mArr) return { i: parseFloat(mArr[1]) };\n\
    else return { p: value };\n\
  });\n\
};\n\
\n\
/*!\n\
 * ## _getPathValue(parsed, obj)\n\
 *\n\
 * Helper companion function for `.parsePath` that returns\n\
 * the value located at the parsed address.\n\
 *\n\
 *      var value = getPathValue(parsed, obj);\n\
 *\n\
 * @param {Object} parsed definition from `parsePath`.\n\
 * @param {Object} object to search against\n\
 * @returns {Object|Undefined} value\n\
 * @api private\n\
 */\n\
\n\
function _getPathValue (parsed, obj) {\n\
  var tmp = obj\n\
    , res;\n\
  for (var i = 0, l = parsed.length; i < l; i++) {\n\
    var part = parsed[i];\n\
    if (tmp) {\n\
      if ('undefined' !== typeof part.p)\n\
        tmp = tmp[part.p];\n\
      else if ('undefined' !== typeof part.i)\n\
        tmp = tmp[part.i];\n\
      if (i == (l - 1)) res = tmp;\n\
    } else {\n\
      res = undefined;\n\
    }\n\
  }\n\
  return res;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/getPathValue.js"
));
require.register("chaijs-chai/lib/chai/utils/getProperties.js", Function("exports, require, module",
"/*!\n\
 * Chai - getProperties utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### .getProperties(object)\n\
 *\n\
 * This allows the retrieval of property names of an object, enumerable or not,\n\
 * inherited or not.\n\
 *\n\
 * @param {Object} object\n\
 * @returns {Array}\n\
 * @name getProperties\n\
 * @api public\n\
 */\n\
\n\
module.exports = function getProperties(object) {\n\
  var result = Object.getOwnPropertyNames(subject);\n\
\n\
  function addProperty(property) {\n\
    if (result.indexOf(property) === -1) {\n\
      result.push(property);\n\
    }\n\
  }\n\
\n\
  var proto = Object.getPrototypeOf(subject);\n\
  while (proto !== null) {\n\
    Object.getOwnPropertyNames(proto).forEach(addProperty);\n\
    proto = Object.getPrototypeOf(proto);\n\
  }\n\
\n\
  return result;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/getProperties.js"
));
require.register("chaijs-chai/lib/chai/utils/index.js", Function("exports, require, module",
"/*!\n\
 * chai\n\
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Main exports\n\
 */\n\
\n\
var exports = module.exports = {};\n\
\n\
/*!\n\
 * test utility\n\
 */\n\
\n\
exports.test = require('./test');\n\
\n\
/*!\n\
 * type utility\n\
 */\n\
\n\
exports.type = require('./type');\n\
\n\
/*!\n\
 * message utility\n\
 */\n\
\n\
exports.getMessage = require('./getMessage');\n\
\n\
/*!\n\
 * actual utility\n\
 */\n\
\n\
exports.getActual = require('./getActual');\n\
\n\
/*!\n\
 * Inspect util\n\
 */\n\
\n\
exports.inspect = require('./inspect');\n\
\n\
/*!\n\
 * Object Display util\n\
 */\n\
\n\
exports.objDisplay = require('./objDisplay');\n\
\n\
/*!\n\
 * Flag utility\n\
 */\n\
\n\
exports.flag = require('./flag');\n\
\n\
/*!\n\
 * Flag transferring utility\n\
 */\n\
\n\
exports.transferFlags = require('./transferFlags');\n\
\n\
/*!\n\
 * Deep equal utility\n\
 */\n\
\n\
exports.eql = require('deep-eql');\n\
\n\
/*!\n\
 * Deep path value\n\
 */\n\
\n\
exports.getPathValue = require('./getPathValue');\n\
\n\
/*!\n\
 * Function name\n\
 */\n\
\n\
exports.getName = require('./getName');\n\
\n\
/*!\n\
 * add Property\n\
 */\n\
\n\
exports.addProperty = require('./addProperty');\n\
\n\
/*!\n\
 * add Method\n\
 */\n\
\n\
exports.addMethod = require('./addMethod');\n\
\n\
/*!\n\
 * overwrite Property\n\
 */\n\
\n\
exports.overwriteProperty = require('./overwriteProperty');\n\
\n\
/*!\n\
 * overwrite Method\n\
 */\n\
\n\
exports.overwriteMethod = require('./overwriteMethod');\n\
\n\
/*!\n\
 * Add a chainable method\n\
 */\n\
\n\
exports.addChainableMethod = require('./addChainableMethod');\n\
\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/index.js"
));
require.register("chaijs-chai/lib/chai/utils/inspect.js", Function("exports, require, module",
"// This is (almost) directly from Node.js utils\n\
// https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/util.js\n\
\n\
var getName = require('./getName');\n\
var getProperties = require('./getProperties');\n\
var getEnumerableProperties = require('./getEnumerableProperties');\n\
\n\
module.exports = inspect;\n\
\n\
/**\n\
 * Echos the value of a value. Trys to print the value out\n\
 * in the best way possible given the different types.\n\
 *\n\
 * @param {Object} obj The object to print out.\n\
 * @param {Boolean} showHidden Flag that shows hidden (not enumerable)\n\
 *    properties of objects.\n\
 * @param {Number} depth Depth in which to descend in object. Default is 2.\n\
 * @param {Boolean} colors Flag to turn on ANSI escape codes to color the\n\
 *    output. Default is false (no coloring).\n\
 */\n\
function inspect(obj, showHidden, depth, colors) {\n\
  var ctx = {\n\
    showHidden: showHidden,\n\
    seen: [],\n\
    stylize: function (str) { return str; }\n\
  };\n\
  return formatValue(ctx, obj, (typeof depth === 'undefined' ? 2 : depth));\n\
}\n\
\n\
// https://gist.github.com/1044128/\n\
var getOuterHTML = function(element) {\n\
  if ('outerHTML' in element) return element.outerHTML;\n\
  var ns = \"http://www.w3.org/1999/xhtml\";\n\
  var container = document.createElementNS(ns, '_');\n\
  var elemProto = (window.HTMLElement || window.Element).prototype;\n\
  var xmlSerializer = new XMLSerializer();\n\
  var html;\n\
  if (document.xmlVersion) {\n\
    return xmlSerializer.serializeToString(element);\n\
  } else {\n\
    container.appendChild(element.cloneNode(false));\n\
    html = container.innerHTML.replace('><', '>' + element.innerHTML + '<');\n\
    container.innerHTML = '';\n\
    return html;\n\
  }\n\
};\n\
\n\
// Returns true if object is a DOM element.\n\
var isDOMElement = function (object) {\n\
  if (typeof HTMLElement === 'object') {\n\
    return object instanceof HTMLElement;\n\
  } else {\n\
    return object &&\n\
      typeof object === 'object' &&\n\
      object.nodeType === 1 &&\n\
      typeof object.nodeName === 'string';\n\
  }\n\
};\n\
\n\
function formatValue(ctx, value, recurseTimes) {\n\
  // Provide a hook for user-specified inspect functions.\n\
  // Check that value is an object with an inspect function on it\n\
  if (value && typeof value.inspect === 'function' &&\n\
      // Filter out the util module, it's inspect function is special\n\
      value.inspect !== exports.inspect &&\n\
      // Also filter out any prototype objects using the circular check.\n\
      !(value.constructor && value.constructor.prototype === value)) {\n\
    var ret = value.inspect(recurseTimes);\n\
    if (typeof ret !== 'string') {\n\
      ret = formatValue(ctx, ret, recurseTimes);\n\
    }\n\
    return ret;\n\
  }\n\
\n\
  // Primitive types cannot have properties\n\
  var primitive = formatPrimitive(ctx, value);\n\
  if (primitive) {\n\
    return primitive;\n\
  }\n\
\n\
  // If it's DOM elem, get outer HTML.\n\
  if (isDOMElement(value)) {\n\
    return getOuterHTML(value);\n\
  }\n\
\n\
  // Look up the keys of the object.\n\
  var visibleKeys = getEnumerableProperties(value);\n\
  var keys = ctx.showHidden ? getProperties(value) : visibleKeys;\n\
\n\
  // Some type of object without properties can be shortcutted.\n\
  // In IE, errors have a single `stack` property, or if they are vanilla `Error`,\n\
  // a `stack` plus `description` property; ignore those for consistency.\n\
  if (keys.length === 0 || (isError(value) && (\n\
      (keys.length === 1 && keys[0] === 'stack') ||\n\
      (keys.length === 2 && keys[0] === 'description' && keys[1] === 'stack')\n\
     ))) {\n\
    if (typeof value === 'function') {\n\
      var name = getName(value);\n\
      var nameSuffix = name ? ': ' + name : '';\n\
      return ctx.stylize('[Function' + nameSuffix + ']', 'special');\n\
    }\n\
    if (isRegExp(value)) {\n\
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');\n\
    }\n\
    if (isDate(value)) {\n\
      return ctx.stylize(Date.prototype.toUTCString.call(value), 'date');\n\
    }\n\
    if (isError(value)) {\n\
      return formatError(value);\n\
    }\n\
  }\n\
\n\
  var base = '', array = false, braces = ['{', '}'];\n\
\n\
  // Make Array say that they are Array\n\
  if (isArray(value)) {\n\
    array = true;\n\
    braces = ['[', ']'];\n\
  }\n\
\n\
  // Make functions say that they are functions\n\
  if (typeof value === 'function') {\n\
    var name = getName(value);\n\
    var nameSuffix = name ? ': ' + name : '';\n\
    base = ' [Function' + nameSuffix + ']';\n\
  }\n\
\n\
  // Make RegExps say that they are RegExps\n\
  if (isRegExp(value)) {\n\
    base = ' ' + RegExp.prototype.toString.call(value);\n\
  }\n\
\n\
  // Make dates with properties first say the date\n\
  if (isDate(value)) {\n\
    base = ' ' + Date.prototype.toUTCString.call(value);\n\
  }\n\
\n\
  // Make error with message first say the error\n\
  if (isError(value)) {\n\
    return formatError(value);\n\
  }\n\
\n\
  if (keys.length === 0 && (!array || value.length == 0)) {\n\
    return braces[0] + base + braces[1];\n\
  }\n\
\n\
  if (recurseTimes < 0) {\n\
    if (isRegExp(value)) {\n\
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');\n\
    } else {\n\
      return ctx.stylize('[Object]', 'special');\n\
    }\n\
  }\n\
\n\
  ctx.seen.push(value);\n\
\n\
  var output;\n\
  if (array) {\n\
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);\n\
  } else {\n\
    output = keys.map(function(key) {\n\
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);\n\
    });\n\
  }\n\
\n\
  ctx.seen.pop();\n\
\n\
  return reduceToSingleString(output, base, braces);\n\
}\n\
\n\
\n\
function formatPrimitive(ctx, value) {\n\
  switch (typeof value) {\n\
    case 'undefined':\n\
      return ctx.stylize('undefined', 'undefined');\n\
\n\
    case 'string':\n\
      var simple = '\\'' + JSON.stringify(value).replace(/^\"|\"$/g, '')\n\
                                               .replace(/'/g, \"\\\\'\")\n\
                                               .replace(/\\\\\"/g, '\"') + '\\'';\n\
      return ctx.stylize(simple, 'string');\n\
\n\
    case 'number':\n\
      return ctx.stylize('' + value, 'number');\n\
\n\
    case 'boolean':\n\
      return ctx.stylize('' + value, 'boolean');\n\
  }\n\
  // For some reason typeof null is \"object\", so special case here.\n\
  if (value === null) {\n\
    return ctx.stylize('null', 'null');\n\
  }\n\
}\n\
\n\
\n\
function formatError(value) {\n\
  return '[' + Error.prototype.toString.call(value) + ']';\n\
}\n\
\n\
\n\
function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {\n\
  var output = [];\n\
  for (var i = 0, l = value.length; i < l; ++i) {\n\
    if (Object.prototype.hasOwnProperty.call(value, String(i))) {\n\
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,\n\
          String(i), true));\n\
    } else {\n\
      output.push('');\n\
    }\n\
  }\n\
  keys.forEach(function(key) {\n\
    if (!key.match(/^\\d+$/)) {\n\
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,\n\
          key, true));\n\
    }\n\
  });\n\
  return output;\n\
}\n\
\n\
\n\
function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {\n\
  var name, str;\n\
  if (value.__lookupGetter__) {\n\
    if (value.__lookupGetter__(key)) {\n\
      if (value.__lookupSetter__(key)) {\n\
        str = ctx.stylize('[Getter/Setter]', 'special');\n\
      } else {\n\
        str = ctx.stylize('[Getter]', 'special');\n\
      }\n\
    } else {\n\
      if (value.__lookupSetter__(key)) {\n\
        str = ctx.stylize('[Setter]', 'special');\n\
      }\n\
    }\n\
  }\n\
  if (visibleKeys.indexOf(key) < 0) {\n\
    name = '[' + key + ']';\n\
  }\n\
  if (!str) {\n\
    if (ctx.seen.indexOf(value[key]) < 0) {\n\
      if (recurseTimes === null) {\n\
        str = formatValue(ctx, value[key], null);\n\
      } else {\n\
        str = formatValue(ctx, value[key], recurseTimes - 1);\n\
      }\n\
      if (str.indexOf('\\n\
') > -1) {\n\
        if (array) {\n\
          str = str.split('\\n\
').map(function(line) {\n\
            return '  ' + line;\n\
          }).join('\\n\
').substr(2);\n\
        } else {\n\
          str = '\\n\
' + str.split('\\n\
').map(function(line) {\n\
            return '   ' + line;\n\
          }).join('\\n\
');\n\
        }\n\
      }\n\
    } else {\n\
      str = ctx.stylize('[Circular]', 'special');\n\
    }\n\
  }\n\
  if (typeof name === 'undefined') {\n\
    if (array && key.match(/^\\d+$/)) {\n\
      return str;\n\
    }\n\
    name = JSON.stringify('' + key);\n\
    if (name.match(/^\"([a-zA-Z_][a-zA-Z_0-9]*)\"$/)) {\n\
      name = name.substr(1, name.length - 2);\n\
      name = ctx.stylize(name, 'name');\n\
    } else {\n\
      name = name.replace(/'/g, \"\\\\'\")\n\
                 .replace(/\\\\\"/g, '\"')\n\
                 .replace(/(^\"|\"$)/g, \"'\");\n\
      name = ctx.stylize(name, 'string');\n\
    }\n\
  }\n\
\n\
  return name + ': ' + str;\n\
}\n\
\n\
\n\
function reduceToSingleString(output, base, braces) {\n\
  var numLinesEst = 0;\n\
  var length = output.reduce(function(prev, cur) {\n\
    numLinesEst++;\n\
    if (cur.indexOf('\\n\
') >= 0) numLinesEst++;\n\
    return prev + cur.length + 1;\n\
  }, 0);\n\
\n\
  if (length > 60) {\n\
    return braces[0] +\n\
           (base === '' ? '' : base + '\\n\
 ') +\n\
           ' ' +\n\
           output.join(',\\n\
  ') +\n\
           ' ' +\n\
           braces[1];\n\
  }\n\
\n\
  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];\n\
}\n\
\n\
function isArray(ar) {\n\
  return Array.isArray(ar) ||\n\
         (typeof ar === 'object' && objectToString(ar) === '[object Array]');\n\
}\n\
\n\
function isRegExp(re) {\n\
  return typeof re === 'object' && objectToString(re) === '[object RegExp]';\n\
}\n\
\n\
function isDate(d) {\n\
  return typeof d === 'object' && objectToString(d) === '[object Date]';\n\
}\n\
\n\
function isError(e) {\n\
  return typeof e === 'object' && objectToString(e) === '[object Error]';\n\
}\n\
\n\
function objectToString(o) {\n\
  return Object.prototype.toString.call(o);\n\
}\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/inspect.js"
));
require.register("chaijs-chai/lib/chai/utils/objDisplay.js", Function("exports, require, module",
"/*!\n\
 * Chai - flag utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Module dependancies\n\
 */\n\
\n\
var inspect = require('./inspect');\n\
\n\
/**\n\
 * ### .objDisplay (object)\n\
 *\n\
 * Determines if an object or an array matches\n\
 * criteria to be inspected in-line for error\n\
 * messages or should be truncated.\n\
 *\n\
 * @param {Mixed} javascript object to inspect\n\
 * @name objDisplay\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (obj) {\n\
  var str = inspect(obj)\n\
    , type = Object.prototype.toString.call(obj);\n\
\n\
  if (str.length >= 40) {\n\
    if (type === '[object Function]') {\n\
      return !obj.name || obj.name === ''\n\
        ? '[Function]'\n\
        : '[Function: ' + obj.name + ']';\n\
    } else if (type === '[object Array]') {\n\
      return '[ Array(' + obj.length + ') ]';\n\
    } else if (type === '[object Object]') {\n\
      var keys = Object.keys(obj)\n\
        , kstr = keys.length > 2\n\
          ? keys.splice(0, 2).join(', ') + ', ...'\n\
          : keys.join(', ');\n\
      return '{ Object (' + kstr + ') }';\n\
    } else {\n\
      return str;\n\
    }\n\
  } else {\n\
    return str;\n\
  }\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/objDisplay.js"
));
require.register("chaijs-chai/lib/chai/utils/overwriteMethod.js", Function("exports, require, module",
"/*!\n\
 * Chai - overwriteMethod utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### overwriteMethod (ctx, name, fn)\n\
 *\n\
 * Overwites an already existing method and provides\n\
 * access to previous function. Must return function\n\
 * to be used for name.\n\
 *\n\
 *     utils.overwriteMethod(chai.Assertion.prototype, 'equal', function (_super) {\n\
 *       return function (str) {\n\
 *         var obj = utils.flag(this, 'object');\n\
 *         if (obj instanceof Foo) {\n\
 *           new chai.Assertion(obj.value).to.equal(str);\n\
 *         } else {\n\
 *           _super.apply(this, arguments);\n\
 *         }\n\
 *       }\n\
 *     });\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.overwriteMethod('foo', fn);\n\
 *\n\
 * Then can be used as any other assertion.\n\
 *\n\
 *     expect(myFoo).to.equal('bar');\n\
 *\n\
 * @param {Object} ctx object whose method is to be overwritten\n\
 * @param {String} name of method to overwrite\n\
 * @param {Function} method function that returns a function to be used for name\n\
 * @name overwriteMethod\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, method) {\n\
  var _method = ctx[name]\n\
    , _super = function () { return this; };\n\
\n\
  if (_method && 'function' === typeof _method)\n\
    _super = _method;\n\
\n\
  ctx[name] = function () {\n\
    var result = method(_super).apply(this, arguments);\n\
    return result === undefined ? this : result;\n\
  }\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/overwriteMethod.js"
));
require.register("chaijs-chai/lib/chai/utils/overwriteProperty.js", Function("exports, require, module",
"/*!\n\
 * Chai - overwriteProperty utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### overwriteProperty (ctx, name, fn)\n\
 *\n\
 * Overwites an already existing property getter and provides\n\
 * access to previous value. Must return function to use as getter.\n\
 *\n\
 *     utils.overwriteProperty(chai.Assertion.prototype, 'ok', function (_super) {\n\
 *       return function () {\n\
 *         var obj = utils.flag(this, 'object');\n\
 *         if (obj instanceof Foo) {\n\
 *           new chai.Assertion(obj.name).to.equal('bar');\n\
 *         } else {\n\
 *           _super.call(this);\n\
 *         }\n\
 *       }\n\
 *     });\n\
 *\n\
 *\n\
 * Can also be accessed directly from `chai.Assertion`.\n\
 *\n\
 *     chai.Assertion.overwriteProperty('foo', fn);\n\
 *\n\
 * Then can be used as any other assertion.\n\
 *\n\
 *     expect(myFoo).to.be.ok;\n\
 *\n\
 * @param {Object} ctx object whose property is to be overwritten\n\
 * @param {String} name of property to overwrite\n\
 * @param {Function} getter function that returns a getter function to be used for name\n\
 * @name overwriteProperty\n\
 * @api public\n\
 */\n\
\n\
module.exports = function (ctx, name, getter) {\n\
  var _get = Object.getOwnPropertyDescriptor(ctx, name)\n\
    , _super = function () {};\n\
\n\
  if (_get && 'function' === typeof _get.get)\n\
    _super = _get.get\n\
\n\
  Object.defineProperty(ctx, name,\n\
    { get: function () {\n\
        var result = getter(_super).call(this);\n\
        return result === undefined ? this : result;\n\
      }\n\
    , configurable: true\n\
  });\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/overwriteProperty.js"
));
require.register("chaijs-chai/lib/chai/utils/test.js", Function("exports, require, module",
"/*!\n\
 * Chai - test utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Module dependancies\n\
 */\n\
\n\
var flag = require('./flag');\n\
\n\
/**\n\
 * # test(object, expression)\n\
 *\n\
 * Test and object for expression.\n\
 *\n\
 * @param {Object} object (constructed Assertion)\n\
 * @param {Arguments} chai.Assertion.prototype.assert arguments\n\
 */\n\
\n\
module.exports = function (obj, args) {\n\
  var negate = flag(obj, 'negate')\n\
    , expr = args[0];\n\
  return negate ? !expr : expr;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/test.js"
));
require.register("chaijs-chai/lib/chai/utils/transferFlags.js", Function("exports, require, module",
"/*!\n\
 * Chai - transferFlags utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/**\n\
 * ### transferFlags(assertion, object, includeAll = true)\n\
 *\n\
 * Transfer all the flags for `assertion` to `object`. If\n\
 * `includeAll` is set to `false`, then the base Chai\n\
 * assertion flags (namely `object`, `ssfi`, and `message`)\n\
 * will not be transferred.\n\
 *\n\
 *\n\
 *     var newAssertion = new Assertion();\n\
 *     utils.transferFlags(assertion, newAssertion);\n\
 *\n\
 *     var anotherAsseriton = new Assertion(myObj);\n\
 *     utils.transferFlags(assertion, anotherAssertion, false);\n\
 *\n\
 * @param {Assertion} assertion the assertion to transfer the flags from\n\
 * @param {Object} object the object to transfer the flags too; usually a new assertion\n\
 * @param {Boolean} includeAll\n\
 * @name getAllFlags\n\
 * @api private\n\
 */\n\
\n\
module.exports = function (assertion, object, includeAll) {\n\
  var flags = assertion.__flags || (assertion.__flags = Object.create(null));\n\
\n\
  if (!object.__flags) {\n\
    object.__flags = Object.create(null);\n\
  }\n\
\n\
  includeAll = arguments.length === 3 ? includeAll : true;\n\
\n\
  for (var flag in flags) {\n\
    if (includeAll ||\n\
        (flag !== 'object' && flag !== 'ssfi' && flag != 'message')) {\n\
      object.__flags[flag] = flags[flag];\n\
    }\n\
  }\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/transferFlags.js"
));
require.register("chaijs-chai/lib/chai/utils/type.js", Function("exports, require, module",
"/*!\n\
 * Chai - type utility\n\
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>\n\
 * MIT Licensed\n\
 */\n\
\n\
/*!\n\
 * Detectable javascript natives\n\
 */\n\
\n\
var natives = {\n\
    '[object Arguments]': 'arguments'\n\
  , '[object Array]': 'array'\n\
  , '[object Date]': 'date'\n\
  , '[object Function]': 'function'\n\
  , '[object Number]': 'number'\n\
  , '[object RegExp]': 'regexp'\n\
  , '[object String]': 'string'\n\
};\n\
\n\
/**\n\
 * ### type(object)\n\
 *\n\
 * Better implementation of `typeof` detection that can\n\
 * be used cross-browser. Handles the inconsistencies of\n\
 * Array, `null`, and `undefined` detection.\n\
 *\n\
 *     utils.type({}) // 'object'\n\
 *     utils.type(null) // `null'\n\
 *     utils.type(undefined) // `undefined`\n\
 *     utils.type([]) // `array`\n\
 *\n\
 * @param {Mixed} object to detect type of\n\
 * @name type\n\
 * @api private\n\
 */\n\
\n\
module.exports = function (obj) {\n\
  var str = Object.prototype.toString.call(obj);\n\
  if (natives[str]) return natives[str];\n\
  if (obj === null) return 'null';\n\
  if (obj === undefined) return 'undefined';\n\
  if (obj === Object(obj)) return 'object';\n\
  return typeof obj;\n\
};\n\
//@ sourceURL=chaijs-chai/lib/chai/utils/type.js"
));








require.alias("microjs-q/q.js", "home-site/deps/q/q.js");
require.alias("microjs-q/q.js", "home-site/deps/q/index.js");
require.alias("microjs-q/q.js", "q/index.js");
require.alias("microjs-q/q.js", "microjs-q/index.js");
require.alias("visionmedia-mocha/mocha.js", "home-site/deps/mocha/mocha.js");
require.alias("visionmedia-mocha/mocha.js", "home-site/deps/mocha/index.js");
require.alias("visionmedia-mocha/mocha.js", "mocha/index.js");
require.alias("visionmedia-mocha/mocha.js", "visionmedia-mocha/index.js");
require.alias("chaijs-chai/index.js", "home-site/deps/chai/index.js");
require.alias("chaijs-chai/lib/chai.js", "home-site/deps/chai/lib/chai.js");
require.alias("chaijs-chai/lib/chai/assertion.js", "home-site/deps/chai/lib/chai/assertion.js");
require.alias("chaijs-chai/lib/chai/core/assertions.js", "home-site/deps/chai/lib/chai/core/assertions.js");
require.alias("chaijs-chai/lib/chai/interface/assert.js", "home-site/deps/chai/lib/chai/interface/assert.js");
require.alias("chaijs-chai/lib/chai/interface/expect.js", "home-site/deps/chai/lib/chai/interface/expect.js");
require.alias("chaijs-chai/lib/chai/interface/should.js", "home-site/deps/chai/lib/chai/interface/should.js");
require.alias("chaijs-chai/lib/chai/utils/addChainableMethod.js", "home-site/deps/chai/lib/chai/utils/addChainableMethod.js");
require.alias("chaijs-chai/lib/chai/utils/addMethod.js", "home-site/deps/chai/lib/chai/utils/addMethod.js");
require.alias("chaijs-chai/lib/chai/utils/addProperty.js", "home-site/deps/chai/lib/chai/utils/addProperty.js");
require.alias("chaijs-chai/lib/chai/utils/flag.js", "home-site/deps/chai/lib/chai/utils/flag.js");
require.alias("chaijs-chai/lib/chai/utils/getActual.js", "home-site/deps/chai/lib/chai/utils/getActual.js");
require.alias("chaijs-chai/lib/chai/utils/getEnumerableProperties.js", "home-site/deps/chai/lib/chai/utils/getEnumerableProperties.js");
require.alias("chaijs-chai/lib/chai/utils/getMessage.js", "home-site/deps/chai/lib/chai/utils/getMessage.js");
require.alias("chaijs-chai/lib/chai/utils/getName.js", "home-site/deps/chai/lib/chai/utils/getName.js");
require.alias("chaijs-chai/lib/chai/utils/getPathValue.js", "home-site/deps/chai/lib/chai/utils/getPathValue.js");
require.alias("chaijs-chai/lib/chai/utils/getProperties.js", "home-site/deps/chai/lib/chai/utils/getProperties.js");
require.alias("chaijs-chai/lib/chai/utils/index.js", "home-site/deps/chai/lib/chai/utils/index.js");
require.alias("chaijs-chai/lib/chai/utils/inspect.js", "home-site/deps/chai/lib/chai/utils/inspect.js");
require.alias("chaijs-chai/lib/chai/utils/objDisplay.js", "home-site/deps/chai/lib/chai/utils/objDisplay.js");
require.alias("chaijs-chai/lib/chai/utils/overwriteMethod.js", "home-site/deps/chai/lib/chai/utils/overwriteMethod.js");
require.alias("chaijs-chai/lib/chai/utils/overwriteProperty.js", "home-site/deps/chai/lib/chai/utils/overwriteProperty.js");
require.alias("chaijs-chai/lib/chai/utils/test.js", "home-site/deps/chai/lib/chai/utils/test.js");
require.alias("chaijs-chai/lib/chai/utils/transferFlags.js", "home-site/deps/chai/lib/chai/utils/transferFlags.js");
require.alias("chaijs-chai/lib/chai/utils/type.js", "home-site/deps/chai/lib/chai/utils/type.js");
require.alias("chaijs-chai/index.js", "home-site/deps/chai/index.js");
require.alias("chaijs-chai/index.js", "chai/index.js");
require.alias("chaijs-assertion-error/index.js", "chaijs-chai/deps/assertion-error/index.js");
require.alias("chaijs-assertion-error/index.js", "chaijs-chai/deps/assertion-error/index.js");
require.alias("chaijs-assertion-error/index.js", "chaijs-assertion-error/index.js");
require.alias("chaijs-deep-eql/lib/eql.js", "chaijs-chai/deps/deep-eql/lib/eql.js");
require.alias("chaijs-deep-eql/lib/eql.js", "chaijs-chai/deps/deep-eql/index.js");
require.alias("chaijs-type-detect/lib/type.js", "chaijs-deep-eql/deps/type-detect/lib/type.js");
require.alias("chaijs-type-detect/lib/type.js", "chaijs-deep-eql/deps/type-detect/index.js");
require.alias("chaijs-type-detect/lib/type.js", "chaijs-type-detect/index.js");
require.alias("chaijs-deep-eql/lib/eql.js", "chaijs-deep-eql/index.js");
require.alias("chaijs-chai/index.js", "chaijs-chai/index.js");