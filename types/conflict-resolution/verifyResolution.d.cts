import { DecodedProof, JWK, ResolutionPayload } from '../types.js';
export declare function verifyResolution<T extends ResolutionPayload>(resolution: string, pubJwk?: JWK): Promise<DecodedProof<T>>;
//# sourceMappingURL=verifyResolution.d.ts.map