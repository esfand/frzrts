
import { extendable } from './utils';
import { Observable } from './observable';
import {ViewList}     from './viewlist'
import { ExtendableObservable } from './extendableobservable'

const EVENT = {init:'init', inited:'inited', mount:'mount', mounted:'mounted', 
               unmount:'unmount', unmounted:'unmounted', sort:'sort', sorted:'sorted', 
               update:'update', updated:'updated', destroy:'destroy'};
               
export class View extends ExtendableObservable {
  /**
   * @external {HTMLElement} https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement
   */

  /**
   * @typedef {Object} ViewOptions
   * @property {el|HTMLElement} [el=el('div')] DOM element
   * @property {Function} [init] 'init' callback shortcut
   * @property {Function} [inited] 'inited' callback shortcut
   * @property {Function} [mount] 'mount' callback shortcut
   * @property {Function} [mounted] 'mounted' callback shortcut
   * @property {Function} [sort] 'sort' callback shortcut
   * @property {Function} [sorted] 'sorted' callback shortcut
   * @property {Function} [update] 'update' callback shortcut
   * @property {Function} [updated] 'updated' callback shortcut
   * @property {Function} [destroy] 'destroy' callback shortcut
   * @property {*} [*] Anything else you want to pass on to View
   */
  
    /**
     * el attributes cache
     * @type {Object}
     */
    attrs: Object = {};
    /**
     * el classNames cache
     * @type {Object}
     */
    classes: Object = {};
    /**
     * HTMLElement
     * @type {el|HTMLElement}
     */
    el: HTMLElement = null;
    /**
     * Proxy event listeners cache
     * @type {Array}
     */
    eventListeners: Object[] = [];
    /**
     * el innerHTML cache
     * @type {String}
     */
    html: string = '';
    /**
     * Listeners cache
     * @type {Object}
     */
    listeners: Object = {};
    /**
     * el styles cache
     * @type {Object}
     */
    styles: Object = {};
    /**
     * el textContent cache
     * @type {String}
     */
    text: string = '';

