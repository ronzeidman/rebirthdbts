import { TermJson } from '../internal-types';
export declare const querySymbol: unique symbol;
export declare const isQuery: (query: any) => boolean;
export declare function toQuery(term: TermJson): any;
