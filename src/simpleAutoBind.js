// This code is copied from `auto-bind v5.0.1` and then simplified -- i.e.
// filtering is omitted.
export default function simpleAutoBind(self) {
  let { prototype } = self.constructor;

  const bindFn = (object, key) => {
    if (key === 'constructor') {
      return;
    }

    const descriptor = Reflect.getOwnPropertyDescriptor(object, key);

    if (descriptor && typeof descriptor.value === 'function') {
      // eslint-disable-next-line no-param-reassign
      self[key] = self[key].bind(self);
    }
  };

  do {
    // Disable javascript:S3796 SonarQube rule, because it is against ESLint's
    // `arrow-body-style: "as-needed"` option. For details, see the
    // `sonar-project.properties` config file.
    //
    // eslint-disable-next-line no-loop-func
    Array.from(Reflect.ownKeys(prototype), (key) => bindFn(prototype, key));
    prototype = Reflect.getPrototypeOf(prototype);
  } while (prototype !== Object.prototype);
}