  /**
   * Creates View
   * @param  {ViewOptions} [options] View options
   * @param  {*} [data]    Any data to pass on to init()
   * @return {View}
   */
  constructor (options: Object = {}, data: any) {
    super();

    for (const key in options) {
      if (EVENT[key]) {
        this.on(key, options[key]);
      } else {
        this[key] = options[key];
      }
    }
    this.trigger(EVENT.init, data);
    if (!this.el) this.el = document.createElement('div');
    this.el.view = this;
    this.trigger(EVENT.inited, data);
  }
  /**
   * Sets/removes View element attribute (only if changed)
   * @param {String} name   Attribute name
   * @param {*|null} value Attribute value or null to remove
   * @return {View}
   */
  setAttr (name: string, value: any): View {
    if (!this.attrs) this.attrs = {};

    if (this.attrs[name] === value) {
      return this;
    }
    if (value || value === '') {
      this.el.setAttribute(name, value);
      this.attrs[name] = value;
    } else {
      this.el.removeAttribute(name);
      this.attrs[name] = null;
    }

    return this;
  }
  /**
   * Sets/removes View element class (only if changed)
   * @param {String} key   Class name
   * @param {Boolean} value true / false
   * @return {View}
   */
  setClass (key: string, value: boolean): View {
    if (!this.classes) this.classes = {};

    if (this.classes[key] === value) {
      return this;
    }
    if (value) {
      this.el.classList.add(key);
    } else {
      this.el.classList.remove(key);
    }
    this.classes[key] = value;

    return this;
  }
  /**
   * Sets/removes View element style (only if changed)
   * @param {String} key   Style name
   * @param {*|null} value Style value or null to remove
   * @return {View}
   */
  setStyle (key: string, value: any): View {
    if (!this.styles) this.styles = {};

    if (this.styles[key] === value) {
      return this;
    }
    this.el.style[key] = value;
    this.styles[key] = value;

    return this;
  }
  /**
   * Sets View element textContent (only if changed)
   * @param {String} text Text to be applied to textContent
   * @return {View}
   */
  setText (text: string): View {
    if (this.text === text) {
      return this;
    }
    this.el.textContent = text;
    this.text = text;

    return this;
  }
  /**
   * Sets View element innerHTML (only if changed)
   * @param {String} html HTML string
   * @return {View}
   */
  setHTML (html: string): View {
    if (this.html === html) {
      return this;
    }
    this.el.innerHTML = html;
    this.html = html;

    return this;
  }
  /**
   * Adds proxy event listener to View
   * @param {[type]}   name       Listener name
   * @param {Function} callback         Listener callback
   * @param {Boolean}   useCapture Use capture or not
   * @return {View}
   */
  addListener (name: string, callback: Function, useCapture: boolean): View {
    const listener = {
      name: name,
      callback: callback,
      proxy: (...args) => {
        callback.apply(this, args);
      }
    };
    if (!this.eventListeners) this.eventListeners = [];

    this.eventListeners.push(listener);
    this.el.addEventListener(name, listener.proxy, useCapture);

    return this;
  }
  /**
   * Removes all proxy event listeners from View, or by name, or by name and callback
   * @param  {String}   [name] Listener name
   * @param  {Function} [callback]   Listener callback
   * @return {View}
   */
  removeListener (name: string, callback: Function): View {
    const listeners = this.eventListeners;
    if (!listeners) {
      return this;
    }
    if (typeof name === 'undefined') {
      for (let i = 0; i < listeners.length; i++) {
        this.el.removeEventListener(listeners[i].proxy);
      }
      this.listeners = [];
    } else if (typeof callback === 'undefined') {
      for (let i = 0; i < listeners.length; i++) {
        if (listeners[i].name === name) {
          listeners.splice(i--, 1);
        }
      }
    } else {
      for (let i = 0; i < listeners.length; i++) {
        const listener = listeners[i];
        if (listener.name === name && callback === listener.callback) {
          listeners.splice(i--, 1);
        }
      }
    }

    return this;
  }
  /**
   * Adds child View/ViewList to View
   * @param {View|ViewList} child Child View/ViewList to be added
   * @return {View}
   */
  addChild (child: View|ViewList): View {
    if (child.views) {
      child.parent = this;
      return this.setChildren(...child.views);
    }
    let sorting = false;
    if (child.parent) {
      sorting = true;
      child.trigger(EVENT.sort);
    } else {
      child.trigger(EVENT.mount);
    }

    this.el.appendChild(child.el);
    child.parent = this;

    if (sorting) {
      child.trigger(EVENT.sorted);
    } else {
      child.trigger(EVENT.mounted);
    }

    return this;
  }
  /**
   * Adds child View before another View/HTMLElement
   * @param {View} child  Child View to be added
   * @param {View|HTMLElement} before Reference View/HTMLElement
   * @return {View}
   */
  addBefore (child: View, before: View|HTMLElement): View {
    let sorting = false;

    if (child.parent) {
      sorting = true;
      child.trigger(EVENT.sort);
    } else {
      child.trigger(EVENT.mount);
    }

    this.el.insertBefore(child.el, before.el || before);
    child.parent = this;

    if (sorting) {
      child.trigger(EVENT.sorted);
    } else {
      child.trigger(EVENT.mounted);
    }

    return this;
  }
  /**
   * Replace children with Views or ViewList
   * @param {View|ViewList} ...views [description]
   * @return {View}
   */
  setChildren (...views: (View|ViewList)[]): View {
    if (views[0].views) {
      views[0].parent = this;
      if (!views[0].views.length) {
        return this;
      }
      this.setChildren(...views[0].views);
    }
    let traverse = this.el.firstChild;

    for (let i = 0; i < views.length; i++) {
      const view = views[i];

      if (traverse === view.el) {
        traverse = traverse.nextSibling;
        continue;
      }
      if (traverse) {
        this.addBefore(view, traverse);
      } else {
        this.addChild(view);
      }
    }
    while (traverse) {
      const next = traverse.nextSibling;

      if (traverse.view) {
        traverse.view.parent.removeChild(traverse.view);
      } else {
        this.el.removeChild(traverse);
      }

      traverse = next;
    }

    return this;
  }
  /**
   * Remove child View / ViewList
   * @param  {View|ViewList} child Child View/ViewList to be removed
   * @return {View}
   */
  removeChild (child: View|ViewList) {
    if (!child.parent) {
      return this;
    }
    child.trigger(EVENT.unmount);

    this.el.removeChild(child.el);
    child.parent = null;

    child.trigger(EVENT.unmounted);

    return this;
  }
  /**
   * Trigger 'update' with data
   * @param  {*} data Any data
   * @return {View}
   */
  update (data: any): void {
    this.trigger(EVENT.update, data);
  }
  /**
   * Destroy View (remove listeners, children, etc..)
   */
  destroy (): void {
    if (this.parent) this.parent.removeChild(this);
    this.trigger(EVENT.destroy);
    this.setChildren([]);
    this.off();
    this.removeListener();
  }
}

//extendable(View);
