
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.2' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const api = {
        async get(path) {
            const res = await fetch('api/' + path);
            return await res.json();
        }
    };
    // a function that generates a random string
    function generateRandomString(length) {
        let randomString = '';
        const randomNumber = Math.floor(Math.random() * 10);
        for (let i = 0; i < length + randomNumber; i++) {
            randomString += String.fromCharCode(33 + Math.floor(Math.random() * 94));
        }
        return randomString;
    }
    // a function that reads cookies and parses them into an object
    function readCookies() {
        const cookies = {};
        document.cookie.split('; ').forEach((cookie) => {
            const [key, value] = cookie.split('=');
            cookies[key] = value;
        });
        return cookies;
    }
    function writeCookie(name, value) {
        document.cookie = `${name}=${value}`;
    }
    function listenClickExit(element, callback) {
        document.addEventListener('click', (event) => {
            if (element.contains(event.target)) {
                return;
            }
            callback();
        });
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function draw(node, { delay = 0, speed, duration, easing = cubicInOut } = {}) {
        let len = node.getTotalLength();
        const style = getComputedStyle(node);
        if (style.strokeLinecap !== 'butt') {
            len += parseInt(style.strokeWidth);
        }
        if (duration === undefined) {
            if (speed === undefined) {
                duration = 800;
            }
            else {
                duration = len / speed;
            }
        }
        else if (typeof duration === 'function') {
            duration = duration(len);
        }
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `stroke-dasharray: ${t * len} ${u * len}`
        };
    }

    /* src\components\bar.svelte generated by Svelte v3.46.2 */

    const file$5 = "src\\components\\bar.svelte";

    // (15:2) {:else}
    function create_else_block$1(ctx) {
    	let t0_value = Math.round(/*percentage*/ ctx[5]) + "";
    	let t0;
    	let t1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text("% ");
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*percentage*/ 32) && t0_value !== (t0_value = Math.round(/*percentage*/ ctx[5]) + "")) set_data_dev(t0, t0_value);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(15:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (13:2) {#if mode}
    function create_if_block$2(ctx) {
    	let t0_value = (/*value*/ ctx[1] === /*max*/ ctx[0]
    	? /*value*/ ctx[1]
    	: `${/*value*/ ctx[1]}/${/*max*/ ctx[0]}`) + "";

    	let t0;
    	let t1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = space();
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*value, max*/ 3) && t0_value !== (t0_value = (/*value*/ ctx[1] === /*max*/ ctx[0]
    			? /*value*/ ctx[1]
    			: `${/*value*/ ctx[1]}/${/*max*/ ctx[0]}`) + "")) set_data_dev(t0, t0_value);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 64)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[6],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[6])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(13:2) {#if mode}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let span;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*mode*/ ctx[4]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			span = element("span");
    			if_block.c();
    			attr_dev(div0, "class", "progress-bar svelte-n8afle");
    			set_style(div0, "width", (/*percentage*/ ctx[5] > 0 ? /*percentage*/ ctx[5] : 0) + "%");
    			set_style(div0, "background-color", /*color*/ ctx[2]);
    			add_location(div0, file$5, 10, 1, 265);
    			attr_dev(span, "class", "text svelte-n8afle");
    			add_location(span, file$5, 11, 1, 376);
    			attr_dev(div1, "class", "container svelte-n8afle");
    			set_style(div1, "background-color", /*bgColor*/ ctx[3]);
    			add_location(div1, file$5, 9, 0, 172);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t);
    			append_dev(div1, span);
    			if_blocks[current_block_type_index].m(span, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*click_handler*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*percentage*/ 32) {
    				set_style(div0, "width", (/*percentage*/ ctx[5] > 0 ? /*percentage*/ ctx[5] : 0) + "%");
    			}

    			if (!current || dirty & /*color*/ 4) {
    				set_style(div0, "background-color", /*color*/ ctx[2]);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(span, null);
    			}

    			if (!current || dirty & /*bgColor*/ 8) {
    				set_style(div1, "background-color", /*bgColor*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let percentage;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Bar', slots, ['default']);
    	let { max } = $$props;
    	let { value } = $$props;
    	let { color } = $$props;
    	let { bgColor } = $$props;
    	let mode = true;
    	const writable_props = ['max', 'value', 'color', 'bgColor'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Bar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(4, mode = !mode);

    	$$self.$$set = $$props => {
    		if ('max' in $$props) $$invalidate(0, max = $$props.max);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('color' in $$props) $$invalidate(2, color = $$props.color);
    		if ('bgColor' in $$props) $$invalidate(3, bgColor = $$props.bgColor);
    		if ('$$scope' in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		max,
    		value,
    		color,
    		bgColor,
    		mode,
    		percentage
    	});

    	$$self.$inject_state = $$props => {
    		if ('max' in $$props) $$invalidate(0, max = $$props.max);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('color' in $$props) $$invalidate(2, color = $$props.color);
    		if ('bgColor' in $$props) $$invalidate(3, bgColor = $$props.bgColor);
    		if ('mode' in $$props) $$invalidate(4, mode = $$props.mode);
    		if ('percentage' in $$props) $$invalidate(5, percentage = $$props.percentage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value, max*/ 3) {
    			$$invalidate(5, percentage = value / max * 100);
    		}
    	};

    	return [max, value, color, bgColor, mode, percentage, $$scope, slots, click_handler];
    }

    class Bar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { max: 0, value: 1, color: 2, bgColor: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bar",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*max*/ ctx[0] === undefined && !('max' in props)) {
    			console.warn("<Bar> was created without expected prop 'max'");
    		}

    		if (/*value*/ ctx[1] === undefined && !('value' in props)) {
    			console.warn("<Bar> was created without expected prop 'value'");
    		}

    		if (/*color*/ ctx[2] === undefined && !('color' in props)) {
    			console.warn("<Bar> was created without expected prop 'color'");
    		}

    		if (/*bgColor*/ ctx[3] === undefined && !('bgColor' in props)) {
    			console.warn("<Bar> was created without expected prop 'bgColor'");
    		}
    	}

    	get max() {
    		throw new Error("<Bar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set max(value) {
    		throw new Error("<Bar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Bar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Bar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Bar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Bar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get bgColor() {
    		throw new Error("<Bar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set bgColor(value) {
    		throw new Error("<Bar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function xpUntilNext(level) {
        // the amount of xp needed is multiplied by two each ten levels
        return Math.floor(Math.pow(2, level / 10) * 200);
    }

    /* src\auth\login.svelte generated by Svelte v3.46.2 */
    const file$4 = "src\\auth\\login.svelte";

    // (45:1) {:else}
    function create_else_block(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 0,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*personal*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*personal*/ 1 && promise !== (promise = /*personal*/ ctx[0]) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(45:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:1) {#if !cookies.token || !personal.id}
    function create_if_block$1(ctx) {
    	let a;
    	let svg;
    	let path;
    	let circle;

    	const block = {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			circle = svg_element("circle");
    			attr_dev(path, "d", "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2");
    			add_location(path, file$4, 42, 213, 1553);
    			attr_dev(circle, "cx", "12");
    			attr_dev(circle, "cy", "7");
    			attr_dev(circle, "r", "4");
    			add_location(circle, file$4, 42, 266, 1606);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "fill", "none");
    			attr_dev(svg, "stroke", "currentColor");
    			attr_dev(svg, "stroke-width", "2");
    			attr_dev(svg, "stroke-linecap", "round");
    			attr_dev(svg, "stroke-linejoin", "round");
    			attr_dev(svg, "class", "feather feather-user svelte-17a7rdm");
    			add_location(svg, file$4, 42, 3, 1343);
    			attr_dev(a, "href", /*href*/ ctx[1]);
    			attr_dev(a, "class", "svelte-17a7rdm");
    			add_location(a, file$4, 41, 2, 1321);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, path);
    			append_dev(svg, circle);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*href*/ 2) {
    				attr_dev(a, "href", /*href*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(41:1) {#if !cookies.token || !personal.id}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script lang="ts">import { api, generateRandomString, listenClickExit, readCookies, writeCookie }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script lang=\\\"ts\\\">import { api, generateRandomString, listenClickExit, readCookies, writeCookie }",
    		ctx
    	});

    	return block;
    }

    // (48:2) {:then personal}
    function create_then_block(ctx) {
    	let img;
    	let img_src_value;
    	let t;
    	let if_block_anchor;
    	let current;
    	let if_block = /*opened*/ ctx[2] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			img = element("img");
    			t = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			if (!src_url_equal(img.src, img_src_value = "https://cdn.discordapp.com/avatars/" + /*personal*/ ctx[0].id + "/" + /*personal*/ ctx[0].avatar + ".png?size=128")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "avatar");
    			attr_dev(img, "class", "svelte-17a7rdm");
    			add_location(img, file$4, 48, 3, 1722);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*personal*/ 1 && !src_url_equal(img.src, img_src_value = "https://cdn.discordapp.com/avatars/" + /*personal*/ ctx[0].id + "/" + /*personal*/ ctx[0].avatar + ".png?size=128")) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (/*opened*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*opened*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(48:2) {:then personal}",
    		ctx
    	});

    	return block;
    }

    // (50:3) {#if opened}
    function create_if_block_1(ctx) {
    	let div0;
    	let t0_value = /*personal*/ ctx[0].username + "";
    	let t0;
    	let t1;
    	let t2_value = /*personal*/ ctx[0].discriminator + "";
    	let t2;
    	let div0_intro;
    	let div0_outro;
    	let t3;
    	let div1;
    	let t4;
    	let t5_value = /*personal*/ ctx[0].level + "";
    	let t5;
    	let div1_intro;
    	let div1_outro;
    	let t6;
    	let div2;
    	let bar0;
    	let div2_intro;
    	let div2_outro;
    	let t7;
    	let div3;
    	let bar1;
    	let div3_intro;
    	let div3_outro;
    	let t8;
    	let div4;
    	let bar2;
    	let div4_intro;
    	let div4_outro;
    	let current;

    	bar0 = new Bar({
    			props: {
    				max: /*personal*/ ctx[0].maxHealth,
    				value: /*personal*/ ctx[0].health,
    				color: "#c92845",
    				bgColor: "#7a414c",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	bar1 = new Bar({
    			props: {
    				max: /*personal*/ ctx[0].maxMana,
    				value: /*personal*/ ctx[0].mana,
    				color: "#2224aa",
    				bgColor: "#4d4e8e",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	bar2 = new Bar({
    			props: {
    				max: xpUntilNext(/*personal*/ ctx[0].level),
    				value: /*personal*/ ctx[0].xp,
    				color: "#eac629",
    				bgColor: "#998d5b",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = text("#");
    			t2 = text(t2_value);
    			t3 = space();
    			div1 = element("div");
    			t4 = text("level ");
    			t5 = text(t5_value);
    			t6 = space();
    			div2 = element("div");
    			create_component(bar0.$$.fragment);
    			t7 = space();
    			div3 = element("div");
    			create_component(bar1.$$.fragment);
    			t8 = space();
    			div4 = element("div");
    			create_component(bar2.$$.fragment);
    			attr_dev(div0, "class", "username svelte-17a7rdm");
    			add_location(div0, file$4, 50, 4, 1849);
    			attr_dev(div1, "class", "level svelte-17a7rdm");
    			add_location(div1, file$4, 51, 4, 1980);
    			attr_dev(div2, "class", "bar svelte-17a7rdm");
    			add_location(div2, file$4, 52, 4, 2086);
    			attr_dev(div3, "class", "bar svelte-17a7rdm");
    			add_location(div3, file$4, 57, 4, 2292);
    			attr_dev(div4, "class", "bar svelte-17a7rdm");
    			add_location(div4, file$4, 62, 4, 2494);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div0, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t4);
    			append_dev(div1, t5);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, div2, anchor);
    			mount_component(bar0, div2, null);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div3, anchor);
    			mount_component(bar1, div3, null);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div4, anchor);
    			mount_component(bar2, div4, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*personal*/ 1) && t0_value !== (t0_value = /*personal*/ ctx[0].username + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*personal*/ 1) && t2_value !== (t2_value = /*personal*/ ctx[0].discriminator + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*personal*/ 1) && t5_value !== (t5_value = /*personal*/ ctx[0].level + "")) set_data_dev(t5, t5_value);
    			const bar0_changes = {};
    			if (dirty & /*personal*/ 1) bar0_changes.max = /*personal*/ ctx[0].maxHealth;
    			if (dirty & /*personal*/ 1) bar0_changes.value = /*personal*/ ctx[0].health;

    			if (dirty & /*$$scope*/ 64) {
    				bar0_changes.$$scope = { dirty, ctx };
    			}

    			bar0.$set(bar0_changes);
    			const bar1_changes = {};
    			if (dirty & /*personal*/ 1) bar1_changes.max = /*personal*/ ctx[0].maxMana;
    			if (dirty & /*personal*/ 1) bar1_changes.value = /*personal*/ ctx[0].mana;

    			if (dirty & /*$$scope*/ 64) {
    				bar1_changes.$$scope = { dirty, ctx };
    			}

    			bar1.$set(bar1_changes);
    			const bar2_changes = {};
    			if (dirty & /*personal*/ 1) bar2_changes.max = xpUntilNext(/*personal*/ ctx[0].level);
    			if (dirty & /*personal*/ 1) bar2_changes.value = /*personal*/ ctx[0].xp;

    			if (dirty & /*$$scope*/ 64) {
    				bar2_changes.$$scope = { dirty, ctx };
    			}

    			bar2.$set(bar2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div0_outro) div0_outro.end(1);
    				div0_intro = create_in_transition(div0, fly, { y: 50, duration: 200, delay: 200 });
    				div0_intro.start();
    			});

    			add_render_callback(() => {
    				if (div1_outro) div1_outro.end(1);
    				div1_intro = create_in_transition(div1, fly, { y: 50, duration: 200, delay: 400 });
    				div1_intro.start();
    			});

    			transition_in(bar0.$$.fragment, local);

    			add_render_callback(() => {
    				if (div2_outro) div2_outro.end(1);
    				div2_intro = create_in_transition(div2, fly, { y: 50, duration: 200, delay: 600 });
    				div2_intro.start();
    			});

    			transition_in(bar1.$$.fragment, local);

    			add_render_callback(() => {
    				if (div3_outro) div3_outro.end(1);
    				div3_intro = create_in_transition(div3, fly, { y: 50, duration: 200, delay: 800 });
    				div3_intro.start();
    			});

    			transition_in(bar2.$$.fragment, local);

    			add_render_callback(() => {
    				if (div4_outro) div4_outro.end(1);
    				div4_intro = create_in_transition(div4, fly, { y: 50, duration: 200, delay: 1000 });
    				div4_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div0_intro) div0_intro.invalidate();
    			div0_outro = create_out_transition(div0, fade, {});
    			if (div1_intro) div1_intro.invalidate();
    			div1_outro = create_out_transition(div1, fade, {});
    			transition_out(bar0.$$.fragment, local);
    			if (div2_intro) div2_intro.invalidate();
    			div2_outro = create_out_transition(div2, fade, {});
    			transition_out(bar1.$$.fragment, local);
    			if (div3_intro) div3_intro.invalidate();
    			div3_outro = create_out_transition(div3, fade, {});
    			transition_out(bar2.$$.fragment, local);
    			if (div4_intro) div4_intro.invalidate();
    			div4_outro = create_out_transition(div4, fade, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching && div0_outro) div0_outro.end();
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			if (detaching && div1_outro) div1_outro.end();
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(div2);
    			destroy_component(bar0);
    			if (detaching && div2_outro) div2_outro.end();
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div3);
    			destroy_component(bar1);
    			if (detaching && div3_outro) div3_outro.end();
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div4);
    			destroy_component(bar2);
    			if (detaching && div4_outro) div4_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(50:3) {#if opened}",
    		ctx
    	});

    	return block;
    }

    // (54:5) <Bar max={personal.maxHealth} value={personal.health} color="#c92845" bgColor="#7a414c">
    function create_default_slot_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("pv");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(54:5) <Bar max={personal.maxHealth} value={personal.health} color=\\\"#c92845\\\" bgColor=\\\"#7a414c\\\">",
    		ctx
    	});

    	return block;
    }

    // (59:5) <Bar max={personal.maxMana} value={personal.mana} color="#2224aa" bgColor="#4d4e8e">
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("mp");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(59:5) <Bar max={personal.maxMana} value={personal.mana} color=\\\"#2224aa\\\" bgColor=\\\"#4d4e8e\\\">",
    		ctx
    	});

    	return block;
    }

    // (64:5) <Bar max={xpUntilNext(personal.level)} value={personal.xp} color="#eac629" bgColor="#998d5b">
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("xp");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(64:5) <Bar max={xpUntilNext(personal.level)} value={personal.xp} color=\\\"#eac629\\\" bgColor=\\\"#998d5b\\\">",
    		ctx
    	});

    	return block;
    }

    // (46:19)      loading...    {:then personal}
    function create_pending_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("loading...");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(46:19)      loading...    {:then personal}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*cookies*/ ctx[4].token || !/*personal*/ ctx[0].id) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "login svelte-17a7rdm");
    			toggle_class(div, "opened", /*opened*/ ctx[2]);
    			toggle_class(div, "dead", /*dead*/ ctx[3]);
    			add_location(div, file$4, 39, 0, 1219);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*open*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}

    			if (dirty & /*opened*/ 4) {
    				toggle_class(div, "opened", /*opened*/ ctx[2]);
    			}

    			if (dirty & /*dead*/ 8) {
    				toggle_class(div, "dead", /*dead*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let dead;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Login', slots, []);
    	const cookies = readCookies();
    	let href = '';

    	let personal = {
    		id: '',
    		username: '',
    		discriminator: '',
    		avatar: '',
    		xp: 0,
    		level: 0,
    		health: 100,
    		maxHealth: 100,
    		mana: 100,
    		maxMana: 100
    	};

    	window.addEventListener('load', async () => {
    		$$invalidate(0, personal = await api.get('me'));
    		let url = window.location.origin;
    		url = url.replace('://', '%3A%2F%2F');
    		$$invalidate(1, href = `https://discord.com/api/oauth2/authorize?client_id=738322654385406003&redirect_uri=${url}%2Fauth%2Flogin&response_type=code&scope=identify`);
    		const randomString = generateRandomString(21);
    		writeCookie('oauthState', randomString);
    		$$invalidate(1, href += `&state=${btoa(randomString)}`);
    	});

    	let opened = false;

    	async function open() {
    		if (opened) return;
    		$$invalidate(2, opened = true);

    		// refresh
    		$$invalidate(0, personal = await api.get('me'));

    		listenClickExit(this, () => $$invalidate(2, opened = false));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		api,
    		generateRandomString,
    		listenClickExit,
    		readCookies,
    		writeCookie,
    		fade,
    		fly,
    		Bar,
    		xpUntilNext,
    		cookies,
    		href,
    		personal,
    		opened,
    		open,
    		dead
    	});

    	$$self.$inject_state = $$props => {
    		if ('href' in $$props) $$invalidate(1, href = $$props.href);
    		if ('personal' in $$props) $$invalidate(0, personal = $$props.personal);
    		if ('opened' in $$props) $$invalidate(2, opened = $$props.opened);
    		if ('dead' in $$props) $$invalidate(3, dead = $$props.dead);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*personal*/ 1) {
    			$$invalidate(3, dead = personal.health <= 0);
    		}
    	};

    	return [personal, href, opened, dead, cookies, open];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function tick_spring(ctx, last_value, current_value, target_value) {
        if (typeof current_value === 'number' || is_date(current_value)) {
            // @ts-ignore
            const delta = target_value - current_value;
            // @ts-ignore
            const velocity = (current_value - last_value) / (ctx.dt || 1 / 60); // guard div by 0
            const spring = ctx.opts.stiffness * delta;
            const damper = ctx.opts.damping * velocity;
            const acceleration = (spring - damper) * ctx.inv_mass;
            const d = (velocity + acceleration) * ctx.dt;
            if (Math.abs(d) < ctx.opts.precision && Math.abs(delta) < ctx.opts.precision) {
                return target_value; // settled
            }
            else {
                ctx.settled = false; // signal loop to keep ticking
                // @ts-ignore
                return is_date(current_value) ?
                    new Date(current_value.getTime() + d) : current_value + d;
            }
        }
        else if (Array.isArray(current_value)) {
            // @ts-ignore
            return current_value.map((_, i) => tick_spring(ctx, last_value[i], current_value[i], target_value[i]));
        }
        else if (typeof current_value === 'object') {
            const next_value = {};
            for (const k in current_value) {
                // @ts-ignore
                next_value[k] = tick_spring(ctx, last_value[k], current_value[k], target_value[k]);
            }
            // @ts-ignore
            return next_value;
        }
        else {
            throw new Error(`Cannot spring ${typeof current_value} values`);
        }
    }
    function spring(value, opts = {}) {
        const store = writable(value);
        const { stiffness = 0.15, damping = 0.8, precision = 0.01 } = opts;
        let last_time;
        let task;
        let current_token;
        let last_value = value;
        let target_value = value;
        let inv_mass = 1;
        let inv_mass_recovery_rate = 0;
        let cancel_task = false;
        function set(new_value, opts = {}) {
            target_value = new_value;
            const token = current_token = {};
            if (value == null || opts.hard || (spring.stiffness >= 1 && spring.damping >= 1)) {
                cancel_task = true; // cancel any running animation
                last_time = now();
                last_value = new_value;
                store.set(value = target_value);
                return Promise.resolve();
            }
            else if (opts.soft) {
                const rate = opts.soft === true ? .5 : +opts.soft;
                inv_mass_recovery_rate = 1 / (rate * 60);
                inv_mass = 0; // infinite mass, unaffected by spring forces
            }
            if (!task) {
                last_time = now();
                cancel_task = false;
                task = loop(now => {
                    if (cancel_task) {
                        cancel_task = false;
                        task = null;
                        return false;
                    }
                    inv_mass = Math.min(inv_mass + inv_mass_recovery_rate, 1);
                    const ctx = {
                        inv_mass,
                        opts: spring,
                        settled: true,
                        dt: (now - last_time) * 60 / 1000
                    };
                    const next_value = tick_spring(ctx, last_value, value, target_value);
                    last_time = now;
                    last_value = value;
                    store.set(value = next_value);
                    if (ctx.settled) {
                        task = null;
                    }
                    return !ctx.settled;
                });
            }
            return new Promise(fulfil => {
                task.promise.then(() => {
                    if (token === current_token)
                        fulfil();
                });
            });
        }
        const spring = {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe,
            stiffness,
            damping,
            precision
        };
        return spring;
    }

    /* src\components\mouse-follower.svelte generated by Svelte v3.46.2 */
    const file$3 = "src\\components\\mouse-follower.svelte";

    function create_fragment$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "box svelte-jyaf37");
    			set_style(div, "left", /*$coords*/ ctx[0].x + "px");
    			set_style(div, "top", /*$coords*/ ctx[0].y + "px");
    			set_style(div, "font-size", /*$size*/ ctx[1] + "px");
    			add_location(div, file$3, 25, 0, 686);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$coords*/ 1) {
    				set_style(div, "left", /*$coords*/ ctx[0].x + "px");
    			}

    			if (dirty & /*$coords*/ 1) {
    				set_style(div, "top", /*$coords*/ ctx[0].y + "px");
    			}

    			if (dirty & /*$size*/ 2) {
    				set_style(div, "font-size", /*$size*/ ctx[1] + "px");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $coords;
    	let $size;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Mouse_follower', slots, []);
    	let coords = spring({ x: -100, y: -100 }, { stiffness: 0.1, damping: 0.25 });
    	validate_store(coords, 'coords');
    	component_subscribe($$self, coords, value => $$invalidate(0, $coords = value));
    	let size = spring(10, { stiffness: 0.1, damping: 0.25 });
    	validate_store(size, 'size');
    	component_subscribe($$self, size, value => $$invalidate(1, $size = value));

    	const handleOver = e => {
    		const currentCursor = getComputedStyle(e.target).cursor;

    		if (currentCursor !== 'auto') {
    			size.set(20);
    		} else {
    			size.set(10);
    		}
    	};

    	const isTouchscreen = 'ontouchstart' in window || navigator.maxTouchPoints;

    	if (!isTouchscreen) {
    		window.addEventListener('mousemove', e => coords.set({ x: e.clientX, y: e.clientY }));
    		window.addEventListener('mouseover', handleOver);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Mouse_follower> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		spring,
    		coords,
    		size,
    		handleOver,
    		isTouchscreen,
    		$coords,
    		$size
    	});

    	$$self.$inject_state = $$props => {
    		if ('coords' in $$props) $$invalidate(2, coords = $$props.coords);
    		if ('size' in $$props) $$invalidate(3, size = $$props.size);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$coords, $size, coords, size];
    }

    class Mouse_follower extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Mouse_follower",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\logo.svelte generated by Svelte v3.46.2 */
    const file$2 = "src\\logo.svelte";

    // (10:0) {#if visible}
    function create_if_block(ctx) {
    	let a;
    	let svg;
    	let g;
    	let path_1;
    	let path_1_intro;
    	let svg_class_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path_1 = svg_element("path");
    			attr_dev(path_1, "d", path);
    			set_style(path_1, "stroke", "white");
    			set_style(path_1, "stroke-width", "1.5");
    			set_style(path_1, "fill", "none");
    			add_location(path_1, file$2, 13, 4, 10050);
    			add_location(g, file$2, 12, 3, 10041);
    			attr_dev(svg, "width", "243.812");
    			attr_dev(svg, "height", "41.501");
    			attr_dev(svg, "viewBox", "-1 -1 245 44");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", svg_class_value = /*$$props*/ ctx[1].class);
    			add_location(svg, file$2, 11, 2, 9919);
    			attr_dev(a, "href", window.location.origin);
    			add_location(a, file$2, 10, 1, 9880);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, g);
    			append_dev(g, path_1);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$$props*/ 2 && svg_class_value !== (svg_class_value = /*$$props*/ ctx[1].class)) {
    				attr_dev(svg, "class", svg_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (!path_1_intro) {
    				add_render_callback(() => {
    					path_1_intro = create_in_transition(path_1, draw, { duration: 8000, easing: identity });
    					path_1_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(10:0) {#if visible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*visible*/ ctx[0] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*visible*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			transition_in(if_block);
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const path = "M 0.012 38.9 L 4.512 3.3 A 3.114 3.114 0 0 1 4.85 2.244 A 2.751 2.751 0 0 1 5.862 1.2 Q 7.012 0.5 8.412 0.5 Q 9.612 0.5 10.662 1.05 Q 11.712 1.6 12.112 2.8 L 20.912 26 Q 21.482 27.235 22.052 27.297 A 0.557 0.557 0 0 0 22.112 27.3 A 0.519 0.519 0 0 0 22.413 27.189 Q 22.788 26.92 23.212 26 L 31.912 2.8 A 3.938 3.938 0 0 1 32.456 1.861 A 3.145 3.145 0 0 1 33.412 1.05 Q 34.412 0.5 35.612 0.5 A 5.458 5.458 0 0 1 37.127 0.704 A 4.639 4.639 0 0 1 38.262 1.2 Q 39.412 1.9 39.512 3.3 L 44.012 38.9 A 3.486 3.486 0 0 1 44.046 39.208 Q 44.114 40.28 43.412 40.85 Q 42.612 41.5 41.612 41.5 A 2.306 2.306 0 0 1 40.355 41.123 A 2.982 2.982 0 0 1 40.112 40.95 Q 39.412 40.4 39.212 39.4 L 35.812 9.1 A 2.659 2.659 0 0 0 35.723 8.811 Q 35.531 8.3 35.212 8.3 Q 34.874 8.3 34.536 8.801 A 3.13 3.13 0 0 0 34.412 9 L 25.112 33.1 A 5.563 5.563 0 0 1 24.464 34.16 Q 23.481 35.4 22.012 35.4 A 2.816 2.816 0 0 1 19.852 34.398 Q 19.48 33.987 19.168 33.407 A 7.07 7.07 0 0 1 19.012 33.1 L 9.612 9 A 1.939 1.939 0 0 0 9.46 8.711 Q 9.366 8.565 9.257 8.471 A 0.664 0.664 0 0 0 8.812 8.3 A 0.404 0.404 0 0 0 8.51 8.443 Q 8.327 8.638 8.212 9.1 L 4.812 39.4 A 2.371 2.371 0 0 1 4.612 40.164 A 2.009 2.009 0 0 1 3.962 40.95 Q 3.212 41.5 2.412 41.5 Q 1.412 41.5 0.662 40.85 A 1.857 1.857 0 0 1 0.065 39.823 Q -0.023 39.431 0.008 38.948 A 4.199 4.199 0 0 1 0.012 38.9 Z M 167.711 41.038 A 23.933 23.933 0 0 0 172.512 41.5 A 21.364 21.364 0 0 0 176.618 41.123 A 15.377 15.377 0 0 0 182.862 38.45 A 9.714 9.714 0 0 0 186.404 33.752 A 11.647 11.647 0 0 0 187.012 29.9 A 15.476 15.476 0 0 0 186.994 29.152 Q 186.924 27.713 186.581 26.511 A 7.669 7.669 0 0 0 184.762 23.25 Q 182.512 20.9 179.312 19.75 Q 176.112 18.6 173.412 17.9 Q 170.512 17.1 168.062 16.35 A 15.302 15.302 0 0 1 167.233 16.071 Q 166.357 15.747 165.638 15.349 A 7.839 7.839 0 0 1 164.212 14.35 A 4.034 4.034 0 0 1 162.977 12.258 A 6.044 6.044 0 0 1 162.812 10.8 A 7.69 7.69 0 0 1 162.894 9.658 A 5.47 5.47 0 0 1 165.462 5.7 Q 167.201 4.585 169.694 4.201 A 18.564 18.564 0 0 1 172.512 4 Q 174.59 4 176.21 4.353 A 9.939 9.939 0 0 1 178.212 5 Q 180.412 6 181.512 6.9 A 4.624 4.624 0 0 0 181.872 7.155 Q 182.168 7.343 182.453 7.452 A 2.123 2.123 0 0 0 183.212 7.6 Q 184.012 7.6 184.612 6.85 Q 184.914 6.473 185.064 6.107 A 1.852 1.852 0 0 0 185.212 5.4 A 1.899 1.899 0 0 0 184.883 4.328 A 2.673 2.673 0 0 0 184.412 3.8 A 13.228 13.228 0 0 0 182.515 2.393 A 16.426 16.426 0 0 0 179.762 1.05 A 13.217 13.217 0 0 0 178.399 0.616 Q 177.201 0.302 175.797 0.148 A 26.545 26.545 0 0 0 172.912 0 A 27.52 27.52 0 0 0 170.825 0.077 Q 168.61 0.246 166.747 0.785 A 13.484 13.484 0 0 0 162.312 2.95 Q 158.412 5.9 158.412 10.9 A 10.406 10.406 0 0 0 158.597 12.91 A 7.212 7.212 0 0 0 160.512 16.65 A 12.421 12.421 0 0 0 162.754 18.459 A 15.31 15.31 0 0 0 165.862 19.95 Q 169.112 21.1 172.512 21.9 Q 174.812 22.4 177.112 23.25 A 12.751 12.751 0 0 1 177.984 23.609 A 10.674 10.674 0 0 1 181.012 25.65 Q 182.612 27.2 182.612 29.8 A 6.927 6.927 0 0 1 181.834 33.081 A 7.482 7.482 0 0 1 180.012 35.3 A 8.208 8.208 0 0 1 179.063 35.993 Q 177.677 36.86 175.883 37.229 A 14.279 14.279 0 0 1 173.012 37.5 A 18.13 18.13 0 0 1 172.342 37.488 A 15.567 15.567 0 0 1 166.362 36.1 A 20.837 20.837 0 0 1 165.575 35.72 Q 163.086 34.448 161.612 32.8 Q 160.812 32 159.912 32 Q 159.012 32 158.262 32.65 A 2.16 2.16 0 0 0 157.711 33.362 A 2.171 2.171 0 0 0 157.512 34.3 A 1.804 1.804 0 0 0 157.574 34.762 Q 157.645 35.029 157.795 35.31 A 3.875 3.875 0 0 0 158.112 35.8 A 11.081 11.081 0 0 0 158.916 36.665 Q 159.942 37.659 161.315 38.507 A 20.363 20.363 0 0 0 163.912 39.85 A 19.134 19.134 0 0 0 167.711 41.038 Z M 73.912 40.5 L 57.412 40.5 A 6.571 6.571 0 0 1 55.881 40.332 A 4.592 4.592 0 0 1 53.862 39.3 Q 52.636 38.211 52.523 36.133 A 7.965 7.965 0 0 1 52.512 35.7 L 52.512 5.4 A 4.744 4.744 0 0 1 52.768 3.812 A 4.132 4.132 0 0 1 53.762 2.25 A 4.221 4.221 0 0 1 56.67 1.006 A 5.591 5.591 0 0 1 56.912 1 L 73.412 1 A 2.731 2.731 0 0 1 74.012 1.062 Q 74.66 1.208 75.012 1.7 Q 75.512 2.4 75.512 3.3 A 1.908 1.908 0 0 1 74.95 4.662 A 2.504 2.504 0 0 1 74.912 4.7 A 2.024 2.024 0 0 1 73.47 5.3 A 2.657 2.657 0 0 1 73.412 5.3 L 60.812 5.3 A 5.039 5.039 0 0 0 59.427 5.474 Q 57.312 6.08 57.312 8.8 L 57.312 14.9 A 5.039 5.039 0 0 0 57.485 16.286 Q 58.091 18.4 60.812 18.4 L 72.012 18.4 A 3.023 3.023 0 0 1 72.843 18.505 Q 73.775 18.771 74.022 19.723 A 3.094 3.094 0 0 1 74.112 20.5 A 2.451 2.451 0 0 1 73.996 21.287 Q 73.627 22.38 72.071 22.4 A 4.545 4.545 0 0 1 72.012 22.4 L 60.812 22.4 A 5.039 5.039 0 0 0 59.427 22.574 Q 57.312 23.18 57.312 25.9 L 57.312 32.7 A 5.039 5.039 0 0 0 57.485 34.086 Q 58.091 36.2 60.812 36.2 L 73.912 36.2 A 3.208 3.208 0 0 1 74.496 36.25 Q 75.231 36.386 75.562 36.9 Q 76.012 37.6 76.012 38.4 A 2.123 2.123 0 0 1 75.826 39.254 A 3.013 3.013 0 0 1 75.512 39.8 A 1.596 1.596 0 0 1 74.583 40.421 Q 74.281 40.5 73.912 40.5 Z M 84.012 39.2 L 84.012 5.7 Q 84.012 4.204 84.459 3.221 A 3.053 3.053 0 0 1 85.362 2.05 A 4.667 4.667 0 0 1 86.992 1.251 Q 87.663 1.064 88.46 1.016 A 9.34 9.34 0 0 1 89.012 1 L 99.112 1 A 14.221 14.221 0 0 1 104.459 1.986 A 13.318 13.318 0 0 1 107.812 3.95 A 9.614 9.614 0 0 1 111.439 10.756 A 13.867 13.867 0 0 1 111.512 12.2 A 14.246 14.246 0 0 1 111.078 15.8 A 10.898 10.898 0 0 1 109.162 19.75 A 11.2 11.2 0 0 1 106.154 22.501 A 10.297 10.297 0 0 1 103.312 23.7 A 4.631 4.631 0 0 1 104.523 24.234 Q 105.449 24.798 106.412 25.85 A 12.799 12.799 0 0 1 107.971 27.978 A 17.572 17.572 0 0 1 109.112 30.3 L 112.312 38.2 Q 112.442 38.591 112.487 38.897 A 2.075 2.075 0 0 1 112.512 39.2 A 2.517 2.517 0 0 1 112.383 40.022 A 2.143 2.143 0 0 1 111.862 40.85 A 2.195 2.195 0 0 1 110.396 41.495 A 2.933 2.933 0 0 1 110.212 41.5 Q 108.712 41.5 108.012 39.9 L 104.312 31 A 10.398 10.398 0 0 0 102.701 28.202 A 8.88 8.88 0 0 0 100.212 26.1 A 12.33 12.33 0 0 0 97.053 24.812 A 10.546 10.546 0 0 0 94.512 24.5 L 92.012 24.5 A 5.039 5.039 0 0 0 90.627 24.674 Q 88.512 25.28 88.512 28 L 88.712 39.2 A 2.147 2.147 0 0 1 88.176 40.622 A 2.886 2.886 0 0 1 88.012 40.8 A 2.363 2.363 0 0 1 86.517 41.486 A 3.207 3.207 0 0 1 86.212 41.5 A 2.309 2.309 0 0 1 85.465 41.385 A 1.924 1.924 0 0 1 84.612 40.8 Q 84.012 40.1 84.012 39.2 Z M 117.212 38.1 L 131.012 2.7 A 4.224 4.224 0 0 1 131.574 1.619 A 3.418 3.418 0 0 1 132.662 0.65 A 5.065 5.065 0 0 1 134.008 0.116 A 4.416 4.416 0 0 1 135.012 0 A 5.07 5.07 0 0 1 136.607 0.235 Q 138.108 0.731 138.833 2.273 A 5.455 5.455 0 0 1 139.012 2.7 L 152.812 38.1 Q 152.942 38.491 152.987 38.797 A 2.075 2.075 0 0 1 153.012 39.1 A 2.152 2.152 0 0 1 152.32 40.701 A 2.887 2.887 0 0 1 152.212 40.8 A 3.12 3.12 0 0 1 151.558 41.247 A 2.308 2.308 0 0 1 150.512 41.5 Q 149.038 41.5 148.337 39.86 A 4.786 4.786 0 0 1 148.312 39.8 L 145.012 31.2 Q 144.243 29.278 142.365 29.203 A 3.865 3.865 0 0 0 142.212 29.2 L 127.812 29.2 A 3.06 3.06 0 0 0 126.554 29.448 Q 125.531 29.904 125.012 31.2 L 121.712 39.8 A 3.727 3.727 0 0 1 121.284 40.584 Q 120.613 41.5 119.512 41.5 A 2.354 2.354 0 0 1 118.283 41.147 A 3.284 3.284 0 0 1 117.812 40.8 A 2.434 2.434 0 0 1 117.268 40.137 A 2.128 2.128 0 0 1 117.012 39.1 Q 117.012 38.832 117.102 38.473 A 5.165 5.165 0 0 1 117.212 38.1 Z M 208.012 38.1 L 221.812 2.7 A 4.224 4.224 0 0 1 222.374 1.619 A 3.418 3.418 0 0 1 223.462 0.65 A 5.065 5.065 0 0 1 224.808 0.116 A 4.416 4.416 0 0 1 225.812 0 A 5.07 5.07 0 0 1 227.407 0.235 Q 228.908 0.731 229.633 2.273 A 5.455 5.455 0 0 1 229.812 2.7 L 243.612 38.1 Q 243.742 38.491 243.787 38.797 A 2.075 2.075 0 0 1 243.812 39.1 A 2.152 2.152 0 0 1 243.12 40.701 A 2.887 2.887 0 0 1 243.012 40.8 A 3.12 3.12 0 0 1 242.358 41.247 A 2.308 2.308 0 0 1 241.312 41.5 Q 239.838 41.5 239.137 39.86 A 4.786 4.786 0 0 1 239.112 39.8 L 235.812 31.2 Q 235.043 29.278 233.165 29.203 A 3.865 3.865 0 0 0 233.012 29.2 L 218.612 29.2 A 3.06 3.06 0 0 0 217.354 29.448 Q 216.331 29.904 215.812 31.2 L 212.512 39.8 A 3.727 3.727 0 0 1 212.084 40.584 Q 211.413 41.5 210.312 41.5 A 2.354 2.354 0 0 1 209.083 41.147 A 3.284 3.284 0 0 1 208.612 40.8 A 2.434 2.434 0 0 1 208.068 40.137 A 2.128 2.128 0 0 1 207.812 39.1 Q 207.812 38.832 207.902 38.473 A 5.165 5.165 0 0 1 208.012 38.1 Z M 195.512 39.2 L 195.512 2.3 A 2.98 2.98 0 0 1 195.588 1.607 A 1.951 1.951 0 0 1 196.162 0.6 A 2.24 2.24 0 0 1 197.445 0.022 A 3.03 3.03 0 0 1 197.812 0 A 3.307 3.307 0 0 1 198.61 0.092 A 2.406 2.406 0 0 1 199.612 0.6 A 1.951 1.951 0 0 1 200.262 1.751 A 2.907 2.907 0 0 1 200.312 2.3 L 200.312 39.2 A 2.147 2.147 0 0 1 199.776 40.622 A 2.886 2.886 0 0 1 199.612 40.8 A 2.363 2.363 0 0 1 198.117 41.486 A 3.207 3.207 0 0 1 197.812 41.5 A 2.336 2.336 0 0 1 196.951 41.347 A 2.134 2.134 0 0 1 196.162 40.8 Q 195.512 40.1 195.512 39.2 Z M 92.012 20.4 L 98.312 20.4 Q 101.512 20.4 104.162 18.5 A 6.18 6.18 0 0 0 106.747 14.013 A 9.25 9.25 0 0 0 106.812 12.9 A 10.334 10.334 0 0 0 106.589 10.675 Q 106.057 8.268 104.262 7 Q 101.712 5.2 98.512 5.2 L 92.012 5.2 A 5.039 5.039 0 0 0 90.627 5.374 Q 88.512 5.98 88.512 8.7 L 88.512 16.9 A 5.039 5.039 0 0 0 88.685 18.286 Q 89.291 20.4 92.012 20.4 Z M 129.112 25.1 L 140.912 25.1 A 2.49 2.49 0 0 0 141.37 25.062 Q 142.423 24.864 142.087 23.639 A 3.505 3.505 0 0 0 142.012 23.4 L 136.512 8.3 Q 136.085 7.161 135.505 6.833 A 0.987 0.987 0 0 0 135.012 6.7 Q 134.214 6.7 133.652 7.958 A 6.019 6.019 0 0 0 133.512 8.3 L 128.012 23.4 Q 127.467 24.943 128.817 25.086 A 2.81 2.81 0 0 0 129.112 25.1 Z M 219.912 25.1 L 231.712 25.1 A 2.49 2.49 0 0 0 232.17 25.062 Q 233.223 24.864 232.887 23.639 A 3.505 3.505 0 0 0 232.812 23.4 L 227.312 8.3 Q 226.885 7.161 226.305 6.833 A 0.987 0.987 0 0 0 225.812 6.7 Q 225.014 6.7 224.452 7.958 A 6.019 6.019 0 0 0 224.312 8.3 L 218.812 23.4 Q 218.267 24.943 219.617 25.086 A 2.81 2.81 0 0 0 219.912 25.1 Z";

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Logo', slots, []);
    	let visible = false;

    	setTimeout(
    		() => {
    			$$invalidate(0, visible = true);
    		},
    		0
    	);

    	$$self.$$set = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$self.$capture_state = () => ({ linear: identity, draw, visible, path });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(1, $$props = assign(assign({}, $$props), $$new_props));
    		if ('visible' in $$props) $$invalidate(0, visible = $$new_props.visible);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$props = exclude_internal_props($$props);
    	return [visible, $$props];
    }

    class Logo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Logo",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\sections\farms.svelte generated by Svelte v3.46.2 */

    const file$1 = "src\\sections\\farms.svelte";

    function create_fragment$1(ctx) {
    	let section;
    	let h1;

    	const block = {
    		c: function create() {
    			section = element("section");
    			h1 = element("h1");
    			h1.textContent = "HI";
    			add_location(h1, file$1, 4, 1, 35);
    			add_location(section, file$1, 3, 0, 23);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			append_dev(section, h1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Farms', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Farms> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Farms extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Farms",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.46.2 */

    const { document: document_1 } = globals;
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let t0;
    	let header;
    	let logo;
    	let t1;
    	let login;
    	let t2;
    	let div;
    	let farms0;
    	let t3;
    	let farms1;
    	let t4;
    	let farms2;
    	let t5;
    	let farms3;
    	let t6;
    	let farms4;
    	let t7;
    	let farms5;
    	let t8;
    	let mousefollower;
    	let current;
    	logo = new Logo({ props: { class: "logo" }, $$inline: true });
    	login = new Login({ $$inline: true });
    	farms0 = new Farms({ $$inline: true });
    	farms1 = new Farms({ $$inline: true });
    	farms2 = new Farms({ $$inline: true });
    	farms3 = new Farms({ $$inline: true });
    	farms4 = new Farms({ $$inline: true });
    	farms5 = new Farms({ $$inline: true });
    	mousefollower = new Mouse_follower({ $$inline: true });

    	const block = {
    		c: function create() {
    			t0 = space();
    			header = element("header");
    			create_component(logo.$$.fragment);
    			t1 = space();
    			create_component(login.$$.fragment);
    			t2 = space();
    			div = element("div");
    			create_component(farms0.$$.fragment);
    			t3 = space();
    			create_component(farms1.$$.fragment);
    			t4 = space();
    			create_component(farms2.$$.fragment);
    			t5 = space();
    			create_component(farms3.$$.fragment);
    			t6 = space();
    			create_component(farms4.$$.fragment);
    			t7 = space();
    			create_component(farms5.$$.fragment);
    			t8 = space();
    			create_component(mousefollower.$$.fragment);
    			document_1.title = "Merasia";
    			attr_dev(header, "class", "svelte-1g8dlb0");
    			add_location(header, file, 18, 0, 629);
    			attr_dev(div, "class", "scroll-section svelte-1g8dlb0");
    			add_location(div, file, 22, 0, 680);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, header, anchor);
    			mount_component(logo, header, null);
    			append_dev(header, t1);
    			mount_component(login, header, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div, anchor);
    			mount_component(farms0, div, null);
    			append_dev(div, t3);
    			mount_component(farms1, div, null);
    			append_dev(div, t4);
    			mount_component(farms2, div, null);
    			append_dev(div, t5);
    			mount_component(farms3, div, null);
    			append_dev(div, t6);
    			mount_component(farms4, div, null);
    			append_dev(div, t7);
    			mount_component(farms5, div, null);
    			insert_dev(target, t8, anchor);
    			mount_component(mousefollower, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logo.$$.fragment, local);
    			transition_in(login.$$.fragment, local);
    			transition_in(farms0.$$.fragment, local);
    			transition_in(farms1.$$.fragment, local);
    			transition_in(farms2.$$.fragment, local);
    			transition_in(farms3.$$.fragment, local);
    			transition_in(farms4.$$.fragment, local);
    			transition_in(farms5.$$.fragment, local);
    			transition_in(mousefollower.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logo.$$.fragment, local);
    			transition_out(login.$$.fragment, local);
    			transition_out(farms0.$$.fragment, local);
    			transition_out(farms1.$$.fragment, local);
    			transition_out(farms2.$$.fragment, local);
    			transition_out(farms3.$$.fragment, local);
    			transition_out(farms4.$$.fragment, local);
    			transition_out(farms5.$$.fragment, local);
    			transition_out(mousefollower.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(header);
    			destroy_component(logo);
    			destroy_component(login);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div);
    			destroy_component(farms0);
    			destroy_component(farms1);
    			destroy_component(farms2);
    			destroy_component(farms3);
    			destroy_component(farms4);
    			destroy_component(farms5);
    			if (detaching) detach_dev(t8);
    			destroy_component(mousefollower, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	window.addEventListener('load', () => {
    		const scrollSection = document.querySelector(".scroll-section");

    		scrollSection.addEventListener('wheel', e => {
    			const way = e.deltaY > 0 ? 1 : -1;
    			const scrollSection = document.querySelector(".scroll-section");
    			scrollSection.scrollBy(window.innerWidth * way, 0);
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Login, MouseFollower: Mouse_follower, Logo, Farms });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
