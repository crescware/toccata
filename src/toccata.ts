/**
 * Cresc Toccata
 * @copyright © 2015 Crescware
 */
import operatingMode from './operating-mode';

export interface ToccataStatic {
  operatingMode: string;
}

export default function toccata(angular: any): ToccataStatic {
  return {
    operatingMode: operatingMode(angular)
  };
}