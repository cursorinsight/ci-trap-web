const eventEmitterMixin = {
  on(eventName, handler) {
    if (!this._eventHandlers) {
      this._eventHandlers = {};
    }
    if (!this._eventHandlers[eventName]) {
      this._eventHandlers[eventName] = [];
    }
    this._eventHandlers[eventName].push(handler);
  },

  emit(eventName, ...args) {
    if (!this._eventHandlers?.[eventName]) {
      return; // no handlers for that event name
    }

    // call the handlers
    this._eventHandlers[eventName]
      .forEach((handler) => handler.apply(this, args));
  },
};

export default eventEmitterMixin;
