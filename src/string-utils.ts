'use strict';

export function camelize(s: string) {
  return s.replace(/(\-|_|\s)+(.)?/g, (mathc: any, sep: any, c: string) => {
    return (c ? c.toUpperCase() : '');
  });
}