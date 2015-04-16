/**
 * return the operating mode of toccata
 *
 * @param {*} angular
 * @returns {string}
 */
export default function operatingMode(angular: any): string {
  if (!angular.version && !angular.bootstrap) {
    // arg of angular is not Angular
    throw new Error('AngularJS or Angular 2 is required to Toccata');
  }

  let version = angular.version;
  if (!version) {
    // if Angular 2
    return 'v2';
  }

  let preReleaseVer = ((v: {full: string}): {phase: string; num: number} => {
    let full = v.full.split('-')[1];
    return (!full) ? void 0 : {
      phase: full.split('.')[0],
      num: +full.split('.')[1]
    };
  })(version);

  if (version.major === 1 && version.minor === 4 && preReleaseVer.phase === 'beta' && preReleaseVer.num < 5) {
    // if AngularJS <1.4.0-beta.5
    throw new Error(`AngularJS ${version.full} does not support CommonJS`);
  }

  let lessThan1_3_14 = version.major === 1 && version.minor === 3 && version.dot < 14;
  let lessThan1_3    = version.major === 1 && version.minor < 3;
  if (lessThan1_3_14 || lessThan1_3) {
    // if AngularJS <1.3.14
    throw new Error('Toccata does not support the version less than AngularJS 1.3.14');
  }

  return 'v1';
}