import { applyDecorators } from '@nestjs/common';

export const getCurrentDateWithSlashes = () => {
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return [year, month, day].join('-');
};

export function Today(): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    Object.defineProperty(target, propertyKey, {
      get: function () {
        const today = getCurrentDateWithSlashes();
        return today;
      },
      enumerable: true,
      configurable: true,
    });
  };
}
